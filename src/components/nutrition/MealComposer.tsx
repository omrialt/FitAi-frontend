import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { foodService } from '../../services/coach.service';
import type { FoodSearchResult } from '../../types/coach.types';
import type { FoodUnit, LoggedFood, MealSource } from '../../types/meal-log.types';

/**
 * Builds the list of foods for one logged meal.
 *
 * Three ways in, and the ordering on screen is a claim about which matters:
 * **manual entry is a first-class tab, not a fallback.** The request that
 * prompted this feature was explicitly for a meal that is not in any plan, with
 * every macro typed by hand — so a search box that fails to find "my
 * grandmother's soup" must not be a dead end.
 *
 * USDA search is a convenience layered on top: it fills the same four numbers
 * the manual form asks for, and the row it came from is shown so the figures
 * are traceable. When the server has no `FDC_API_KEY` the tab is absent rather
 * than present-and-broken, the same rule the AI features follow.
 */

const UNITS: FoodUnit[] = ['g', 'ml', 'unit', 'cup', 'tbsp', 'oz'];

type Tab = 'manual' | 'search';

const EMPTY_DRAFT = {
  name: '',
  quantity: '',
  unit: 'g' as FoodUnit,
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
};

/** A number the user typed, or 0 — an empty macro box means zero, not invalid. */
const num = (v: string): number => {
  const parsed = Number(v);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export function MealComposer({
  foods,
  onChange,
  onSourceChange,
  searchEnabled,
}: {
  foods: LoggedFood[];
  onChange: (foods: LoggedFood[]) => void;
  /** Reported so the entry records where its numbers came from. */
  onSourceChange: (source: MealSource) => void;
  searchEnabled: boolean;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('manual');
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [grams, setGrams] = useState<Record<number, string>>({});

  // A tab that cannot work should not be offered. If the key disappears while
  // the screen is open, fall back rather than leaving the user on a dead tab.
  useEffect(() => {
    if (!searchEnabled && tab === 'search') setTab('manual');
  }, [searchEnabled, tab]);

  const addFood = (food: LoggedFood, source: MealSource) => {
    onChange([...foods, food]);
    onSourceChange(source);
  };

  const addManual = () => {
    if (!draft.name.trim()) return;

    addFood(
      {
        name: draft.name.trim(),
        quantity: draft.quantity ? num(draft.quantity) : null,
        unit: draft.quantity ? draft.unit : null,
        calories: num(draft.calories),
        protein: num(draft.protein),
        carbs: num(draft.carbs),
        fat: num(draft.fat),
      },
      'manual',
    );
    setDraft(EMPTY_DRAFT);
  };

  const runSearch = async () => {
    const q = query.trim();
    if (q.length < 2 || searching) return;

    setSearching(true);
    try {
      setResults(await foodService.search(q, 8));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  /**
   * USDA rows are per 100g, so the grams box is what turns a reference figure
   * into a portion. It defaults to 100 rather than to the serving size: a
   * default the user did not choose should be the one that makes the maths
   * obvious, not the one that hides it.
   */
  const addFromSearch = (row: FoodSearchResult) => {
    const g = num(grams[row.fdcId] || '100') || 100;
    const factor = g / 100;

    addFood(
      {
        name: row.description,
        quantity: g,
        unit: 'g',
        calories: Math.round(row.per100g.calories * factor),
        protein: Math.round(row.per100g.protein * factor * 10) / 10,
        carbs: Math.round(row.per100g.carbs * factor * 10) / 10,
        fat: Math.round(row.per100g.fat * factor * 10) / 10,
        fdcId: row.fdcId,
      },
      'search',
    );
  };

  const field = (
    key: keyof typeof EMPTY_DRAFT,
    label: string,
    opts: { wide?: boolean; numeric?: boolean } = {},
  ) => (
    <label className={opts.wide ? 'col-span-2 flex flex-col gap-1' : 'flex flex-col gap-1'}>
      <span className="text-[11px] font-bold text-on-surface-variant">{label}</span>
      <input
        value={draft[key] as string}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        inputMode={opts.numeric ? 'decimal' : undefined}
        className="min-h-10 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 text-sm text-on-surface"
      />
    </label>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs. Manual first — it is the path that always works. */}
      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={tab === 'manual'}
          onClick={() => setTab('manual')}
          className={`min-h-10 flex-1 rounded-lg border text-sm font-bold ${
            tab === 'manual'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-outline-variant/40 text-on-surface-variant'
          }`}
        >
          {t('mealLog.tabManual')}
        </button>

        {searchEnabled && (
          <button
            type="button"
            aria-pressed={tab === 'search'}
            onClick={() => setTab('search')}
            className={`min-h-10 flex-1 rounded-lg border text-sm font-bold ${
              tab === 'search'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-outline-variant/40 text-on-surface-variant'
            }`}
          >
            {t('mealLog.tabSearch')}
          </button>
        )}
      </div>

      {tab === 'manual' ? (
        <div className="flex flex-col gap-3 rounded-lg border border-outline-variant/20 p-3">
          <div className="grid grid-cols-2 gap-3">
            {field('name', t('mealLog.foodName'), { wide: true })}
            {field('quantity', t('mealLog.quantity'), { numeric: true })}
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-on-surface-variant">
                {t('mealLog.unit')}
              </span>
              <select
                value={draft.unit}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value as FoodUnit })}
                className="min-h-10 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 text-sm text-on-surface"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{t(`mealLog.unit_${u}`)}</option>
                ))}
              </select>
            </label>
            {field('calories', t('nutrition.calories'), { numeric: true })}
            {field('protein', t('nutrition.protein'), { numeric: true })}
            {field('carbs', t('nutrition.carbs'), { numeric: true })}
            {field('fat', t('nutrition.fat'), { numeric: true })}
          </div>

          <button
            type="button"
            onClick={addManual}
            disabled={!draft.name.trim()}
            className="min-h-11 rounded-lg border border-primary text-sm font-bold text-primary disabled:opacity-50"
          >
            {t('mealLog.addFood')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-outline-variant/20 p-3">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); void runSearch(); }
              }}
              placeholder={t('mealLog.searchPlaceholder')}
              aria-label={t('mealLog.tabSearch')}
              className="min-h-11 flex-1 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 text-sm text-on-surface"
            />
            <button
              type="button"
              onClick={() => void runSearch()}
              disabled={searching || query.trim().length < 2}
              className="min-h-11 rounded-lg bg-primary-gradient px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {searching ? t('mealLog.searching') : t('mealLog.search')}
            </button>
          </div>

          <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {results.map((row) => (
              <li
                key={row.fdcId}
                className="flex flex-col gap-2 rounded-lg border border-outline-variant/20 p-2"
              >
                <span className="text-sm font-bold text-on-surface">{row.description}</span>
                <span className="text-[11px] text-on-surface-variant">
                  {t('mealLog.per100g', {
                    calories: row.per100g.calories,
                    protein: row.per100g.protein,
                    carbs: row.per100g.carbs,
                    fat: row.per100g.fat,
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    value={grams[row.fdcId] ?? '100'}
                    onChange={(e) => setGrams({ ...grams, [row.fdcId]: e.target.value })}
                    inputMode="decimal"
                    aria-label={t('mealLog.grams')}
                    className="min-h-10 w-20 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-2 text-sm text-on-surface"
                  />
                  <span className="text-xs text-on-surface-variant">{t('mealLog.unit_g')}</span>
                  <button
                    type="button"
                    onClick={() => addFromSearch(row)}
                    className="ms-auto min-h-10 rounded-lg border border-primary px-3 text-xs font-bold text-primary"
                  >
                    {t('mealLog.addFood')}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Not `nutrition.macroSource` — that copy belongs to the free-text
              parser and says the text was read by AI. Nothing is parsed here;
              these are database rows scaled by a number the user typed. */}
          {results.length > 0 && (
            <p className="text-[11px] text-on-surface-variant">
              {t('mealLog.searchSource')}
            </p>
          )}
        </div>
      )}

      {/* What has been added so far. Removable, because a mis-tapped row is the
          most likely mistake on this screen. */}
      {foods.length > 0 && (
        <ul className="flex flex-col gap-2">
          {foods.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-outline-variant/20 p-2"
            >
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-bold text-on-surface">
                  {f.name}
                  {f.quantity ? ` · ${f.quantity}${f.unit && f.unit !== 'unit' ? f.unit : ''}` : ''}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {t('nutrition.macroLine', {
                    calories: f.calories,
                    protein: f.protein,
                    carbs: f.carbs,
                    fat: f.fat,
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onChange(foods.filter((_, j) => j !== i))}
                aria-label={t('common.delete')}
                className="min-h-9 min-w-9 rounded-lg text-error"
              >
                <StitchIcon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
