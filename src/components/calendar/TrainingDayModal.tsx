import React from 'react';
import { Modal } from '@mantine/core';
import { format } from 'date-fns';
import { he as heLocale, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import type { Exercise, ExerciseSet } from '../../types/training-plan.types';
import type { TrainingDayModalProps } from '../../types/calendar-components.types';

/** Training day detail — "Performance Lab" design. */
const TrainingDayModal: React.FC<TrainingDayModalProps> = ({
  opened,
  onClose,
  event,
}) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith('he') ? heLocale : enUS;

  if (!event) return null;

  const renderSet = (set: ExerciseSet, setIndex: number) => (
    <div
      key={setIndex}
      className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-surface-container-low"
    >
      <span className="text-[10px] font-black uppercase tracking-wider text-primary shrink-0">
        {t('calendar.setLabel', { num: setIndex + 1 })}
      </span>
      <span className="text-xs text-on-surface text-end">
        {t('calendar.setTarget', {
          reps: set.targetReps,
          weight: set.targetWeight,
        })}
        {set.performedReps !== undefined && (
          <span className="text-on-surface-variant">
            {t('calendar.setPerformed', {
              reps: set.performedReps,
              weight: set.performedWeight,
            })}
          </span>
        )}
      </span>
    </div>
  );

  const renderExercise = (exercise: Exercise, exerciseIndex: number) => {
    const isSupersetOrDropset =
      exercise.type === 'superset' || exercise.type === 'dropset';
    const typeLabel =
      exercise.type === 'superset'
        ? t('calendar.superset')
        : exercise.type === 'dropset'
          ? t('calendar.dropset')
          : '';

    return (
      <div
        key={exerciseIndex}
        className="rounded-xl border border-outline-variant/10 p-4 bg-surface-container-lowest"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h4 className="font-bold text-on-surface">
            <span className="text-primary">{exerciseIndex + 1}.</span>{' '}
            {exercise.name}
          </h4>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {exercise.muscleGroup}
            </span>
            {isSupersetOrDropset && (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary">
                {typeLabel}
              </span>
            )}
          </div>
        </div>

        {exercise.notes && (
          <p className="text-xs text-on-surface-variant mb-3">
            <strong className="text-on-surface">{t('calendar.notesLabel')}</strong>{' '}
            {exercise.notes}
          </p>
        )}

        {exercise.video && (
          <a
            href={exercise.video}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mb-3"
          >
            <StitchIcon name="play_arrow" size={14} />
            {t('calendar.watchVideo')}
          </a>
        )}

        <div className="space-y-1.5">
          {exercise.sets?.map((set, setIndex) => renderSet(set, setIndex))}
        </div>
      </div>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
            {event.title}
          </h3>
          <p className="text-xs text-on-surface-variant">
            {format(event.start, 'EEEE, MMMM d, yyyy', { locale: dateLocale })} •{' '}
            {format(event.start, 'HH:mm')} – {format(event.end, 'HH:mm')}
          </p>
        </div>
      }
      size="lg"
      centered
    >
      <div className="space-y-4">
        {event.description && (
          <p className="text-sm text-on-surface-variant">{event.description}</p>
        )}

        {event.exercises && event.exercises.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {t('calendar.exercises')}
            </p>
            {event.exercises.map((exercise, index) =>
              renderExercise(exercise, index),
            )}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">
            {t('calendar.noExercises')}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default TrainingDayModal;
