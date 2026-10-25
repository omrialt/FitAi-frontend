package com.fitai.app;

import android.content.Context;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Whether this build can use push notifications at all.
 *
 * Registering for push without Firebase configured crashes the app, and a
 * build only has Firebase when google-services.json was present: the Google
 * Services plugin then generates the google_app_id resource, which is exactly
 * what Firebase initialises from. So its presence is the test — no Firebase
 * class needs to be on this module's classpath to ask.
 */
@CapacitorPlugin(name = "PushSupport")
public class PushSupportPlugin extends Plugin {

    @PluginMethod
    public void isConfigured(PluginCall call) {
        Context context = getContext();
        int id = context.getResources().getIdentifier("google_app_id", "string", context.getPackageName());
        JSObject result = new JSObject();
        result.put("configured", id != 0);
        call.resolve(result);
    }
}
