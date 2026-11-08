import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';

import { RestTimer } from './RestTimer';

/**
 * Assertions run against translation keys rather than Hebrew copy, so
 * rewording a string never breaks a test that is really about behaviour.
 */
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

/**
 * A stand-in for the Web Audio API, which jsdom does not implement.
 *
 * It records what was asked of it rather than pretending to make a noise —
 * the thing worth asserting is that the countdown reaching zero starts
 * oscillators, and that a muted timer starts none.
 */
function stubAudio() {
  const started: number[] = [];

  class FakeParam {
    value = 0;
    setValueAtTime() {}
    exponentialRampToValueAtTime() {}
  }
  class FakeNode {
    connect(next: unknown) {
      return next;
    }
  }
  class FakeOsc extends FakeNode {
    type = '';
    frequency = new FakeParam();
    start() {
      started.push(this.frequency.value);
    }
    stop() {}
  }
  class FakeGain extends FakeNode {
    gain = new FakeParam();
  }
  class FakeCtx {
    currentTime = 0;
    destination = {};
    createOscillator() {
      return new FakeOsc();
    }
    createGain() {
      return new FakeGain();
    }
    resume() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
  }

  vi.stubGlobal('AudioContext', FakeCtx);
  return started;
}

/** Runs the fake clock past a whole countdown, ticks and all. */
function runOut(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000 + 500);
  });
}

describe('RestTimer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('offers 45 seconds — the short rest', () => {
    render(<RestTimer />);
    expect(screen.getByText('0:45')).toBeInTheDocument();
  });

  it('chimes when the countdown reaches zero', () => {
    const started = stubAudio();
    render(<RestTimer />);

    act(() => {
      screen.getByText('0:45').click();
    });
    expect(started).toHaveLength(0);

    runOut(45);

    expect(screen.getByText('workout.restOver')).toBeInTheDocument();
    // Three rising tones, not one: a single beep is easy to miss in a gym.
    expect(started).toHaveLength(3);
    expect(started[0]).toBeLessThan(started[2]);
  });

  it('stays silent once muted, and remembers it', () => {
    const started = stubAudio();
    const { unmount } = render(<RestTimer />);

    act(() => {
      screen.getByLabelText('workout.muteTimer').click();
    });
    act(() => {
      screen.getByText('0:45').click();
    });
    runOut(45);

    expect(started).toHaveLength(0);

    // The preference is per device, so a remount must not un-mute it.
    unmount();
    render(<RestTimer />);
    expect(screen.getByLabelText('workout.unmuteTimer')).toBeInTheDocument();
  });

  it('shows the session clock beside the rest clock, and can hide it', () => {
    // Twelve minutes and five seconds ago.
    render(<RestTimer sessionStartedAt={Date.now() - 725_000} />);

    expect(screen.getByText('workout.totalShort')).toBeInTheDocument();
    expect(screen.getByText('12:05')).toBeInTheDocument();

    act(() => {
      screen.getByLabelText('workout.toggleTotalTimer').click();
    });

    expect(screen.queryByText('workout.totalShort')).not.toBeInTheDocument();
    expect(screen.queryByText('12:05')).not.toBeInTheDocument();
  });

  it('has no session clock to show without a start time', () => {
    render(<RestTimer />);

    expect(screen.queryByText('workout.totalShort')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('workout.toggleTotalTimer')).not.toBeInTheDocument();
  });

  it('counts an hour-long session in hours', () => {
    render(<RestTimer sessionStartedAt={Date.now() - 3_725_000} />);
    expect(screen.getByText('1:02:05')).toBeInTheDocument();
  });

  describe('main action (direction B)', () => {
    it('starts the rest by itself when a set is marked done', () => {
      stubAudio();
      const { rerender } = render(<RestTimer restSignal={0} />);
      expect(screen.getByText('–:––')).toBeInTheDocument();
      rerender(<RestTimer restSignal={1} />);
      expect(document.querySelector('.stat-number')?.textContent).toBe('1:30');
    });

    it('offers the next set as the one button, and becomes the countdown after it', () => {
      stubAudio();
      const onCompleteNext = vi.fn();
      const { rerender } = render(
        <RestTimer restSignal={0} nextSetLabel="Finished set 2" onCompleteNext={onCompleteNext} />,
      );
      fireEvent.click(screen.getByRole('button', { name: /Finished set 2/ }));
      expect(onCompleteNext).toHaveBeenCalledTimes(1);

      rerender(<RestTimer restSignal={1} nextSetLabel="Finished set 3" onCompleteNext={onCompleteNext} />);
      // While resting, the same spot is the countdown, with +30 and skip.
      expect(screen.queryByRole('button', { name: /Finished set 3/ })).toBeNull();
      expect(screen.getByRole('button', { name: 'workout.liveSkipRest' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'workout.livePlus30' }));
      expect(screen.getAllByText('2:00').length).toBeGreaterThan(0);

      fireEvent.click(screen.getByRole('button', { name: 'workout.skip' }));
      expect(screen.getByRole('button', { name: /Finished set 3/ })).toBeInTheDocument();
    });

    it('turns into the finish button once every set is done', () => {
      const onFinish = vi.fn();
      render(<RestTimer nextSetLabel={null} onFinish={onFinish} />);
      fireEvent.click(screen.getByRole('button', { name: /workout\.finish/ }));
      expect(onFinish).toHaveBeenCalled();
    });
  });
});

