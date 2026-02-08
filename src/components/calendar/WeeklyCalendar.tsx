import React, { useState, useMemo } from 'react';
import { useWeeklyCalendar, useGoogleCalendar, useTrainingPlanSync } from '../../hooks/useCalendar';
import type { CalendarEvent } from '../../types/calendar.types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import TrainingDayModal from './TrainingDayModal';
import '../../styles/WeeklyCalendar.css';

interface WeeklyCalendarProps {
  activeTrainingPlanId?: string;
}



const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ activeTrainingPlanId }) => {
  const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 }),
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const { events, loading, error, refetch } = useWeeklyCalendar(currentWeekStart);
  const { status: googleStatus, connect, disconnect } = useGoogleCalendar();
  const { syncPlan, syncing } = useTrainingPlanSync();

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};

    for (let i = 0; i < 7; i++) {
      const date = addDays(currentWeekStart, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      grouped[dateKey] = [];
    }

    events?.forEach((event) => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (grouped[dateKey]) {
        grouped[dateKey].push(event);
      }
    });

    // Sort events within each day by start time
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.start.getTime() - b.start.getTime());
    });

    return grouped;
  }, [events, currentWeekStart]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const handleSyncToGoogle = async () => {
    if (!activeTrainingPlanId) {
      alert('No active training plan selected');
      return;
    }

    try {
      const result = await syncPlan(activeTrainingPlanId, currentWeekStart);
      alert(
        `Sync complete!\nCreated: ${result.created}\nUpdated: ${result.updated}\nDeleted: ${result.deleted}`,
      );
      refetch();
    } catch (err) {
      alert('Failed to sync training plan');
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'training') {
      setSelectedEvent(event);
      setModalOpened(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setSelectedEvent(null);
  };

  const renderEvent = (event: CalendarEvent) => {
    const eventClass = event.type === 'training' ? 'event-training' : 'event-google';
    const icon = event.type === 'training' ? '🏋️' : '📅';
    const isClickable = event.type === 'training';

    return (
      <div
        key={event.id || `${event.title}-${event.start.getTime()}`}
        className={`calendar-event ${eventClass} ${isClickable ? 'clickable' : ''}`}
        onClick={() => isClickable && handleEventClick(event)}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
      >
        <div className="event-icon">{icon}</div>
        <div className="event-content">
          <div className="event-title">{event.title}</div>
          <div className="event-time">
            {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
          </div>
          {event.description && (
            <div className="event-description">{event.description}</div>
          )}
        </div>
      </div>
    );
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="weekly-calendar-container">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button onClick={handlePreviousWeek} className="btn-nav">
            ← Previous
          </button>
          <button onClick={handleToday} className="btn-today">
            Today
          </button>
          <button onClick={handleNextWeek} className="btn-nav">
            Next →
          </button>
        </div>

        <div className="calendar-title">
          <h2>
            Week of {format(currentWeekStart, 'MMM d')} -{' '}
            {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </h2>
        </div>

        <div className="calendar-actions">
          {googleStatus?.connected ? (
            <>
              <button onClick={disconnect} className="btn-disconnect">
                Disconnect Google
              </button>
              {activeTrainingPlanId && (
                <button
                  onClick={handleSyncToGoogle}
                  disabled={syncing}
                  className="btn-sync"
                >
                  {syncing ? 'Syncing...' : 'Sync to Google'}
                </button>
              )}
            </>
          ) : (
            <button onClick={connect} className="btn-connect">
              Connect Google Calendar
            </button>
          )}
        </div>
      </div>

      {loading && <div className="calendar-loading">Loading calendar...</div>}
      {error && <div className="calendar-error">{error}</div>}

      <div className="calendar-grid">
        {DAYS_OF_WEEK.map((dayName, index) => {
          const date = addDays(currentWeekStart, index);
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayEvents = eventsByDay[dateKey] || [];
          const todayClass = isToday(date) ? 'day-today' : '';

          return (
            <div key={dateKey} className={`calendar-day ${todayClass}`}>
              <div className="day-header">
                <div className="day-name">{dayName}</div>
                <div className="day-date">{format(date, 'd')}</div>
              </div>
              <div className="day-events">
                {dayEvents.length === 0 ? (
                  <div className="no-events">No events</div>
                ) : (
                  dayEvents.map(renderEvent)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!googleStatus?.connected && (
        <div className="calendar-info">

      <TrainingDayModal
        opened={modalOpened}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
          <p>
            💡 Connect your Google Calendar to see all your events in one place and
            automatically sync your training schedule!
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;
