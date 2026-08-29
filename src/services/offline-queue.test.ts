import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';

import {
  enqueue,
  listQueued,
  dequeue,
  flushQueue,
  queuedCount,
  mintClientId,
} from './offline-queue';
import type { CreateWorkoutSessionDto } from '../types/workout-session.types';

const payload = (name = 'Bench Press'): CreateWorkoutSessionDto => ({
  exercises: [{ name, sets: [{ reps: 8, weight: 60 }] }],
});

/** An axios-shaped rejection, which is how the real failures arrive. */
const httpError = (status: number) => ({ response: { status } });

async function clear() {
  for (const record of await listQueued()) {
    await dequeue(record.clientId);
  }
}

describe('offline queue', () => {
  beforeEach(async () => {
    await clear();
  });

  it('mints a unique id per session', () => {
    expect(mintClientId()).not.toBe(mintClientId());
    expect(mintClientId().length).toBeGreaterThanOrEqual(8);
  });

  it('keeps a queued session across reads', async () => {
    await enqueue('id-one-1234', payload());

    const queued = await listQueued();
    expect(queued).toHaveLength(1);
    expect(queued[0].payload.exercises[0].name).toBe('Bench Press');
    expect(await queuedCount()).toBe(1);
  });

  it('sends the queue oldest first and empties it', async () => {
    await enqueue('id-old-1234', payload('Squat'));
    await new Promise((r) => setTimeout(r, 2));
    await enqueue('id-new-1234', payload('Row'));

    const send = vi.fn().mockResolvedValue({});
    const result = await flushQueue(send);

    expect(result).toEqual({ sent: 2, kept: 0 });
    expect(send.mock.calls[0][0].exercises[0].name).toBe('Squat');
    expect(await queuedCount()).toBe(0);
  });

  /**
   * The property the whole design rests on: the key travels with the payload,
   * so the server can recognise a resend of a workout it already stored.
   */
  it('sends the clientId with the payload', async () => {
    await enqueue('id-keyed-1234', payload());

    const send = vi.fn().mockResolvedValue({});
    await flushQueue(send);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: 'id-keyed-1234' }),
    );
  });

  it('keeps a session whose request never landed', async () => {
    await enqueue('id-offline-1234', payload());

    const send = vi.fn().mockRejectedValue(new Error('Network Error'));
    const result = await flushQueue(send);

    expect(result).toEqual({ sent: 0, kept: 1 });
    expect(await queuedCount()).toBe(1);
  });

  it('keeps a session through an expired token', async () => {
    await enqueue('id-401-1234', payload());

    const result = await flushQueue(vi.fn().mockRejectedValue(httpError(401)));

    expect(result.kept).toBe(1);
    expect(await queuedCount()).toBe(1);
  });

  // A payload the server refuses will never become valid, and leaving it in
  // place would block every workout queued behind it.
  it('drops a session the server rejected outright', async () => {
    await enqueue('id-400-1234', payload());

    const result = await flushQueue(vi.fn().mockRejectedValue(httpError(400)));

    expect(result).toEqual({ sent: 0, kept: 0 });
    expect(await queuedCount()).toBe(0);
  });

  it('keeps a session through a server error', async () => {
    await enqueue('id-500-1234', payload());

    const result = await flushQueue(vi.fn().mockRejectedValue(httpError(500)));

    expect(result.kept).toBe(1);
    expect(await queuedCount()).toBe(1);
  });

  it('counts attempts so a poison message is visible', async () => {
    await enqueue('id-retry-1234', payload());

    await flushQueue(vi.fn().mockRejectedValue(httpError(500)));
    await flushQueue(vi.fn().mockRejectedValue(httpError(500)));

    const [record] = await listQueued();
    expect(record.attempts).toBe(2);
  });

  it('does not lose the rest of the queue when one session fails', async () => {
    await enqueue('id-good-1234', payload('Squat'));
    await new Promise((r) => setTimeout(r, 2));
    await enqueue('id-bad-1234', payload('Row'));

    const send = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(httpError(500));

    const result = await flushQueue(send);

    expect(result).toEqual({ sent: 1, kept: 1 });
    const remaining = await listQueued();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].clientId).toBe('id-bad-1234');
  });

  it('re-queuing the same id replaces rather than duplicates', async () => {
    await enqueue('id-same-1234', payload('Squat'));
    await enqueue('id-same-1234', payload('Row'));

    const queued = await listQueued();
    expect(queued).toHaveLength(1);
    expect(queued[0].payload.exercises[0].name).toBe('Row');
  });

  it('flushing an empty queue does nothing', async () => {
    const send = vi.fn();
    expect(await flushQueue(send)).toEqual({ sent: 0, kept: 0 });
    expect(send).not.toHaveBeenCalled();
  });
});
