import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AlertsScreen() {
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [activityReminders, setActivityReminders] = useState(true);
  const [sleepReminders, setSleepReminders] = useState(false);
  const [appointmentAlerts, setAppointmentAlerts] = useState(true);
  
  // Sample alerts data
  const alerts = [
    {
      id: 1,
      type: "medication",
      icon: "pill",
      color: "#F44336",
      title: "Medication Reminder",
      message: "Time to take your evening medication",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "water",
      icon: "water",
      color: "#2196F3",
      title: "Hydration Alert",
      message: "You haven't logged water intake in the last 3 hours",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 3,
      type: "activity",
      icon: "walk",
      color: "#4CAF50",
      title: "Activity Goal",
      message: "You're 1,000 steps away from your daily goal!",
      time: "4 hours ago",
      read: false,
    },
    {
      id: 4,
      type: "appointment",
      icon: "calendar",
      color: "#9C27B0",
      title: "Upcoming Appointment",
      message: "Doctor appointment tomorrow at 10:00 AM",
      time: "12 hours ago",
      read: true,
    },
    {
      id: 5,
      type: "sleep",
      icon: "moon",
      color: "#3F51B5",
      title: "Sleep Reminder",
      message: "Time to prepare for sleep to reach your 8-hour goal",
      time: "1 day ago",
      read: true,
    },
  ];

  const toggleAlert = (type, value) => {
    switch(type) {
      case "medication":
        setMedicationReminders(value);
        break;
      case "water":
        setWaterReminders(value);
        break;
      case "activity":
        setActivityReminders(value);
        break;
      case "sleep":
        setSleepReminders(value);
        break;
      case "appointment":
        setAppointmentAlerts(value);
        break;
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Alerts</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Alerts</Text>
        
        {alerts.map(alert => (
          <View 
            key={alert.id} 
            style={[
              styles.alertCard, 
              !alert.read && styles.unreadAlert
            ]}
          >
            <View style={[styles.alertIcon, {backgroundColor: alert.color}]}>
              <Ionicons name={alert.icon} size={20} color="#fff" />
            </View>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
            </View>
            {!alert.read && <View style={styles.unreadDot} />}
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="pill" size={20} color="#F44336" />
            <Text style={styles.settingText}>Medication Reminders</Text>
          </View>
          <Switch
            value={medicationReminders}
            onValueChange={(value) => toggleAlert("medication", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="water" size={20} color="#2196F3" />
            <Text style={styles.settingText}>Water Intake Alerts</Text>
          </View>
          <Switch
            value={waterReminders}
            onValueChange={(value) => toggleAlert("water", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="walk" size={20} color="#4CAF50" />
            <Text style={styles.settingText}>Activity Reminders</Text>
          </View>
          <Switch
            value={activityReminders}
            onValueChange={(value) => toggleAlert("activity", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={20} color="#3F51B5" />
            <Text style={styles.settingText}>Sleep Schedule Alerts</Text>
          </View>
          <Switch
            value={sleepReminders}
            onValueChange={(value) => toggleAlert("sleep", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="calendar" size={20} color="#9C27B0" />
            <Text style={styles.settingText}>Appointment Reminders</Text>
          </View>
          <Switch
            value={appointmentAlerts}
            onValueChange={(value) => toggleAlert("appointment", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </View>
      </View>
      
      <TouchableOpacity style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear All Notifications</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  settingsButton: {
    padding: 8,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  unreadAlert: {
    backgroundColor: "#f0f8ff",
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  alertTime: {
    fontSize: 12,
    color: "#888",
  },
  alertMessage: {
    fontSize: 14,
    color: "#666",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007BFF",
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  clearButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 14,
    margin: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  clearButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
  },
});