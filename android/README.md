# LocalLoop Android Mobile App

Native Android wrapper for **LocalLoop**, ready to build and run in **Android Studio**.

---

## 📱 Features

- **Terracotta & Cream Brand Theme**: Native status bars, navigation bars, and loading indicators matching LocalLoop's brand design.
- **Swipe-to-Refresh**: Native pull-to-refresh (`SwipeRefreshLayout`) integrated with Next.js webview.
- **LocalStorage & DOM Storage**: Full persistent cart and order storage synchronization.
- **Seller Photo & Banner Uploads**: Native Android Camera and Gallery file picker integration (`WebChromeClient` + `FileProvider`) for store banners and product photos.
- **Intelligent Host Auto-Detection**:
  - Running on **Android Emulator** automatically connects to `http://10.0.2.2:3000` (host loopback).
  - Running on a **Physical Phone** automatically connects to your Mac's LAN IP: `http://192.168.29.56:3000`.
- **In-App Server Switcher**: Tap the bottom-right pill button or the connection error dialog to switch between Emulator, Mac Wi-Fi LAN, or a custom production URL anytime.
- **Native Back Navigation**: Intercepts Android back gesture to navigate web history (`webView.goBack()`).

---

## 🚀 How to Run in Android Studio

### Step 1: Ensure Next.js Dev Server is Running on your Mac
Make sure your LocalLoop development server is active:
```bash
cd /Users/prathampatki/hackfest
npm run dev
```
*(Listening on `http://localhost:3000` / `http://192.168.29.56:3000`)*

### Step 2: Open in Android Studio
1. Launch **Android Studio** (`/Applications/Android Studio.app`).
2. Click **Open** (or `File` -> `Open...`).
3. Browse to `/Users/prathampatki/hackfest/android` and click **Open**.
4. Android Studio will automatically perform a Gradle Sync.

### Step 3: Run the App
- **On Android Emulator**:
  1. Select an Android Virtual Device (AVD) from the device dropdown at the top.
  2. Click the green **Run (▶)** button.
  3. The app will launch and automatically connect to `http://10.0.2.2:3000`.

- **On Physical Phone (Connected via USB or Wi-Fi)**:
  1. Connect your phone to your Mac via USB cable (or enable Wireless Debugging in Developer Options).
  2. Make sure your phone is connected to the **same Wi-Fi network** as your Mac (`192.168.29.x`).
  3. Select your physical phone in the Android Studio device dropdown.
  4. Click the green **Run (▶)** button.
  5. The app will install and automatically load `http://192.168.29.56:3000`!

---

## 📦 How to Generate an APK File
In Android Studio:
1. Go to `Build` -> `Build Bundle(s) / APK(s)` -> **`Build APK(s)`**.
2. When the build finishes, click **locate** in the popup notification to get the `app-debug.apk` file.
3. You can transfer and install this APK directly on any Android phone!
