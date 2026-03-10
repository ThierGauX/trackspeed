// src/config/firebase.ts
// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE OBLIGATOIRE : Remplace les valeurs ci-dessous par celles de ton projet
// Firebase. Va sur https://console.firebase.google.com → ton projet →
// Paramètres (engrenage) → Tes applications → Config
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID as string
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
