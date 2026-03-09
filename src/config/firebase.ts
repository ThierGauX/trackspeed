// src/config/firebase.ts
// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE OBLIGATOIRE : Remplace les valeurs ci-dessous par celles de ton projet
// Firebase. Va sur https://console.firebase.google.com → ton projet →
// Paramètres (engrenage) → Tes applications → Config
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey:            'REMPLACE_PAR_TON_API_KEY',
  authDomain:        'REMPLACE_PAR_TON_PROJECT_ID.firebaseapp.com',
  projectId:         'REMPLACE_PAR_TON_PROJECT_ID',
  storageBucket:     'REMPLACE_PAR_TON_PROJECT_ID.appspot.com',
  messagingSenderId: 'REMPLACE_PAR_TON_SENDER_ID',
  appId:             'REMPLACE_PAR_TON_APP_ID',
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
