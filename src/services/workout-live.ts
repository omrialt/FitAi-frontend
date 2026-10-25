import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { isNativeApp } from '../config/platform';

/**
 * The live workout notification (WorkoutLivePlugin.java), from the page's side.
 *
 * One notification for the whole workout: the session clock between sets, the
 * rest countdown during a rest, a progress bar of sets done. On One UI 8 /
 * Android 16 it becomes a Live Update — a chip with the running clock in the
 * status bar, the Now Bar and the lock screen.
 *
 * The workout screen and the rest timer each own part of the state, so it is
 * kept here and sent as one `show()` per change, batched to a microtask. Never
 * per second: Android runs the clocks. Every call is a no-op on the web and
 * never throws — the notification mirrors the page, it is not the record.
 */

export interface SessionInfo {
  startedAt: number;
  title: string;
  /** "Squat · set 3 of 4", already localised. */
  text: string;
  done: number;
  total: number;
  /** Sets per exercise, for the segmented progress bar. */
  segments: number[];
}

export interface LiveLabels {
  restTitle: string;
  sessionText: string;
  plus30: string;
  skip: string;
}

export interface LiveAction {
  type: 'plus30' | 'skipRest';
  /** The rest deadline after the tap; 0 once skipped. */
  restDeadline: number;
}

interface WorkoutLivePlugin {
  show(options: SessionInfo & {
    restDeadline?: number;
    restTitle: string;
    sessionText: string;
    plus30Label: string;
    skipLabel: string;
  }): Promise<void>;
  stop(): Promise<void>;
  getStatus(): Promise<{ notifications: boolean; promoted: boolean }>;
  openSettings(): Promise<void>;
  addListener(
    event: 'action',
    listener: (action: LiveAction) => void,
  ): Promise<PluginListenerHandle>;
}

const WorkoutLive = registerPlugin<WorkoutLivePlugin>('WorkoutLive');

let session: SessionInfo | null = null;
let labels: LiveLabels = { restTitle: 'Rest', sessionText: '', plus30: '+30', skip: 'Skip' };
let restDeadline = 0;
let flushQueued = false;

function scheduleFlush() {
  if (!isNativeApp || flushQueued) return;
  flushQueued = true;
  queueMicrotask(() => {
    flushQueued = false;
    if (!session) return;
    const resting = restDeadline > Date.now();
    WorkoutLive.show({
      ...session,
      ...(resting ? { restDeadline } : {}),
      restTitle: labels.restTitle,
      sessionText: labels.sessionText,
      plus30Label: labels.plus30,
      skipLabel: labels.skip,
    }).catch(() => {
      // No permission or plugin: the page is still the workout.
    });
  });
}

/** Start or update the notification for the workout on screen. */
export function updateSession(info: SessionInfo, text: LiveLabels): void {
  if (!isNativeApp) return;
  session = info;
  labels = text;
  scheduleFlush();
}

/** A rest began (deadline) or ended (null). */
export function setRest(deadline: number | null): void {
  if (!isNativeApp) return;
  restDeadline = deadline ?? 0;
  scheduleFlush();
}

/** The workout is over, abandoned, or was never running. */
export function endSession(): void {
  if (!isNativeApp) return;
  session = null;
  restDeadline = 0;
  void WorkoutLive.stop().catch(() => {});
}

export function onLiveAction(listener: (action: LiveAction) => void): () => void {
  if (!isNativeApp) return () => {};
  const handle = WorkoutLive.addListener('action', listener).catch(() => null);
  return () => {
    void handle.then((h) => h?.remove());
  };
}

export async function getLiveStatus(): Promise<{ notifications: boolean; promoted: boolean }> {
  if (!isNativeApp) return { notifications: false, promoted: false };
  try {
    return await WorkoutLive.getStatus();
  } catch {
    return { notifications: false, promoted: false };
  }
}

export async function openNotificationSettings(): Promise<void> {
  if (!isNativeApp) return;
  try {
    await WorkoutLive.openSettings();
  } catch {
    // Nothing to open on this device.
  }
}
