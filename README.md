# ⚡ SpeedStreak (TrackSpeed)

SpeedStreak is a high-performance speed tracking mobile application built with **React Native** and **Expo**. It allows users to measure their maximum speed, track their progress through streaks, and compete with friends on a global leaderboard.

## 🚀 Key Features

- **Real-time Speed Tracking**: Accurate speed measurement using `expo-location`.
- **Streaks & Badges**: Gamified experience with daily streaks and unlockable badges.
- **Global Leaderboard**: Compete with users worldwide for the top spot.
- **Social Integration**: Add friends by email and track their progress.
- **Push Notifications**: Stay motivated with daily reminders and achievement alerts.
- **Firebase Backend**: Real-time data synchronization with Firestore and secure Authentication.

## 🛠️ Technical Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Backend**: [Google Firebase](https://firebase.google.com/) (Auth, Firestore, Messaging)
- **Styling**: Custom theme with support for gradients and haptics.
- **Navigation**: React Navigation (Bottom Tabs & Native Stack)
- **Date Handling**: `date-fns` for streak calculations.

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ThierGauX/trackspeed.git
    cd trackspeed
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the application**:
    - For development: `npx expo start`
    - For Android: `npx expo run:android`
    - For iOS: `npx expo run:ios`

## ⚙️ Configuration

Refer to [CONFIGURATION.md](file:///home/lestimegauthier/code/projet/trackspeed/CONFIGURATION.md) for detailed setup of Firebase and environment variables.

## 💡 Future Improvements

Planned features and ideas can be found in [IDEES_AMELIORATION.md](file:///home/lestimegauthier/code/projet/trackspeed/IDEES_AMELIORATION.md).
