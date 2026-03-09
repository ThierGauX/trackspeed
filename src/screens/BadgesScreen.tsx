// src/screens/BadgesScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { BADGES, Badge } from '../constants/badges';
import { subscribeToProfile } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/theme';

export default function BadgesScreen() {
  const { user }   = useAuth();
  const [profile, setProfile]               = useState<any>(null);
  const [selected, setSelected]             = useState<Badge | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToProfile(user.uid, setProfile);
  }, [user?.uid]);

  const unlockedIds: string[] = profile?.badges ?? [];
  const sorted = [...BADGES].sort((a, b) => {
    const au = unlockedIds.includes(a.id), bu = unlockedIds.includes(b.id);
    return au === bu ? 0 : au ? -1 : 1;
  });

  return (
    <View style={s.container}>
      {/* Barre de progression */}
      <View style={s.prog}>
        <Text style={s.progText}>{unlockedIds.length}/{BADGES.length} badges débloqués</Text>
        <View style={s.progBar}>
          <View style={[s.progFill, { width: `${(unlockedIds.length / BADGES.length) * 100}%` as any }]} />
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={b => b.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const ok = unlockedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[s.card, ok && s.cardOn]}
              onPress={() => setSelected(item)}
              activeOpacity={0.8}
            >
              <Text style={[s.icon, !ok && { opacity: 0.3 }]}>{item.icon}</Text>
              <Text style={[s.name, { color: ok ? COLORS.gold : COLORS.textMuted }]}>{item.name}</Text>
              <Text style={s.desc} numberOfLines={2}>{item.description}</Text>
              {ok && <Text style={s.check}>✓ DÉBLOQUÉ</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <TouchableOpacity style={s.modalBg} onPress={() => setSelected(null)} activeOpacity={1}>
          {selected && (
            <View style={s.modalCard}>
              <Text style={s.modalIcon}>{selected.icon}</Text>
              <Text style={s.modalName}>{selected.name}</Text>
              <Text style={s.modalDesc}>{selected.description}</Text>
              {unlockedIds.includes(selected.id)
                ? <View style={s.tagOn}><Text style={{ color: COLORS.gold, fontWeight: '700' }}>✓ Badge débloqué !</Text></View>
                : <View style={s.tagOff}><Text style={{ color: COLORS.textMuted }}>🔒 À débloquer</Text></View>
              }
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  prog:      { padding: 16, paddingBottom: 8 },
  progText:  { color: COLORS.textMuted, fontSize: 12, marginBottom: 8, fontWeight: '600' },
  progBar:   { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  progFill:  { height: '100%', borderRadius: 3, backgroundColor: COLORS.gold },
  list:      { padding: 12, paddingTop: 4 },
  card:      { flex: 1, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardBorder, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 12, opacity: 0.45 },
  cardOn:    { backgroundColor: COLORS.goldDim, borderColor: COLORS.goldBorder, opacity: 1 },
  icon:      { fontSize: 40, marginBottom: 8 },
  name:      { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  desc:      { color: COLORS.textDim, fontSize: 11, textAlign: 'center' },
  check:     { color: COLORS.gold, fontSize: 10, marginTop: 6, fontWeight: '700' },
  modalBg:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0d1117', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, alignItems: 'center', borderTopWidth: 1, borderColor: COLORS.goldBorder },
  modalIcon: { fontSize: 72, marginBottom: 12 },
  modalName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  modalDesc: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  tagOn:     { backgroundColor: COLORS.goldDim, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.goldBorder },
  tagOff:    { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 },
});
