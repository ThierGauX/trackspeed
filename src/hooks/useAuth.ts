// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createUserProfile, getUserProfile } from '../services/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE OBLIGATOIRE : remplace REMPLACE_PAR_TON_WEB_CLIENT_ID
// par l'ID que tu as copié depuis Firebase → Authentication → Google
// Exemple : 1234567890-abcdefgh.apps.googleusercontent.com
// ─────────────────────────────────────────────────────────────────────────────
GoogleSignin.configure({
  webClientId: 'REMPLACE_PAR_TON_WEB_CLIENT_ID.apps.googleusercontent.com',
});

export function useAuth() {
  const [user, setUser]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          await createUserProfile(firebaseUser.uid, {
            displayName: firebaseUser.displayName || 'Anonyme',
            email:       firebaseUser.email        || '',
            photoURL:    firebaseUser.photoURL     || '',
          });
        }
        setUser({ ...firebaseUser, profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();
    const credential  = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(credential);
  };

  const signOut = async () => {
    await GoogleSignin.signOut();
    await auth().signOut();
  };

  return { user, loading, signInWithGoogle, signOut };
}
