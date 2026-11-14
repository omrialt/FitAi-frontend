/**
 * Guards for the Hebrew reading order of numbers with units.
 *
 * The bug this file exists for: a set rendered "12 × ק"ג 36" to a Hebrew
 * reader, and "+ מוט 20" put the plus at the far end. Both came from forcing
 * left-to-right on an element that held Hebrew — one a `dir="ltr"` on the set
 * chip, the other a global CSS rule on every `.tabular-nums` (theme.css,
 * now `unicode-bidi: plaintext`). jsdom applies no stylesheet, so the CSS
 * side is covered by the plate line test: Hebrew text must not carry the
 * numeric class at all.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import he from '../i18n/locales/he.json';
import { WeightReps } from '../components/common/WeightReps';
import { PlateCalculator } from '../components/workout/PlateCalculator';

const HEBREW = /[֐-׿]/;

/** Every element forced LTR (by attribute) whose text contains Hebrew. */
function forcedLtrWithHebrew(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[dir="ltr"]'))
    .filter((el) => HEBREW.test(el.textContent ?? ''))
    .map((el) => el.outerHTML);
}

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'he',
    resources: { he: { translation: he } },
    interpolation: { escapeValue: false },
  });
});

describe('Hebrew reading order', () => {
  it('a set does not force LTR on its Hebrew unit', () => {
    const { container } = render(
      <div dir="rtl">
        <WeightReps weight={36} reps={12} />
      </div>,
    );
    expect(forcedLtrWithHebrew(container)).toEqual([]);
    // Logical order is the Hebrew reading order: 36, ק"ג, ×, 12.
    const parts = Array.from(container.querySelector('[data-weight-reps]')!.children).map(
      (el) => el.textContent,
    );
    expect(parts).toEqual(['36', he.common.kg, '×', '12']);
  });

  it('the plate line keeps "+ מוט 20" in Hebrew order', () => {
    const { container } = render(
      <div dir="rtl">
        <PlateCalculator weightKg={60} barKg={20} />
      </div>,
    );
    expect(forcedLtrWithHebrew(container)).toEqual([]);
    // The bar line is Hebrew text: it must not carry the numeric class that
    // used to flip it.
    const barLine = Array.from(container.querySelectorAll('span')).find((el) =>
      el.textContent?.includes('מוט'),
    )!;
    expect(barLine.className).not.toMatch(/tabular-nums/);
  });
});
