import { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { isNativeApp } from '../config/platform';
import { armRestAlarm, disarmRestAlarm } from '../services/rest-alarm';
import { setRest } from '../services/workout-live';

/**
 * Keeps the live workout notification and the background alarm in step with
 * the rest timer.
 *
 * While a rest runs, the workout notification shows its countdown instead of
 * the session clock; Android switches it back at zero on its own.
 *
 * The alarm is armed when the app is paused (screen off or app switched) while a countdown
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
  // Whether the app is in the background right now.
  const paused = useRef(false);

  useEffect(() => {
    if (!isNativeApp) return;

    const pause = CapacitorApp.addListener('pause', () => {
      paused.current = true;
      const { running: on, deadline: at, text: copy } = state.current;
      if (on) void armRestAlarm(at, copy);
    });
    const resume = CapacitorApp.addListener('resume', () => {
      paused.current = false;
      void disarmRestAlarm();
    });

    return () => {
      void pause.then((handle) => handle.remove());
      void resume.then((handle) => handle.remove());
      void disarmRestAlarm();
    };
  }, []);

  // A stopped or restarted countdown invalidates whatever was scheduled, and
  // moves the workout notification into or out of its rest view.
  useEffect(() => {
    if (!isNativeApp) return;
    void disarmRestAlarm();
    setRest(running ? deadline : null);
    // "+30" from the lock screen moves the deadline while the app is in the
    // background; the alarm has to move with it.
    if (running && paused.current) void armRestAlarm(deadline, state.current.text);
  }, [running, deadline]);
}
