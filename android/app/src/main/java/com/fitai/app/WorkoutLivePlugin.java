package com.fitai.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.lang.ref.WeakReference;

/**
 * The live workout notification (see WorkoutLiveNotifier), driven from JS.
 *
 * show() is called when the workout changes, never per second; stop() ends it.
 * Taps on its buttons come back as "action" events, retained until the page
 * listens, so a tap made with the app asleep is not lost.
 */
@CapacitorPlugin(name = "WorkoutLive")
public class WorkoutLivePlugin extends Plugin {

    private static WeakReference<WorkoutLivePlugin> instance = new WeakReference<>(null);

    @Override
    public void load() {
        instance = new WeakReference<>(this);
    }

    static void emitAction(String type, long restDeadline) {
        WorkoutLivePlugin plugin = instance.get();
        if (plugin == null) return;
        JSObject data = new JSObject();
        data.put("type", type);
        data.put("restDeadline", restDeadline);
        plugin.notifyListeners("action", data, true);
    }

    @PluginMethod
    public void show(PluginCall call) {
        WorkoutLiveNotifier.State state = new WorkoutLiveNotifier.State();
        Double startedAt = call.getDouble("startedAt");
        if (startedAt == null) {
            call.reject("startedAt is required");
            return;
        }
        state.startedAt = startedAt.longValue();
        state.title = call.getString("title", "");
        state.text = call.getString("text", "");
        state.done = call.getInt("done", 0);
        state.total = call.getInt("total", 0);
        Double restDeadline = call.getDouble("restDeadline");
        state.restDeadline = restDeadline == null ? 0 : restDeadline.longValue();
        state.restTitle = call.getString("restTitle", "");
        state.sessionText = call.getString("sessionText", "");
        state.plus30Label = call.getString("plus30Label", "+30");
        state.skipLabel = call.getString("skipLabel", "Skip");

        JSArray segments = call.getArray("segments");
        if (segments != null) {
            try {
                for (Integer length : segments.<Integer>toList()) state.segments.add(length);
            } catch (JSONException | ClassCastException ignored) {
                // Without segments the progress bar is one plain track.
            }
        }

        WorkoutLiveNotifier.save(getContext(), state);
        WorkoutLiveNotifier.render(getContext(), state);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        WorkoutLiveNotifier.clear(getContext());
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("notifications", NotificationManagerCompat.from(getContext()).areNotificationsEnabled());
        result.put("promoted", WorkoutLiveNotifier.canPromote(getContext()));
        call.resolve(result);
    }

    /** Opens this app's notification settings, where both switches live. */
    @PluginMethod
    public void openSettings(PluginCall call) {
        Intent intent;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                .putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
        } else {
            intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                .setData(Uri.parse("package:" + getContext().getPackageName()));
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }
}
