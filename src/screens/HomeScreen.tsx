// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSpeed } from '../hooks/useSpeed';
import { useAuth } from '../hooks/useAuth';
import { saveMeasure, subscribeToProfile } from '../services/firestore';
import { scheduleDailyReminder, sendBadgeNotification } from '../services/notifications';
import { Badge } from '../constants/badges';
import { COLORS } from '../constants/theme';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

const { width } = Dimensions.get('window');
const BTN = width * 0.58;

export default function HomeScreen() {
  const { user } = useAuth();
  const { phase, currentSpeed, averageSpeed, timeLeft, error, startMeasure, reset } = useSpeed();
  const [profile, setProfile]         = useState<any>(null);
  const [saving, setSaving]           = useState(false);
  const [newBadges, setNewBadges]     = useState<Badge[]>([]);
  const [showBadge, setShowBadge]     = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToProfile(user.uid, setProfile);
  }, [user?.uid]);

  useEffect(() => {
    if (phase === 'done' && averageSpeed !== null && !saving) handleSave(averageSpeed);
  }, [phase, averageSpeed]);

  const handleSave = async (speed: number) => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const { newBadges: unlocked, newStats } = await saveMeasure(user.uid, speed);
      await scheduleDailyReminder(newStats.streak);
      if (unlocked.length > 0) {
        setNewBadges(unlocked);
        setShowBadge(true);
        for (const b of unlocked) await sendBadgeNotification(b.name, b.icon);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSaving(false);
    }
  };

  const todayDone = profile?.lastMeasureDate === format(new Date(), 'yyyy-MM-dd');
  const streak    = profile?.streak    ?? 0;
  const maxSpeed  = profile?.maxSpeed  ?? 0;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { label: format(d, 'EEEEE', { locale: fr }).toUpperCase(), daysAgo: 6 - i, isToday: isToday(d) };
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { icon: '🔥', value: `${streak}j`,          color: COLORS.orange, label: 'SÉRIE'    },
            { icon: '⚡', value: `${maxSpeed} km/h`,     color: COLORS.accent, label: 'RECORD'   },
            { icon: '📊', value: `${profile?.totalMeasures ?? 0}`, color: COLORS.text, label: 'MESURES' },
          ].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={{ fontSize: 18, marginBottom: 4 }}>{st.icon}</Text>
              <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Calendrier série */}
        <View style={s.streakCard}>
          <Text style={s.streakTitle}>🔥 SÉRIE EN COURS — {streak} JOURS</Text>
          <View style={s.weekRow}>
            {weekDays.map((d, i) => {
              const done = d.daysAgo < streak;
              return (
                <View key={i} style={s.dayCol}>
                  <Text style={s.dayLabel}>{d.label}</Text>
                  <View style={[s.dayDot, done && s.dayDotDone, d.isToday && !done && s.dayDotToday]}>
                    {done && <Text style={{ fontSize: 12 }}>🔥</Text>}
                    {d.isToday && !done && <View style={s.todayDot} />}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bouton principal */}
        <View style={s.btnSection}>
          {todayDone && phase === 'idle' && (
            <Text style={s.doneText}>✅ Déjà mesuré aujourd'hui ! Reviens demain.</Text>
          )}
          {error && <Text style={s.errorText}>{error}</Text>}

          <TouchableOpacity
            onPress={phase === 'done' ? reset : startMeasure}
            disabled={(todayDone && phase === 'idle') || saving}
            style={{ opacity: todayDone && phase === 'idle' ? 0.5 : 1 }}
            activeOpacity={0.85}
          >
            <View style={s.btnOuter}>
              {phase === 'measuring' && (
                <View style={[s.progressRing, { borderColor: COLORS.accent }]} />
              )}
              <LinearGradient
                colors={phase === 'done' ? ['#003a1a','#002a12'] : phase === 'measuring' ? ['#001a2e','#002a4a'] : ['#001830','#00294a']}
                style={s.btn}
              >
                {phase === 'idle' && !todayDone && (
                  <>
                    <Text style={{ fontSize: 48, marginBottom: 8 }}>⚡</Text>
                    <Text style={s.btnMain}>MESURER</Text>
                    <Text style={s.btnSub}>15 secondes</Text>
                  </>
                )}
                {phase === 'measuring' && (
                  <>
                    <Text style={[s.btnSpeed, { color: COLORS.accent }]}>{Math.round(currentSpeed)}</Text>
                    <Text style={s.btnUnit}>KM/H</Text>
                    <Text style={s.btnSub}>{(timeLeft / 1000).toFixed(1)}s</Text>
                  </>
                )}
                {phase === 'done' && (
                  <>
                    <Text style={[s.btnSpeed, { color: COLORS.green }]}>{averageSpeed}</Text>
                    <Text style={[s.btnUnit, { color: '#2a8a5a' }]}>KM/H MOY.</Text>
                    <Text style={[s.btnSub, { marginTop: 6 }]}>Appuie pour rejouer</Text>
                  </>
                )}
                {todayDone && phase === 'idle' && (
                  <>
                    <Text style={{ fontSize: 48, marginBottom: 8 }}>✅</Text>
                    <Text style={s.btnMain}>FAIT !</Text>
                    <Text style={s.btnSub}>{maxSpeed} km/h</Text>
                  </>
                )}
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {phase === 'done' && averageSpeed !== null && (
            <View style={s.resultCard}>
              <Text style={{ color: averageSpeed > maxSpeed ? COLORS.gold : COLORS.accent, fontSize: 14, fontWeight: '600' }}>
                {averageSpeed > maxSpeed ? '🏆 Nouveau record personnel !' : `Ton record : ${maxSpeed} km/h`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal badge */}
      <Modal visible={showBadge} transparent animationType="fade">
        <TouchableOpacity style={s.modalBg} onPress={() => { setShowBadge(false); setNewBadges([]); }} activeOpacity={1}>
          <View style={s.modalCard}>
            {newBadges.map((b, i) => (
              <View key={i} style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 72, marginBottom: 12 }}>{b.icon}</Text>
                <Text style={{ color: COLORS.gold, fontSize: 22, fontWeight: '900', letterSpacing: 2, marginBottom: 6 }}>BADGE DÉBLOQUÉ !</Text>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{b.name}</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>{b.description}</Text>
              </View>
            ))}
            <Text style={{ color: COLORS.textDim, fontSize: 12, marginTop: 8 }}>Appuie pour continuer</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.bg },
  statsRow:    { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 8 },
  statCard:    { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgCardBorder },
  statVal:     { fontSize: 14, fontWeight: '700' },
  statLabel:   { color: COLORS.textMuted, fontSize: 9, marginTop: 2, letterSpacing: 0.5 },
  streakCard:  { margin: 16, marginTop: 0, backgroundColor: COLORS.orangeDim, borderWidth: 1, borderColor: COLORS.orangeBorder, borderRadius: 16, padding: 14 },
  streakTitle: { color: COLORS.orange, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  weekRow:     { flexDirection: 'row', gap: 6 },
  dayCol:      { flex: 1, alignItems: 'center' },
  dayLabel:    { color: COLORS.textMuted, fontSize: 9, marginBottom: 4, fontWeight: '600' },
  dayDot:      { height: 34, width: '100%', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
  dayDotDone:  { backgroundColor: 'rgba(255,100,0,0.3)', borderWidth: 1, borderColor: COLORS.orangeBorder },
  dayDotToday: { borderWidth: 1, borderColor: COLORS.accent },
  todayDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent },
  btnSection:  { alignItems: 'center', paddingVertical: 16 },
  doneText:    { color: COLORS.accent, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  errorText:   { color: COLORS.red, fontSize: 12, marginBottom: 10, textAlign: 'center', paddingHorizontal: 20 },
  btnOuter:    { width: BTN + 20, height: BTN + 20, alignItems: 'center', justifyContent: 'center' },
  progressRing:{ position: 'absolute', width: BTN + 20, height: BTN + 20, borderRadius: (BTN + 20) / 2, borderWidth: 5 },
  btn:         { width: BTN, height: BTN, borderRadius: BTN / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(0,195,255,0.25)', elevation: 15 },
  btnMain:     { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  btnSub:      { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  btnSpeed:    { fontSize: 52, fontWeight: '900', lineHeight: 56 },
  btnUnit:     { fontSize: 12, letterSpacing: 2, fontWeight: '600', color: COLORS.textMuted },
  resultCard:  { marginTop: 16, backgroundColor: COLORS.accentDim, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.accentBorder },
  modalBg:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center' },
  modalCard:   { backgroundColor: '#0d1117', borderRadius: 24, padding: 32, alignItems: 'center', width: '80%', borderWidth: 1, borderColor: COLORS.goldBorder },
});
