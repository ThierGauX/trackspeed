// src/services/notifications.ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Rappel quotidien à 19h
export async function scheduleDailyReminder(streak: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const msgs = [
    { title: '⚡ Ta série t\'attend !',   body: `${streak} jours — ne brise pas ta flamme !` },
    { title: '🔥 Garde ta série !',        body: 'Lance ta mesure du jour maintenant.' },
    { title: '🏆 Le classement t\'attend', body: 'Lance ta mesure du jour !' },
  ];
  const m = msgs[streak % msgs.length];

  await Notifications.scheduleNotificationAsync({
    content: { title: m.title, body: m.body, sound: true },
    trigger: { hour: 19, minute: 0, repeats: true },
  });
}

// Notif immédiate badge débloqué
export async function sendBadgeNotification(name: string, icon: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title: `${icon} Badge débloqué !`, body: `Tu as obtenu "${name}"`, sound: true },
    trigger: null,
  });
}
