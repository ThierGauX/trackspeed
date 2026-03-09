// src/services/firestore.ts
import firestore from '@react-native-firebase/firestore';
import { format } from 'date-fns';
import { BADGES, getNewlyUnlockedBadges, Badge, UserStats } from '../constants/badges';

// ── Lire le profil ──────────────────────────────────────────────────────────
export async function getUserProfile(uid: string) {
  const doc = await firestore().collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
}

// ── Créer le profil à la 1ère connexion ────────────────────────────────────
export async function createUserProfile(uid: string, data: {
  displayName: string; email: string; photoURL: string;
}) {
  await firestore().collection('users').doc(uid).set({
    ...data,
    createdAt:       firestore.FieldValue.serverTimestamp(),
    streak:          0,
    lastMeasureDate: null,
    totalMeasures:   0,
    maxSpeed:        0,
    badges:          [],
    friends:         [],
  });
  await firestore().collection('leaderboard').doc(uid).set({
    displayName: data.displayName,
    photoURL:    data.photoURL,
    maxSpeed:    0,
    streak:      0,
    updatedAt:   firestore.FieldValue.serverTimestamp(),
  });
}

// ── Enregistrer une mesure ──────────────────────────────────────────────────
export async function saveMeasure(uid: string, speed: number)
  : Promise<{ newBadges: Badge[]; newStats: UserStats }> {

  const today     = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

  const userRef = firestore().collection('users').doc(uid);
  const user    = (await userRef.get()).data()!;

  if (user.lastMeasureDate === today) throw new Error('Déjà mesuré aujourd\'hui !');

  const newStreak      = user.lastMeasureDate === yesterday ? user.streak + 1 : 1;
  const newMaxSpeed    = Math.max(user.maxSpeed, speed);
  const newTotalMeasures = user.totalMeasures + 1;

  const oldStats: UserStats = { streak: user.streak, maxSpeed: user.maxSpeed, totalMeasures: user.totalMeasures, rank: 9999, badges: user.badges || [] };
  const newStats: UserStats = { streak: newStreak,   maxSpeed: newMaxSpeed,   totalMeasures: newTotalMeasures,   rank: 9999, badges: user.badges || [] };

  const newBadges  = getNewlyUnlockedBadges(oldStats, newStats);
  const allBadges  = [...(user.badges || []), ...newBadges.map(b => b.id)];

  const batch = firestore().batch();
  batch.update(userRef, { streak: newStreak, lastMeasureDate: today, totalMeasures: newTotalMeasures, maxSpeed: newMaxSpeed, badges: allBadges });
  batch.set(firestore().collection('measures').doc(uid).collection('entries').doc(),
    { speed, date: today, timestamp: firestore.FieldValue.serverTimestamp() });
  batch.update(firestore().collection('leaderboard').doc(uid),
    { maxSpeed: newMaxSpeed, streak: newStreak, updatedAt: firestore.FieldValue.serverTimestamp() });
  await batch.commit();

  return { newBadges, newStats: { ...newStats, badges: allBadges } };
}

// ── Classement global top 50 ────────────────────────────────────────────────
export async function getGlobalLeaderboard() {
  const snap = await firestore().collection('leaderboard').orderBy('maxSpeed', 'desc').limit(50).get();
  return snap.docs.map((d, i) => ({ uid: d.id, rank: i + 1, ...d.data() }));
}

// ── Classement amis ─────────────────────────────────────────────────────────
export async function getFriendsLeaderboard(uid: string, friendUids: string[]) {
  if (friendUids.length === 0) return [];
  const allUids = [uid, ...friendUids];
  const results: any[] = [];
  for (let i = 0; i < allUids.length; i += 10) {
    const snap = await firestore().collection('leaderboard')
      .where(firestore.FieldPath.documentId(), 'in', allUids.slice(i, i + 10)).get();
    snap.docs.forEach(d => results.push({ uid: d.id, ...d.data() }));
  }
  return results.sort((a, b) => b.maxSpeed - a.maxSpeed).map((u, i) => ({ ...u, rank: i + 1 }));
}

// ── Ajouter un ami par email ─────────────────────────────────────────────────
export async function addFriendByEmail(uid: string, email: string) {
  const snap = await firestore().collection('users').where('email', '==', email).limit(1).get();
  if (snap.empty) throw new Error('Utilisateur introuvable');
  const friendUid = snap.docs[0].id;
  if (friendUid === uid) throw new Error('Tu ne peux pas t\'ajouter toi-même');
  await firestore().collection('users').doc(uid).update({
    friends: firestore.FieldValue.arrayUnion(friendUid),
  });
  return { friendUid, ...snap.docs[0].data() };
}

// ── Listener temps réel profil ───────────────────────────────────────────────
export function subscribeToProfile(uid: string, cb: (data: any) => void) {
  return firestore().collection('users').doc(uid).onSnapshot(doc => {
    if (doc.exists) cb({ uid, ...doc.data() });
  });
}
