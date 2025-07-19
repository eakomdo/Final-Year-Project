import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const SignInScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        try {
            if (!email || !password) {
                Alert.alert('Error', 'Please fill in all fields');
                return;
            }

            setLoading(true);

            const result = await login(email, password);

            if (result.success) {
                // Navigation will be handled automatically by AuthContext
                console.log('Login successful');
            } else {
                Alert.alert('Login Failed', result.error);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your JEGHealth account</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSignIn}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('SignUp')}
                >
                    <Text style={styles.linkText}>
                        Don't have an account? Sign Up
                    </Text>
                </TouchableOpacity>

                {/* Quick login for testing */}
                <View style={styles.testSection}>
                    <Text style={styles.testTitle}>Quick Test Login:</Text>
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={() => {
                            setEmail('patient@jeghealth.com');
                            setPassword('password123');
                        }}
                    >
                        <Text style={styles.testButtonText}>Test Patient</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={() => {
                            setEmail('doctor@jeghealth.com');
                            setPassword('password123');
                        }}
                    >
                        <Text style={styles.testButtonText}>Test Doctor</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
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
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: 'white',
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
    testSection: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
    },
    testTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    testButton: {
        backgroundColor: '#6c757d',
        borderRadius: 6,
        padding: 10,
        alignItems: 'center',
        marginBottom: 5,
    },
    testButtonText: {
        color: 'white',
        fontSize: 14,
    },
});

export default SignInScreen;