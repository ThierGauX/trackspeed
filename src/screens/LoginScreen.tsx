// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/theme';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      Alert.alert('Erreur de connexion', e.message || 'Réessaie plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#0d1117', '#0a0e1a']} style={s.container}>
      <View style={s.circle1} />
      <View style={s.circle2} />
      <View style={s.content}>

        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoRing} />
          <LinearGradient colors={['#00c3ff', '#0057ff']} style={s.logoInner}>
            <Text style={{ fontSize: 38 }}>⚡</Text>
          </LinearGradient>
        </View>

        <Text style={s.title}>SPEEDSTREAK</Text>
        <Text style={s.tagline}>MESURE • PROGRESSE • DOMINE</Text>

        {/* Features */}
        <View style={s.features}>
          {[
            { icon: '⚡', text: 'Mesure ta vitesse GPS en 15 secondes' },
            { icon: '🔥', text: 'Série quotidienne style Duolingo' },
            { icon: '🏆', text: 'Classement global & entre amis' },
            { icon: '🏅', text: '14 badges à débloquer' },
          ].map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Bouton Google */}
        <TouchableOpacity style={s.googleBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#1a1a2e" />
            : <>
                <Text style={s.googleG}>G</Text>
                <Text style={s.googleText}>Continuer avec Google</Text>
              </>
          }
        </TouchableOpacity>

        <Text style={s.legal}>En continuant, tu acceptes nos CGU</Text>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle1:     { position: 'absolute', top: -100,  right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(0,195,255,0.04)' },
  circle2:     { position: 'absolute', bottom: -150, left: -100, width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(0,87,255,0.04)' },
  content:     { alignItems: 'center', paddingHorizontal: 32, width: '100%' },
  logoWrap:    { alignItems: 'center', justifyContent: 'center', marginBottom: 24, width: 90, height: 90 },
  logoRing:    { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(0,195,255,0.08)', borderWidth: 1, borderColor: 'rgba(0,195,255,0.15)' },
  logoInner:   { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', elevation: 12 },
  title:       { fontSize: 48, color: '#fff', letterSpacing: 4, fontWeight: '900', marginBottom: 6 },
  tagline:     { color: '#4a7fa5', fontSize: 11, letterSpacing: 3, marginBottom: 40 },
  features:    { width: '100%', marginBottom: 36, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  featureRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  featureIcon: { fontSize: 18, marginRight: 14, width: 24, textAlign: 'center' },
  featureText: { color: '#8a9aaa', fontSize: 14 },
  googleBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15, paddingHorizontal: 28, gap: 12, width: '100%', justifyContent: 'center', elevation: 8 },
  googleG:     { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleText:  { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  legal:       { color: '#2a3a4a', fontSize: 11, textAlign: 'center', marginTop: 16 },
});
