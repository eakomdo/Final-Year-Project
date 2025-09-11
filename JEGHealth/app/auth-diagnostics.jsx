import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import DjangoAuthService from '../lib/djangoAuth';
import { getBackendURL } from '../lib/networkConfig';

const DiagnosticsScreen = () => {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, status, details) => {
    setResults(prev => [...prev, { test, status, details, timestamp: new Date() }]);
  };

  const testNetworkConnectivity = async () => {
    const backendUrl = getBackendURL();
    
    try {
      addResult('Backend URL', 'info', `Using: ${backendUrl}`);
      
      // Test basic connectivity
      const response = await fetch(`${backendUrl}/`, {
        method: 'GET',
        timeout: 5000,
      });
      
      if (response.ok) {
        addResult('Network Connectivity', 'success', 'Backend is reachable');
      } else {
        addResult('Network Connectivity', 'error', `HTTP ${response.status}`);
      }
    } catch (error) {
      addResult('Network Connectivity', 'error', error.message);
    }
  };

  const testAuthEndpoint = async () => {
    const backendUrl = getBackendURL();
    
    try {
      const response = await fetch(`${backendUrl}/api/v1/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        }),
      });
      
      if (response.status === 400 || response.status === 401) {
        addResult('Auth Endpoint', 'success', 'Endpoint is working (expected auth failure)');
      } else {
        addResult('Auth Endpoint', 'warning', `Status: ${response.status}`);
      }
    } catch (error) {
      addResult('Auth Endpoint', 'error', error.message);
    }
  };

  const testWithValidCredentials = async () => {
    try {
      addResult('Test Login', 'info', 'Testing with demo credentials');
      
      // This will fail but help us see the exact error
      const result = await DjangoAuthService.loginUser('demo@jeghealth.com', 'demo123');
      
      if (result.success) {
        addResult('Test Login', 'success', 'Login successful');
      } else {
        addResult('Test Login', 'error', result.error);
      }
    } catch (error) {
      addResult('Test Login', 'error', error.message);
    }
  };

  const createTestUser = async () => {
    try {
      addResult('Create Test User', 'info', 'Creating test user account');
      
      const testUserData = {
        email: 'testuser@jeghealth.com',
        password: 'TestPass123!',
        password_confirm: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User',
        contact: '+233243567890',
        roleName: 'patient'
      };
      
      const result = await DjangoAuthService.registerUser(testUserData);
      
      if (result.success) {
        addResult('Create Test User', 'success', 'Test user created successfully');
        addResult('Test Credentials', 'info', 'Email: testuser@jeghealth.com, Password: TestPass123!');
      } else {
        addResult('Create Test User', 'error', result.error);
      }
    } catch (error) {
      addResult('Create Test User', 'error', error.message);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      addResult('Diagnostics Started', 'info', 'Running authentication diagnostics...');
      
      await testNetworkConnectivity();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testAuthEndpoint();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testWithValidCredentials();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await createTestUser();
      
      addResult('Diagnostics Complete', 'info', 'All tests completed');
    } catch (error) {
      addResult('Diagnostics Error', 'error', error.message);
    } finally {
      setTesting(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return Colors.success;
      case 'error': return Colors.error;
      case 'warning': return Colors.warning;
      default: return Colors.info;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Auth Diagnostics</Text>
        <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
          <Ionicons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color={Colors.info} />
          <Text style={styles.instructionsText}>
            This tool helps diagnose authentication issues. Tap "Run Tests" to check your backend connection and authentication setup.
          </Text>
        </View>

        {/* Test Button */}
        <TouchableOpacity
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          onPress={runAllTests}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Ionicons name="play-circle" size={20} color="white" />
          )}
          <Text style={styles.testButtonText}>
            {testing ? 'Running Tests...' : 'Run Authentication Tests'}
          </Text>
        </TouchableOpacity>

        {/* Results */}
        {results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            {results.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Ionicons 
                    name={getStatusIcon(result.status)} 
                    size={20} 
                    color={getStatusColor(result.status)} 
                  />
                  <Text style={styles.resultTest}>{result.test}</Text>
                </View>
                <Text style={[styles.resultDetails, { color: getStatusColor(result.status) }]}>
                  {result.details}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Fixes */}
        <View style={styles.quickFixesSection}>
          <Text style={styles.sectionTitle}>Quick Fixes</Text>
          
          <View style={styles.fixCard}>
            <Text style={styles.fixTitle}>1. Backend Connection Issues</Text>
            <Text style={styles.fixDescription}>
              • Make sure your Django server is running on port 8000{'\n'}
              • Check if the IP address in networkConfig.js is correct{'\n'}
              • Verify firewall settings allow connections
            </Text>
          </View>

          <View style={styles.fixCard}>
            <Text style={styles.fixTitle}>2. Invalid Credentials</Text>
            <Text style={styles.fixDescription}>
              • Use the test account created by this tool{'\n'}
              • Check if user exists in Django admin{'\n'}
              • Verify password requirements match Django settings
            </Text>
          </View>

          <View style={styles.fixCard}>
            <Text style={styles.fixTitle}>3. Network Configuration</Text>
            <Text style={styles.fixDescription}>
              • Update DJANGO_HOST in networkConfig.js{'\n'}
              • Use device IP for testing on physical devices{'\n'}
              • Use localhost for iOS simulator
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  instructionsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  testButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTest: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  resultDetails: {
    fontSize: 12,
    marginLeft: 28,
  },
  quickFixesSection: {
    marginBottom: 20,
  },
  fixCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  fixTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  fixDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default DiagnosticsScreen;
