import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

class NotificationService {
  constructor() {
    this.isExpoGo = Constants.appOwnership === 'expo';
    this.isDevelopment = __DEV__;
    this.isStandalone = Constants.appOwnership === 'standalone';
    this.hasNativeNotificationSupport = Platform.OS === 'ios' || Platform.OS === 'android';
    this.scheduledNotifications = new Map(); // Track scheduled notifications
    this.setupNotifications();
    this.logInitialization();
  }

  logInitialization() {
    if (this.isExpoGo) {
      console.log('📱 NotificationService: Expo Go mode (local notifications only)');
      console.log('ℹ️  Push notifications require development build or production app');
      console.log('🔗 Development Build Guide: https://docs.expo.dev/develop/development-builds/introduction/');
    } else if (this.isDevelopment) {
      console.log('📱 NotificationService: Development build (full functionality)');
    } else {
      console.log('📱 NotificationService: Production mode (full functionality)');
    }
    
    console.log('📋 Notification Support Matrix:');
    console.log(`   Local Notifications: ${this.hasNativeNotificationSupport ? 'Supported' : 'Not Supported'}`);
    console.log(`   Push Notifications: ${this.isExpoGo ? 'Limited (Expo Go)' : 'Supported'}`);
    console.log(`   Background Notifications: ${this.isExpoGo ? 'Limited' : 'Supported'}`);
    console.log(`   Rich Notifications: ${this.isStandalone ? 'Supported' : 'Limited'}`);
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
        // In Expo Go, we can still use local notifications
        console.log('📱 Notification permissions: Using local notifications (Expo Go)');
        
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === 'granted') {
          console.log('✅ Local notification permissions granted');
          return 'granted';
        } else {
          console.log('❌ Local notification permissions denied');
          return 'denied';
        }
      }

      // For development builds and production
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log(
          'Notification Permission',
          'Please enable notifications to receive health reminders and alerts'
        );
        return 'denied';
      }

      return 'granted';
    } catch (error) {
      console.log('Error getting notification permission:', error);
      return 'error';
    }
  }

  async scheduleNotification(title, body, trigger, data = {}) {
    try {
      const enhancedData = {
        ...data,
        scheduledAt: new Date().toISOString(),
        environment: this.isExpoGo ? 'expo-go' : 'production',
        notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const notificationRequest = {
        content: {
          title,
          body,
          sound: true,
          data: enhancedData,
          // Enhanced content for development builds
          ...(this.isStandalone && {
            subtitle: data.subtitle,
            badge: data.badge,
            categoryIdentifier: data.category
          })
        },
        trigger,
      };

      const notificationId = await Notifications.scheduleNotificationAsync(notificationRequest);

      // Track scheduled notification
      this.scheduledNotifications.set(notificationId, {
        id: notificationId,
        title,
        body,
        trigger,
        data: enhancedData,
        scheduledAt: new Date().toISOString(),
        status: 'scheduled'
      });

      if (this.isExpoGo) {
        console.log(`📱 Local notification scheduled: "${title}" - ID: ${notificationId}`);
        this.showExpoGoLimitation();
      } else {
        console.log(`🔔 Notification scheduled: "${title}" - ID: ${notificationId}`);
      }

      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      
      // Enhanced fallback for development
      if (this.isDevelopment) {
        const fallbackId = `fallback_${Date.now()}`;
        console.log(`📝 [FALLBACK] Would schedule: "${title}" - ${body}`);
        console.log(`📝 [FALLBACK] Trigger: ${JSON.stringify(trigger)}`);
        console.log(`📝 [FALLBACK] Data: ${JSON.stringify(data)}`);
        
        // Store fallback notification for testing
        this.scheduledNotifications.set(fallbackId, {
          id: fallbackId,
          title,
          body,
          trigger,
          data: data,
          scheduledAt: new Date().toISOString(),
          status: 'fallback'
        });
        
        return fallbackId;
      }
      
      return null;
    }
  }

  showExpoGoLimitation() {
    if (this.isExpoGo && !this.hasShownLimitation) {
      console.log('ℹ️  Expo Go Limitation: Notifications work locally but won\'t show when app is closed');
      this.hasShownLimitation = true;
    }
  }

  async scheduleHealthReminder(type, message, scheduledTime, options = {}) {
    const title = this.getHealthReminderTitle(type);
    const trigger = {
      hour: scheduledTime.hour,
      minute: scheduledTime.minute,
      repeats: options.repeats !== false,
    };

    // Add weekday for recurring reminders
    if (options.weekday !== undefined) {
      trigger.weekday = options.weekday;
    }

    const notificationData = {
      type: 'health_reminder',
      category: type,
      healthType: type,
      priority: this.getHealthPriority(type),
      ...options.data
    };

    return await this.scheduleNotification(title, message, trigger, notificationData);
  }

  async scheduleMedicationReminder(medicationName, dosage, times, options = {}) {
    const reminderIds = [];
    
    for (const time of times) {
      const title = `💊 ${medicationName} Reminder`;
      const message = `Time to take your ${medicationName} (${dosage})`;
      
      const trigger = {
        hour: time.hour,
        minute: time.minute,
        repeats: true
      };

      const data = {
        type: 'medication',
        medicationName,
        dosage,
        medicationId: options.medicationId,
        priority: 'high'
      };

      const notificationId = await this.scheduleNotification(title, message, trigger, data);
      if (notificationId) {
        reminderIds.push(notificationId);
      }
    }

    console.log(`💊 Scheduled ${reminderIds.length} medication reminders for ${medicationName}`);
    return reminderIds;
  }

  async scheduleAppointmentReminder(appointment, reminderType = 'day_before') {
    const appointmentDate = new Date(appointment.appointment_date);
    const reminderTimes = this.getAppointmentReminderTimes(appointmentDate, reminderType);
    const reminderIds = [];

    for (const reminderTime of reminderTimes) {
      const title = `📅 Appointment Reminder`;
      const message = `Appointment with ${appointment.doctor_name} ${reminderTime.description}`;
      
      const trigger = {
        date: reminderTime.triggerDate
      };

      const data = {
        type: 'appointment',
        appointmentId: appointment.$id,
        doctorName: appointment.doctor_name,
        appointmentDate: appointment.appointment_date,
        priority: 'high'
      };

      const notificationId = await this.scheduleNotification(title, message, trigger, data);
      if (notificationId) {
        reminderIds.push(notificationId);
      }
    }

    console.log(`📅 Scheduled ${reminderIds.length} appointment reminders`);
    return reminderIds;
  }

  async scheduleSmartHealthReminders(userId) {
    console.log('🧠 Setting up smart health reminders...');
    
    const smartReminders = [
      // Morning hydration
      {
        type: 'water',
        title: '💧 Morning Hydration',
        message: 'Start your day with a glass of water!',
        trigger: { hour: 7, minute: 0, repeats: true },
        priority: 'medium'
      },
      // Midday water reminder
      {
        type: 'water',
        title: '💧 Hydration Check',
        message: 'Have you had enough water today?',
        trigger: { hour: 14, minute: 0, repeats: true },
        priority: 'medium'
      },
      // Evening medication check
      {
        type: 'medication_check',
        title: '💊 Medication Check',
        message: 'Did you take all your medications today?',
        trigger: { hour: 21, minute: 0, repeats: true },
        priority: 'medium'
      },
      // Weekly vitals reminder
      {
        type: 'vitals',
        title: '❤️ Weekly Health Check',
        message: 'Time for your weekly vitals measurement',
        trigger: { weekday: 1, hour: 9, minute: 0, repeats: true }, // Monday morning
        priority: 'medium'
      }
    ];

    const scheduledIds = [];
    for (const reminder of smartReminders) {
      const notificationId = await this.scheduleNotification(
        reminder.title,
        reminder.message,
        reminder.trigger,
        { type: reminder.type, priority: reminder.priority, userId, smart: true }
      );
      if (notificationId) {
        scheduledIds.push(notificationId);
      }
    }

    console.log(`🧠 Scheduled ${scheduledIds.length} smart health reminders`);
    return scheduledIds;
  }

  getHealthReminderTitle(type) {
    const titles = {
      medication: '💊 Medication Reminder',
      water: '💧 Hydration Reminder', 
      exercise: '🏃‍♂️ Exercise Reminder',
      sleep: '😴 Sleep Reminder',
      appointment: '📅 Appointment Reminder',
      vitals: '❤️ Check Your Vitals',
      nutrition: '🥗 Nutrition Reminder',
      medication_check: '💊 Daily Medication Check'
    };
    return titles[type] || '🔔 Health Reminder';
  }

  getHealthPriority(type) {
    const priorities = {
      medication: 'high',
      appointment: 'high',
      vitals: 'medium',
      water: 'medium',
      exercise: 'medium',
      sleep: 'medium',
      nutrition: 'low'
    };
    return priorities[type] || 'medium';
  }

  getAppointmentReminderTimes(appointmentDate, reminderType) {
    const reminders = [];
    const now = new Date();

    switch (reminderType) {
      case 'comprehensive':
        // Day before
        const dayBefore = new Date(appointmentDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        dayBefore.setHours(18, 0, 0, 0); // 6 PM day before
        if (dayBefore > now) {
          reminders.push({
            triggerDate: dayBefore,
            description: 'tomorrow'
          });
        }

        // 2 hours before
        const twoHoursBefore = new Date(appointmentDate);
        twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
        if (twoHoursBefore > now) {
          reminders.push({
            triggerDate: twoHoursBefore,
            description: 'in 2 hours'
          });
        }

        // 30 minutes before
        const thirtyMinsBefore = new Date(appointmentDate);
        thirtyMinsBefore.setMinutes(thirtyMinsBefore.getMinutes() - 30);
        if (thirtyMinsBefore > now) {
          reminders.push({
            triggerDate: thirtyMinsBefore,
            description: 'in 30 minutes'
          });
        }
        break;

      case 'day_before':
      default:
        const dayBeforeDefault = new Date(appointmentDate);
        dayBeforeDefault.setDate(dayBeforeDefault.getDate() - 1);
        dayBeforeDefault.setHours(18, 0, 0, 0);
        if (dayBeforeDefault > now) {
          reminders.push({
            triggerDate: dayBeforeDefault,
            description: 'tomorrow'
          });
        }
        break;
    }

    return reminders;
  }

  async cancelScheduledNotification(notificationId) {
    try {
      if (this.isExpoGo && !notificationId.startsWith('fallback_')) {
        console.log(`[MOCK] Cancelled notification: ${notificationId}`);
      } else if (!notificationId.startsWith('fallback_')) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`🗑️ Cancelled notification: ${notificationId}`);
      }

      // Remove from tracking
      this.scheduledNotifications.delete(notificationId);
    } catch (error) {
      console.log('Error cancelling notification:', error);
    }
  }

  async cancelAllScheduledNotifications() {
    try {
      if (this.isExpoGo) {
        console.log('[MOCK] Cancelled all notifications');
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('🗑️ Cancelled all scheduled notifications');
      }

      // Clear tracking
      this.scheduledNotifications.clear();
    } catch (error) {
      console.log('Error cancelling all notifications:', error);
    }
  }

  async cancelMedicationReminders(medicationId) {
    let cancelledCount = 0;
    
    for (const [notificationId, notification] of this.scheduledNotifications) {
      if (notification.data?.medicationId === medicationId) {
        await this.cancelScheduledNotification(notificationId);
        cancelledCount++;
      }
    }

    console.log(`🗑️ Cancelled ${cancelledCount} medication reminders for medication ${medicationId}`);
    return cancelledCount;
  }

  async getScheduledNotifications() {
    try {
      if (this.isExpoGo) {
        // Return tracked notifications for Expo Go
        return Array.from(this.scheduledNotifications.values());
      } else {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        return scheduled;
      }
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  showDevelopmentBuildGuidance() {
    console.log('🚀 Development Build Guide:');
    console.log('To access push notifications, background notifications, and rich notifications, create a development build:');
    console.log('1. Install EAS CLI: npm install -g @expo/eas-cli');
    console.log('2. Configure: eas build:configure');
    console.log('3. Build: eas build --platform android --profile development');
    console.log('4. Install: eas build:run -p android');
    console.log('📖 Full guide: https://docs.expo.dev/develop/development-builds/introduction/');
  }

  showLimitationWarning() {
    if (this.isExpoGo) {
      console.log('🟡 Development Mode - Expo Go');
      console.log('You are using Expo Go. Notifications and some device features will be simulated for testing purposes.');
      console.log('💡 Consider upgrading to a development build for full features');
    }
  }

  // Enhanced development and testing methods
  async createDemoNotifications() {
    if (!this.isDevelopment) return;

    console.log('🧪 Creating comprehensive demo notifications for testing...');
    
    // Enhanced demo notifications for testing
    const demoNotifications = [
      {
        title: '💧 Hydration Reminder',
        body: 'Time to drink some water! Stay hydrated throughout the day.',
        trigger: { seconds: 10 },
        data: { type: 'hydration', priority: 'medium' }
      },
      {
        title: '💊 Medication Reminder', 
        body: 'Don\'t forget to take your morning medication - Lisinopril 10mg.',
        trigger: { seconds: 30 },
        data: { type: 'medication', priority: 'high', medicationName: 'Lisinopril' }
      },
      {
        title: '❤️ Health Check',
        body: 'How are you feeling today? Time to log your vitals and symptoms.',
        trigger: { seconds: 60 },
        data: { type: 'vitals', priority: 'medium' }
      },
      {
        title: '🏃‍♂️ Exercise Reminder',
        body: 'It\'s time for your daily 30-minute walk! Get moving for better health.',
        trigger: { seconds: 90 },
        data: { type: 'exercise', priority: 'medium' }
      },
      {
        title: '📅 Appointment Tomorrow',
        body: 'Reminder: You have an appointment with Dr. Smith tomorrow at 2:00 PM.',
        trigger: { seconds: 120 },
        data: { type: 'appointment', priority: 'high', doctorName: 'Dr. Smith' }
      }
    ];

    const scheduledIds = [];
    for (const notification of demoNotifications) {
      const id = await this.scheduleNotification(
        notification.title,
        notification.body,
        notification.trigger,
        { ...notification.data, source: 'demo' }
      );
      if (id) scheduledIds.push(id);
    }

    console.log(`✅ Scheduled ${scheduledIds.length} demo notifications successfully`);
    return scheduledIds;
  }

  async testLocalNotification() {
    const testId = await this.scheduleNotification(
      '🧪 Test Notification',
      'This is a test notification to verify the notification system is working properly.',
      { seconds: 5 },
      { type: 'test', timestamp: Date.now(), priority: 'medium' }
    );

    console.log(`🧪 Test notification scheduled with ID: ${testId}`);
    
    if (this.isExpoGo) {
      console.log('ℹ️  Note: In Expo Go, notifications only work when the app is open');
    }
    
    return testId;
  }

  async testMedicationReminders() {
    if (!this.isDevelopment) return;

    console.log('🧪 Testing medication reminder system...');
    
    const testMedication = {
      name: 'Test Medication',
      dosage: '10mg',
      times: [
        { hour: new Date().getHours(), minute: new Date().getMinutes() + 1 },
        { hour: new Date().getHours(), minute: new Date().getMinutes() + 2 }
      ]
    };

    const reminderIds = await this.scheduleMedicationReminder(
      testMedication.name,
      testMedication.dosage,
      testMedication.times,
      { medicationId: 'test_med_001' }
    );

    console.log(`🧪 Scheduled ${reminderIds.length} test medication reminders`);
    return reminderIds;
  }

  logNotificationStatus() {
    const status = {
      environment: this.isExpoGo ? 'Expo Go' : this.isStandalone ? 'Standalone' : 'Development Build',
      localNotifications: this.hasNativeNotificationSupport ? 'Available' : 'Not Supported',
      pushNotifications: this.isExpoGo ? 'Limited (Expo Go)' : 'Available',
      backgroundNotifications: this.isExpoGo ? 'Limited' : 'Available',
      richNotifications: this.isStandalone ? 'Available' : 'Limited',
      trackedNotifications: this.scheduledNotifications.size
    };

    console.log('📋 Notification Service Status:');
    Object.entries(status).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    if (this.isExpoGo) {
      console.log('\n💡 To unlock full notification features:');
      console.log('   1. Create a development build with EAS');
      console.log('   2. Use: eas build --platform android --profile development');
      console.log('   3. Install the development build on your device');
    }

    return status;
  }

  getNotificationStats() {
    const notifications = Array.from(this.scheduledNotifications.values());
    const stats = {
      total: notifications.length,
      byType: {},
      byPriority: {},
      byStatus: {},
      scheduled: notifications.filter(n => n.status === 'scheduled').length,
      fallback: notifications.filter(n => n.status === 'fallback').length
    };

    notifications.forEach(notification => {
      const type = notification.data?.type || 'unknown';
      const priority = notification.data?.priority || 'unknown';
      const status = notification.status || 'unknown';

      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    return stats;
  }
}

export default new NotificationService();
