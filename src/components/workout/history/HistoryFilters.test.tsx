import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { HistoryFilters } from './HistoryFilters';
import type { HistoryFilterValues } from './filters';

/** Keys, not copy, so rewording a label never breaks a behaviour test. */
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      typeof vars?.defaultValue === 'string' ? vars.defaultValue : key,
    i18n: { language: 'he' },
  }),
}));

const EMPTY: HistoryFilterValues = {
  search: '',
  type: '',
  muscle: '',
  plan: '',
  days: 0,
};

function renderFilters(plans: string[], value = EMPTY) {
  const onChange = vi.fn();
  render(
    <HistoryFilters
      value={value}
      onChange={onChange}
      types={['Upper A', 'Lower']}
      muscles={['chest']}
      plans={plans}
    />,
  );
  return onChange;
}

describe('HistoryFilters · plan picker (N-53)', () => {
  it('stays hidden when the log has a single plan', () => {
    renderFilters(['Upper / Lower Split']);
    expect(
      screen.queryByLabelText('workout.history.planFilter'),
    ).not.toBeInTheDocument();
  });

  it('appears with two plans and reports the one picked', () => {
    const onChange = renderFilters(['Upper / Lower Split', 'PPL']);

    fireEvent.change(screen.getByLabelText('workout.history.planFilter'), {
      target: { value: 'PPL' },
    });

    expect(onChange).toHaveBeenCalledWith({ plan: 'PPL' });
  });

  it('clears the plan along with every other filter', () => {
    const onChange = renderFilters(['A', 'B'], { ...EMPTY, plan: 'A' });

    fireEvent.click(screen.getByText('workout.history.clearFilters'));

    expect(onChange).toHaveBeenCalledWith({
      search: '',
      type: '',
      muscle: '',
      plan: '',
      days: 0,
    });
  });
});
