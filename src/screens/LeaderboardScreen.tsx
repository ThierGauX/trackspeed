// src/screens/LeaderboardScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, RefreshControl, Image } from 'react-native';
import { subscribeToGlobalLeaderboard, subscribeToFriendsLeaderboard, addFriendByEmail } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/theme';

type Tab = 'global' | 'friends';

export default function LeaderboardScreen() {
  const { user }                          = useAuth();
  const [tab, setTab]                     = useState<Tab>('global');
  const [global, setGlobal]               = useState<any[]>([]);
  const [friends, setFriends]             = useState<any[]>([]);
  const [refreshing, setRefreshing]       = useState(false);
  const [friendEmail, setFriendEmail]     = useState('');
  const [showAdd, setShowAdd]             = useState(false);
  const [addingFriend, setAddingFriend]   = useState(false);

  const loadGlobal = useCallback(() => {
    if (!user?.uid) return;
    return subscribeToGlobalLeaderboard(data => {
      setGlobal(data);
      setRefreshing(false);
    });
  }, [user]);

  const loadFriends = useCallback(() => {
    if (!user?.uid) return;
    return subscribeToFriendsLeaderboard(user.uid, user.profile?.friends ?? [], data => {
      setFriends(data);
    });
  }, [user]);

  useEffect(() => { 
    const unsubGlobal = loadGlobal();
    const unsubFriends = loadFriends();
    return () => {
      if (typeof unsubGlobal === 'function') unsubGlobal();
      if (typeof unsubFriends === 'function') unsubFriends();
    };
  }, [loadGlobal, loadFriends]);

  const handleAddFriend = async () => {
    if (!friendEmail.trim()) return;
    setAddingFriend(true);
    try {
      await addFriendByEmail(user.uid, friendEmail.trim().toLowerCase());
      setFriendEmail(''); setShowAdd(false);
      Alert.alert('✅ Ami ajouté !');
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    finally { setAddingFriend(false); }
  };

  const data = tab === 'global' ? global : friends;

  return (
    <View style={s.container}>
      {/* Tabs */}
      <View style={s.tabs}>
        {(['global','friends'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabOn]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextOn]}>
              {t === 'global' ? '🌍 Global' : '👥 Amis'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ajouter un ami */}
      {tab === 'friends' && (
        <View style={s.addSection}>
          {showAdd ? (
            <View style={s.addRow}>
              <TextInput style={s.input} placeholder="Email de l'ami…" placeholderTextColor={COLORS.textMuted}
                value={friendEmail} onChangeText={setFriendEmail} keyboardType="email-address" autoCapitalize="none" />
              <TouchableOpacity style={s.addBtn} onPress={handleAddFriend} disabled={addingFriend}>
                <Text style={s.addBtnText}>{addingFriend ? '…' : 'Ajouter'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.showAddBtn} onPress={() => setShowAdd(true)}>
              <Text style={s.showAddText}>+ Ajouter un ami</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={item => item.uid}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { /* Real-time syncs automatically */ }} tintColor={COLORS.accent} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>{tab === 'friends' ? '👥' : '🏆'}</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 14, textAlign: 'center' }}>
              {tab === 'friends' ? 'Ajoute des amis pour les voir ici !' : 'Aucun utilisateur pour l\'instant.'}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isMe = item.uid === user?.uid;
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
          return (
            <View style={[s.row, isMe && s.rowMe]}>
              <Text style={[s.rank, { color: medal ? COLORS.gold : COLORS.textMuted }]}>{medal ?? `#${item.rank}`}</Text>
              {item.photoURL
                ? <Image source={{ uri: item.photoURL }} style={s.avatar} />
                : <View style={[s.avatar, s.avatarFallback]}><Text style={{ fontSize: 18 }}>😎</Text></View>
              }
              <View style={{ flex: 1 }}>
                <Text style={[s.name, isMe && { color: COLORS.accent }]}>
                  {item.displayName ?? 'Anonyme'}{isMe ? '  ' : ''}
                  {isMe && <Text style={s.meBadge}>TOI</Text>}
                </Text>
                <Text style={s.streak}>🔥 {item.streak ?? 0} jours</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.speed}>{item.maxSpeed?.toFixed(1) ?? '—'}</Text>
                <Text style={s.speedUnit}>KM/H</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.bg },
  tabs:        { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  tab:         { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  tabOn:       { backgroundColor: COLORS.accentDim, borderColor: COLORS.accentBorder },
  tabText:     { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextOn:   { color: COLORS.accent },
  addSection:  { paddingHorizontal: 16, marginBottom: 8 },
  showAddBtn:  { backgroundColor: COLORS.accentDim, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.accentBorder, alignSelf: 'flex-start' },
  showAddText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  addRow:      { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input:       { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  addBtn:      { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  addBtnText:  { color: '#000', fontWeight: '700', fontSize: 14 },
  list:        { padding: 16, paddingTop: 4 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  rowMe:       { backgroundColor: COLORS.accentDim, borderColor: COLORS.accentBorder },
  rank:        { width: 32, fontSize: 18, textAlign: 'center', fontWeight: '700' },
  avatar:      { width: 42, height: 42, borderRadius: 21 },
  avatarFallback: { backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  name:        { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  meBadge:     { fontSize: 9, color: COLORS.accent },
  streak:      { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  speed:       { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  speedUnit:   { color: COLORS.textMuted, fontSize: 8, letterSpacing: 0.5 },
  empty:       { alignItems: 'center', paddingTop: 60 },
});
