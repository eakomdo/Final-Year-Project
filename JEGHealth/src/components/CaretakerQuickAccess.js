import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

const CaretakerQuickAccess = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push('/caretakers')}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={24} color={Colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Manage Caretakers</Text>
          <Text style={styles.subtitle}>Add trusted people for emergency access</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push('/add-caretaker')}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="person-add" size={24} color={Colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Add New Caretaker</Text>
          <Text style={styles.subtitle}>Quick add a new trusted contact</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      {/* Quick Add Button */}
      <TouchableOpacity 
        style={styles.quickAddButton}
        onPress={() => router.push('/add-caretaker')}
      >
        <Ionicons name="person-add" size={24} color={Colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
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
  content: {
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
  quickAddButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});

export default CaretakerQuickAccess;