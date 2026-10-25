package com.fitai.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Renders the live workout notification from its last known state.
 *
 * One ongoing, silent notification for the whole workout. Between sets its
 * chronometer counts up from the start of the session; during a rest it counts
 * down to the end of the rest. Android runs both clocks itself, so the WebView
 * only sends something when the workout changes (a set logged, a rest begun).
 *
 * No short critical text is set on purpose: on Android 16 the status-bar chip
 * shows that text instead of the chronometer, and the running clock is the
 * point of the chip.
 *
 * The state is kept in SharedPreferences, so the notification buttons and the
 * end-of-rest alarm can redraw it with the WebView asleep.
 */
final class WorkoutLiveNotifier {

    static final String CHANNEL_ID = "workout-live";
    static final int NOTIFICATION_ID = 4502;

    static final String ACTION_PLUS_30 = "com.fitai.app.workoutlive.PLUS_30";
    static final String ACTION_SKIP_REST = "com.fitai.app.workoutlive.SKIP_REST";
    static final String ACTION_REST_END = "com.fitai.app.workoutlive.REST_END";

    private static final String PREFS = "workout-live";
    private static final String KEY_STATE = "state";

    private WorkoutLiveNotifier() {}

    /** Everything needed to draw the notification. Strings come localised from JS. */
    static final class State {
        long startedAt;
        String title = "";
        String text = "";
        int done;
        int total;
        List<Integer> segments = new ArrayList<>();
        long restDeadline; // 0 when not resting
        String restTitle = "";
        String sessionText = "";
        String plus30Label = "+30";
        String skipLabel = "Skip";

        JSONObject toJson() throws JSONException {
            JSONObject o = new JSONObject();
            o.put("startedAt", startedAt);
            o.put("title", title);
            o.put("text", text);
            o.put("done", done);
            o.put("total", total);
            o.put("segments", new JSONArray(segments));
            o.put("restDeadline", restDeadline);
            o.put("restTitle", restTitle);
            o.put("sessionText", sessionText);
            o.put("plus30Label", plus30Label);
            o.put("skipLabel", skipLabel);
            return o;
        }

        static State fromJson(JSONObject o) {
            State s = new State();
            s.startedAt = o.optLong("startedAt");
            s.title = o.optString("title");
            s.text = o.optString("text");
            s.done = o.optInt("done");
            s.total = o.optInt("total");
            JSONArray seg = o.optJSONArray("segments");
            if (seg != null) {
                for (int i = 0; i < seg.length(); i++) s.segments.add(seg.optInt(i));
            }
            s.restDeadline = o.optLong("restDeadline");
            s.restTitle = o.optString("restTitle");
            s.sessionText = o.optString("sessionText");
            s.plus30Label = o.optString("plus30Label", "+30");
            s.skipLabel = o.optString("skipLabel", "Skip");
            return s;
        }
    }

    static void save(Context context, State state) {
        try {
            prefs(context).edit().putString(KEY_STATE, state.toJson().toString()).apply();
        } catch (JSONException ignored) {
            // A state that cannot be stored is simply not redrawn by the buttons.
        }
    }

    static State load(Context context) {
        String raw = prefs(context).getString(KEY_STATE, null);
        if (raw == null) return null;
        try {
            return State.fromJson(new JSONObject(raw));
        } catch (JSONException e) {
            return null;
        }
    }

    static void clear(Context context) {
        prefs(context).edit().remove(KEY_STATE).apply();
        cancelRestEnd(context);
        NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID);
    }

    /** Draws the notification and keeps the end-of-rest redraw scheduled. */
    static void render(Context context, State state) {
        ensureChannel(context);

        long now = System.currentTimeMillis();
        boolean resting = state.restDeadline > now;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_timer)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setOngoing(true)
            .setSilent(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(true)
            .setUsesChronometer(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setRequestPromotedOngoing(true)
            .setContentIntent(openAppIntent(context));

        if (resting) {
            builder
                .setContentTitle(state.restTitle)
                .setContentText(state.sessionText)
                .setWhen(state.restDeadline)
                .setChronometerCountDown(true)
                .addAction(0, state.plus30Label, actionIntent(context, ACTION_PLUS_30, 1))
                .addAction(0, state.skipLabel, actionIntent(context, ACTION_SKIP_REST, 2));
        } else {
            builder
                .setContentTitle(state.title)
                .setContentText(state.text)
                .setWhen(state.startedAt)
                .setChronometerCountDown(false);
        }

        if (state.total > 0) {
            NotificationCompat.ProgressStyle style = new NotificationCompat.ProgressStyle()
                .setStyledByProgress(true)
                .setProgress(Math.min(state.done, state.total));
            List<NotificationCompat.ProgressStyle.Segment> segments = new ArrayList<>();
            for (int length : state.segments) {
                if (length > 0) segments.add(new NotificationCompat.ProgressStyle.Segment(length));
            }
            if (segments.isEmpty()) segments.add(new NotificationCompat.ProgressStyle.Segment(state.total));
            style.setProgressSegments(segments);
            builder.setStyle(style);
        }

        try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, builder.build());
        } catch (SecurityException ignored) {
            // No notification permission: the workout still runs in the app.
        }

        if (resting) {
            scheduleRestEnd(context, state.restDeadline);
        } else {
            cancelRestEnd(context);
        }
    }

    /** Whether Android 16 lets this app's notifications become Live Updates. */
    static boolean canPromote(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.BAKLAVA) return true;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        return manager != null && manager.canPostPromotedNotifications();
    }

    private static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;

        // Default, not low: Android 16 will not promote a notification from a
        // channel below default importance. Silence comes from setSilent().
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Workout in progress",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("The workout clock and rest timer while you train");
        channel.setSound(null, null);
        channel.enableVibration(false);
        channel.setShowBadge(false);
        manager.createNotificationChannel(channel);
    }

    /**
     * At the end of a rest the chronometer would run on into negative time, so
     * an alarm redraws the notification back to the workout clock. Exact when
     * Android allows it; otherwise it may be a little late, and the in-app
     * timer still corrects it the moment the app is opened.
     */
    private static void scheduleRestEnd(Context context, long at) {
        AlarmManager alarms = context.getSystemService(AlarmManager.class);
        if (alarms == null) return;
        PendingIntent pi = actionIntent(context, ACTION_REST_END, 3);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarms.canScheduleExactAlarms()) {
            alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        } else {
            alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    private static void cancelRestEnd(Context context) {
        AlarmManager alarms = context.getSystemService(AlarmManager.class);
        if (alarms != null) alarms.cancel(actionIntent(context, ACTION_REST_END, 3));
    }

    private static PendingIntent actionIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, WorkoutLiveActionReceiver.class).setAction(action);
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static PendingIntent openAppIntent(Context context) {
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (intent == null) intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
