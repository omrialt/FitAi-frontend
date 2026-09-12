import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { PlanFoodPicker } from './PlanFoodPicker';
import type { NutritionPlan } from '../../types/nutrition.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown> | string) =>
      vars && typeof vars === 'object' ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

const plan = {
  _id: 'p1',
  title: 'תפריט',
  meals: [
    {
      mealType: 'breakfast',
      foods: [
        { name: "קוטג'", quantity: 1, unit: 'unit', calories: 238, protein: 27, carbs: 3.8, fat: 12.5 },
        { name: 'יוגורט', quantity: 1, unit: 'unit', calories: 138, protein: 20, carbs: 13.7, fat: 0 },
      ],
    },
    {
      mealType: 'lunch',
      foods: [
        { name: 'חזה עוף', quantity: 300, unit: 'g', calories: 342, protein: 78, carbs: 0, fat: 7.8 },
      ],
    },
  ],
} as unknown as NutritionPlan;

describe('PlanFoodPicker', () => {
  it('renders nothing without an active plan', () => {
    const { container } = render(
      <PlanFoodPicker plan={null} onAddFoods={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  /**
   * Collapsed by default. Expanded would put every food in the plan on screen
   * above the form people came to use.
   */
  it('starts collapsed and expands one meal at a time', () => {
    render(<PlanFoodPicker plan={plan} onAddFoods={vi.fn()} />);

    // The name shares its span with the quantity suffix, so match loosely.
    expect(screen.queryByText(/קוטג'/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('nutrition.meal_breakfast'));
    expect(screen.getByText(/קוטג'/)).toBeInTheDocument();

    // Opening lunch closes breakfast — only one wall of rows at a time.
    fireEvent.click(screen.getByText('nutrition.meal_lunch'));
    expect(screen.queryByText(/קוטג'/)).not.toBeInTheDocument();
    expect(screen.getByText(/חזה עוף/)).toBeInTheDocument();
  });

  /**
   * The request this component exists for: one item, not the whole meal.
   */
  it('adds a single item without touching the label or meal type', () => {
    const onAddFoods = vi.fn();
    render(<PlanFoodPicker plan={plan} onAddFoods={onAddFoods} />);

    fireEvent.click(screen.getByText('nutrition.meal_breakfast'));
    fireEvent.click(screen.getByLabelText(/mealLog.addItem.*יוגורט/));

    expect(onAddFoods).toHaveBeenCalledTimes(1);
    const [foods, label, mealType] = onAddFoods.mock.calls[0];

    expect(foods).toEqual([
      {
        name: 'יוגורט',
        quantity: 1,
        unit: 'unit',
        calories: 138,
        protein: 20,
        carbs: 13.7,
        fat: 0,
      },
    ]);
    // A single item says nothing about which meal is being logged, so it must
    // not move the user's selection under them.
    expect(label).toBeUndefined();
    expect(mealType).toBeUndefined();
  });

  it('still adds a whole meal in one tap, and names it', () => {
    const onAddFoods = vi.fn();
    render(<PlanFoodPicker plan={plan} onAddFoods={onAddFoods} />);

    fireEvent.click(screen.getAllByText('mealLog.addWholeMeal')[0]);

    const [foods, label, mealType] = onAddFoods.mock.calls[0];
    expect(foods).toHaveLength(2);
    expect(label).toBe('nutrition.meal_breakfast');
    expect(mealType).toBe('breakfast');
  });

  it('does not require expanding a meal to add all of it', () => {
    const onAddFoods = vi.fn();
    render(<PlanFoodPicker plan={plan} onAddFoods={onAddFoods} />);

    // Nothing expanded — the whole-meal button is still there.
    expect(screen.queryByText(/חזה עוף/)).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByText('mealLog.addWholeMeal')[1]);
    expect(onAddFoods.mock.calls[0][0]).toHaveLength(1);
  });

  it('summarises each meal without opening it', () => {
    render(<PlanFoodPicker plan={plan} onAddFoods={vi.fn()} />);

    expect(
      screen.getByText(/itemsAndCalories.*"count":2.*"calories":376/),
    ).toBeInTheDocument();
  });
});
