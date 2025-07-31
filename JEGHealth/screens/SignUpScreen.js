import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';

const SignUpScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        password_confirm: '',
        phoneNumber: '',
        roleName: 'patient'
    });

    // Additional profile data based on role
    const [profileData, setProfileData] = useState({
        // Patient fields
        dateOfBirth: '',
        gender: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        
        // Doctor fields
        licenseNumber: '',
        specialty: '',
        clinicName: '',
        
        // Caretaker fields
        relationship: ''
    });

    const handleSignUp = async () => {
        try {
            // Validation
            if (!formData.fullName || !formData.email || !formData.password) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            // if (formData.password !== formData.password_confirm) {
            //     Alert.alert('Error', 'Passwords do not match');
            //     return;
            // }

            if (formData.password.length < 8) {
                Alert.alert('Error', 'Password must be at least 8 characters long');
                return;
            }

            setLoading(true);

            const userData = {
                ...formData,
                profileData
            };

            const result = await register(userData);

            if (result.success) {
                Alert.alert('Success', 'Account created successfully!');
                // Navigation will be handled automatically by AuthContext
            } else {
                Alert.alert('Registration Failed', result.error);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const updateProfileData = (key, value) => {
        setProfileData(prev => ({ ...prev, [key]: value }));
    };

    const renderRoleSpecificFields = () => {
        switch (formData.roleName) {
            case 'patient':
                return (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Date of Birth (YYYY-MM-DD)"
                            value={profileData.dateOfBirth}
                            onChangeText={(value) => updateProfileData('dateOfBirth', value)}
                        />
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={profileData.gender}
                                onValueChange={(value) => updateProfileData('gender', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Gender" value="" />
                                <Picker.Item label="Male" value="male" />
                                <Picker.Item label="Female" value="female" />
                                <Picker.Item label="Other" value="other" />
                            </Picker>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Emergency Contact Name"
                            value={profileData.emergencyContactName}
                            onChangeText={(value) => updateProfileData('emergencyContactName', value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Emergency Contact Phone"
                            value={profileData.emergencyContactPhone}
                            onChangeText={(value) => updateProfileData('emergencyContactPhone', value)}
                            keyboardType="phone-pad"
                        />
                    </>
                );

            case 'doctor':
                return (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Medical License Number *"
                            value={profileData.licenseNumber}
                            onChangeText={(value) => updateProfileData('licenseNumber', value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Specialty *"
                            value={profileData.specialty}
                            onChangeText={(value) => updateProfileData('specialty', value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Clinic/Hospital Name"
                            value={profileData.clinicName}
                            onChangeText={(value) => updateProfileData('clinicName', value)}
                        />
                    </>
                );

            case 'caretaker':
                return (
                    <TextInput
                        style={styles.input}
                        placeholder="Relationship to Patient"
                        value={profileData.relationship}
                        onChangeText={(value) => updateProfileData('relationship', value)}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join JEGHealth today</Text>

                {/* Basic Information */}
                <TextInput
                    style={styles.input}
                    placeholder="Full Name *"
                    value={formData.fullName}
                    onChangeText={(value) => updateFormData('fullName', value)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email *"
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChangeText={(value) => updateFormData('phoneNumber', value)}
                    keyboardType="phone-pad"
                />

                {/* Role Selection */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>I am a:</Text>
                    <Picker
                        selectedValue={formData.roleName}
                        onValueChange={(value) => updateFormData('roleName', value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Patient" value="patient" />
                        <Picker.Item label="Doctor" value="doctor" />
                        <Picker.Item label="Caretaker" value="caretaker" />
                    </Picker>
                </View>

                {/* Role-specific fields */}
                {renderRoleSpecificFields()}

                {/* Password Fields */}
                <TextInput
                    style={styles.input}
                    placeholder="Password *"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    secureTextEntry
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password *"
                    value={formData.password_confirm}
                    onChangeText={(value) => updateFormData('password_confirm', value)}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('SignIn')}
                >
                    <Text style={styles.linkText}>
                        Already have an account? Sign In
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: 'white',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    picker: {
        height: 50,
    },
    button: {
        backgroundColor: '#007BFF',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        alignItems: 'center',
    },
    linkText: {
        color: '#007BFF',
        fontSize: 16,
    },
});

export default SignUpScreen;