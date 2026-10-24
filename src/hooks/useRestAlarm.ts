import { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { isNativeApp } from '../config/platform';
import { armRestAlarm, disarmRestAlarm } from '../services/rest-alarm';

/**
 * Keeps the background alarm in step with the rest timer.
 *
 * Armed when the app is paused (screen off or app switched) while a countdown
 * runs; disarmed when it resumes, when the countdown stops, and when another
 * starts. While the app is visible the in-page chime does the job, so the two
 * never both sound.
 */
export function useRestAlarm(
  running: boolean,
  deadline: number,
  text: { title: string; body: string },
) {
  // Read inside the listeners, which are registered once.
  const state = useRef({ running, deadline, text });
  state.current = { running, deadline, text };

  useEffect(() => {
    if (!isNativeApp) return;

    const pause = CapacitorApp.addListener('pause', () => {
      const { running: on, deadline: at, text: copy } = state.current;
      if (on) void armRestAlarm(at, copy);
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

  // A stopped or restarted countdown invalidates whatever was scheduled.
  useEffect(() => {
    if (!isNativeApp) return;
    void disarmRestAlarm();
  }, [running, deadline]);
}
