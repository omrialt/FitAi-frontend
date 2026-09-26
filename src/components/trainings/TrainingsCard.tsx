/**
 * TrainingsCard — mobile card view for a single training plan.
 * "Performance Lab" design.
 */

'use client';

import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { TrainingsActionsMenu } from './TrainingsActionsMenu';
import type { TrainingsCardProps } from '../../types/trainings-components.types';

const getDifficultyPill = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-surface-container-high text-on-surface-variant';
    case 'intermediate':
    case 'advanced':
      return 'bg-secondary-container text-on-secondary-container';
    case 'elite':
      return 'bg-error-container text-on-error-container';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
};


export function TrainingsCard({
  training,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
  onActivate,
}: TrainingsCardProps) {
  const { t, i18n } = useTranslation();

  const difficulty = (training.difficulty || 'beginner').toLowerCase();
  const difficultyLabel = ['beginner', 'intermediate', 'advanced', 'elite'].includes(
    difficulty,
  )
    ? t(`trainings.${difficulty}`)
    : training.difficulty;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-extrabold tracking-tight text-on-surface min-w-0">
          {training.title}
        </h3>
        <TrainingsActionsMenu
          training={training}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onView={onView}
          onEdit={onEdit}
          onExportPDF={onExportPDF}
          onExportExcel={onExportExcel}
          onDelete={onDelete}
          onActivate={onActivate}
        />
      </div>

      {/* Details — a chip row instead of six label/value lines: the same facts
          in a third of the height, so two plans fit on a phone screen. */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${getDifficultyPill(difficulty)}`}
        >
          {difficultyLabel}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface bg-surface-container-low rounded-full px-2.5 py-1">
          <StitchIcon name="calendar_view_week" size={14} />
          {t('common.dayCount', { count: training.days?.length || 0 })}
        </span>
        {training.estimatedDuration && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface bg-surface-container-low rounded-full px-2.5 py-1">
            <StitchIcon name="timer" size={14} />
            {t('trainings.durationMin', { count: training.estimatedDuration })}
          </span>
        )}
        {training.focus && (
          <span className="text-xs font-semibold text-on-surface bg-surface-container-low rounded-full px-2.5 py-1">
            {training.focus}
          </span>
        )}
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${training.isActive ? 'bg-success' : 'bg-outline'}`}
            aria-hidden="true"
          />
          <span className={training.isActive ? 'text-success font-semibold' : ''}>
            {training.isActive ? t('trainings.active') : t('trainings.inactive')}
          </span>
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {t('trainings.created')}{' '}
          {training.createdAt
            ? new Date(training.createdAt).toLocaleDateString(
                i18n.language === 'he' ? 'he-IL' : 'en-GB',
              )
            : t('common.none')}
        </span>
      </p>

      {/* Quick actions */}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => onView(training._id)}
          className="flex-1 flex items-center justify-center gap-1.5 min-h-11 bg-primary/10 text-primary py-2.5 rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors"
        >
          <StitchIcon name="visibility" size={16} />
          {t('common.view')}
        </button>
        <button
          type="button"
          onClick={() => onEdit(training._id)}
          className="flex-1 flex items-center justify-center gap-1.5 min-h-11 bg-surface-container-high text-on-surface py-2.5 rounded-lg font-bold text-sm hover:bg-surface-container-highest transition-colors"
        >
          <StitchIcon name="edit" size={16} />
          {t('common.edit')}
        </button>
      </div>
    </div>
  );
}
