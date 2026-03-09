// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { subscribeToProfile } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';
import { BADGES } from '../constants/badges';
import { COLORS } from '../constants/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToProfile(user.uid, setProfile);
  }, [user?.uid]);

  const handleSignOut = () =>
    Alert.alert('Se déconnecter ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: signOut },
    ]);

  const unlockedBadges = BADGES.filter(b => (profile?.badges ?? []).includes(b.id));
  const memberSince    = profile?.createdAt?.toDate
    ? format(profile.createdAt.toDate(), 'MMMM yyyy', { locale: fr }) : '—';

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View style={s.header}>
        {user?.photoURL
          ? <Image source={{ uri: user.photoURL }} style={s.avatar} />
          : <View style={[s.avatar, s.avatarFallback]}><Text style={{ fontSize: 40 }}>😎</Text></View>
        }
        <Text style={s.name}>{user?.displayName ?? 'Anonyme'}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.streakPill}>
          <Text style={{ fontSize: 18 }}>🔥</Text>
          <Text style={s.streakNum}>{profile?.streak ?? 0}</Text>
          <Text style={s.streakLabel}>jours de série</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>MES STATISTIQUES</Text>
        <View style={s.grid}>
          {[
            { icon: '🔥', label: 'Série actuelle',  value: `${profile?.streak ?? 0} jours` },
            { icon: '⚡', label: 'Vitesse max',      value: `${profile?.maxSpeed ?? 0} km/h` },
            { icon: '📊', label: 'Total mesures',    value: profile?.totalMeasures ?? 0 },
            { icon: '🏅', label: 'Badges',           value: `${unlockedBadges.length}/${BADGES.length}` },
            { icon: '👥', label: 'Amis',             value: (profile?.friends ?? []).length },
            { icon: '📅', label: 'Membre depuis',    value: memberSince },
          ].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={{ fontSize: 22, marginBottom: 6 }}>{st.icon}</Text>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Badges récents */}
      {unlockedBadges.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>BADGES RÉCENTS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {unlockedBadges.slice(-6).reverse().map(b => (
              <View key={b.id} style={s.badgePill}>
                <Text style={{ fontSize: 28 }}>{b.icon}</Text>
                <Text style={s.badgeName}>{b.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Déconnexion */}
      <View style={s.section}>
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Text style={s.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  header:       { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  avatar:       { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  avatarFallback: { backgroundColor: 'rgba(0,195,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.accent },
  name:         { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  email:        { color: COLORS.textMuted, fontSize: 13, marginTop: 4, marginBottom: 16 },
  streakPill:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.orangeDim, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.orangeBorder },
  streakNum:    { color: COLORS.orange, fontSize: 20, fontWeight: '800' },
  streakLabel:  { color: COLORS.orange, fontSize: 13, opacity: 0.8 },
  section:      { padding: 16, paddingTop: 20 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard:     { width: '47%', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  statValue:    { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  statLabel:    { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  badgePill:    { backgroundColor: COLORS.goldDim, borderRadius: 14, padding: 12, alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: COLORS.goldBorder, minWidth: 80 },
  badgeName:    { color: COLORS.gold, fontSize: 10, marginTop: 4, fontWeight: '700', textAlign: 'center' },
  signOutBtn:   { backgroundColor: 'rgba(255,68,68,0.1)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,68,68,0.2)' },
  signOutText:  { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});
