import { Capacitor } from '@capacitor/core';

/**
 * True inside the installed Android app, false in every browser.
 *
 * Read once at load: the platform cannot change while the page is alive. Any
 * behaviour that differs between the app and the web goes behind this, so the
 * web build keeps doing exactly what it did before the app existed.
 */
export const isNativeApp = Capacitor.isNativePlatform();
