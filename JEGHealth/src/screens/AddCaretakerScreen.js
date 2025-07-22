import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import JEGHealthLogo from '../components/JEGHealthLogo';
import CaretakerService from '../services/CaretakerService';
import { showError, showSuccess } from '../utils/NotificationHelper';

const AddCaretakerScreen = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    relationship: '',
    address: '',
    dateOfBirth: '',
    notes: '',
    emergencyContact: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const relationships = [
    'Spouse/Partner',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Healthcare Provider',
    'Other'
  ];

  const validateForm = () => {
    const { fullName, email, phoneNumber, relationship } = formData;
    
    if (!fullName.trim()) {
      showError('Error', 'Please enter the caretaker\'s full name');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      showError('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!phoneNumber.trim()) {
      showError('Error', 'Please enter a phone number');
      return false;
    }
    
    if (!relationship.trim()) {
      showError('Error', 'Please select a relationship');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const caretaker = await CaretakerService.addCaretaker(formData);
      
      showSuccess(
        'Success',
        `Caretaker added successfully! Access Code: ${caretaker.uniqueCode}. This code has been sent to your registered phone and email.`
      );
      
      // Navigate back after showing notification
      setTimeout(() => router.back(), 2000);
    } catch (error) {
      console.error('Error adding caretaker:', error);
      showError('Error', error.message || 'Failed to add caretaker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4ECDC4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Caretaker</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <JEGHealthLogo size="large" />
        </View>

        <Text style={styles.subtitle}>
          Add a trusted person who can access your health information in case of emergency
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#B0B0B0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter caretaker's full name"
                placeholderTextColor="#B0B0B0"
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#B0B0B0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor="#B0B0B0"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#B0B0B0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#B0B0B0"
                value={formData.phoneNumber}
                onChangeText={(value) => updateFormData('phoneNumber', value)}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Relationship */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Relationship *</Text>
            <View style={styles.relationshipContainer}>
              {relationships.map((relationship) => (
                <TouchableOpacity
                  key={relationship}
                  style={[
                    styles.relationshipOption,
                    formData.relationship === relationship && styles.relationshipSelected
                  ]}
                  onPress={() => updateFormData('relationship', relationship)}
                  disabled={loading}
                >
                  <Text style={[
                    styles.relationshipText,
                    formData.relationship === relationship && styles.relationshipTextSelected
                  ]}>
                    {relationship}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#B0B0B0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter address"
                placeholderTextColor="#B0B0B0"
                value={formData.address}
                onChangeText={(value) => updateFormData('address', value)}
                multiline
                editable={!loading}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date of Birth (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#B0B0B0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#B0B0B0"
                value={formData.dateOfBirth}
                onChangeText={(value) => updateFormData('dateOfBirth', value)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Emergency Contact Toggle */}
          <View style={styles.switchContainer}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Emergency Contact</Text>
              <Text style={styles.switchDescription}>
                Allow this person to be contacted in medical emergencies
              </Text>
            </View>
            <Switch
              value={formData.emergencyContact}
              onValueChange={(value) => updateFormData('emergencyContact', value)}
              trackColor={{ false: '#E9ECEF', true: '#4ECDC4' }}
              thumbColor={formData.emergencyContact ? 'white' : '#B0B0B0'}
              disabled={loading}
            />
          </View>

          {/* Notes */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="document-text-outline" size={20} color="#B0B0B0" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Any additional notes about this caretaker"
                placeholderTextColor="#B0B0B0"
                value={formData.notes}
                onChangeText={(value) => updateFormData('notes', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#2196F3" />
            <Text style={styles.infoText}>
              A unique 6-character access code will be generated and sent to your registered phone and email. 
              This code allows the caretaker to access your health information when needed.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Add Caretaker</Text>
                <Ionicons name="person-add" size={18} color="white" style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4ECDC4', // Turquoise background for block-based screen
  },
  header: {
    backgroundColor: 'white', // White header with turquoise elements
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4', // Turquoise text on white header
    textAlign: 'center',
    marginLeft: -32, // Compensate for back button
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'white', // White text on turquoise background
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white', // White labels on turquoise background
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white', // White input backgrounds
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333', // Dark text in white inputs
  },
  notesInput: {
    minHeight: 80,
  },
  relationshipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white', // White borders on turquoise background
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle white overlay
  },
  relationshipSelected: {
    backgroundColor: 'white', // White selected option
    borderColor: 'white',
  },
  relationshipText: {
    fontSize: 14,
    color: 'white', // White text for unselected options
  },
  relationshipTextSelected: {
    color: '#4ECDC4', // Turquoise text on white selected option
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white', // White card on turquoise background
    borderRadius: 12,
    marginBottom: 20,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333', // Dark text on white card
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666', // Medium gray text on white card
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'white', // White info box
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3', // Blue accent for info
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666', // Medium gray text
    lineHeight: 20,
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: '#4ECDC4', // Turquoise submit button
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 4px 8px rgba(78, 205, 196, 0.3)`, // Turquoise shadow
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white', // White text on turquoise button
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default AddCaretakerScreen;