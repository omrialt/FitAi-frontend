import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativeApp } from '../config/platform';

/**
 * The rest timer's alarm for when the app is not on screen.
 *
 * In the app, the in-page chime only plays while the WebView is visible. With
 * the phone locked on a bench it never fires, which is the one moment a rest
 * timer exists for. So while a countdown runs and the app goes to the
 * background, a single local notification is scheduled for the deadline, and
 * it is cancelled again the moment the app comes back. Visible and hidden
 * never both sound.
 *
 * Every function is a no-op on the web.
 */

const CHANNEL_ID = 'rest-timer';
/** One alarm at a time; reusing the id replaces any earlier one. */
const ALARM_ID = 4501;

let channelReady: Promise<void> | null = null;

function ensureRestChannel(): Promise<void> {
  channelReady ??= LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'Rest timer',
    description: 'Tells you when your rest between sets is over',
    // 4 = high: heads-up, sound and vibration, as an alarm should.
    importance: 4,
    vibration: true,
    visibility: 1,
  }).catch(() => {
    // A failed channel is retried on the next arm.
    channelReady = null;
  });
  return channelReady;
}

/**
 * Ask for notification permission (Android 13+). Called when the workout
 * screen opens: the live workout notification and the rest alarm both need it,
 * and starting a workout is the reason the user can see for the prompt.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativeApp) return false;
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return true;
    if (current.display === 'denied') return false;
    const asked = await LocalNotifications.requestPermissions();
    return asked.display === 'granted';
  } catch {
    return false;
  }
}

/**
 * Whether Android will deliver the alarm on the second. Since Android 14
 * exact alarms are off by default; without them the notification can arrive
 * late while the phone dozes.
 */
export async function hasExactAlarms(): Promise<boolean> {
  if (!isNativeApp) return true;
  try {
    const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting();
    return exact_alarm === 'granted';
  } catch {
    return true;
  }
}

/** Opens the system screen where the user can allow exact alarms. */
export async function openExactAlarmSetting(): Promise<void> {
  if (!isNativeApp) return;
  try {
    await LocalNotifications.changeExactNotificationSetting();
  } catch {
    // Older Android has no such screen, and does not need it.
  }
}

export async function armRestAlarm(
  deadline: number,
  text: { title: string; body: string },
): Promise<void> {
  if (!isNativeApp || deadline <= Date.now()) return;
  try {
    await ensureRestChannel();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: ALARM_ID,
          title: text.title,
          body: text.body,
          channelId: CHANNEL_ID,
          // White-on-transparent stopwatch (res/drawable); the app icon
          // would render as a white square in the status bar.
          smallIcon: 'ic_stat_timer',
          schedule: { at: new Date(deadline), allowWhileIdle: true },
        },
      ],
    });
  } catch {
    // No permission or no channel: the timer still counts, just silently.
  }
}

export async function disarmRestAlarm(): Promise<void> {
  if (!isNativeApp) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: ALARM_ID }] });
  } catch {
    // Nothing scheduled.
  }
}
