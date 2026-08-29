import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Loader } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { exerciseService } from '../../../services/exercise.service';
import type { Exercise } from '../../../types/exercise.types';

/**
 * Exercise name field, backed by the catalogue.
 *
 * The important property is what it does *not* do: it never rejects what the
 * user typed. `Autocomplete` — not `Select` — because someone training
 * something the catalogue has never heard of must still be able to write it in,
 * exactly as before this existed. The catalogue suggests; the user decides.
 *
 * Picking a suggestion fills the muscle group too. That is the whole reason
 * this field exists: the muscle group is the field people leave inconsistent,
 * and the only way to get canonical values into it is to stop asking for them.
 */

/** Long enough to stop a request per keystroke, short enough to feel live. */
const DEBOUNCE_MS = 250;
/** A one-letter query matches most of the catalogue and helps nobody. */
const MIN_QUERY = 2;

interface ExercisePickerProps {
  value: string;
  label: string;
  /** Called with the typed text, and with a muscle group when one is known. */
  onChange: (patch: { name: string; muscleGroup?: string }) => void;
}

export function ExercisePicker({
  value,
  label,
  onChange,
}: ExercisePickerProps) {
  const { t, i18n } = useTranslation();

  const [matches, setMatches] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  // The list is keyed by display label, so a pick can be resolved back to the
  // catalogue row it came from without stuffing ids into the input.
  const isHebrew = i18n.language.startsWith('he');
  const labelFor = useMemo(
    () => (exercise: Exercise) => (isHebrew ? exercise.nameHe : exercise.nameEn),
    [isHebrew],
  );

  const timer = useRef<number | null>(null);

  useEffect(() => {
    const term = value.trim();

    if (timer.current !== null) window.clearTimeout(timer.current);
    if (term.length < MIN_QUERY) {
      setMatches([]);
      setLoading(false);
      return;
    }

    // A suggestion already chosen exactly should not re-open the dropdown on
    // every re-render of the parent form.
    if (matches.some((exercise) => labelFor(exercise) === term)) return;

    setLoading(true);
    timer.current = window.setTimeout(() => {
      exerciseService
        .search({ search: term, limit: 8 })
        .then(setMatches)
        // A catalogue that is unreachable must not block typing a name.
        .catch(() => setMatches([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
    // `matches` is read but deliberately not a dependency: including it would
    // re-run the effect with every result and loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, labelFor]);

  const options = useMemo(
    () => matches.map(labelFor).filter(Boolean),
    [matches, labelFor],
  );

  return (
    <Autocomplete
      label={label}
      value={value}
      data={options}
      size="xs"
      required
      limit={8}
      placeholder={t('trainings.exerciseSearchPlaceholder')}
      rightSection={loading ? <Loader size={12} /> : null}
      onChange={(typed) => onChange({ name: typed })}
      onOptionSubmit={(picked) => {
        const chosen = matches.find((exercise) => labelFor(exercise) === picked);
        onChange({
          name: picked,
          muscleGroup: chosen
            ? t(`exercises.muscle_${chosen.primaryMuscle}`)
            : undefined,
        });
      }}
    />
  );
}
