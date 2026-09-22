import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { WeightReps } from './WeightReps';

vi.mock('react-i18next', () => {
  const translation = { t: (key: string) => key, i18n: { language: 'he' } };
  return { useTranslation: () => translation };
});

describe('WeightReps', () => {
  /**
   * The bug this component exists for: rendered as loose text inside an RTL
   * paragraph, `100` + unit + `×` + `6` was reordered by the bidi algorithm
   * into the single number `1006`. The fix is the isolation, so that is what
   * is asserted — not the text, which looked correct in the source all along.
   */
  it('isolates the value from the surrounding direction', () => {
    const { container } = render(<WeightReps weight={100} reps={6} />);

    const value = container.querySelector('[dir="ltr"]');
    expect(value).not.toBeNull();
    expect(value).toHaveTextContent('100');
    expect(value).toHaveTextContent('6');
  });

  it('keeps weight before reps, whatever the page direction', () => {
    render(
      <div dir="rtl">
        <WeightReps weight={100} reps={6} />
      </div>,
    );

    // Order in the DOM is what the LTR isolation pins down.
    const value = screen.getByText('100').closest('[dir="ltr"]')!;
    const numbers = Array.from(value.querySelectorAll('span'))
      .map((el) => el.textContent?.trim())
      .filter((text) => text && /^[\d.]+$/.test(text));

    expect(numbers).toEqual(['100', '6']);
  });

  it('renders a fractional weight without swallowing the reps', () => {
    // 87.5 × 8 read "87.58" on the client card — the decimal point is one
    // more neutral character for bidi to fold in.
    render(<WeightReps weight={87.5} reps={8} />);

    expect(screen.getByText('87.5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
