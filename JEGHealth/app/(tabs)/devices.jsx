import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeviceList from '../../component/DeviceList';
import { Colors } from '../../src/constants/colors';
import { showError, showSuccess, showInfo } from '../../src/utils/NotificationHelper';

export default function DevicesScreen() {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Initialize device connection manager
    initializeDeviceManager();
  }, []);

  const initializeDeviceManager = async () => {
    try {
      // This would normally initialize the BLE manager
      // For now, we'll use mock data since BLE is in mock mode
      console.log('DeviceManager initialized');
    } catch (error) {
      console.error('Failed to initialize device manager:', error);
    }
  };

  const startScanning = async () => {
    if (isScanning) return;

    setIsScanning(true);
    setDevices([]);

    try {
      // Simulate scanning with mock devices
      setTimeout(() => {
        const mockDevices = [
          {
            id: 'mock-ecg-001',
            name: 'JEG ECG Monitor',
            rssi: -45,
            type: 'ecg'
          },
          {
            id: 'mock-pulse-001',
            name: 'MAX30102 Pulse Sensor',
            rssi: -52,
            type: 'pulse'
          },
          {
            id: 'mock-bp-001',
            name: 'Blood Pressure Monitor',
            rssi: -38,
            type: 'blood_pressure'
          }
        ];
        
        setDevices(mockDevices);
        setIsScanning(false);
      }, 3000);

    } catch (error) {
      console.error('Error scanning for devices:', error);
      setIsScanning(false);
      showError('Error', 'Failed to scan for devices');
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    console.log('Device scanning stopped');
  };

  const connectToDevice = async (device) => {
    setIsConnecting(true);
    
    try {
      // Simulate connection
      setTimeout(() => {
        setConnectedDevice(device);
        setIsConnecting(false);
        showSuccess('Success', `Connected to ${device.name}`);
      }, 2000);

    } catch (error) {
      console.error('Error connecting to device:', error);
      setIsConnecting(false);
      showError('Error', `Failed to connect to ${device.name}`);
    }
  };

  const disconnectDevice = async () => {
    if (!connectedDevice) return;

    try {
      setConnectedDevice(null);
      showInfo('Disconnected', 'Device has been disconnected');
    } catch (error) {
      console.error('Error disconnecting device:', error);
      showError('Error', 'Failed to disconnect device');
    }
  };

  const ConnectedDeviceCard = ({ device }) => (
    <View style={styles.connectedCard}>
      <View style={styles.connectedHeader}>
        <Ionicons name="bluetooth" size={24} color={Colors.primary} />
        <Text style={styles.connectedTitle}>Connected Device</Text>
      </View>
      <View style={styles.deviceDetails}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text style={styles.deviceId}>ID: {device.id}</Text>
        <Text style={styles.deviceStatus}>Status: Connected</Text>
      </View>
      <TouchableOpacity
        style={styles.disconnectButton}
        onPress={disconnectDevice}
      >
        <Text style={styles.disconnectButtonText}>Disconnect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Device Management</Text>
          <Text style={styles.subtitle}>
            Manage your health monitoring devices
          </Text>
        </View>

        {connectedDevice && (
          <ConnectedDeviceCard device={connectedDevice} />
        )}

        <View style={styles.scanSection}>
          <View style={styles.scanHeader}>
            <Text style={styles.sectionTitle}>Available Devices</Text>
            <TouchableOpacity
              style={[
                styles.scanButton,
                isScanning && styles.scanButtonDisabled
              ]}
              onPress={isScanning ? stopScanning : startScanning}
              disabled={isConnecting}
            >
              <Ionicons
                name={isScanning ? "stop" : "search"}
                size={16}
                color="#FFF"
              />
              <Text style={styles.scanButtonText}>
                {isScanning ? 'Stop Scan' : 'Scan Devices'}
              </Text>
            </TouchableOpacity>
          </View>

          {isScanning && (
            <View style={styles.scanningIndicator}>
              <Text style={styles.scanningText}>Scanning for devices...</Text>
            </View>
          )}

          <DeviceList
            devices={devices}
            onSelectDevice={connectToDevice}
            connecting={isConnecting}
          />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Make sure your devices are powered on and in pairing mode before scanning.
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="warning" size={20} color="#FFA726" />
            <Text style={styles.infoText}>
              Note: This app is currently running in mock mode for development. 
              Real device connections require a development build.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  connectedCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2D8B85',
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  deviceDetails: {
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: 14,
    color: '#2D8B85',
    fontWeight: '500',
  },
  disconnectButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  disconnectButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scanSection: {
    marginBottom: 24,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#999',
  },
  scanButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  scanningIndicator: {
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  scanningText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
