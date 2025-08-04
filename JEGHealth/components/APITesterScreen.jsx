import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { authAPI } from '../api/services';

const APITesterScreen = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (endpoint, success, data, error) => {
    const result = {
      endpoint,
      success,
      data: success ? data : null,
      error: success ? null : error,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testAPIEndpoints = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test basic profile endpoints
    try {
      const response = await authAPI.getBasicProfile();
      addResult('Basic Profile GET', true, response.data);
    } catch (error) {
      addResult('Basic Profile GET', false, null, error.message);
    }

    try {
      const response = await authAPI.getPersonalProfile();
      addResult('Personal Profile GET', true, response.data);
    } catch (error) {
      addResult('Personal Profile GET', false, null, error.message);
    }

    // Test current user endpoint (fallback)
    try {
      const response = await authAPI.getCurrentUser();
      addResult('Current User GET', true, response.data);
    } catch (error) {
      addResult('Current User GET', false, null, error.message);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Endpoint Tester</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={testAPIEndpoints}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test API Endpoints'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <View key={index} style={[
            styles.resultItem,
            { backgroundColor: result.success ? '#d4edda' : '#f8d7da' }
          ]}>
            <View style={styles.resultHeader}>
              <Text style={styles.endpoint}>{result.endpoint}</Text>
              <Text style={styles.timestamp}>{result.timestamp}</Text>
            </View>
            
            <Text style={[
              styles.status,
              { color: result.success ? '#155724' : '#721c24' }
            ]}>
              {result.success ? '✅ SUCCESS' : '❌ FAILED'}
            </Text>
            
            {result.error && (
              <Text style={styles.error}>Error: {result.error}</Text>
            )}
            
            {result.data && (
              <Text style={styles.data}>
                Data: {JSON.stringify(result.data, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D8B85',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#2D8B85',
  },
  clearButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  endpoint: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  error: {
    fontSize: 12,
    color: '#721c24',
    fontFamily: 'monospace',
  },
  data: {
    fontSize: 10,
    color: '#155724',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
  },
});

export default APITesterScreen;
