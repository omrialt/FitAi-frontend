package com.fitai.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * The live workout notification's buttons ("+30", "skip rest") and its
 * end-of-rest redraw.
 *
 * The notification is updated here first, from the stored state, so a tap on
 * the lock screen answers at once even while the WebView sleeps. The app is
 * then told, so the timer on the page and the end-of-rest alarm follow.
 */
public class WorkoutLiveActionReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action == null) return;

        WorkoutLiveNotifier.State state = WorkoutLiveNotifier.load(context);
        if (state == null) return;

        long now = System.currentTimeMillis();
        String event;

        switch (action) {
            case WorkoutLiveNotifier.ACTION_PLUS_30:
                state.restDeadline = Math.max(state.restDeadline, now) + 30_000L;
                event = "plus30";
                break;
            case WorkoutLiveNotifier.ACTION_SKIP_REST:
                state.restDeadline = 0;
                event = "skipRest";
                break;
            case WorkoutLiveNotifier.ACTION_REST_END:
                // Superseded by a later rest or "+30": nothing to end yet.
                if (state.restDeadline > now + 1_000L) return;
                state.restDeadline = 0;
                event = null;
                break;
            default:
                return;
        }

        WorkoutLiveNotifier.save(context, state);
        WorkoutLiveNotifier.render(context, state);

        if (event != null) WorkoutLivePlugin.emitAction(event, state.restDeadline);
    }
}
