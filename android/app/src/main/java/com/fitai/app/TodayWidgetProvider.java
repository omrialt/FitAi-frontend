package com.fitai.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

/**
 * "Today's workout" on the home screen.
 *
 * Never touches the network. The app stores the active plan's weekly schedule
 * (WidgetPlugin), and every redraw — on each app sync and every 30 minutes —
 * works out today from it (WidgetSchedule), so the widget is right after
 * midnight without the app being opened. All text arrives localised from the
 * app; the layout mirrors itself in RTL.
 */
public class TodayWidgetProvider extends AppWidgetProvider {

    static final String PREFS = "fitai-widget";
    static final String KEY_STATE = "state";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) manager.updateAppWidget(id, render(context));
    }

    /** Redraw every placed widget now. */
    static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, TodayWidgetProvider.class));
        if (ids.length == 0) return;
        RemoteViews views = render(context);
        for (int id : ids) manager.updateAppWidget(id, views);
    }

    private static RemoteViews render(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_today);
        JSONObject state = load(context);
        JSONObject text = state.optJSONObject("text");
        if (text == null) text = new JSONObject();

        Calendar now = Calendar.getInstance();
        String todayKey = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(now.getTime());
        String planId = state.optString("planId", "");

        WidgetSchedule.Result result = WidgetSchedule.decide(
            state.optBoolean("signedIn", false),
            planId,
            days(state.optJSONArray("days")),
            now.get(Calendar.DAY_OF_WEEK) - 1,
            todayKey,
            state.optString("lastTrainedDate", null)
        );

        String title;
        String subtitle;
        String startUrl = null;
        switch (result.kind) {
            case WORKOUT:
                title = fill(text.optString("todayTitle", "Today: {day}"), result.day);
                subtitle = fill(text.optString("todaySubtitle", "{exercises} exercises"), result.day);
                startUrl = "com.fitai.app://open?to=/workout/" + planId + "/" + result.day.index;
                break;
            case DONE:
                title = text.optString("doneTitle", "Today's workout is done");
                subtitle = fill(text.optString("doneSubtitle", "{day}"), result.day);
                break;
            case REST:
                title = text.optString("restTitle", "Rest day");
                subtitle = fill(
                    result.inDays == 1
                        ? text.optString("nextTomorrow", "Next: tomorrow, {day}")
                        : text.optString("nextLater", "Next: {weekday}, {day}"),
                    result.day
                ).replace("{weekday}", weekday(text, result.day.dow));
                break;
            case NO_PLAN:
                title = text.optString("noPlanTitle", "No active plan");
                subtitle = text.optString("noPlanSubtitle", "Pick a plan in FitAi");
                break;
            default:
                title = text.optString("signedOutTitle", "Sign in to FitAi");
                subtitle = text.optString("signedOutSubtitle", "Your workout of the day will show here");
        }

        views.setTextViewText(R.id.widget_title, title);
        views.setTextViewText(R.id.widget_subtitle, subtitle);

        int streak = state.optInt("streakWeeks", 0);
        boolean showStreak = streak > 0 && result.kind != WidgetSchedule.Kind.SIGNED_OUT;
        views.setViewVisibility(R.id.widget_streak, showStreak ? View.VISIBLE : View.GONE);
        if (showStreak) {
            views.setTextViewText(R.id.widget_streak,
                text.optString("streak", "{weeks}-week streak").replace("{weeks}", String.valueOf(streak)));
        }

        views.setOnClickPendingIntent(R.id.widget_root, openApp(context));
        if (startUrl != null) {
            views.setViewVisibility(R.id.widget_start, View.VISIBLE);
            views.setTextViewText(R.id.widget_start, text.optString("start", "Start"));
            views.setOnClickPendingIntent(R.id.widget_start, openLink(context, startUrl));
        } else {
            views.setViewVisibility(R.id.widget_start, View.GONE);
        }
        return views;
    }

    private static String fill(String template, WidgetSchedule.Day day) {
        if (day == null) return template;
        return template
            .replace("{day}", day.name)
            .replace("{exercises}", String.valueOf(day.exercises));
    }

    private static String weekday(JSONObject text, int dow) {
        JSONArray names = text.optJSONArray("weekdays");
        return names != null && dow < names.length() ? names.optString(dow, "") : "";
    }

    private static List<WidgetSchedule.Day> days(JSONArray raw) {
        List<WidgetSchedule.Day> out = new ArrayList<>();
        if (raw == null) return out;
        for (int i = 0; i < raw.length(); i++) {
            JSONObject d = raw.optJSONObject(i);
            if (d == null) continue;
            out.add(new WidgetSchedule.Day(d.optInt("dow", -1), d.optInt("index", 0), d.optString("name", ""), d.optInt("exercises", 0)));
        }
        return out;
    }

    private static JSONObject load(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            return new JSONObject(prefs.getString(KEY_STATE, "{}"));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    private static PendingIntent openApp(Context context) {
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (intent == null) intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(context, 10, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Through the app's allow-listed link router, like shortcuts and reminders. */
    private static PendingIntent openLink(Context context, String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url))
            .setPackage(context.getPackageName())
            .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(context, 11, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
