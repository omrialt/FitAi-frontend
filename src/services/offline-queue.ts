import type { CreateWorkoutSessionDto } from '../types/workout-session.types';

/**
 * Workouts logged where there is no signal.
 *
 * Gyms are basements. The logger already survives a refresh, but a finished
 * workout that cannot reach the server was still lost the moment the user
 * walked away — the one thing this app must never do.
 *
 * `IndexedDB` rather than `localStorage`: the queue holds whole sessions, it
 * has to survive a tab the phone killed, and it must not compete for the 5MB
 * that also holds the auth token.
 *
 * Every queued session carries a `clientId` minted *before the first send*.
 * That is the crux of the whole design: a request can succeed on the server
 * and still fail on the wire, and the phone cannot tell the difference. With
 * the key, a retry is a no-op on the server; without it, a flaky connection
 * quietly doubles a user's training history.
 */

const DB_NAME = 'fitai-offline';
const DB_VERSION = 1;
const STORE = 'workout-sessions';

export interface QueuedSession {
  /** Also the idempotency key the server dedupes on. */
  clientId: string;
  payload: CreateWorkoutSessionDto;
  queuedAt: number;
  attempts: number;
}

/** Crypto-strong where available; the fallback only has to be unique per device. */
export function mintClientId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'clientId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();

  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function enqueue(
  clientId: string,
  payload: CreateWorkoutSessionDto,
): Promise<void> {
  const record: QueuedSession = {
    clientId,
    payload,
    queuedAt: Date.now(),
    attempts: 0,
  };
  await withStore('readwrite', (store) => store.put(record));
}

export async function listQueued(): Promise<QueuedSession[]> {
  return withStore<QueuedSession[]>('readonly', (store) =>
    store.getAll() as IDBRequest<QueuedSession[]>,
  );
}

export async function dequeue(clientId: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(clientId));
}

async function bumpAttempts(record: QueuedSession): Promise<void> {
  await withStore('readwrite', (store) =>
    store.put({ ...record, attempts: record.attempts + 1 }),
  );
}

export interface FlushResult {
  sent: number;
  kept: number;
}

/**
 * Sends everything queued, oldest first.
 *
 * A failure is classified rather than blanket-retried:
 *
 *   - the request never landed (offline, timeout) — keep it and try again
 *     later, because the workout still exists and nobody has it;
 *   - the server rejected it (4xx that is not auth) — drop it. The payload
 *     will never become valid, and a permanently stuck queue means every
 *     later workout is stuck behind it too;
 *   - 401 — keep it. The session is fine, the token is not, and the user
 *     signing in again should not cost them a workout.
 */
export async function flushQueue(
  send: (payload: CreateWorkoutSessionDto) => Promise<unknown>,
): Promise<FlushResult> {
  let queued: QueuedSession[];

  try {
    queued = await listQueued();
  } catch {
    // No IndexedDB (private mode, disabled storage) — nothing was ever queued.
    return { sent: 0, kept: 0 };
  }

  queued.sort((a, b) => a.queuedAt - b.queuedAt);

  let sent = 0;
  let kept = 0;

  for (const record of queued) {
    try {
      await send({ ...record.payload, clientId: record.clientId });
      await dequeue(record.clientId);
      sent += 1;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;

      if (status && status >= 400 && status < 500 && status !== 401) {
        // Unsendable forever. Dropping it is the lesser harm.
        await dequeue(record.clientId);
        continue;
      }

      await bumpAttempts(record);
      kept += 1;
    }
  }

  return { sent, kept };
}

export async function queuedCount(): Promise<number> {
  try {
    const all = await listQueued();
    return all.length;
  } catch {
    return 0;
  }
}
