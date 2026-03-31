# Add project specific ProGuard rules here.

# ─── React Native ─────────────────────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**

# ─── Hermes / JSI ─────────────────────────────────────────────────────────────
-keep class com.facebook.soloader.** { *; }
-dontwarn com.facebook.soloader.**

# ─── Keep native method names (JNI) ──────────────────────────────────────────
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.uimanager.annotations.ReactProp *;
}

# ─── OkHttp / Axios (network layer) ──────────────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# ─── React Native AsyncStorage ────────────────────────────────────────────────
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ─── React Native WebView ─────────────────────────────────────────────────────
-keep class com.reactnativecommunity.webview.** { *; }

# ─── React Native Image Picker ───────────────────────────────────────────────
-keep class com.imagepicker.** { *; }

# ─── React Native Linear Gradient ────────────────────────────────────────────
-keep class com.BV.LinearGradient.** { *; }

# ─── React Native SVG ────────────────────────────────────────────────────────
-keep class com.horcrux.svg.** { *; }

# ─── React Native Safe Area Context ──────────────────────────────────────────
-keep class com.th3rdwave.safeareacontext.** { *; }

# ─── React Native Screens ─────────────────────────────────────────────────────
-keep class com.swmansion.rnscreens.** { *; }

# ─── React Native Gesture Handler ────────────────────────────────────────────
-keep class com.swmansion.gesturehandler.** { *; }

# ─── React Native Reanimated ─────────────────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }

# ─── DateTime Picker ─────────────────────────────────────────────────────────
-keep class com.reactcommunity.rndatetimepicker.** { *; }

# ─── Gifted Charts / SVG ─────────────────────────────────────────────────────
-keep class com.horcrux.** { *; }

# ─── General: keep class names used via reflection ───────────────────────────
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# ─── Keep BuildConfig ────────────────────────────────────────────────────────
-keep class com.donationsreceiptapp.BuildConfig { *; }
-keep class com.donationsreceiptapp.** { *; }
