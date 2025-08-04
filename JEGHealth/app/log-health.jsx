import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { showError, showSuccess } from '../src/utils/NotificationHelper';
import { Colors } from '../src/constants/colors';
import DjangoDatabaseService from '../lib/djangoDatabase';

const LogHealthScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Health metrics state
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    weight: '',
    height: '',
    temperature: '',
    oxygenSaturation: '',
    bloodSugar: '',
    steps: '',
    waterIntake: '',
    sleepHours: '',
    notes: '',
  });

  // Predefined metric types with their units and validation
  const metricTypes = [
    {
      key: 'heartRate',
      label: 'Heart Rate',
      unit: 'BPM',
      icon: 'heart-outline',
      color: Colors.error,
      placeholder: 'e.g., 72',
      validate: (value) => value >= 40 && value <= 200,
    },
    {
      key: 'bloodPressureSystolic',
      label: 'Blood Pressure (Systolic)',
      unit: 'mmHg',
      icon: 'pulse-outline',
      color: Colors.warning,
      placeholder: 'e.g., 120',
      validate: (value) => value >= 80 && value <= 250,
    },
    {
      key: 'bloodPressureDiastolic',
      label: 'Blood Pressure (Diastolic)',
      unit: 'mmHg',
      icon: 'pulse-outline',
      color: Colors.warning,
      placeholder: 'e.g., 80',
      validate: (value) => value >= 40 && value <= 150,
    },
    {
      key: 'weight',
      label: 'Weight',
      unit: 'kg',
      icon: 'scale-outline',
      color: Colors.primary,
      placeholder: 'e.g., 70.5',
      validate: (value) => value >= 20 && value <= 300,
    },
    {
      key: 'height',
      label: 'Height',
      unit: 'cm',
      icon: 'resize-outline',
      color: Colors.info,
      placeholder: 'e.g., 175',
      validate: (value) => value >= 50 && value <= 250,
    },
    {
      key: 'temperature',
      label: 'Body Temperature',
      unit: '°C',
      icon: 'thermometer-outline',
      color: Colors.error,
      placeholder: 'e.g., 36.5',
      validate: (value) => value >= 30 && value <= 45,
    },
    {
      key: 'oxygenSaturation',
      label: 'Oxygen Saturation',
      unit: '%',
      icon: 'fitness-outline',
      color: Colors.success,
      placeholder: 'e.g., 98',
      validate: (value) => value >= 70 && value <= 100,
    },
    {
      key: 'bloodSugar',
      label: 'Blood Sugar',
      unit: 'mg/dL',
      icon: 'water-outline',
      color: Colors.warning,
      placeholder: 'e.g., 90',
      validate: (value) => value >= 40 && value <= 400,
    },
    {
      key: 'steps',
      label: 'Steps Today',
      unit: 'steps',
      icon: 'walk-outline',
      color: Colors.primary,
      placeholder: 'e.g., 8420',
      validate: (value) => value >= 0 && value <= 50000,
    },
    {
      key: 'waterIntake',
      label: 'Water Intake',
      unit: 'L',
      icon: 'water-outline',
      color: Colors.info,
      placeholder: 'e.g., 2.5',
      validate: (value) => value >= 0 && value <= 10,
    },
    {
      key: 'sleepHours',
      label: 'Sleep Duration',
      unit: 'hours',
      icon: 'moon-outline',
      color: Colors.textSecondary,
      placeholder: 'e.g., 7.5',
      validate: (value) => value >= 0 && value <= 24,
    },
  ];

  const handleInputChange = (key, value) => {
    setHealthMetrics(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
    }
  };

  const validateInputs = () => {
    const filledMetrics = Object.entries(healthMetrics).filter(([key, value]) => 
      value && value.toString().trim() !== '' && key !== 'notes'
    );

    if (filledMetrics.length === 0) {
      showError('Validation Error', 'Please enter at least one health metric.');
      return false;
    }

    // Validate each filled metric
    for (const [key, value] of filledMetrics) {
      const metricType = metricTypes.find(m => m.key === key);
      if (metricType && metricType.validate) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || !metricType.validate(numValue)) {
          showError('Validation Error', `Invalid value for ${metricType.label}. Please check the range.`);
          return false;
        }
      }
    }

    return true;
  };

  const saveHealthData = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      // Filter out empty values and prepare data for API
      const dataToSave = Object.entries(healthMetrics)
        .filter(([key, value]) => value && value.toString().trim() !== '' && key !== 'notes')
        .map(([key, value]) => {
          const metricType = metricTypes.find(m => m.key === key);
          return {
            metric_type: metricType ? metricType.label : key,
            value: parseFloat(value),
            unit: metricType ? metricType.unit : '',
            recorded_at: selectedDate.toISOString(),
            notes: healthMetrics.notes || '',
            user: user.$id || user.id,
          };
        });

      // Save each metric to the backend
      const savePromises = dataToSave.map(metric => 
        DjangoDatabaseService.createHealthMetric(metric)
      );

      await Promise.all(savePromises);

      showSuccess('Success', `Successfully logged ${dataToSave.length} health metric${dataToSave.length > 1 ? 's' : ''}.`);
      
      // Reset form
      setHealthMetrics({
        heartRate: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        weight: '',
        height: '',
        temperature: '',
        oxygenSaturation: '',
        bloodSugar: '',
        steps: '',
        waterIntake: '',
        sleepHours: '',
        notes: '',
      });
      
      // Navigate back to home
      router.back();
      
    } catch (error) {
      console.error('Error saving health data:', error);
      showError('Error', 'Failed to save health data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMetricInput = (metric) => (
    <View key={metric.key} style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${metric.color}15` }]}>
          <Ionicons name={metric.icon} size={20} color={metric.color} />
        </View>
        <Text style={styles.metricLabel}>{metric.label}</Text>
        <Text style={styles.metricUnit}>{metric.unit}</Text>
      </View>
      
      <TextInput
        style={styles.metricInput}
        placeholder={metric.placeholder}
        placeholderTextColor={Colors.textSecondary}
        value={healthMetrics[metric.key]}
        onChangeText={(value) => handleInputChange(metric.key, value)}
        keyboardType="numeric"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Health Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <TouchableOpacity 
            style={styles.dateSelector} 
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              accentColor={Colors.primary}
            />
          )}
        </View>

        {/* Health Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <Text style={styles.sectionSubtitle}>
            Fill in the metrics you want to log. All fields are optional.
          </Text>
          
          {metricTypes.map(renderMetricInput)}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any additional notes about your health today..."
            placeholderTextColor={Colors.textSecondary}
            value={healthMetrics.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveHealthData}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Health Data</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 20,
    marginTop: 0,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  metricUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metricInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBackground,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: 'white',
    minHeight: 100,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default LogHealthScreen;
