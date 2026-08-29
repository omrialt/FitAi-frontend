import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';

import { ExercisePicker } from './ExercisePicker';
import { exerciseService } from '../../../services/exercise.service';
import type { Exercise } from '../../../types/exercise.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'he' },
  }),
}));

vi.mock('../../../services/exercise.service', () => ({
  exerciseService: { search: vi.fn() },
}));

const CABLE_FLY: Exercise = {
  slug: 'cable-fly',
  nameEn: 'Cable Fly',
  nameHe: 'פרפר בפולי',
  primaryMuscle: 'chest',
  secondaryMuscles: [],
  equipment: 'cable',
  aliases: ['fly'],
  isCompound: false,
};

/**
 * The picker is controlled, so the harness has to feed the value back the way
 * the real edit modal does — otherwise typing never changes `value`, the search
 * effect never re-runs, and the tests quietly assert against a dead component.
 */
function Harness({ onChange }: { onChange: (p: ExercisePatch) => void }) {
  const [value, setValue] = useState('');

  return (
    <MantineProvider>
      <ExercisePicker
        label="name"
        value={value}
        onChange={(patch) => {
          setValue(patch.name);
          onChange(patch);
        }}
      />
    </MantineProvider>
  );
}

interface ExercisePatch {
  name: string;
  muscleGroup?: string;
}

function renderPicker() {
  const onChange = vi.fn<(patch: ExercisePatch) => void>();
  const utils = render(<Harness onChange={onChange} />);
  return { ...utils, onChange };
}

describe('ExercisePicker', () => {
  beforeEach(() => {
    vi.mocked(exerciseService.search).mockResolvedValue([CABLE_FLY]);
  });

  it('does not query the catalogue for a single character', async () => {
    const user = userEvent.setup();
    renderPicker();

    await user.type(screen.getByRole('textbox'), 'פ');

    await waitFor(() => {
      expect(exerciseService.search).not.toHaveBeenCalled();
    });
  });

  it('searches once the term is long enough', async () => {
    const user = userEvent.setup();
    renderPicker();

    await user.type(screen.getByRole('textbox'), 'פרפר');

    await waitFor(() => {
      expect(exerciseService.search).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'פרפר' }),
      );
    });
  });

  /**
   * The regression this file exists for.
   *
   * Picking a catalogue exercise has to set the muscle group as well as the
   * name — that is the entire reason the field is backed by the catalogue. It
   * shipped setting only the name, because Mantine fires `onChange` after
   * `onOptionSubmit` and a stale-closure writer reverted the second field.
   */
  it('reports BOTH the name and the muscle group when an option is picked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker();

    await user.type(screen.getByRole('textbox'), 'פרפר');
    await screen.findByText('פרפר בפולי');
    await user.click(screen.getByText('פרפר בפולי'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'פרפר בפולי',
          muscleGroup: expect.stringContaining('chest'),
        }),
      );
    });
  });

  // The field must never reject what the user typed: someone training
  // something the catalogue has never heard of writes it in as before.
  it('reports free text with no muscle group attached', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker();

    await user.type(screen.getByRole('textbox'), 'סחיבת צמיג');

    expect(onChange).toHaveBeenCalled();
    for (const [patch] of onChange.mock.calls) {
      expect(patch.muscleGroup).toBeUndefined();
    }
  });

  it('keeps accepting input when the catalogue is unreachable', async () => {
    vi.mocked(exerciseService.search).mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    const { onChange } = renderPicker();

    await user.type(screen.getByRole('textbox'), 'פרפר');

    await waitFor(() => {
      expect(exerciseService.search).toHaveBeenCalled();
    });
    expect(onChange).toHaveBeenCalled();
  });
});
