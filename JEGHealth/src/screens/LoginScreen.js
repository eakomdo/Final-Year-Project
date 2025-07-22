import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { showError } from '../utils/NotificationHelper';

const { height } = Dimensions.get('window');

const SignInScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        try {
            if (!email || !password) {
                showError('Error', 'Please fill in all fields');
                return;
            }

            setLoading(true);

            const result = await login(email, password);

            if (result.success) {
                // Navigation will be handled automatically by AuthContext
                console.log('Login successful');
            } else {
                showError('Login Failed', result.error);
            }
        } catch (error) {
            showError('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = (userEmail, userPassword) => {
        setEmail(userEmail);
        setPassword(userPassword);
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
            <View style={styles.decorativePlant} />

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Hello!</Text>
                <Text style={styles.welcomeSubtitle}>Welcome to JEGHealth</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formContainer}>
                <View style={styles.formContent}>
                    <Text style={styles.formTitle}>Login</Text>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Feather name="mail" size={20} color="#7FCCCC" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#B0B0B0"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Feather name="lock" size={20} color="#7FCCCC" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#B0B0B0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity 
                        style={styles.forgotPasswordContainer}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.buttonDisabled]}
                        onPress={handleSignIn}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    {/* Social Login Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or sign up with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Login Buttons */}
                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.socialButtonText}>f</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.socialButtonText}>G</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.socialButtonText}>🍎</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpLinkContainer}>
                        <Text style={styles.signUpLinkText}>Don&apos;t have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.signUpLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Test Login Section */}
                    <View style={styles.testSection}>
                        <Text style={styles.testTitle}>Quick Test Login:</Text>
                        <View style={styles.testButtonsRow}>
                            <TouchableOpacity
                                style={styles.testButton}
                                onPress={() => handleQuickLogin('patient@jeghealth.com', 'password123')}
                            >
                                <Feather name="user" size={16} color="white" />
                                <Text style={styles.testButtonText}>Patient</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.testButton}
                                onPress={() => handleQuickLogin('doctor@jeghealth.com', 'password123')}
                            >
                                <Feather name="user-plus" size={16} color="white" />
                                <Text style={styles.testButtonText}>Doctor</Text>
                            </TouchableOpacity>
                        </View>
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
    decorativePlant: {
        position: 'absolute',
        top: 120,
        right: 20,
        width: 80,
        height: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 40,
        transform: [{ rotate: '15deg' }],
    },
    welcomeSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 30,
        paddingTop: 100,
        paddingBottom: 50,
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
        minHeight: height * 0.65,
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
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordText: {
        color: '#2D8B85',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#2D8B85',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
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
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E9ECEF',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#666',
        fontSize: 14,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 25,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    socialButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
    signUpLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    signUpLinkText: {
        color: '#666',
        fontSize: 16,
    },
    signUpLink: {
        color: '#2D8B85',
        fontSize: 16,
        fontWeight: 'bold',
    },
    testSection: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    testTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    testButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    testButton: {
        backgroundColor: '#6c757d',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 0.48,
        minHeight: 45,
    },
    testButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default SignInScreen;