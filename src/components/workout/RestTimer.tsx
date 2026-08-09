import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';

/**
 * Rest timer for the workout logger.
 *
 * Counts down rather than up, because the question between sets is "how much
 * longer", not "how long has it been". It sits fixed to the bottom of the
 * viewport so it stays reachable while the exercise list scrolls — during a
 * set the phone is on a bench, not in your hand.
 *
 * Deliberately silent: an audio cue would need an autoplay-unlock gesture and
 * would fire in a gym where the phone is likely muted anyway. The bar turns
 * green at zero instead.
 */

const PRESETS = [60, 90, 120, 180];

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RestTimer() {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  // The deadline is a timestamp rather than a per-tick decrement: a throttled
  // background tab resumes at the right value instead of drifting behind by
  // however long it was asleep.
  const deadline = useRef(0);

  useEffect(() => {
    if (!running) return;

    const tick = () =>
      setRemaining(Math.max(0, Math.round((deadline.current - Date.now()) / 1000)));

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const start = useCallback((seconds: number) => {
    setDuration(seconds);
    deadline.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    setRemaining(0);
  }, []);

  const done = running && remaining === 0;
  const progress = running ? 1 - remaining / duration : 0;

  return (
    <div
      className="fixed inset-x-0 z-50 border-t border-outline-variant/20 bg-surface-container-lowest/95 backdrop-blur"
      // The app shell already pins a footer to the bottom at z-index 100.
      // Sitting the timer directly above it — rather than outbidding that
      // z-index — keeps both readable instead of hiding the app's own chrome.
      // The var is Mantine's own, so the two stay in step if the footer resizes.
      style={{ bottom: 'var(--app-shell-footer-offset, 0px)' }}
    >
      {/* Progress rail — reads at a glance without parsing the digits */}
      <div className="h-1 w-full bg-surface-container-high">
        <div
          className={`h-full transition-[width] duration-200 ease-linear ${
            done ? 'bg-success' : 'bg-primary'
          }`}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-3">
        <span
          className={`flex items-center gap-2 font-black tabular-nums ${
            done ? 'text-success' : 'text-on-surface'
          }`}
          aria-live="polite"
        >
          <StitchIcon name="timer" size={20} />
          <span className="text-xl">{running ? format(remaining) : '–:––'}</span>
        </span>

        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {done ? t('workout.restOver') : t('workout.rest')}
        </span>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          {PRESETS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => start(seconds)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                running && duration === seconds
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {format(seconds)}
            </button>
          ))}
          {running && (
            <button
              type="button"
              onClick={stop}
              aria-label={t('workout.stopTimer')}
              className="rounded-lg bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
            >
              <StitchIcon name="close" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
