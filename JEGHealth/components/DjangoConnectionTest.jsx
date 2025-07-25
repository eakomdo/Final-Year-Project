import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getBackendURL, checkBackendConnection } from '../lib/networkConfig';
import { authAPI } from '../api/services';

/**
 * Component to test Django backend connection
 * Use this to verify that your frontend can communicate with Django
 */
const DjangoConnectionTest = () => {
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [backendURL, setBackendURL] = useState('');

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        setConnectionStatus('checking');
        
        const url = getBackendURL();
        setBackendURL(url);
        
        try {
            const isConnected = await checkBackendConnection();
            setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        } catch (error) {
            console.error('Connection test error:', error);
            setConnectionStatus('error');
        }
    };

    const testAuthEndpoint = async () => {
        try {
            // Test a simple auth endpoint that doesn't require authentication
            const response = await fetch(`${getBackendURL()}/auth/test/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                Alert.alert('Success', 'Auth endpoint is working!');
            } else {
                Alert.alert('Error', `Auth endpoint returned status: ${response.status}`);
            }
        } catch (error) {
            Alert.alert('Error', `Failed to reach auth endpoint: ${error.message}`);
        }
    };

    const testRegistrationEndpoint = async () => {
        try {
            // Test registration endpoint with invalid data to see if it responds
            await authAPI.register({
                email: 'test@example.com',
                password: 'testpass123',
                full_name: 'Test User',
            });
            
            // This should fail, but if we get a proper error response, the endpoint is working
            Alert.alert('Unexpected', 'Registration succeeded with test data');
        } catch (error) {
            if (error.response) {
                // We got a response from the server, which means the endpoint exists
                Alert.alert('Success', `Registration endpoint is working (got expected error: ${error.response.status})`);
            } else {
                // Network error or endpoint doesn't exist
                Alert.alert('Error', `Registration endpoint not reachable: ${error.message}`);
            }
        }
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return '#4CAF50';
            case 'disconnected': return '#F44336';
            case 'checking': return '#FF9800';
            case 'error': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Connected ✓';
            case 'disconnected': return 'Disconnected ✗';
            case 'checking': return 'Checking...';
            case 'error': return 'Error ✗';
            default: return 'Unknown';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Django Backend Connection Test</Text>
            
            <View style={styles.statusContainer}>
                <Text style={styles.label}>Backend URL:</Text>
                <Text style={styles.url}>{backendURL}</Text>
            </View>
            
            <View style={styles.statusContainer}>
                <Text style={styles.label}>Connection Status:</Text>
                <Text style={[styles.status, { color: getStatusColor() }]}>
                    {getStatusText()}
                </Text>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={testConnection}>
                <Text style={styles.buttonText}>Test Connection</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={testAuthEndpoint}>
                <Text style={styles.buttonText}>Test Auth Endpoint</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={testRegistrationEndpoint}>
                <Text style={styles.buttonText}>Test Registration Endpoint</Text>
            </TouchableOpacity>
            
            <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                <Text style={styles.instructionsText}>
                    1. Make sure your Django server is running on the configured IP/port{'\n'}
                    2. Check that your firewall allows connections{'\n'}
                    3. Verify CORS is configured in Django settings{'\n'}
                    4. Update the IP address in networkConfig.js if needed
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    statusContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    url: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'monospace',
    },
    status: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    instructionsContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1976D2',
        marginBottom: 10,
    },
    instructionsText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});

export default DjangoConnectionTest;
