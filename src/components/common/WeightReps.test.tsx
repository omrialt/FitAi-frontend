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
   * into the single number `1006`. Each part is its own element and each
   * number its own `<bdi>`, so there is no run for bidi to fold together.
   */
  it('keeps each number in its own isolate', () => {
    const { container } = render(<WeightReps weight={100} reps={6} />);

    const isolated = Array.from(container.querySelectorAll('bdi')).map((el) => el.textContent);
    expect(isolated).toEqual(['100', '6']);
  });

  /**
   * The follow-up bug: pinning the value `dir="ltr"` kept the digits apart but
   * made a Hebrew reader meet the reps first ("12 × ק"ג 36"). The value must
   * follow the page direction, so it may not force one of its own.
   */
  it('does not force a direction, so the page direction orders it', () => {
    const { container } = render(
      <div dir="rtl">
        <WeightReps weight={36} reps={12} />
      </div>,
    );

    const value = container.querySelector('[data-weight-reps]')!;
    expect(value.closest('[dir="ltr"]')).toBeNull();
    expect(value.querySelector('[dir]')).toBeNull();
  });

  it('keeps weight, unit, ×, reps in that logical order', () => {
    const { container } = render(<WeightReps weight={100} reps={6} />);

    const parts = Array.from(container.querySelector('[data-weight-reps]')!.children).map(
      (el) => el.textContent,
    );
    expect(parts).toEqual(['100', 'common.kg', '×', '6']);
  });

  it('renders a fractional weight without swallowing the reps', () => {
    // 87.5 × 8 read "87.58" on the client card — the decimal point is one
    // more neutral character for bidi to fold in.
    render(<WeightReps weight={87.5} reps={8} />);

    expect(screen.getByText('87.5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
