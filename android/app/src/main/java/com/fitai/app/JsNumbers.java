package com.fitai.app;

/**
 * Numbers arriving from JS through a Capacitor plugin call.
 *
 * org.json parses an epoch time in milliseconds (13 digits) as a Long, and
 * PluginCall.getDouble returns null for a Long — only Double, Float and
 * Integer count. Reading a timestamp that way made every live-workout
 * notification fail with "startedAt is required", silently. This accepts
 * whatever numeric shape the value arrived in.
 */
final class JsNumbers {

    private JsNumbers() {}

    /** The value as epoch milliseconds, or 0 when it is missing or not a number. */
    static long toMillis(Object value) {
        if (value instanceof Number) return ((Number) value).longValue();
        if (value instanceof String) {
            try {
                return (long) Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }
}
