import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationService from '../services/NotificationService';

const NotificationTester = () => {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
    NotificationService.logNotificationStatus();
  }, []);

  const checkPermissionStatus = async () => {
    const status = await NotificationService.requestPermissions();
    setPermissionStatus(status);
  };

  const testLocalNotification = async () => {
    setIsLoading(true);
    try {
      const notificationId = await NotificationService.testLocalNotification();
      // Send success as notification instead of alert
      await NotificationService.scheduleNotification(
        '✅ Test Successful',
        `Notification system is working! Test ID: ${notificationId}`,
        { seconds: 2 },
        { type: 'success', source: 'test' }
      );
    } catch (error) {
      // Send error as notification instead of alert
      await NotificationService.scheduleNotification(
        '❌ Test Failed',
        'Failed to schedule test notification. Check console for details.',
        { seconds: 2 },
        { type: 'error', source: 'test' }
      );
      console.error('Test notification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoNotifications = async () => {
    setIsLoading(true);
    try {
      await NotificationService.createDemoNotifications();
      // Send confirmation as notification
      await NotificationService.scheduleNotification(
        '🧪 Demo Notifications Created',
        'Several health notifications have been scheduled for the next few minutes.',
        { seconds: 1 },
        { type: 'info', source: 'demo' }
      );
    } catch (error) {
      await NotificationService.scheduleNotification(
        '❌ Demo Failed',
        'Failed to create demo notifications. Check console for details.',
        { seconds: 1 },
        { type: 'error', source: 'demo' }
      );
      console.error('Demo notifications error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testMedicationReminders = async () => {
    setIsLoading(true);
    try {
      await NotificationService.testMedicationReminders();
      await NotificationService.scheduleNotification(
        '💊 Medication Test Active',
        'Test medication reminders scheduled for the next 1-2 minutes.',
        { seconds: 1 },
        { type: 'info', source: 'medication_test' }
      );
    } catch (error) {
      await NotificationService.scheduleNotification(
        '❌ Medication Test Failed',
        'Failed to test medication reminders.',
        { seconds: 1 },
        { type: 'error', source: 'medication_test' }
      );
      console.error('Medication reminders error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSmartReminders = async () => {
    setIsLoading(true);
    try {
      await NotificationService.scheduleSmartHealthReminders('test_user');
      await NotificationService.scheduleNotification(
        '🧠 Smart Reminders Active',
        'Daily smart health reminders have been activated successfully.',
        { seconds: 1 },
        { type: 'success', source: 'smart_reminders' }
      );
    } catch (error) {
      await NotificationService.scheduleNotification(
        '❌ Smart Setup Failed',
        'Failed to setup smart reminders.',
        { seconds: 1 },
        { type: 'error', source: 'smart_reminders' }
      );
      console.error('Smart reminders error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewScheduledNotifications = async () => {
    setIsLoading(true);
    try {
      const scheduled = await NotificationService.getScheduledNotifications();
      const stats = NotificationService.getNotificationStats();
      
      await NotificationService.scheduleNotification(
        '📊 Notification Status',
        `Active: ${scheduled.length} notifications | Total tracked: ${stats.total}`,
        { seconds: 1 },
        { type: 'info', source: 'status' }
      );
      
      console.log('📊 Notification Statistics:', stats);
      console.log('📅 Scheduled Notifications:', scheduled);
    } catch (error) {
      await NotificationService.scheduleNotification(
        '❌ Status Check Failed',
        'Failed to get notification status.',
        { seconds: 1 },
        { type: 'error', source: 'status' }
      );
      console.error('Notification status error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleHealthReminder = async () => {
    setIsLoading(true);
    try {
      const notificationId = await NotificationService.scheduleHealthReminder(
        'water',
        'Remember to drink water every hour for better health!',
        { hour: new Date().getHours(), minute: new Date().getMinutes() + 1 }
      );
      Alert.alert(
        'Health Reminder Scheduled',
        `Water reminder set for ${new Date().getMinutes() + 1} minutes from now.\nID: ${notificationId}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule health reminder');
      console.error('Health reminder error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (permissionStatus) {
      case 'granted': return '#28A745';
      case 'denied': return '#F44336';
      case 'limited': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'granted': return 'checkmark-circle';
      case 'denied': return 'close-circle';
      case 'limited': return 'warning';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Notification Tester</Text>
        <Text style={styles.subtitle}>Test notification functionality in development</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Ionicons 
            name={getStatusIcon()} 
            size={24} 
            color={getStatusColor()} 
          />
          <View style={styles.statusText}>
            <Text style={styles.statusLabel}>Permission Status</Text>
            <Text style={[styles.statusValue, { color: getStatusColor() }]}>
              {permissionStatus.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={testLocalNotification}
          disabled={isLoading}
        >
          <Ionicons name="notifications" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Test Local Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={createDemoNotifications}
          disabled={isLoading}
        >
          <Ionicons name="copy" size={20} color="#007BFF" />
          <Text style={[styles.buttonText, styles.secondaryText]}>Create Demo Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.healthButton]} 
          onPress={scheduleHealthReminder}
          disabled={isLoading}
        >
          <Ionicons name="heart" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Schedule Health Reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.medicationButton]} 
          onPress={testMedicationReminders}
          disabled={isLoading}
        >
          <Ionicons name="medical" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Test Medication Reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.smartButton]} 
          onPress={testSmartReminders}
          disabled={isLoading}
        >
          <Ionicons name="bulb" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Setup Smart Reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.statusButton]} 
          onPress={viewScheduledNotifications}
          disabled={isLoading}
        >
          <Ionicons name="list" size={20} color="#666" />
          <Text style={[styles.buttonText, { color: '#666' }]}>View Notification Status</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.infoButton]} 
          onPress={() => NotificationService.showLimitationWarning()}
          disabled={isLoading}
        >
          <Ionicons name="information-circle" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Show Dev Info</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 12,
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007BFF',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#007BFF',
  },
  healthButton: {
    backgroundColor: '#28A745',
  },
  medicationButton: {
    backgroundColor: '#DC3545',
  },
  smartButton: {
    backgroundColor: '#FFC107',
  },
  statusButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  infoButton: {
    backgroundColor: '#6C757D',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryText: {
    color: '#007BFF',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationTester;
