import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  FlatList,
  Modal,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function AlertsScreen() {
  const { theme } = useTheme();
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [activityReminders, setActivityReminders] = useState(true);
  const [sleepReminders, setSleepReminders] = useState(false);
  const [appointmentAlerts, setAppointmentAlerts] = useState(true);

  // Sample alerts data (will be replaced with real alerts)
  const [alerts, setAlerts] = useState([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [medicationName, setMedicationName] = useState("");
  const [waterAmount, setWaterAmount] = useState("250");
  const [activityType, setActivityType] = useState("Walking");
  const [sleepHours, setSleepHours] = useState("8");
  const [reminderTimes, setReminderTimes] = useState([new Date()]);
  const [frequency, setFrequency] = useState("once");
  const [repeatDays, setRepeatDays] = useState({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });

  // Load saved alerts when component mounts
  useEffect(() => {
    loadAlerts();
    registerForPushNotifications();
  }, []);

  // Register for push notifications
  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Notification Permission",
          "Please enable notifications to receive health reminders",
          [{ text: "OK" }]
        );
        return;
      }
    } catch (error) {
      console.log("Error getting notification permission:", error);
    }
  };

  // Load alerts from storage
  const loadAlerts = async () => {
    try {
      const savedAlerts = await AsyncStorage.getItem("healthAlerts");
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
    } catch (error) {
      console.log("Error loading alerts:", error);
    }
  };

  // Save alerts to storage
  const saveAlerts = async (newAlerts) => {
    try {
      await AsyncStorage.setItem("healthAlerts", JSON.stringify(newAlerts));
    } catch (error) {
      console.log("Error saving alerts:", error);
    }
  };

  // Schedule a notification
  const scheduleNotification = async (title, body, trigger) => {
    try {
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
      console.log("Error scheduling notification:", error);
      return null;
    }
  };

  // Add new alert
  // Modify the addNewAlert function to handle multiple schedules
  const addNewAlert = async (type) => {
    // Format the date for display
    const formattedDate = selectedDate.toLocaleDateString();

    let title = alertTitle;
    let message = alertMessage;
    let icon = "";
    let color = "";

    // Set default values based on alert type
    switch (type) {
      case "medication":
        title = title || `Medication Reminder: ${medicationName}`;
        message = message || `Time to take your ${medicationName}`;
        icon = "medkit";
        color = "#F44336";
        break;
      case "water":
        title = title || "Hydration Alert";
        message = message || `Time to drink ${waterAmount}ml of water`;
        icon = "water";
        color = "#2196F3";
        break;
      case "activity":
        title = title || "Activity Reminder";
        message = message || `Time for ${activityType}`;
        icon = "walk";
        color = "#4CAF50";
        break;
      case "sleep":
        title = title || "Sleep Schedule";
        message =
          message || `Time to prepare for sleep (${sleepHours} hours goal)`;
        icon = "moon";
        color = "#3F51B5";
        break;
      case "appointment":
        title = title || "Appointment Reminder";
        icon = "calendar";
        color = "#9C27B0";
        break;
    }

    // Create notification schedule based on frequency
    let notificationIds = [];
    let successCount = 0;

    // Function to schedule a notification for a specific time
    const scheduleForTime = async (time) => {
      // Create a trigger time (5 minutes before the selected time)
      const triggerDate = new Date(selectedDate);
      triggerDate.setHours(time.getHours());
      triggerDate.setMinutes(time.getMinutes() - 5);

      // For non-one-time reminders, set the date to today if it's in the future
      if (frequency !== "once") {
        const today = new Date();
        if (
          triggerDate.getHours() > today.getHours() ||
          (triggerDate.getHours() === today.getHours() &&
            triggerDate.getMinutes() > today.getMinutes())
        ) {
          triggerDate.setDate(today.getDate());
          triggerDate.setMonth(today.getMonth());
          triggerDate.setFullYear(today.getFullYear());
        } else {
          // Set to tomorrow if the time today has already passed
          triggerDate.setDate(today.getDate() + 1);
          triggerDate.setMonth(today.getMonth());
          triggerDate.setFullYear(today.getFullYear());
        }
      }

      // Check if the date is in the past for one-time reminders
      if (frequency === "once" && triggerDate < new Date()) {
        Alert.alert(
          "Invalid Time",
          "Please select a future time for your reminder"
        );
        return null;
      }

      // Set up the trigger based on frequency
      let trigger;

      if (frequency === "once") {
        // One-time notification
        trigger = { date: triggerDate };
      } else if (frequency === "daily") {
        // Daily repeating notification
        trigger = {
          hour: time.getHours(),
          minute: time.getMinutes() - 5,
          repeats: true,
        };
      } else if (frequency === "custom") {
        // Custom day repeating notification
        const weekdays = [];
        if (repeatDays.sunday) weekdays.push(0);
        if (repeatDays.monday) weekdays.push(1);
        if (repeatDays.tuesday) weekdays.push(2);
        if (repeatDays.wednesday) weekdays.push(3);
        if (repeatDays.thursday) weekdays.push(4);
        if (repeatDays.friday) weekdays.push(5);
        if (repeatDays.saturday) weekdays.push(6);

        if (weekdays.length === 0) {
          Alert.alert(
            "Select Days",
            "Please select at least one day for your custom schedule"
          );
          return null;
        }

        trigger = {
          hour: time.getHours(),
          minute: time.getMinutes() - 5,
          weekday: weekdays[0], // We'll handle multiple days by scheduling separate notifications
          repeats: true,
        };
      }

      // Schedule the notification
      try {
        let ids = [];

        if (frequency === "custom") {
          // For custom frequency, create separate notifications for each selected day
          const weekdays = [];
          if (repeatDays.sunday) weekdays.push(0);
          if (repeatDays.monday) weekdays.push(1);
          if (repeatDays.tuesday) weekdays.push(2);
          if (repeatDays.wednesday) weekdays.push(3);
          if (repeatDays.thursday) weekdays.push(4);
          if (repeatDays.friday) weekdays.push(5);
          if (repeatDays.saturday) weekdays.push(6);

          for (const weekday of weekdays) {
            const dayTrigger = {
              hour: time.getHours(),
              minute: time.getMinutes() - 5,
              weekday,
              repeats: true,
            };

            const id = await scheduleNotification(title, message, dayTrigger);
            if (id) ids.push(id);
          }
        } else {
          // For once or daily, just schedule one notification
          const id = await scheduleNotification(title, message, trigger);
          if (id) ids.push(id);
        }

        return ids;
      } catch (error) {
        console.log("Error scheduling notification:", error);
        return [];
      }
    };

    // Schedule notifications for each selected time
    for (const time of reminderTimes) {
      const ids = await scheduleForTime(time);
      if (ids && ids.length > 0) {
        notificationIds = [...notificationIds, ...ids];
        successCount++;
      }
    }

    if (notificationIds.length > 0) {
      // Create formatted time string
      const timeStrings = reminderTimes.map((time) =>
        time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );

      let timeDescription;
      if (frequency === "once") {
        timeDescription = `Scheduled for ${timeStrings.join(", ")}`;
      } else if (frequency === "daily") {
        timeDescription = `Daily at ${timeStrings.join(", ")}`;
      } else {
        const days = [];
        if (repeatDays.sunday) days.push("Sun");
        if (repeatDays.monday) days.push("Mon");
        if (repeatDays.tuesday) days.push("Tue");
        if (repeatDays.wednesday) days.push("Wed");
        if (repeatDays.thursday) days.push("Thu");
        if (repeatDays.friday) days.push("Fri");
        if (repeatDays.saturday) days.push("Sat");

        timeDescription = `${days.join(", ")} at ${timeStrings.join(", ")}`;
      }

      // Create new alert object
      const newAlert = {
        id: Date.now().toString(),
        type,
        icon,
        color,
        title,
        message,
        time: timeDescription,
        date: formattedDate,
        read: false,
        frequency,
        times: reminderTimes.map((t) =>
          t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        ),
        repeatDays: frequency === "custom" ? { ...repeatDays } : null,
        notificationIds,
      };

      // Add to alerts list
      const updatedAlerts = [newAlert, ...alerts];
      setAlerts(updatedAlerts);

      // Save to storage
      saveAlerts(updatedAlerts);

      // Show confirmation
      Alert.alert(
        "Reminder Set",
        `You will be reminded ${
          frequency === "once" ? "at" : "every"
        } ${timeStrings.join(", ")}`
      );
    }
  };

  // Delete an alert
  // Update the deleteAlert function to handle multiple notification IDs
  const deleteAlert = async (id) => {
    // Find the alert to get the notification IDs
    const alertToDelete = alerts.find((alert) => alert.id === id);

    if (alertToDelete && alertToDelete.notificationIds) {
      // Cancel all the scheduled notifications for this alert
      for (const notificationId of alertToDelete.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    }

    // Remove from the alerts list
    const filteredAlerts = alerts.filter((alert) => alert.id !== id);
    setAlerts(filteredAlerts);

    // Save to storage
    saveAlerts(filteredAlerts);
  };

  // Clear all alerts
  const clearAllAlerts = async () => {
    // Cancel all scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Clear the alerts list
    setAlerts([]);

    // Save empty list to storage
    saveAlerts([]);
  };

  // Toggle alert settings
  const toggleAlert = (type, value) => {
    switch (type) {
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

  // Add and remove reminder times
  const handleReminderTimes = (action, index, newTime = null) => {
    if (action === "add") {
      setReminderTimes([...reminderTimes, new Date()]);
    } else if (action === "remove") {
      setReminderTimes(reminderTimes.filter((_, i) => i !== index));
    } else if (action === "update" && newTime) {
      const updatedTimes = [...reminderTimes];
      updatedTimes[index] = newTime;
      setReminderTimes(updatedTimes);
    }
  };

  // Reset multi-timer state
  const resetMultiTimerState = () => {
    setReminderTimes([new Date()]);
    setFrequency("once");
    setRepeatDays({
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    });
  };

  // Open modal to add new alert
  const openNewAlertModal = (type) => {
    // Reset form fields
    setAlertTitle("");
    setAlertMessage("");
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setMedicationName("");
    setWaterAmount("250");
    setActivityType("Walking");
    setSleepHours("8");
    resetMultiTimerState();

    // Set modal type and make it visible
    setModalType(type);
    setModalVisible(true);
  };

  // Apply dynamic styles based on theme
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.card,
      borderBottomColor: theme.border,
    },
    title: {
      color: theme.text,
    },
    section: {
      backgroundColor: theme.card,
      shadowColor: theme.text,
    },
    sectionTitle: {
      color: theme.text,
    },
    alertItem: {
      backgroundColor: theme.card,
      borderBottomColor: theme.divider,
    },
    alertTitle: {
      color: theme.text,
    },
    alertMessage: {
      color: theme.subText,
    },
    alertTime: {
      color: theme.subText,
    },
    settingText: {
      color: theme.text,
    },
    modalContainer: {
      backgroundColor: theme.card,
    },
    modalTitle: {
      color: theme.text,
    },
    inputLabel: {
      color: theme.text,
    },
    input: {
      color: theme.text,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    dateTimeButton: {
      backgroundColor: theme.background,
      borderColor: theme.border,
    },
    dateTimeButtonText: {
      color: theme.text,
    },
    addButton: {
      backgroundColor: theme.primary,
    },
    cancelButton: {
      borderColor: theme.primary,
    },
    cancelButtonText: {
      color: theme.primary,
    },
    clearButton: {
      backgroundColor: theme.background,
    },
    clearButtonText: {
      color: "#FF3B30",
    },
  };

  // Alert item component
  const AlertItem = ({ id, icon, color, title, message, time, read }) => (
    <View
      style={[
        styles.alertItem,
        dynamicStyles.alertItem,
        !read && styles.unreadAlert,
      ]}
    >
      <Ionicons name={icon} size={24} color={color} />
      <View style={styles.alertContent}>
        <Text style={[styles.alertTitle, dynamicStyles.alertTitle]}>
          {title}
        </Text>
        <Text style={[styles.alertMessage, dynamicStyles.alertMessage]}>
          {message}
        </Text>
        <Text style={[styles.alertTime, dynamicStyles.alertTime]}>{time}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteAlert(id)}>
        <Ionicons name="close-circle" size={22} color={theme.subText} />
      </TouchableOpacity>
    </View>
  );

  // Render the alert creation modal
  const renderAlertModal = () => {
    let modalTitle = "";
    let specificFields = null;

    // Set modal title and fields based on alert type
    switch (modalType) {
      case "medication":
        modalTitle = "Set Medication Reminder";
        specificFields = (
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
              Medication Name
            </Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              value={medicationName}
              onChangeText={setMedicationName}
              placeholder="Enter medication name"
              placeholderTextColor={theme.subText}
            />
          </View>
        );
        break;
      case "water":
        modalTitle = "Set Hydration Reminder";
        specificFields = (
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
              Water Amount (ml)
            </Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              value={waterAmount}
              onChangeText={setWaterAmount}
              keyboardType="number-pad"
              placeholder="Enter amount in milliliters"
              placeholderTextColor={theme.subText}
            />
          </View>
        );
        break;
      case "activity":
        modalTitle = "Set Activity Reminder";
        specificFields = (
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
              Activity Type
            </Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              value={activityType}
              onChangeText={setActivityType}
              placeholder="Enter activity type"
              placeholderTextColor={theme.subText}
            />
          </View>
        );
        break;
      case "sleep":
        modalTitle = "Set Sleep Schedule";
        specificFields = (
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
              Sleep Goal (hours)
            </Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              value={sleepHours}
              onChangeText={setSleepHours}
              keyboardType="number-pad"
              placeholder="Enter sleep hours"
              placeholderTextColor={theme.subText}
            />
          </View>
        );
        break;
      case "appointment":
        modalTitle = "Set Appointment Reminder";
        break;
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={{ width: "100%" }}>
            <View style={[styles.modalContainer, dynamicStyles.modalContainer]}>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
                {modalTitle}
              </Text>

              {/* Title and message inputs */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                  Title (optional)
                </Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  value={alertTitle}
                  onChangeText={setAlertTitle}
                  placeholder="Enter reminder title"
                  placeholderTextColor={theme.subText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                  Message (optional)
                </Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  value={alertMessage}
                  onChangeText={setAlertMessage}
                  placeholder="Enter reminder message"
                  placeholderTextColor={theme.subText}
                />
              </View>

              {/* Type-specific fields */}
              {specificFields}

              {/* Date picker - only show for one-time reminders */}
              {frequency === "once" && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                    Date
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dateTimeButton,
                      dynamicStyles.dateTimeButton,
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text
                      style={[
                        styles.dateTimeButtonText,
                        dynamicStyles.dateTimeButtonText,
                      ]}
                    >
                      {selectedDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Multi-time selector component */}
              <MultiTimeSelector />

              {/* Action buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, dynamicStyles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      dynamicStyles.cancelButtonText,
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.addButton, dynamicStyles.addButton]}
                  onPress={() => {
                    addNewAlert(modalType);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.addButtonText}>Set Reminder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Date picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}
      </Modal>
    );
  };

  // Add this component function inside your AlertsScreen component
  const MultiTimeSelector = () => {
    const [currentEditIndex, setCurrentEditIndex] = useState(null);

    return (
      <View style={styles.multiTimeContainer}>
        <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
          Reminder Times
        </Text>

        {/* Frequency selector */}
        <View style={styles.frequencyContainer}>
          <Text style={[styles.frequencyLabel, dynamicStyles.subText]}>
            Repeat:
          </Text>
          <TouchableOpacity
            style={[
              styles.frequencyOption,
              frequency === "once" && styles.frequencyOptionSelected,
              frequency === "once" && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFrequency("once")}
          >
            <Text
              style={[
                styles.frequencyText,
                frequency === "once" && styles.frequencyTextSelected,
              ]}
            >
              Once{" "}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.frequencyOption,
              frequency === "daily" && styles.frequencyOptionSelected,
              frequency === "daily" && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFrequency("daily")}
          >
            <Text
              style={[
                styles.frequencyText,
                frequency === "daily" && styles.frequencyTextSelected,
              ]}
            >
              Daily{" "}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.frequencyOption,
              frequency === "custom" && styles.frequencyOptionSelected,
              frequency === "custom" && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFrequency("custom")}
          >
            <Text
              style={[
                styles.frequencyText,
                frequency === "custom" && styles.frequencyTextSelected,
              ]}
            >
              Custom{" "}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekday selectors for custom frequency */}
        {frequency === "custom" && (
          <View style={styles.weekdaySelector}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
              const dayKey = [
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
              ][index];
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    repeatDays[dayKey] && styles.dayButtonSelected,
                    repeatDays[dayKey] && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => {
                    setRepeatDays({
                      ...repeatDays,
                      [dayKey]: !repeatDays[dayKey],
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.dayText,
                      repeatDays[dayKey] && styles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Time selectors */}
        {reminderTimes.map((time, index) => (
          <View key={index} style={styles.timeRow}>
            <TouchableOpacity
              style={[styles.timeButton, dynamicStyles.dateTimeButton]}
              onPress={() => {
                setCurrentEditIndex(index);
                setShowTimePicker(true);
              }}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  dynamicStyles.dateTimeButtonText,
                ]}
              >
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            {reminderTimes.length > 1 && (
              <TouchableOpacity
                style={styles.removeTimeButton}
                onPress={() => handleReminderTimes("remove", index)}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Add another time button */}
        <TouchableOpacity
          style={styles.addTimeButton}
          onPress={() => handleReminderTimes("add")}
        >
          <Ionicons name="add-circle" size={24} color={theme.primary} />
          <Text style={[styles.addTimeText, { color: theme.primary }]}>
            Add another time
          </Text>
        </TouchableOpacity>

        {/* Time picker - modified to work with multi-time */}
        {showTimePicker && (
          <DateTimePicker
            value={
              currentEditIndex !== null
                ? reminderTimes[currentEditIndex]
                : new Date()
            }
            mode="time"
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time && currentEditIndex !== null) {
                handleReminderTimes("update", currentEditIndex, time);
                setCurrentEditIndex(null);
              }
            }}
          />
        )}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.title, dynamicStyles.title]}>Health Alerts</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          Recent Alerts
        </Text>

        {alerts.length === 0 ? (
          <View style={styles.emptyAlerts}>
            <Ionicons
              name="notifications-off"
              size={48}
              color={theme.subText}
            />
            <Text style={[styles.emptyAlertsText, { color: theme.subText }]}>
              No active alerts
            </Text>
            <Text style={[styles.emptyAlertsSubText, { color: theme.subText }]}>
              Set up reminders below to start tracking your health routines
            </Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlertItem
                id={item.id}
                icon={item.icon}
                color={item.color}
                title={item.title}
                message={item.message}
                time={item.time}
                read={item.read}
              />
            )}
            scrollEnabled={false}
          />
        )}
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          Alert Settings
        </Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => medicationReminders && openNewAlertModal("medication")}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="medkit" size={20} color="#F44336" />
            <Text style={[styles.settingText, dynamicStyles.settingText]}>
              Medication Reminders
            </Text>
          </View>
          <Switch
            value={medicationReminders}
            onValueChange={(value) => toggleAlert("medication", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => waterReminders && openNewAlertModal("water")}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="water" size={20} color="#2196F3" />
            <Text style={[styles.settingText, dynamicStyles.settingText]}>
              Water Intake Alerts
            </Text>
          </View>
          <Switch
            value={waterReminders}
            onValueChange={(value) => toggleAlert("water", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => activityReminders && openNewAlertModal("activity")}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="walk" size={20} color="#4CAF50" />
            <Text style={[styles.settingText, dynamicStyles.settingText]}>
              Activity Reminders
            </Text>
          </View>
          <Switch
            value={activityReminders}
            onValueChange={(value) => toggleAlert("activity", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => sleepReminders && openNewAlertModal("sleep")}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={20} color="#3F51B5" />
            <Text style={[styles.settingText, dynamicStyles.settingText]}>
              Sleep Schedule Alerts
            </Text>
          </View>
          <Switch
            value={sleepReminders}
            onValueChange={(value) => toggleAlert("sleep", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => appointmentAlerts && openNewAlertModal("appointment")}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="calendar" size={20} color="#9C27B0" />
            <Text style={[styles.settingText, dynamicStyles.settingText]}>
              Appointment Reminders
            </Text>
          </View>
          <Switch
            value={appointmentAlerts}
            onValueChange={(value) => toggleAlert("appointment", value)}
            trackColor={{ false: "#d1d1d6", true: "#4CD964" }}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.clearButton, dynamicStyles.clearButton]}
        onPress={clearAllAlerts}
      >
        <Text style={[styles.clearButtonText, dynamicStyles.clearButtonText]}>
          Clear All Notifications
        </Text>
      </TouchableOpacity>

      {/* Render the modal */}
      {renderAlertModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  settingsButton: {
    padding: 8,
  },
  section: {
    borderRadius: 10,
    padding: 16,
    margin: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  emptyAlerts: {
    alignItems: "center",
    padding: 20,
  },
  emptyAlertsText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 12,
  },
  emptyAlertsSubText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  alertMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  alertTime: {
    fontSize: 12,
    marginTop: 4,
  },
  unreadAlert: {
    backgroundColor: "rgba(33, 150, 243, 0.08)",
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
    marginLeft: 12,
  },
  clearButton: {
    borderRadius: 8,
    padding: 14,
    margin: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    alignItems: "stretch",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  dateTimeButton: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  dateTimeButtonText: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  addButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  multiTimeContainer: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  timeButtonText: {
    fontSize: 16,
  },
  removeTimeButton: {
    marginLeft: 8,
    padding: 4,
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 6,
  },
  addTimeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  frequencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  frequencyLabel: {
    fontSize: 16,
    marginRight: 12,
  },
  frequencyOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  frequencyOptionSelected: {
    backgroundColor: "#007AFF",
  },
  frequencyText: {
    fontSize: 14,
  },
  frequencyTextSelected: {
    color: "#fff",
  },
  weekdaySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  dayButtonSelected: {
    backgroundColor: "#007AFF",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dayTextSelected: {
    color: "#fff",
  },
});
