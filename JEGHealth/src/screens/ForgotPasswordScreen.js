import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { showError, showSuccess } from '../utils/NotificationHelper';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleResetPassword = async () => {
        try {
            if (!email.trim()) {
                showError('Error', 'Please enter your email address');
                return;
            }

            if (!validateEmail(email)) {
                showError('Error', 'Please enter a valid email address');
                return;
            }

            setLoading(true);

            // Simulate API call - Replace with actual password reset logic
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setEmailSent(true);
            showSuccess(
                'Reset Link Sent',
                'Check your email for password reset instructions'
            );
        } catch (_error) {
            showError('Error', 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.navigate('SignIn');
    };

    const handleResendEmail = () => {
        setEmailSent(false);
        setEmail('');
    };

    if (emailSent) {
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

                {/* Success Content */}
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Feather name="mail" size={60} color="#4ECDC4" />
                    </View>
                    
                    <Text style={styles.successTitle}>Check Your Email</Text>
                    <Text style={styles.successSubtitle}>
                        We&apos;ve sent a password reset link to {email}
                    </Text>
                    
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleBackToLogin}
                    >
                        <Text style={styles.primaryButtonText}>Back to Login</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleResendEmail}
                    >
                        <Text style={styles.secondaryButtonText}>Resend Email</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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
            <View style={styles.decorativePlant} />

            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleBackToLogin}
                >
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Reset Password</Text>
                <Text style={styles.welcomeSubtitle}>Enter your email to receive reset instructions</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formContainer}>
                <View style={styles.formContent}>
                    <View style={styles.iconContainer}>
                        <Feather name="lock" size={40} color="#4ECDC4" />
                    </View>
                    
                    <Text style={styles.formTitle}>Forgot Password?</Text>
                    <Text style={styles.formSubtitle}>
                        Don&apos;t worry! Enter your email address and we&apos;ll send you a link to reset your password.
                    </Text>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Feather name="mail" size={20} color="#7FCCCC" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#B0B0B0"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>

                    {/* Reset Button */}
                    <TouchableOpacity
                        style={[styles.resetButton, loading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Feather name="send" size={20} color="white" style={styles.buttonIcon} />
                                <Text style={styles.resetButtonText}>Send Reset Link</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Back to Login Link */}
                    <View style={styles.backToLoginContainer}>
                        <Text style={styles.backToLoginText}>Remember your password? </Text>
                        <TouchableOpacity onPress={handleBackToLogin}>
                            <Text style={styles.backToLoginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        bottom: -100,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    decorativeLeaf1: {
        position: 'absolute',
        top: 120,
        left: 20,
        width: 40,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        transform: [{ rotate: '45deg' }],
    },
    decorativeLeaf2: {
        position: 'absolute',
        top: 200,
        right: 40,
        width: 30,
        height: 45,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        transform: [{ rotate: '-30deg' }],
    },
    decorativePlant: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 60,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 30,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    welcomeSection: {
        paddingHorizontal: 30,
        paddingVertical: 20,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 22,
    },
    formContainer: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    formContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingVertical: 40,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -5,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    formSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 15,
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
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
    },
    resetButton: {
        backgroundColor: '#4ECDC4',
        paddingVertical: 18,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#4ECDC4',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#A0A0A0',
        shadowOpacity: 0,
    },
    buttonIcon: {
        marginRight: 10,
    },
    resetButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    backToLoginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    backToLoginText: {
        fontSize: 16,
        color: '#666',
    },
    backToLoginLink: {
        fontSize: 16,
        color: '#4ECDC4',
        fontWeight: '600',
    },
    // Success screen styles
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 15,
    },
    successSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    primaryButton: {
        backgroundColor: 'white',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 15,
        marginBottom: 15,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#4ECDC4',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    secondaryButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: 'white',
        width: '100%',
    },
    secondaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default ForgotPasswordScreen;
