import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HealthRecommendationService from '../services/HealthRecommendationService';
import { useAuth } from '../../context/AuthContext';

const HealthRecommendations = ({ limit = 5, showHeader = true, style }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());

  const loadRecommendations = useCallback(() => {
    const recs = HealthRecommendationService.getRecommendations({ limit });
    setRecommendations(recs);
  }, [limit]);

  const initializeRecommendations = useCallback(async () => {
    if (!user?.$id) return;
    
    try {
      setLoading(true);
      await HealthRecommendationService.initialize(user.$id);
      loadRecommendations();
    } catch (error) {
      console.error('Error initializing recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.$id, loadRecommendations]);

  useEffect(() => {
    initializeRecommendations();
  }, [initializeRecommendations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await HealthRecommendationService.refreshRecommendations();
      loadRecommendations();
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRecommendationAction = async (recommendation) => {
    try {
      const success = await HealthRecommendationService.executeRecommendationAction(
        recommendation.id,
        { userId: user.$id }
      );

      if (success) {
        Alert.alert(
          'Action Completed',
          `Successfully executed: ${recommendation.title}`,
          [{ text: 'OK' }]
        );
        loadRecommendations(); // Refresh to show updated state
      } else {
        Alert.alert('Error', 'Failed to execute action. Please try again.');
      }
    } catch (error) {
      console.error('Error executing recommendation action:', error);
      Alert.alert('Error', 'An error occurred while executing the action.');
    }
  };

  const handleDismiss = (recommendationId) => {
    Alert.alert(
      'Dismiss Recommendation',
      'Are you sure you want to dismiss this recommendation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: () => {
            HealthRecommendationService.dismissRecommendation(recommendationId);
            loadRecommendations();
          }
        }
      ]
    );
  };

  const toggleCardExpansion = (recommendationId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(recommendationId)) {
      newExpanded.delete(recommendationId);
    } else {
      newExpanded.add(recommendationId);
    }
    setExpandedCards(newExpanded);
  };

  const getRecommendationIcon = (type) => {
    const icons = {
      medication: 'medical',
      hydration: 'water',
      exercise: 'fitness',
      sleep: 'moon',
      appointment: 'calendar',
      vitals: 'heart',
      nutrition: 'nutrition',
      emergency: 'warning'
    };
    return icons[type] || 'information-circle';
  };

  const getRecommendationColor = (priority, urgency) => {
    if (urgency === 'urgent') return '#FF3B30';
    if (priority === 'high') return '#FF9500';
    if (priority === 'medium') return '#007AFF';
    return '#8E8E93';
  };

  const renderRecommendationCard = (recommendation) => {
    const isExpanded = expandedCards.has(recommendation.id);
    const iconName = getRecommendationIcon(recommendation.type);
    const color = getRecommendationColor(recommendation.priority, recommendation.urgency);

    return (
      <View key={recommendation.id} style={[styles.recommendationCard, { borderLeftColor: color }]}>
        <TouchableOpacity
          onPress={() => toggleCardExpansion(recommendation.id)}
          style={styles.cardHeader}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Ionicons name={iconName} size={24} color={color} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={styles.recommendationMessage} numberOfLines={isExpanded ? 0 : 2}>
                {recommendation.message}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.priorityBadge, { backgroundColor: color }]}>
              <Text style={styles.priorityText}>
                {recommendation.urgency === 'urgent' ? 'URGENT' : recommendation.priority.toUpperCase()}
              </Text>
            </View>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#8E8E93" 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {recommendation.description && (
              <Text style={styles.description}>{recommendation.description}</Text>
            )}

            {recommendation.benefits && (
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Benefits:</Text>
                {recommendation.benefits.map((benefit, index) => (
                  <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
                ))}
              </View>
            )}

            {recommendation.tips && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Tips:</Text>
                {recommendation.tips.map((tip, index) => (
                  <Text key={index} style={styles.tipItem}>• {tip}</Text>
                ))}
              </View>
            )}

            {recommendation.suggestions && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                {recommendation.suggestions.map((suggestion, index) => (
                  <Text key={index} style={styles.suggestionItem}>• {suggestion}</Text>
                ))}
              </View>
            )}

            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: color }]}
                onPress={() => handleRecommendationAction(recommendation)}
              >
                <Ionicons name="checkmark" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Take Action</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => handleDismiss(recommendation.id)}
              >
                <Ionicons name="close" size={16} color="#8E8E93" />
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderStats = () => {
    const stats = HealthRecommendationService.getRecommendationStats();
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.byPriority?.high || 0}</Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={32} color="#007AFF" />
          <Text style={styles.loadingText}>Loading health recommendations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎯 Health Recommendations</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}

      {showHeader && renderStats()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {recommendations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyMessage}>
              You&apos;re doing great! Check back later for new health recommendations.
            </Text>
          </View>
        ) : (
          recommendations.map(renderRecommendationCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recommendationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  recommendationMessage: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 12,
  },
  benefitsContainer: {
    marginBottom: 12,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  benefitItem: {
    fontSize: 13,
    color: '#3C3C43',
    marginBottom: 2,
  },
  tipsContainer: {
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  tipItem: {
    fontSize: 13,
    color: '#3C3C43',
    marginBottom: 2,
  },
  suggestionsContainer: {
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  suggestionItem: {
    fontSize: 13,
    color: '#3C3C43',
    marginBottom: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: '#8E8E93',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HealthRecommendations;
