import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import DatabaseService from '../lib/database';

const EditProfileScreen = ({ navigation }) => {
    const { user, userProfile, updateProfile, getUserRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});
    
    const roleName = getUserRole();

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = () => {
        const profileData = userProfile?.data ? 
            (typeof userProfile.data === 'string' ? JSON.parse(userProfile.data) : userProfile.data) : {};

        // Merge user data with profile data
        const initialData = {
            fullName: user?.name || '',
            email: user?.email || '',
            phoneNumber: user?.phone_number || '',
            ...profileData
        };

        setFormData(initialData);
    };

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Update user document
            const userUpdateData = {
                full_name: formData.fullName,
                phone_number: formData.phoneNumber || null
            };

            await DatabaseService.updateUser(user.$id, userUpdateData);

            // Update profile data
            const profileUpdateData = { ...formData };
            delete profileUpdateData.fullName;
            delete profileUpdateData.email;
            delete profileUpdateData.phoneNumber;

            await updateProfile(profileUpdateData);

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const renderBasicFields = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
                placeholder="Enter your full name"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.email}
                editable={false}
                placeholder="Email cannot be changed"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(value) => updateFormData('phoneNumber', value)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
            />
        </View>
    );

    const renderPatientFields = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
                style={styles.input}
                value={formData.date_of_birth}
                onChangeText={(value) => updateFormData('date_of_birth', value)}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.gender}
                    onValueChange={(value) => updateFormData('gender', value)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                </Picker>
            </View>

            <Text style={styles.label}>Blood Type</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.blood_type}
                    onValueChange={(value) => updateFormData('blood_type', value)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Blood Type" value="" />
                    <Picker.Item label="A+" value="A+" />
                    <Picker.Item label="A-" value="A-" />
                    <Picker.Item label="B+" value="B+" />
                    <Picker.Item label="B-" value="B-" />
                    <Picker.Item label="AB+" value="AB+" />
                    <Picker.Item label="AB-" value="AB-" />
                    <Picker.Item label="O+" value="O+" />
                    <Picker.Item label="O-" value="O-" />
                </Picker>
            </View>

            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
                style={styles.input}
                value={formData.height?.toString()}
                onChangeText={(value) => updateFormData('height', parseFloat(value) || null)}
                placeholder="Enter height in cm"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
                style={styles.input}
                value={formData.weight?.toString()}
                onChangeText={(value) => updateFormData('weight', parseFloat(value) || null)}
                placeholder="Enter weight in kg"
                keyboardType="numeric"
            />

            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            
            <Text style={styles.label}>Emergency Contact Name</Text>
            <TextInput
                style={styles.input}
                value={formData.emergency_contact?.name}
                onChangeText={(value) => updateFormData('emergency_contact', {
                    ...formData.emergency_contact,
                    name: value
                })}
                placeholder="Emergency contact name"
            />

            <Text style={styles.label}>Emergency Contact Phone</Text>
            <TextInput
                style={styles.input}
                value={formData.emergency_contact?.phone}
                onChangeText={(value) => updateFormData('emergency_contact', {
                    ...formData.emergency_contact,
                    phone: value
                })}
                placeholder="Emergency contact phone"
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Relationship</Text>
            <TextInput
                style={styles.input}
                value={formData.emergency_contact?.relationship}
                onChangeText={(value) => updateFormData('emergency_contact', {
                    ...formData.emergency_contact,
                    relationship: value
                })}
                placeholder="Relationship (e.g., spouse, parent)"
            />
        </View>
    );

    const renderDoctorFields = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            <Text style={styles.label}>Medical License Number</Text>
            <TextInput
                style={styles.input}
                value={formData.license_number}
                onChangeText={(value) => updateFormData('license_number', value)}
                placeholder="Enter license number"
            />

            <Text style={styles.label}>Specialty</Text>
            <TextInput
                style={styles.input}
                value={formData.specialty}
                onChangeText={(value) => updateFormData('specialty', value)}
                placeholder="Enter your specialty"
            />

            <Text style={styles.label}>Sub-specialty</Text>
            <TextInput
                style={styles.input}
                value={formData.sub_specialty}
                onChangeText={(value) => updateFormData('sub_specialty', value)}
                placeholder="Enter sub-specialty (optional)"
            />

            <Text style={styles.label}>Clinic/Hospital Name</Text>
            <TextInput
                style={styles.input}
                value={formData.clinic_name}
                onChangeText={(value) => updateFormData('clinic_name', value)}
                placeholder="Enter clinic or hospital name"
            />

            <Text style={styles.label}>Clinic Address</Text>
            <TextInput
                style={styles.input}
                value={formData.clinic_address}
                onChangeText={(value) => updateFormData('clinic_address', value)}
                placeholder="Enter clinic address"
                multiline
            />

            <Text style={styles.label}>Years of Experience</Text>
            <TextInput
                style={styles.input}
                value={formData.years_experience?.toString()}
                onChangeText={(value) => updateFormData('years_experience', parseInt(value) || 0)}
                placeholder="Enter years of experience"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(value) => updateFormData('bio', value)}
                placeholder="Brief bio about yourself"
                multiline
                numberOfLines={4}
            />
        </View>
    );

    const renderCaretakerFields = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Caretaker Information</Text>
            
            <Text style={styles.label}>Relationship to Patient</Text>
            <TextInput
                style={styles.input}
                value={formData.relationship}
                onChangeText={(value) => updateFormData('relationship', value)}
                placeholder="e.g., spouse, parent, child, friend"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => updateFormData('address', value)}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
            />

            <Text style={styles.label}>Unique Code</Text>
            <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.unique_code}
                editable={false}
                placeholder="Auto-generated code"
            />
        </View>
    );

    const renderRoleSpecificFields = () => {
        switch (roleName) {
            case 'patient':
                return renderPatientFields();
            case 'doctor':
                return renderDoctorFields();
            case 'caretaker':
                return renderCaretakerFields();
            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#007BFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {renderBasicFields()}
                {renderRoleSpecificFields()}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    saveButton: {
        padding: 8,
    },
    saveButtonText: {
        fontSize: 16,
        color: '#007BFF',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: 'white',
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    disabledInput: {
        backgroundColor: '#f8f9fa',
        color: '#666',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: 'white',
    },
    picker: {
        height: 50,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
});

export default EditProfileScreen;