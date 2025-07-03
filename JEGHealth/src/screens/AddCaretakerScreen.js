import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import JEGHealthLogo from '../components/JEGHealthLogo';
import CaretakerService from '../services/CaretakerService';

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
      Alert.alert('Error', 'Please enter the caretaker\'s full name');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return false;
    }
    
    if (!relationship.trim()) {
      Alert.alert('Error', 'Please select a relationship');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const caretaker = await CaretakerService.addCaretaker(formData);
      
      Alert.alert(
        'Success',
        `Caretaker added successfully!\n\nAccess Code: ${caretaker.uniqueCode}\n\nThis code has been sent to your registered phone and email.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding caretaker:', error);
      Alert.alert('Error', error.message || 'Failed to add caretaker. Please try again.');
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
          <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
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
              <Ionicons name="person-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter caretaker's full name"
                placeholderTextColor={Colors.placeholder}
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
              <Ionicons name="mail-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor={Colors.placeholder}
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
              <Ionicons name="call-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={Colors.placeholder}
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
              <Ionicons name="location-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter address"
                placeholderTextColor={Colors.placeholder}
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
              <Ionicons name="calendar-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.placeholder}
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
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={formData.emergencyContact ? Colors.textOnPrimary : Colors.textTertiary}
              disabled={loading}
            />
          </View>

          {/* Notes */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="document-text-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Any additional notes about this caretaker"
                placeholderTextColor={Colors.placeholder}
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
            <Ionicons name="information-circle-outline" size={24} color={Colors.info} />
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
              <ActivityIndicator size="small" color={Colors.textOnPrimary} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Add Caretaker</Text>
                <Ionicons name="person-add" size={18} color={Colors.textOnPrimary} style={styles.buttonIcon} />
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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
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
    color: Colors.textOnPrimary,
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
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
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
    color: Colors.textPrimary,
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
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  relationshipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  relationshipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  relationshipTextSelected: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundLight,
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
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 4px 8px ${Colors.primary}30`,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default AddCaretakerScreen;