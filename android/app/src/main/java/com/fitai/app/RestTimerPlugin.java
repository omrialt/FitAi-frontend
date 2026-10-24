package com.fitai.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * The rest countdown, live in the status bar.
 *
 * An ongoing notification whose chronometer counts down to the deadline, so
 * Android runs the clock itself and the WebView sends nothing per second. It
 * asks to be promoted to a Live Update: on Android 16 (One UI 8) that puts the
 * running countdown in a chip in the status bar, the Now Bar and the lock
 * screen. Older versions show the timer icon in the status bar and the live
 * countdown in the shade.
 *
 * Silent by design. The sound at the end belongs to the separate alarm the
 * local-notifications plugin schedules, and this one removes itself when the
 * countdown reaches zero.
 */
@CapacitorPlugin(name = "RestTimer")
public class RestTimerPlugin extends Plugin {

    private static final String CHANNEL_ID = "rest-timer-live";
    private static final int NOTIFICATION_ID = 4502;

    @PluginMethod
    public void start(PluginCall call) {
        Double deadlineArg = call.getDouble("deadline");
        String title = call.getString("title", "Rest");
        long now = System.currentTimeMillis();

        if (deadlineArg == null || deadlineArg.longValue() <= now) {
            call.reject("deadline must be in the future");
            return;
        }
        long deadline = deadlineArg.longValue();

        Context context = getContext();
        ensureChannel(context);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_timer)
            .setContentTitle(title)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setOngoing(true)
            .setSilent(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(true)
            .setWhen(deadline)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setTimeoutAfter(deadline - now)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setRequestPromotedOngoing(true)
            .setShortCriticalText(title)
            .setContentIntent(openAppIntent(context));

        try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, builder.build());
            call.resolve();
        } catch (SecurityException e) {
            // Notification permission not granted; the timer still runs in the app.
            call.reject("notifications not permitted");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        NotificationManagerCompat.from(getContext()).cancel(NOTIFICATION_ID);
        call.resolve();
    }

    private void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;

        // Default, not low: Android 16 will not promote a notification from a
        // channel below default importance. Silence comes from setSilent().
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Rest countdown",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("The running rest timer between sets");
        channel.setSound(null, null);
        channel.enableVibration(false);
        channel.setShowBadge(false);
        manager.createNotificationChannel(channel);
    }

    private PendingIntent openAppIntent(Context context) {
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
}
