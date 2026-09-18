import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';

/**
 * Rest timer for the workout logger, with the session clock beside it.
 *
 * Counts down rather than up, because the question between sets is "how much
 * longer", not "how long has it been". It sits fixed to the bottom of the
 * viewport so it stays reachable while the exercise list scrolls — during a
 * set the phone is on a bench, not in your hand.
 *
 * Which is also why it now makes a noise. The bar turning green at zero only
 * works for someone looking at it, and the whole point of the thing is that
 * you are not. The chime is synthesised rather than shipped as an audio file
 * — a few hundred milliseconds of sine wave costs nothing to download and
 * nothing to decode — and it is opt-out, remembered per device, because a gym
 * is not always somewhere you want your phone beeping.
 */

/** 45s leads: it is the short rest, and the one nothing on the bar offered. */
const PRESETS = [45, 60, 90, 120, 180];

const SOUND_KEY = 'fitai.restTimer.sound';
const TOTAL_KEY = 'fitai.restTimer.showTotal';

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === '1';
  } catch {
    return fallback;
  }
}

function storeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // A remembered preference is a convenience, not a requirement.
  }
}

/** `m:ss`, or `h:mm:ss` once a session runs past the hour. */
function format(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60) % 60;
  const s = seconds % 60;

  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Three rising beeps on the Web Audio API.
 *
 * The context is created on the tap that starts a timer, never on mount:
 * browsers hand out a suspended context to a page that has not been touched,
 * and one built without a gesture behind it stays silent for good. Kept alive
 * across timers rather than rebuilt per chime — contexts are a limited
 * resource and a phone will drop the oldest once a page has hoarded a few.
 */
function useChime(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const unlock = useCallback(() => {
    if (!enabled) return;

    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;

      ctxRef.current ??= new Ctor();
      // A context can come back suspended after a tab sleeps, even once
      // unlocked, so this runs on every start rather than only the first.
      void ctxRef.current.resume();
    } catch {
      // No audio is a degraded timer, not a broken one.
    }
  }, [enabled]);

  const play = useCallback(() => {
    const ctx = ctxRef.current;
    if (!enabled || !ctx) return;

    try {
      [880, 1108, 1318].forEach((freq, i) => {
        const at = ctx.currentTime + i * 0.18;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        // Ramped, not switched: a gain that jumps to zero clicks audibly.
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.3, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);

        osc.connect(gain).connect(ctx.destination);
        osc.start(at);
        osc.stop(at + 0.18);
      });
    } catch {
      // As above.
    }
  }, [enabled]);

  useEffect(() => () => void ctxRef.current?.close(), []);

  return { unlock, play };
}

interface RestTimerProps {
  /**
   * When the workout began, as an epoch timestamp. Given one, the bar also
   * carries the session clock — the same figure the header shows in whole
   * minutes, to the second and in view while you are logging rather than only
   * when you scroll back up.
   */
  sessionStartedAt?: number;
}

