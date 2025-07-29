import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { showError, showSuccess } from '../utils/NotificationHelper';

const SignUpScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirm: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = async () => {
        try {
            // Validation
            if (!formData.username || !formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.password_confirm || !formData.phone_number || !formData.date_of_birth || !formData.gender) {
                showError('Error', 'Please fill in all required fields');
                return;
            }

            if (formData.password !== formData.password_confirm) {
                showError('Error', 'Passwords do not match');
                return;
            }

            if (formData.password.length < 8) {
                showError('Error', 'Password must be at least 8 characters long');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showError('Error', 'Please enter a valid email address');
                return;
            }

            setLoading(true);

            const userData = {
                email: formData.email?.trim() || '',
                password: formData.password || '',
                password_confirm: formData.password_confirm || '',
                first_name: formData.first_name?.trim() || '',
                last_name: formData.last_name?.trim() || '',
            };

            // Optionally add username if provided
            if (formData.username?.trim()) {
                userData.username = formData.username.trim();
            }

            // Optionally add phone_number if provided
            if (formData.phone_number?.trim()) {
                userData.phone_number = formData.phone_number.trim();
            }

            // Optionally add date_of_birth if provided
            if (formData.date_of_birth?.trim()) {
                userData.date_of_birth = formData.date_of_birth.trim();
            }

            // Optionally add gender if provided
            if (formData.gender) {
                userData.gender = formData.gender;
            }

            console.log('[DEBUG] Registration payload:', userData);
            const result = await register(userData);

            if (result.success) {
                showSuccess('Success', 'Account created successfully!');
            } else {
                let errorMessage = result.error;
                showError('Registration Failed', errorMessage);
            }
        } catch (error) {
            showError('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#4ECDC4', '#2D8B85', '#1A5F5A']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            
            {/* Decorative Elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeLeaf1} />
            <View style={styles.decorativeLeaf2} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.navigate('SignIn')}
                >
                    <Feather name="arrow-left" size={24} color="white" />
                    <Text style={styles.backButtonText}>Back to login</Text>
                </TouchableOpacity>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Hello!</Text>
                <Text style={styles.welcomeSubtitle}>Welcome to JEGHealth</Text>
            </View>

            {/* Form Card */}
            <ScrollView 
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}
            >
                <Text style={styles.formTitle}>Sign Up</Text>

                {/* Username */}
                <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#B0B0B0"
                        value={formData.username}
                        onChangeText={(value) => updateFormData('username', value)}
                    />
                </View>

                {/* First Name */}
                <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="#B0B0B0"
                        value={formData.first_name}
                        onChangeText={(value) => updateFormData('first_name', value)}
                    />
                </View>

                {/* Last Name */}
                <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="#B0B0B0"
                        value={formData.last_name}
                        onChangeText={(value) => updateFormData('last_name', value)}
                    />
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#B0B0B0"
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#B0B0B0"
                        value={formData.password}
                        onChangeText={(value) => updateFormData('password', value)}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather
                            name={showPassword ? "eye" : "eye-off"}
                            size={20}
                            color="#7FCCCC"
                        />
                    </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#B0B0B0"
                        value={formData.password_confirm}
                        onChangeText={(value) => updateFormData('password_confirm', value)}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Feather
                            name={showConfirmPassword ? "eye" : "eye-off"}
                            size={20}
                            color="#7FCCCC"
                        />
                    </TouchableOpacity>
                </View>

                {/* Phone Number */}
                <View style={styles.inputContainer}>
                    <Feather name="phone" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        placeholderTextColor="#B0B0B0"
                        value={formData.phone_number}
                        onChangeText={(value) => updateFormData('phone_number', value)}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Date of Birth */}
                <View style={styles.inputContainer}>
                    <Feather name="calendar" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Date of Birth (YYYY-MM-DD)"
                        placeholderTextColor="#B0B0B0"
                        value={formData.date_of_birth}
                        onChangeText={(value) => updateFormData('date_of_birth', value)}
                    />
                </View>

                {/* Gender */}
                <View style={styles.inputContainer}>
                    <Feather name="users" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <Picker
                        selectedValue={formData.gender}
                        onValueChange={(value) => updateFormData('gender', value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Gender" value="" />
                        <Picker.Item label="Male" value="MALE" />
                        <Picker.Item label="Female" value="FEMALE" />
                        <Picker.Item label="Other" value="OTHER" />
                    </Picker>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                    style={[styles.signUpButton, loading && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.signUpButtonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                {/* Sign In Link */}
                <View style={styles.signInLinkContainer}>
                    <Text style={styles.signInLinkText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.signInLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4ECDC4',
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        top: 50,
        left: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    decorativeLeaf1: {
        position: 'absolute',
        top: 100,
        right: 50,
        width: 60,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 30,
        transform: [{ rotate: '45deg' }],
    },
    decorativeLeaf2: {
        position: 'absolute',
        top: 150,
        left: 30,
        width: 40,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        transform: [{ rotate: '-30deg' }],
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
    welcomeSection: {
        paddingHorizontal: 30,
        paddingBottom: 30,
    },
    welcomeTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '300',
    },
    formContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    formContent: {
        padding: 30,
        paddingTop: 40,
        paddingBottom: 100,
    },
    formTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D8B85',
        marginBottom: 30,
        textAlign: 'left',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 15,
        minHeight: 55,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    inputIcon: {
        marginRight: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 15,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 15,
        minHeight: 55,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    picker: {
        flex: 1,
        color: '#333',
    },
    signUpButton: {
        backgroundColor: '#2D8B85',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 25,
        shadowColor: '#2D8B85',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
        elevation: 0,
    },
    signUpButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoContainer: {
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    infoText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    signInLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInLinkText: {
        color: '#666',
        fontSize: 16,
    },
    signInLink: {
        color: '#2D8B85',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SignUpScreen;