import { registerPlugin } from '@capacitor/core';
import { isNativeApp } from '../config/platform';

/**
 * The live rest countdown in the phone's status bar (RestTimerPlugin.java).
 *
 * Android runs the countdown from the deadline itself, so this is called once
 * per timer, not once per second. Silent: the sound at the end is the
 * separate rest alarm. Every call is a no-op on the web and never throws —
 * the countdown is a convenience, the timer in the page is the real one.
 */
interface RestTimerPlugin {
  start(options: { deadline: number; title: string }): Promise<void>;
  stop(): Promise<void>;
}

const RestTimer = registerPlugin<RestTimerPlugin>('RestTimer');

export async function showRestCountdown(deadline: number, title: string): Promise<void> {
  if (!isNativeApp || deadline <= Date.now()) return;
  try {
    await RestTimer.start({ deadline, title });
  } catch {
    // No notification permission: the countdown stays in the app only.
  }
}

export async function hideRestCountdown(): Promise<void> {
  if (!isNativeApp) return;
  try {
    await RestTimer.stop();
  } catch {
    // Nothing showing.
  }
}
