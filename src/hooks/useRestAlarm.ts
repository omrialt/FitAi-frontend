import { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { isNativeApp } from '../config/platform';
import { armRestAlarm, disarmRestAlarm } from '../services/rest-alarm';
import { hideRestCountdown, showRestCountdown } from '../services/rest-timer-live';

/**
 * Keeps the status-bar countdown and the background alarm in step with the
 * rest timer.
 *
 * The countdown shows in the status bar for as long as a timer runs, app open
 * or not; Android counts it down and removes it at zero on its own.
 *
 * The alarm is
 * Armed when the app is paused (screen off or app switched) while a countdown
 * runs; disarmed when it resumes, when the countdown stops, and when another
 * starts. While the app is visible the in-page chime does the job, so the two
 * never both sound.
 */
export function useRestAlarm(
  running: boolean,
  deadline: number,
  text: { title: string; body: string; countdown: string },
) {
  // Read inside the listeners, which are registered once.
  const state = useRef({ running, deadline, text });
  state.current = { running, deadline, text };

  useEffect(() => {
    if (!isNativeApp) return;

    const pause = CapacitorApp.addListener('pause', () => {
      const { running: on, deadline: at, text: copy } = state.current;
      if (on) void armRestAlarm(at, { title: copy.title, body: copy.body });
    });
    const resume = CapacitorApp.addListener('resume', () => {
      void disarmRestAlarm();
    });

    return () => {
      void pause.then((handle) => handle.remove());
      void resume.then((handle) => handle.remove());
      void disarmRestAlarm();
    };
  }, []);

  // A stopped or restarted countdown invalidates whatever was scheduled, and
  // replaces the countdown in the status bar.
  useEffect(() => {
    if (!isNativeApp) return;
    void disarmRestAlarm();
    if (running) {
      void showRestCountdown(deadline, state.current.text.countdown);
    } else {
      void hideRestCountdown();
    }
  }, [running, deadline]);

  // Leaving the workout screen takes the countdown with it.
  useEffect(() => {
    if (!isNativeApp) return;
    return () => void hideRestCountdown();
  }, []);
}
