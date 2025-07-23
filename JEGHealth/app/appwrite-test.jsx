import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import ProfileVerificationTest from '../src/utils/ProfileVerificationTest';

const AppwriteTestScreen = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Capture console logs for display
      const originalLog = console.log;
      const originalError = console.error;
      const logs = [];
      
      console.log = (...args) => {
        logs.push({ type: 'log', message: args.join(' ') });
        originalLog(...args);
      };
      
      console.error = (...args) => {
        logs.push({ type: 'error', message: args.join(' ') });
        originalError(...args);
      };
      
      // Run the tests
      const success = await ProfileVerificationTest.runAllTests();
      
      // Restore console
      console.log = originalLog;
      console.error = originalError;
      
      setTestResults(logs);
      
      if (success) {
        Alert.alert(
          '✅ Success!', 
          'Your Appwrite User Profile collection is configured correctly!',
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        Alert.alert(
          '⚠️ Issues Found', 
          'Some tests failed. Check the results below for details.',
          [{ text: 'OK', style: 'default' }]
        );
      }
      
    } catch (error) {
      Alert.alert('Error', `Test execution failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getIconForLog = (log) => {
    if (log.message.includes('✅')) return { name: 'checkmark-circle', color: Colors.success };
    if (log.message.includes('❌')) return { name: 'close-circle', color: Colors.error };
    if (log.message.includes('🔍')) return { name: 'search', color: Colors.info };
    if (log.message.includes('⚠️')) return { name: 'warning', color: Colors.warning };
    return { name: 'information-circle', color: Colors.textSecondary };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appwrite Collection Test</Text>
        <Text style={styles.headerSubtitle}>
          Verify your User Profile collection setup
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.testButton, isRunning && styles.buttonDisabled]}
          onPress={runTests}
          disabled={isRunning}
        >
          <Ionicons 
            name={isRunning ? "reload" : "play-circle"} 
            size={24} 
            color="white" 
            style={[isRunning && styles.spinning]}
          />
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run Verification Tests'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>
              No tests run yet. Click the button above to start verification.
            </Text>
          </View>
        ) : (
          testResults.map((log, index) => {
            const icon = getIconForLog(log);
            return (
              <View key={index} style={styles.logItem}>
                <Ionicons 
                  name={icon.name} 
                  size={16} 
                  color={icon.color} 
                  style={styles.logIcon}
                />
                <Text style={[
                  styles.logText,
                  log.type === 'error' && styles.errorText
                ]}>
                  {log.message}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  spinning: {
    // Add rotation animation if needed
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  logIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  logText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  errorText: {
    color: Colors.error,
  },
});

export default AppwriteTestScreen;
