import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DevelopmentModeIndicator = ({ visible = true }) => {
  if (!__DEV__ || !visible) {
    return null;
  }

  const showDevModeInfo = () => {
    Alert.alert(
      'Development Mode Active',
      'This app is running in development mode with simulated features:\n\n' +
      '• Notifications are simulated\n' +
      '• Bluetooth uses mock devices\n' +
      '• Some security features are relaxed\n\n' +
      'Build a development build for full functionality.',
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'Learn More', 
          style: 'default',
          onPress: () => console.log('Visit: https://docs.expo.dev/develop/development-builds/introduction/')
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.devIndicator}
      onPress={showDevModeInfo}
      activeOpacity={0.7}
    >
      <Ionicons name="code-outline" size={16} color="#fff" />
      <Text style={styles.devText}>DEV</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  devIndicator: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
  },
  devText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default DevelopmentModeIndicator;
