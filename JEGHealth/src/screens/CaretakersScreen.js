import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import CaretakerService from '../services/CaretakerService';
import { showError, showSuccess, showWarning } from '../utils/NotificationHelper';

const CaretakersScreen = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadCaretakers();
  }, []);

  const loadCaretakers = async () => {
    try {
      const caretakersList = await CaretakerService.getAllCaretakers();
      setCaretakers(caretakersList);
    } catch (error) {
      console.error('Error loading caretakers:', error);
      showError('Error', 'Failed to load caretakers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCaretakers();
  };

  const handleDeleteCaretaker = (caretaker) => {
    // Show a warning notification and then proceed with deletion after a delay
    showWarning(
      'Remove Caretaker',
      `Tap again within 5 seconds to confirm removal of ${caretaker.fullName} as a caretaker.`
    );
    
    // Auto-delete after 5 seconds - user can see the warning notification
    setTimeout(async () => {
      try {
        await CaretakerService.removeCaretaker(caretaker.id);
        await loadCaretakers();
        showSuccess('Success', 'Caretaker removed successfully');
      } catch (_error) {
        showError('Error', 'Failed to remove caretaker');
      }
    }, 5000);
  };

  const renderCaretaker = ({ item }) => (
    <View style={styles.caretakerCard}>
      <View style={styles.caretakerHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.caretakerInfo}>
          <Text style={styles.caretakerName}>{item.fullName}</Text>
          <Text style={styles.caretakerRelationship}>{item.relationship}</Text>
          <Text style={styles.caretakerCode}>Code: {item.uniqueCode}</Text>
        </View>
        <View style={styles.caretakerActions}>
          {item.emergencyContact && (
            <View style={styles.emergencyBadge}>
              <Ionicons name="warning" size={12} color={Colors.warning} />
              <Text style={styles.emergencyText}>Emergency</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCaretaker(item)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.caretakerDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={Colors.textTertiary} />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={Colors.textTertiary} />
          <Text style={styles.detailText}>{item.phoneNumber}</Text>
        </View>
        {item.address && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={Colors.textTertiary} />
      <Text style={styles.emptyTitle}>No Caretakers Added</Text>
      <Text style={styles.emptySubtitle}>
        Add trusted people who can access your health information in emergencies
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/add-caretaker')}
      >
        <Text style={styles.emptyButtonText}>Add Your First Caretaker</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Caretakers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-caretaker')}
        >
          <Ionicons name="add" size={24} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={caretakers}
        renderItem={renderCaretaker}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textOnPrimary,
    textAlign: 'center',
    marginLeft: -32,
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  caretakerCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  caretakerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textOnPrimary,
  },
  caretakerInfo: {
    flex: 1,
  },
  caretakerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  caretakerRelationship: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  caretakerCode: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    backgroundColor: Colors.featureIconBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  caretakerActions: {
    alignItems: 'flex-end',
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
  },
  caretakerDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CaretakersScreen;