import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { foodService } from '../../services/coach.service';
import type { ParsedFood } from '../../types/coach.types';

/**
 * "אכלתי חזה עוף עם אורז" into a meal.
 *
 * The rendering carries the honesty the server built in, and it is the whole
 * reason this component is not just a list of numbers:
 *
 *   - An unmatched food shows **no macros at all**, not zeros, and reads as a
 *     row to fill in by hand. Zero is a number, and a user scanning a list has
 *     no way to tell a real 0g of fat from a lookup that failed.
 *
 *   - An **estimated** quantity is marked. "An apple" has to become some number
 *     of grams for a macro to exist, but the user did not say 182g and must not
 *     be shown 95 calories as though they had.
 *
 *   - The **source** is shown for every matched row. The macros come from USDA
 *     and not from a model, and the only way the user can know that is if the
 *     app says which row it used.
 */

function Row({ food }: { food: ParsedFood }) {
  const { t } = useTranslation();

  return (
    <li className="flex flex-col gap-1 rounded-lg border border-outline-variant/20 p-3">
      <div className="flex items-center gap-2">
        <span className="flex-1 text-sm font-bold text-on-surface">
          {food.name}
        </span>

        {food.quantity !== null && (
          <span className="text-xs text-on-surface-variant">
            {food.quantity}
            {food.unit && food.unit !== 'unit' ? food.unit : ''}
          </span>
        )}
      </div>

      {food.matched ? (
        <>
          <p className="text-sm font-extrabold text-on-surface">
            {t('nutrition.macroLine', {
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
            })}
          </p>

          <p className="text-[11px] text-on-surface-variant">
            {food.source?.description}
            {food.quantityEstimated && (
              <>
                {' · '}
                <span className="font-bold text-warning">
                  {t('nutrition.estimatedAmount')}
                </span>
              </>
            )}
          </p>
        </>
      ) : (
        // Deliberately not a zeroed macro row. This is the state the user was
        // already in before the feature existed, and it looks like it.
        <p className="text-xs font-bold text-on-surface-variant">
          {t('nutrition.foodNotFound')}
        </p>
      )}
    </li>
  );
}

export function FoodTextLogger({
  enabled,
  onAccept,
}: {
  enabled: boolean;
  /** Handed only the rows that actually have macros. */
  onAccept?: (foods: ParsedFood[]) => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [items, setItems] = useState<ParsedFood[] | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) return null;

  const parse = async () => {
    const value = text.trim();
    if (value.length < 2 || working) return;

    setWorking(true);
    setError(null);

    try {
      const result = await foodService.parse(value);
      setItems(result.items);
      if (result.items.length === 0) setError(t('nutrition.parseNothing'));
    } catch {
      setError(t('nutrition.parseFailed'));
    } finally {
      setWorking(false);
    }
  };

  const matched = items?.filter((item) => item.matched) ?? [];

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
      <header className="mb-1 flex items-center gap-2">
        <StitchIcon name="restaurant_menu" size={18} />
        <h2 className="text-base font-extrabold tracking-tight text-on-surface">
          {t('nutrition.textLogTitle')}
        </h2>
      </header>

      <p className="mb-3 text-xs text-on-surface-variant">
        {t('nutrition.textLogSubtitle')}
      </p>

      <div className="flex items-end gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, 500))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void parse();
            }
          }}
          maxLength={500}
          placeholder={t('nutrition.textLogPlaceholder')}
          aria-label={t('nutrition.textLogTitle')}
          className="min-h-11 flex-1 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 text-sm text-on-surface"
        />

        <button
          type="button"
          onClick={() => void parse()}
          disabled={working || text.trim().length < 2}
          className="min-h-11 rounded-lg bg-primary-gradient px-4 text-sm font-bold text-white disabled:opacity-60"
        >
          {working ? t('nutrition.parsing') : t('nutrition.parse')}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs font-bold text-error" role="alert">
          {error}
        </p>
      )}

      {items && items.length > 0 && (
        <>
          <ul className="mt-4 flex flex-col gap-2">
            {items.map((item, index) => (
              <Row key={`${item.name}-${index}`} food={item} />
            ))}
          </ul>

          {onAccept && matched.length > 0 && (
            <button
              type="button"
              onClick={() => onAccept(matched)}
              className="mt-3 min-h-11 w-full rounded-lg border border-primary text-sm font-bold text-primary"
            >
              {t('nutrition.addFoods', { count: matched.length })}
            </button>
          )}

          {/* Says where the numbers came from, once, under the list. The claim
              this feature rests on is that they are not invented. */}
          <p className="mt-3 text-[11px] text-on-surface-variant">
            {t('nutrition.macroSource')}
          </p>
        </>
      )}
    </section>
  );
}
