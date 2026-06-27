import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications are not supported on web preview
  if (Platform.OS === 'web') return null;
  if (!Device.isDevice) return null;

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4A017',
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

export function sendLocalNotification(title: string, body: string) {
  // Skip on web — local notifications require native device APIs
  if (Platform.OS === 'web') return;
  try {
    Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch {
    // Silently ignore if notifications are unavailable
  }
}
