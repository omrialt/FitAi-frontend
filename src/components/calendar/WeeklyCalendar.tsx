import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useWeeklyCalendar, useGoogleCalendar, useTrainingPlanSync } from '../../hooks/useCalendar';
import type { CalendarEvent } from '../../types/calendar.types';
import type { WeeklyCalendarProps } from '../../types/calendar-components.types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { he as heLocale, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import TrainingDayModal from './TrainingDayModal';
import { StitchIcon } from '../common/StitchIcon';

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ activeTrainingPlanId, autoSyncOnConnect, onAutoSyncComplete }) => {
  const { t, i18n } = useTranslation();

  // Month/day names come from date-fns, so it needs the active locale too
  const dateLocale = i18n.language.startsWith('he') ? heLocale : enUS;

  const DAYS_OF_WEEK = [
    t('common.weekday0'),
    t('common.weekday1'),
    t('common.weekday2'),
    t('common.weekday3'),
    t('common.weekday4'),
    t('common.weekday5'),
    t('common.weekday6'),
  ];

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 }),
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const { events, loading, error, refetch } = useWeeklyCalendar(currentWeekStart);
  const { status: googleStatus, connect, disconnect } = useGoogleCalendar();
  const { syncPlan, syncing } = useTrainingPlanSync();

  const handleSyncToGoogle = useCallback(async () => {
    if (!activeTrainingPlanId) {
      toast.warning(t('calendar.noActivePlanToSync'));
      return;
    }

    try {
      // Sync the full month that contains the current view
      const result = await syncPlan(activeTrainingPlanId, currentWeekStart);
      toast.success(
        t('calendar.monthSynced', {
          created: result.created,
          updated: result.updated,
          deleted: result.deleted,
        }),
      );
      refetch();
    } catch {
      toast.error(t('calendar.syncFailed'));
    }
  }, [activeTrainingPlanId, currentWeekStart, syncPlan, refetch, t]);

  // Auto-sync to Google Calendar after connecting
  useEffect(() => {
    if (autoSyncOnConnect && googleStatus?.connected && activeTrainingPlanId && !syncing) {
      handleSyncToGoogle().then(() => {
        onAutoSyncComplete?.();
      });
    }
  }, [autoSyncOnConnect, googleStatus?.connected, activeTrainingPlanId, syncing, handleSyncToGoogle, onAutoSyncComplete]);

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

  /**
   * Events are colour-coded by origin: training sessions take the indigo
   * primary, Google events the cyan secondary. Only training events open a
   * detail modal, so only those get affordances.
   */
  const renderEvent = (event: CalendarEvent) => {
    const isTraining = event.type === 'training';
    const isClickable = isTraining;

    return (
      <button
        key={event.id || `${event.title}-${event.start.getTime()}`}
        type="button"
        disabled={!isClickable}
        onClick={() => isClickable && handleEventClick(event)}
        className={`w-full text-start rounded-lg p-3 border-s-4 transition-colors ${
          isTraining
            ? 'bg-primary/5 border-s-primary hover:bg-primary/10 cursor-pointer'
            : 'bg-secondary-fixed/40 border-s-secondary cursor-default'
        }`}
      >
        <p className={`text-[10px] font-black ${isTraining ? 'text-primary' : 'text-on-secondary-container'}`}>
          {event.allDay
            ? t('calendar.allDay')
            : `${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}`}
        </p>
        <p className="text-sm font-bold text-on-surface leading-snug mt-0.5">
          {event.title}
        </p>
        {event.description && (
          <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
      </button>
    );
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-6">
      {/* Header: title + week nav + Google actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-on-surface">
            {format(currentWeekStart, 'MMMM yyyy', { locale: dateLocale })}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {t('calendar.weekOf', {
              start: format(currentWeekStart, 'MMM d', { locale: dateLocale }),
              end: format(addDays(currentWeekStart, 6), 'MMM d, yyyy', {
                locale: dateLocale,
              }),
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-surface-container-high rounded-lg p-1">
            <button
              type="button"
              onClick={handlePreviousWeek}
              aria-label={t('calendar.previous')}
              className="w-9 h-9 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest flex items-center justify-center transition-colors"
            >
              <StitchIcon name="chevron_left" size={18} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-4 h-9 rounded-md bg-surface-container-lowest text-sm font-bold text-on-surface"
            >
              {t('calendar.today')}
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              aria-label={t('calendar.next')}
              className="w-9 h-9 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest flex items-center justify-center transition-colors"
            >
              <StitchIcon name="chevron_right" size={18} />
            </button>
          </div>

          {googleStatus?.connected ? (
            <>
              <button
                type="button"
                onClick={disconnect}
                className="px-4 py-2.5 rounded-lg text-sm font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                {t('calendar.disconnectGoogle')}
              </button>
              <button
                type="button"
                onClick={handleSyncToGoogle}
                disabled={syncing || !activeTrainingPlanId}
                title={
                  !activeTrainingPlanId
                    ? t('calendar.noActivePlan')
                    : t('calendar.syncPlanTooltip')
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-primary-gradient text-white shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                <StitchIcon
                  name="sync"
                  size={16}
                  className={syncing ? 'animate-spin' : undefined}
                />
                {syncing ? t('calendar.syncing') : t('calendar.syncToGoogle')}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={connect}
              className="px-4 py-2.5 rounded-lg text-sm font-bold bg-primary-gradient text-white shadow-lg shadow-primary/20"
            >
              {t('calendar.connectGoogle')}
            </button>
          )}
        </div>
      </div>

      {loading && (
        <p className="text-sm text-on-surface-variant">
          {t('calendar.loadingCalendar')}
        </p>
      )}
      {error && (
        <div className="rounded-lg bg-error-container text-on-error-container p-4 text-sm">
          {error}
        </div>
      )}

      {/* Week grid */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="md:overflow-x-auto">
          {/* Mobile: stacked day agenda (1 col). md+: the 7-column week grid. */}
          <div className="grid grid-cols-1 md:grid-cols-7 md:min-w-[900px]">
            {DAYS_OF_WEEK.map((dayName, index) => {
              const date = addDays(currentWeekStart, index);
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayEvents = eventsByDay[dateKey] || [];
              const today = isToday(date);

              return (
                <div
                  key={dateKey}
                  className={`min-h-0 md:min-h-[420px] p-3 ${index < 6 ? 'border-b border-outline-variant/10 md:border-b-0 md:border-e' : ''} ${
                    today ? 'bg-primary/5' : ''
                  }`}
                >
                  <div
                    className={`text-center pb-3 mb-3 border-b-2 ${
                      today ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        today ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {dayName}
                    </p>
                    <p
                      className={`text-2xl font-black ${
                        today ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {format(date, 'd')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {dayEvents.length === 0 ? (
                      <p className="text-[10px] text-on-surface-variant/60 text-center pt-4">
                        {t('calendar.noEvents')}
                      </p>
                    ) : (
                      dayEvents.map(renderEvent)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!googleStatus?.connected && (
        <div className="bg-primary-gradient rounded-xl p-6 text-white">
          <p className="text-sm leading-relaxed">{t('calendar.connectHint')}</p>
        </div>
      )}

      <TrainingDayModal
        opened={modalOpened}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
};

export default WeeklyCalendar;
