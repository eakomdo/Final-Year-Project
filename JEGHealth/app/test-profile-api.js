import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authAPI } from '../api/services';

export default function TestProfileApiScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, success, data) => {
    setResults(prev => [...prev, { test, success, data, timestamp: new Date() }]);
  };

  const testBasicProfile = async () => {
    try {
      const response = await authAPI.getBasicProfile();
      addResult('Basic Profile GET', true, response.data);
    } catch (error) {
      addResult('Basic Profile GET', false, error.message);
    }
  };

  const testPersonalProfile = async () => {
    try {
      const response = await authAPI.getPersonalProfile();
      addResult('Personal Profile GET', true, response.data);
    } catch (error) {
      addResult('Personal Profile GET', false, error.message);
    }
  };

  const testUpdateBasicProfile = async () => {
    try {
      const testData = {
        first_name: 'Test',
        last_name: 'User',
      };
      const response = await authAPI.updateBasicProfile(testData);
      addResult('Basic Profile UPDATE', true, response.data);
    } catch (error) {
      addResult('Basic Profile UPDATE', false, error.message);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);
    
    await testBasicProfile();
    await testPersonalProfile();
    await testUpdateBasicProfile();
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2D8B85" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile API Tests</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={runAllTests}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.testButtonText}>Run All Tests</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearResults}
          >
            <Text style={styles.clearButtonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsContainer}>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.testName}>{result.test}</Text>
                <Ionicons
                  name={result.success ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={result.success ? '#4CAF50' : '#F44336'}
                />
              </View>
              <Text style={styles.resultData}>
                {typeof result.data === 'object'
                  ? JSON.stringify(result.data, null, 2)
                  : result.data}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D8B85',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  testButton: {
    flex: 1,
    backgroundColor: '#2D8B85',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    gap: 12,
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D8B85',
  },
  resultData: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
});
