import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getBackendURL, checkBackendConnection } from '../lib/networkConfig';

export default function NetworkDebugScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [backendUrl, setBackendUrl] = useState('');

  useEffect(() => {
    setBackendUrl(getBackendURL());
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const isConnected = await checkBackendConnection();
      setConnectionStatus(isConnected);
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus(false);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Network Debug</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend URL</Text>
          <Text style={styles.urlText}>{backendUrl}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Test</Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testConnection}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.testButtonText}>Test Connection</Text>
            )}
          </TouchableOpacity>

          {connectionStatus !== null && (
            <View style={styles.statusContainer}>
              <Ionicons
                name={connectionStatus ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={connectionStatus ? '#4CAF50' : '#F44336'}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: connectionStatus ? '#4CAF50' : '#F44336' },
                ]}
              >
                {connectionStatus ? 'Connected' : 'Connection Failed'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            1. Make sure your Django backend is running on port 8000
          </Text>
          <Text style={styles.instructionText}>
            2. Check if your device/emulator can reach the backend IP
          </Text>
          <Text style={styles.instructionText}>
            3. Update the IP address in networkConfig.js if needed
          </Text>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D8B85',
    marginBottom: 12,
  },
  urlText: {
    fontSize: 14,
    color: '#495057',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#2D8B85',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  instructionText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20,
  },
});
