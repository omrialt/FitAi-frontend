import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PlateCalculator } from './PlateCalculator';

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

describe('PlateCalculator', () => {
  it('shows the plates for one side, grouped', () => {
    render(<PlateCalculator weightKg={100} barKg={20} />);

    expect(screen.getByText('workout.perSide')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('collapses a repeated plate into a count', () => {
    // 50 a side is 25 + 25 — shown once with a multiplier, not twice.
    render(<PlateCalculator weightKg={120} barKg={20} />);

    expect(screen.getByText('2×25')).toBeInTheDocument();
    expect(screen.queryByText('25')).not.toBeInTheDocument();
  });

  it('says so when only the bar is loaded', () => {
    render(<PlateCalculator weightKg={20} barKg={20} />);
    expect(screen.getByText('workout.barOnly')).toBeInTheDocument();
  });

  // Silence here is the dangerous case: the log would record 20.5 for a bar
  // that physically weighs 20.
  it('reports a target the plates cannot reach', () => {
    render(<PlateCalculator weightKg={20.5} barKg={20} />);

    expect(
      screen.getByText(/workout\.plateShortfall.*"achieved":20/),
    ).toBeInTheDocument();
  });

  it('renders nothing for a weight below the bar', () => {
    const { container } = render(<PlateCalculator weightKg={15} barKg={20} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no bar', () => {
    const { container } = render(<PlateCalculator weightKg={40} barKg={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});
