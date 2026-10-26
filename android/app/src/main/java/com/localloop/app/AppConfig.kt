package com.localloop.app

import android.content.Context
import android.os.Build

object AppConfig {
    private const val PREFS_NAME = "localloop_app_prefs"
    private const val KEY_SERVER_URL = "custom_server_url"

    const val DEFAULT_EMULATOR_URL = "http://10.0.2.2:3000"
    const val DEFAULT_LAN_URL = "http://192.168.29.56:3000"
    const val DEFAULT_PROD_URL = "https://localloop.in"

    /**
     * Determines whether the app is running in an Android Emulator.
     */
    fun isEmulator(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || "google_sdk" == Build.PRODUCT)
    }

    /**
     * Resolves the target base URL.
     * Uses saved SharedPreferences if user customized it;
     * otherwise automatically selects 10.0.2.2 for emulator or Mac LAN IP for physical device.
     */
    fun getTargetUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val customUrl = prefs.getString(KEY_SERVER_URL, null)
        if (!customUrl.isNullOrBlank()) {
            return customUrl.trimEnd('/')
        }

        return if (isEmulator()) {
            DEFAULT_EMULATOR_URL
        } else {
            DEFAULT_LAN_URL
        }
    }

    fun setTargetUrl(context: Context, url: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_SERVER_URL, url.trimEnd('/')).apply()
    }

    fun clearCustomUrl(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(KEY_SERVER_URL).apply()
    }
}
