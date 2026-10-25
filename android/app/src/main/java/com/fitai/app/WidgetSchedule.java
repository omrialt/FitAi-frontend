package com.fitai.app;

import java.util.List;

/**
 * What the home widget should say today, worked out from the week's plan.
 *
 * Plain Java on purpose — no Android, no org.json — so the daily decision is
 * unit-tested on the JVM. The app sends the active plan's weekly schedule
 * rather than "today", and the widget re-runs this every half hour, so it
 * stays right past midnight without the app being opened.
 */
final class WidgetSchedule {

    enum Kind { SIGNED_OUT, NO_PLAN, WORKOUT, DONE, REST }

    /** One day of the plan: weekday (0 = Sunday), its index in the plan, name, exercise count. */
    static final class Day {
        final int dow;
        final int index;
        final String name;
        final int exercises;

        Day(int dow, int index, String name, int exercises) {
            this.dow = dow;
            this.index = index;
            this.name = name;
            this.exercises = exercises;
        }
    }

    static final class Result {
        final Kind kind;
        /** Today's day for WORKOUT and DONE; the next one for REST; null otherwise. */
        final Day day;
        /** Days from today to `day` (0 today, 1 tomorrow…); -1 when there is no day. */
        final int inDays;

        Result(Kind kind, Day day, int inDays) {
            this.kind = kind;
            this.day = day;
            this.inDays = inDays;
        }
    }

    private WidgetSchedule() {}

    /**
     * @param todayDow       0 (Sunday) … 6 (Saturday)
     * @param todayKey       today as yyyy-mm-dd, local time
     * @param lastTrained    the last day a workout was logged, yyyy-mm-dd, or null
     */
    static Result decide(boolean signedIn, String planId, List<Day> days, int todayDow, String todayKey, String lastTrained) {
        if (!signedIn) return new Result(Kind.SIGNED_OUT, null, -1);
        if (planId == null || planId.isEmpty() || days == null || days.isEmpty()) {
            return new Result(Kind.NO_PLAN, null, -1);
        }

        Day today = firstOn(days, todayDow);
        if (today != null) {
            boolean trained = todayKey != null && todayKey.equals(lastTrained);
            return new Result(trained ? Kind.DONE : Kind.WORKOUT, today, 0);
        }

        for (int ahead = 1; ahead <= 7; ahead++) {
            Day next = firstOn(days, (todayDow + ahead) % 7);
            if (next != null) return new Result(Kind.REST, next, ahead);
        }
        return new Result(Kind.NO_PLAN, null, -1);
    }

    private static Day firstOn(List<Day> days, int dow) {
        for (Day d : days) {
            if (d.dow == dow) return d;
        }
        return null;
    }
}
