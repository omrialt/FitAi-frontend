package com.fitai.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Test;

public class WidgetScheduleTest {

    private static final String PLAN = "a1a1a1a1a1a1a1a1a1a1a1a1";
    // Sunday (0) Push, Wednesday (3) Legs.
    private static final List<WidgetSchedule.Day> DAYS = Arrays.asList(
        new WidgetSchedule.Day(0, 0, "Push", 5),
        new WidgetSchedule.Day(3, 1, "Legs", 6)
    );

    @Test
    public void todayIsAWorkoutDay() {
        WidgetSchedule.Result r = WidgetSchedule.decide(true, PLAN, DAYS, 3, "2026-10-28", "2026-10-25");
        assertEquals(WidgetSchedule.Kind.WORKOUT, r.kind);
        assertEquals("Legs", r.day.name);
        assertEquals(1, r.day.index);
    }

    @Test
    public void todaysWorkoutAlreadyLogged() {
        WidgetSchedule.Result r = WidgetSchedule.decide(true, PLAN, DAYS, 3, "2026-10-28", "2026-10-28");
        assertEquals(WidgetSchedule.Kind.DONE, r.kind);
    }

    @Test
    public void restDayPointsAtTheNextWorkout() {
        // Thursday (4): next is Sunday, three days ahead.
        WidgetSchedule.Result r = WidgetSchedule.decide(true, PLAN, DAYS, 4, "2026-10-29", null);
        assertEquals(WidgetSchedule.Kind.REST, r.kind);
        assertEquals("Push", r.day.name);
        assertEquals(3, r.inDays);
    }

    @Test
    public void restDayWrapsAroundTheWeek() {
        // Saturday (6) → Sunday (0) tomorrow.
        WidgetSchedule.Result r = WidgetSchedule.decide(true, PLAN, DAYS, 6, "2026-10-31", null);
        assertEquals(1, r.inDays);
    }

    @Test
    public void noPlanAndSignedOut() {
        assertEquals(WidgetSchedule.Kind.NO_PLAN,
            WidgetSchedule.decide(true, null, DAYS, 0, "2026-10-25", null).kind);
        assertEquals(WidgetSchedule.Kind.NO_PLAN,
            WidgetSchedule.decide(true, PLAN, Collections.<WidgetSchedule.Day>emptyList(), 0, "2026-10-25", null).kind);
        WidgetSchedule.Result out = WidgetSchedule.decide(false, PLAN, DAYS, 0, "2026-10-25", null);
        assertEquals(WidgetSchedule.Kind.SIGNED_OUT, out.kind);
        assertNull(out.day);
    }
}
