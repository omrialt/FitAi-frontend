import React from 'react';
import { Modal } from '@mantine/core';
import { format } from 'date-fns';
import type { CalendarEvent } from '../../types/calendar.types';
import type { Exercise, ExerciseSet } from '../../types/training-plan.types';
import type { TrainingDayModalProps } from '../../types/calendar-components.types';
import '../../styles/TrainingDayModal.css';

const TrainingDayModal: React.FC<TrainingDayModalProps> = ({ opened, onClose, event }) => {
  if (!event) return null;

  const renderSet = (set: ExerciseSet, setIndex: number) => (
    <div key={setIndex} className="set-item">
      <span className="set-number">Set {setIndex + 1}:</span>
      <span className="set-details">
        {set.targetReps} reps @ {set.targetWeight}kg
        {set.performedReps !== undefined && (
          <span className="set-performed">
            {' '}(Performed: {set.performedReps} reps @ {set.performedWeight}kg)
          </span>
        )}
      </span>
    </div>
  );

  const renderExercise = (exercise: Exercise, exerciseIndex: number) => {
    const isSupersetOrDropset = exercise.type === 'superset' || exercise.type === 'dropset';
    const typeLabel = exercise.type === 'superset' ? 'Superset' : exercise.type === 'dropset' ? 'Dropset' : '';

    return (
      <div key={exerciseIndex} className={`exercise-item ${exercise.type}`}>
        <div className="exercise-header">
          <h4 className="exercise-name">
            {exerciseIndex + 1}. {exercise.name}
          </h4>
          <div className="exercise-meta">
            <span className="muscle-group">{exercise.muscleGroup}</span>
            {isSupersetOrDropset && <span className="exercise-type-badge">{typeLabel}</span>}
          </div>
        </div>

        {exercise.notes && (
          <div className="exercise-notes">
            <strong>Notes:</strong> {exercise.notes}
          </div>
        )}

        {exercise.video && (
          <div className="exercise-video">
            <a href={exercise.video} target="_blank" rel="noopener noreferrer">
              📹 Watch video
            </a>
          </div>
        )}

        <div className="exercise-sets">
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
        <div className="modal-title">
          <h3>{event.title}</h3>
          <p className="modal-date">
            {format(event.start, 'EEEE, MMMM d, yyyy')} • {format(event.start, 'HH:mm')} -{' '}
            {format(event.end, 'HH:mm')}
          </p>
        </div>
      }
      size="lg"
      centered
    >
      <div className="training-day-content">
        {event.description && (
          <div className="training-description">
            <p>{event.description}</p>
          </div>
        )}

        {event.exercises && event.exercises.length > 0 ? (
          <div className="exercises-list">
            <h4 className="section-title">Exercises</h4>
            {event.exercises.map((exercise, index) => renderExercise(exercise, index))}
          </div>
        ) : (
          <div className="no-exercises">
            <p>No exercises defined for this training day.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TrainingDayModal;
