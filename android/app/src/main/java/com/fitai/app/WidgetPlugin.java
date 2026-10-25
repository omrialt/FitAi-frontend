package com.fitai.app;

import android.content.Context;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Hands the home widget its state (see TodayWidgetProvider) and redraws it.
 * The state is the week's schedule plus localised text, not "today": the
 * widget works today out itself, so it stays right without the app.
 */
@CapacitorPlugin(name = "HomeWidget")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void update(PluginCall call) {
        JSObject state = call.getData();
        save(getContext(), state.toString());
        TodayWidgetProvider.refreshAll(getContext());
        call.resolve();
    }

    /** Signed out: forget the plan so the widget does not show someone else's. */
    @PluginMethod
    public void clear(PluginCall call) {
        save(getContext(), "{}");
        TodayWidgetProvider.refreshAll(getContext());
        call.resolve();
    }

    private static void save(Context context, String json) {
        context.getSharedPreferences(TodayWidgetProvider.PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(TodayWidgetProvider.KEY_STATE, json)
            .apply();
    }
}
