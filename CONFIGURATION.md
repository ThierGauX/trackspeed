# ⚙️ Configuration Menu

Refer to the [GUIDE_INSTALLATION.txt](file:///home/lestimegauthier/code/projet/trackspeed/GUIDE_INSTALLATION.txt) for a step-by-step walkthrough of the setup process.

## 🌐 Firebase Setup

**✅ Status: Completed.** The project is now successfully connected to Firebase, and `google-services.json` is configured in the environment.

1.  **Create a Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com/).
2.  **Add Android/iOS Apps**: Register your apps with the matching bundle/package IDs from `app.json`.
3.  **Download Config Files**:
    - **Android**: Place `google-services.json` in the root or `android/app` directory.
    - **iOS**: Place `GoogleService-Info.plist` in the root or `ios` directory.
4.  **Enable Services**:
    - **Authentication**: Enable Google as a sign-in provider.
    - **Cloud Firestore**: Create a database in "Production" or "Test" mode.
    - **Cloud Messaging**: Setup FCM for notifications.

## 🔑 Google Sign-In

1.  **Obtain Client IDs**: From your Firebase project's settings or Google Cloud Console.
2.  **Web Client ID**: Necessary for `GoogleSignin.configure({ webClientId: '...' })` in `src/screens/LoginScreen.tsx`.

## 📱 App Settings (`app.json`)

Ensure your `app.json` has the correct identifiers:

```json
{
  "expo": {
    "name": "SpeedStreak",
    "slug": "SpeedStreak",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourname.speedstreak"
    },
    "android": {
      "package": "com.yourname.speedstreak"
    }
  }
}
```

## 🏗️ Building the App

For standalone APKs/AABs:
- Run `npm run build:apk` (EAS Build).
- Run `npm run build:aab` (Production).
