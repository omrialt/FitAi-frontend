import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@mantine/core';

import { AppLayout } from '../components/AppLayout';
import { StitchIcon } from '../components/common/StitchIcon';
import { MealLogForm } from '../components/nutrition/MealLogForm';
import { RemainingToday } from '../components/nutrition/RemainingToday';
import { localDayString } from '../services/meal-log.service';
import { useDashboard } from '../hooks/useDashboard';

/**
 * Full-page meal logging, for deep links and desktop. On phones the quick-add
 * opens the same form as a bottom sheet (MealLogSheet) instead.
 */
export default function LogMealPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeNutritionPlan } = useDashboard();
  const [refreshKey, setRefreshKey] = useState(0);
  const day = localDayString();

  return (
    <AppLayout>
      <Container size="lg" py="xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-4 hidden md:flex items-center gap-1 text-sm font-bold text-primary"
        >
          <StitchIcon name="chevron_left" size={16} />
          {t('mealLog.backToDashboard')}
        </button>

        <header className="mb-6">
          <h1 className="font-bold text-on-surface">{t('mealLog.title')}</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t('mealLog.subtitle', { date: new Date().toLocaleDateString(i18n.language) })}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr] items-start">
          <section className="rounded-[var(--radius-card)] bg-surface-container-low p-5">
            <MealLogForm plan={activeNutritionPlan} onSaved={() => setRefreshKey((k) => k + 1)} />
          </section>
          <RemainingToday key={refreshKey} day={day} showMeals />
        </div>
      </Container>
    </AppLayout>
  );
}