export function RestTimer({ sessionStartedAt }: RestTimerProps) {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(() => readFlag(SOUND_KEY, true));
  const [showTotal, setShowTotal] = useState(() => readFlag(TOTAL_KEY, true));
  const [total, setTotal] = useState(0);

  // The deadline is a timestamp rather than a per-tick decrement: a throttled
  // background tab resumes at the right value instead of drifting behind by
  // however long it was asleep.
  const deadline = useRef(0);
  const { unlock, play } = useChime(sound);

  useEffect(() => {
    if (!running) return;

    const tick = () =>
      setRemaining(Math.max(0, Math.round((deadline.current - Date.now()) / 1000)));

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  // The session clock runs whether or not it is on screen — hiding it is a
  // display choice, and a clock that restarted from zero each time it was
  // shown would be worse than no clock.
  useEffect(() => {
    if (sessionStartedAt == null) return;

    const tick = () =>
      setTotal(Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000)));

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sessionStartedAt]);

  useEffect(() => {
    storeFlag(SOUND_KEY, sound);
  }, [sound]);

  useEffect(() => {
    storeFlag(TOTAL_KEY, showTotal);
  }, [showTotal]);

  const start = useCallback(
    (seconds: number) => {
      unlock();
      setDuration(seconds);
      deadline.current = Date.now() + seconds * 1000;
      setRemaining(seconds);
      setRunning(true);
    },
    [unlock],
  );

  const stop = useCallback(() => {
    setRunning(false);
    setRemaining(0);
  }, []);

  const done = running && remaining === 0;
  const progress = running ? 1 - remaining / duration : 0;

  // Fires once per countdown: `done` can only go false→true by a timer
  // reaching zero, and stopping or starting another one resets it first.
  useEffect(() => {
    if (!done) return;

    play();
    // Belt and braces for a muted phone, where the beeps go nowhere.
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      // Not supported, or blocked without a recent gesture. No matter.
    }
  }, [done, play]);

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

      {/* Clocks and toggles on one line, presets on the next; a single row from
          `sm` up. Five presets, two toggles and two clocks do not fit across
          350px, and left to wrap they broke into a ragged pile. The toggles
          ride with the clocks because that is what they govern — grouped with
          the presets they read as a sixth duration. */}
      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-2 font-black tabular-nums ${
              done ? 'text-success' : 'text-on-surface'
            }`}
            aria-live="polite"
          >
            <StitchIcon name="timer" size={20} />
            <span className="text-xl" dir="ltr">
              {running ? format(remaining) : '–:––'}
            </span>
          </span>

          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {done ? t('workout.restOver') : t('workout.rest')}
          </span>

          {/* The session clock, beside the rest clock rather than under it:
              the two answer the same kind of question and are read in the
              same glance. */}
          {sessionStartedAt != null && showTotal && (
            <span className="flex items-center gap-2 border-s border-outline-variant/20 ps-3">
              <span className="flex items-center gap-2 font-black tabular-nums text-on-surface-variant">
                <StitchIcon name="timelapse" size={18} />
                <span className="text-lg" dir="ltr">
                  {format(total)}
                </span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {t('workout.totalShort')}
              </span>
            </span>
          )}

          {/* Pushed to the far end so the two clocks stay a pair. */}
          <span className="ms-auto flex items-center gap-1.5">
            {sessionStartedAt != null && (
              <button
                type="button"
                onClick={() => setShowTotal((on) => !on)}
                aria-pressed={showTotal}
                aria-label={t('workout.toggleTotalTimer')}
                title={t('workout.toggleTotalTimer')}
                className={`rounded-lg px-2 py-1.5 transition-colors ${
                  showTotal
                    ? 'bg-surface-container-high text-on-surface'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <StitchIcon name="timelapse" size={16} />
              </button>
            )}

            <button
              type="button"
              // Turning sound on mid-workout is itself the gesture the audio
              // context needs, so take it.
              onClick={() =>
                setSound((on) => {
                  if (!on) unlock();
                  return !on;
                })
              }
              aria-pressed={sound}
              aria-label={sound ? t('workout.muteTimer') : t('workout.unmuteTimer')}
              title={sound ? t('workout.muteTimer') : t('workout.unmuteTimer')}
              className={`rounded-lg px-2 py-1.5 transition-colors ${
                sound
                  ? 'bg-surface-container-high text-on-surface'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <StitchIcon name={sound ? 'volume_up' : 'volume_off'} size={16} />
            </button>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:ms-auto sm:gap-2">
          {PRESETS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => start(seconds)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-bold tabular-nums transition-colors sm:flex-initial sm:px-2.5 ${
                running && duration === seconds
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span dir="ltr">{format(seconds)}</span>
            </button>
          ))}

          {running && (
            <button
              type="button"
              onClick={stop}
              aria-label={t('workout.stopTimer')}
              className="rounded-lg bg-surface-container-low px-2 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
            >
              <StitchIcon name="close" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
