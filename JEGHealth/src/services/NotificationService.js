import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

class NotificationService {
  constructor() {
    this.isExpoGo = __DEV__ && Platform.OS !== 'web';
    this.setupNotifications();
    console.log('NotificationService initialized for React Native environment');
  }

  setupNotifications() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  async requestPermissions() {
    try {
      if (this.isExpoGo) {
        // In Expo Go, show a warning about limitations
        console.warn('Notifications have limited functionality in Expo Go. Use development build for full features.');
        return 'limited';
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications to receive health reminders',
          [{ text: 'OK' }]
        );
        return 'denied';
      }

      return 'granted';
    } catch (error) {
      console.log('Error getting notification permission:', error);
      return 'error';
    }
  }

  async scheduleNotification(title, body, trigger) {
    try {
      if (this.isExpoGo) {
        // In Expo Go, just log the notification instead of scheduling
        console.log(`[MOCK NOTIFICATION] ${title}: ${body} - Trigger:`, trigger);
        return `mock_${Date.now()}`;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger,
      });
      return notificationId;
    } catch (error) {
      console.log('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelScheduledNotification(notificationId) {
    try {
      if (this.isExpoGo) {
        console.log(`[MOCK] Cancelled notification: ${notificationId}`);
        return;
      }

      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.log('Error cancelling notification:', error);
    }
  }

  async cancelAllScheduledNotifications() {
    try {
      if (this.isExpoGo) {
        console.log('[MOCK] Cancelled all notifications');
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.log('Error cancelling all notifications:', error);
    }
  }

  showLimitationWarning() {
    if (this.isExpoGo) {
      Alert.alert(
        'Development Mode',
        'You are using Expo Go. Notifications and some device features will be simulated for testing purposes. Build a development build for full functionality.',
        [
          { text: 'Got it', style: 'default' },
          { 
            text: 'Learn More', 
            style: 'default',
            onPress: () => console.log('Visit: https://docs.expo.dev/develop/development-builds/introduction/')
          }
        ]
      );
    }
  }
}

export default new NotificationService();
