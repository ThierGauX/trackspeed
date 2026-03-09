// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen        from '../screens/HomeScreen';
import BadgesScreen      from '../screens/BadgesScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen     from '../screens/ProfileScreen';
import LoginScreen       from '../screens/LoginScreen';
import { useAuth }       from '../hooks/useAuth';
import { COLORS }        from '../constants/theme';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle:       { backgroundColor: COLORS.bg },
        headerTitleStyle:  { color: COLORS.text, fontWeight: '800', letterSpacing: 1, fontSize: 16 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: 'rgba(8,9,14,0.97)',
          borderTopColor:  'rgba(255,255,255,0.07)',
          borderTopWidth:  1,
          height: 72, paddingBottom: 12,
        },
        tabBarActiveTintColor:   COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle:        { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Accueil"    component={HomeScreen}
        options={{ title: 'SPEEDSTREAK', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚡</Text>, tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Badges"     component={BadgesScreen}
        options={{ title: 'MES BADGES',  tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏅</Text> }} />
      <Tab.Screen name="Classement" component={LeaderboardScreen}
        options={{ title: 'CLASSEMENT',  tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏆</Text> }} />
      <Tab.Screen name="Profil"     component={ProfileScreen}
        options={{ title: 'MON PROFIL',  tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={s.splash}>
        <Text style={{ fontSize: 52 }}>⚡</Text>
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user
          ? <Stack.Screen name="Main"  component={Tabs}        />
          : <Stack.Screen name="Login" component={LoginScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
});
