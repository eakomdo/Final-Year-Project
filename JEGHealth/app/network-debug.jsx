import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getNetworkConfig } from '../lib/networkConfig';

const NetworkDebugScreen = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, status, message, details = null) => {
    const result = {
      test,
      status, // 'success', 'error', 'info'
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
  };

  const runNetworkTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Check network configuration
    try {
      const config = getNetworkConfig();
      addResult('Network Config', 'info', 'Current configuration', config);
    } catch (error) {
      addResult('Network Config', 'error', 'Failed to get config', error.message);
    }

    // Test 2: Test different URLs
    const urlsToTest = [
      'http://127.0.0.1:8000/',
      'http://192.168.1.50:8000/',
      'http://localhost:8000/',
    ];

    for (const url of urlsToTest) {
      try {
        addResult('URL Test', 'info', `Testing ${url}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          addResult('URL Test', 'success', `✅ ${url} - Status: ${response.status}`);
        } else {
          addResult('URL Test', 'error', `❌ ${url} - Status: ${response.status}`);
        }
      } catch (error) {
        addResult('URL Test', 'error', `❌ ${url} - ${error.message}`);
      }
    }

    // Test 3: Test authentication endpoints
    const config = getNetworkConfig();
    const baseUrl = config.baseUrl;
    
    const authEndpoints = [
      '/api/auth/test/',
      '/api/auth/login/',
      '/api/auth/register/',
    ];

    for (const endpoint of authEndpoints) {
      try {
        const url = `${baseUrl}${endpoint}`;
        addResult('Auth Endpoint Test', 'info', `Testing ${url}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        addResult('Auth Endpoint Test', response.ok ? 'success' : 'error', 
          `${endpoint} - Status: ${response.status}`);
      } catch (error) {
        addResult('Auth Endpoint Test', 'error', `${endpoint} - ${error.message}`);
      }
    }

    // Test 4: Test actual login attempt
    try {
      addResult('Login Test', 'info', 'Testing login with sample credentials...');
      
      const config = getNetworkConfig();
      const response = await fetch(`${config.baseUrl}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        })
      });

      const responseText = await response.text();
      addResult('Login Test', response.ok ? 'success' : 'error', 
        `Login test - Status: ${response.status}`, responseText);
    } catch (error) {
      addResult('Login Test', 'error', `Login test failed: ${error.message}`);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'info': return '#2196F3';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network & Auth Diagnostics</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={runNetworkTests}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Running Tests...' : 'Run Network Tests'}
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
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Text style={styles.testName}>{result.test}</Text>
              <Text style={styles.timestamp}>{result.timestamp}</Text>
            </View>
            <Text style={[styles.message, { color: getStatusColor(result.status) }]}>
              {result.message}
            </Text>
            {result.details && (
              <Text style={styles.details}>
                {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#757575',
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
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  message: {
    fontSize: 14,
    marginBottom: 5,
  },
  details: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
});

export default NetworkDebugScreen;
