import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

const DrJEGQuickAccess = () => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push('/ai-chat')}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={24} color={Colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Ask Dr. JEG</Text>
          <Text style={styles.subtitle}>Get AI-powered health insights</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.featureIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default DrJEGQuickAccess;