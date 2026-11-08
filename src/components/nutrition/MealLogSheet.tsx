/**
 * Meal logging as a modal bottom sheet (redesign, direction B; Android
 * convention for a short, interrupting task). Opened from the quick-add and
 * from Today's timeline; dismissed by the scrim, Escape, the close button or
 * the system back gesture (Mantine Drawer handles all four).
 *
 * The form mounts only while the sheet is open, so its data — the active
 * nutrition plan for the "from your plan" picker — is fetched on demand.
 */
import { Drawer } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { MealLogForm } from './MealLogForm';
import { useDashboard } from '../../hooks/useDashboard';

/** Fired on window to ask the app shell to open the sheet. */
export const OPEN_MEAL_SHEET_EVENT = 'fitai:open-meal-sheet';

function SheetBody({ onDone }: { onDone: () => void }) {
  const { activeNutritionPlan } = useDashboard();
  return <MealLogForm plan={activeNutritionPlan} onSaved={onDone} />;
}

export function MealLogSheet({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      title={t('mealLog.title')}
      closeButtonProps={{ 'aria-label': t('common.close'), size: 'lg' }}
      styles={{
        content: {
          height: 'auto',
          maxHeight: '88dvh',
          borderStartStartRadius: 'var(--radius-sheet)',
          borderStartEndRadius: 'var(--radius-sheet)',
        },
        title: { fontWeight: 800, fontSize: 'var(--text-xl)' },
        body: {
          paddingBottom: 'calc(var(--mantine-spacing-lg) + env(safe-area-inset-bottom, 0px))',
          overscrollBehavior: 'contain',
        },
      }}
    >
      {opened && <SheetBody onDone={onClose} />}
    </Drawer>
  );
}
