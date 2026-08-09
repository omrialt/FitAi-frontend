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

/** One label/value row. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-on-surface-variant">{label}</span>
      {children}
    </div>
  );
}

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
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
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

      {/* Details */}
      <div className="space-y-2.5">
        <Row label={`${t('trainings.difficulty')}:`}>
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${getDifficultyPill(difficulty)}`}
          >
            {difficultyLabel}
          </span>
        </Row>

        <Row label={`${t('trainings.days')}:`}>
          <span className="text-sm font-bold text-primary">
            {training.days?.length || 0}
          </span>
        </Row>

        {training.focus && (
          <Row label={`${t('trainings.focus')}:`}>
            <span className="text-sm text-on-surface">{training.focus}</span>
          </Row>
        )}

        {training.estimatedDuration && (
          <Row label={`${t('trainings.duration')}:`}>
            <span className="text-sm text-on-surface">
              {t('trainings.durationMin', { count: training.estimatedDuration })}
            </span>
          </Row>
        )}

        <Row label={`${t('trainings.status')}:`}>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${training.isActive ? 'bg-success' : 'bg-outline'}`}
            />
            <span
              className={`text-sm font-medium ${training.isActive ? 'text-success' : 'text-on-surface-variant'}`}
            >
              {training.isActive ? t('trainings.active') : t('trainings.inactive')}
            </span>
          </span>
        </Row>

        <Row label={`${t('trainings.created')}:`}>
          <span className="text-sm text-on-surface-variant">
            {training.createdAt
              ? new Date(training.createdAt).toLocaleDateString(
                  i18n.language === 'he' ? 'he-IL' : 'en-GB',
                )
              : t('common.none')}
          </span>
        </Row>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={() => onView(training._id)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 text-primary py-2.5 rounded-lg font-bold text-xs hover:bg-primary/20 transition-colors"
        >
          <StitchIcon name="visibility" size={16} />
          {t('common.view')}
        </button>
        <button
          type="button"
          onClick={() => onEdit(training._id)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-surface-container-high text-on-surface py-2.5 rounded-lg font-bold text-xs hover:bg-surface-container-highest transition-colors"
        >
          <StitchIcon name="edit" size={16} />
          {t('common.edit')}
        </button>
      </div>
    </div>
  );
}
