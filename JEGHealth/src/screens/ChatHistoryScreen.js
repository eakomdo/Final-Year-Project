import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { showSuccess, showError } from '../utils/NotificationHelper';
import ChatHistoryManager from '../utils/ChatHistoryManager';

const ChatHistoryScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  // Load conversations from storage
  const loadConversations = async () => {
    try {
      const loadedConversations = await ChatHistoryManager.loadConversations();
      // Ensure we have a valid array
      const validConversations = Array.isArray(loadedConversations) ? loadedConversations : [];
      setConversations(validConversations);
      setFilteredConversations(validConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      showError('Error', 'Failed to load chat history');
      // Set empty arrays as fallback
      setConversations([]);
      setFilteredConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        // Ensure conversations is an array before setting
        setFilteredConversations(Array.isArray(conversations) ? conversations : []);
      } else {
        const results = await ChatHistoryManager.searchConversations(searchQuery);
        // Ensure results is an array
        setFilteredConversations(Array.isArray(results) ? results : []);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, conversations]);

  // Delete single conversation
  const deleteConversation = (conversationId) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await ChatHistoryManager.deleteConversation(conversationId);
            if (success) {
              await loadConversations(); // Reload to update the list
              showSuccess('Success', 'Conversation deleted');
            } else {
              showError('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  // Clear all conversations
  const clearAllHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all conversations? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const success = await ChatHistoryManager.clearAllHistory();
            if (success) {
              setConversations([]);
              setFilteredConversations([]);
              showSuccess('Success', 'All conversations cleared');
            } else {
              showError('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  // Open conversation detail
  const openConversation = (conversation) => {
    // Navigate to chat detail screen with conversation data
    router.push({
      pathname: '/chat-detail',
      params: { 
        conversationId: conversation.id,
        conversationData: JSON.stringify(conversation)
      }
    });
  };

  // Refresh conversations
  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Generate conversation title from first message
  const generateConversationTitle = (messages) => {
    return ChatHistoryManager.generateConversationTitle(messages);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Render individual conversation item
  const renderConversationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.conversationItem, { backgroundColor: theme.card }]}
      onPress={() => openConversation(item)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title || generateConversationTitle(item.messages)}
          </Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteConversation(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.conversationMeta}>
          <Text style={[styles.messageCount, { color: theme.subText }]}>
            {item.messages.length} messages
          </Text>
          <Text style={[styles.dateText, { color: theme.subText }]}>
            {formatDate(item.lastUpdated)}
          </Text>
        </View>
        
        {/* Preview of last message */}
        {item.messages.length > 1 && (
          <Text 
            style={[styles.lastMessage, { color: theme.subText }]} 
            numberOfLines={2}
          >
            {item.messages[item.messages.length - 1].text}
          </Text>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={theme.subText} />
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={80} color={theme.subText} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Chat History
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.subText }]}>
        Start a conversation with Dr. JEG to see your chat history here.
      </Text>
      <TouchableOpacity
        style={[styles.startChatButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/(tabs)/ai-chat')}
      >
        <Text style={[styles.startChatText, { color: theme.buttonText }]}>
          Start New Chat
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading chat history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    card: { backgroundColor: theme.card },
    text: { color: theme.text },
    subText: { color: theme.subText },
    primary: { color: theme.primary },
    border: { borderColor: theme.border },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.card, dynamicStyles.border]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        {!showSearch ? (
          <>
            <Text style={[styles.headerTitle, dynamicStyles.text]}>Chat History</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => setShowSearch(true)} 
                style={styles.headerButton}
              >
                <Ionicons name="search-outline" size={24} color={theme.text} />
              </TouchableOpacity>
              {conversations.length > 0 && (
                <TouchableOpacity onPress={clearAllHistory} style={styles.headerButton}>
                  <Ionicons name="trash-outline" size={24} color={theme.error} />
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            <TextInput
              style={[styles.searchInput, { 
                color: theme.text, 
                backgroundColor: theme.background,
                borderColor: theme.border 
              }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search conversations..."
              placeholderTextColor={theme.subText}
              autoFocus
            />
            <TouchableOpacity 
              onPress={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              style={styles.headerButton}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item, index) => item?.id || `conversation-${index}-${Date.now()}`}
        renderItem={renderConversationItem}
        contentContainerStyle={[
          styles.listContainer,
          filteredConversations.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={() => 
          searchQuery ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={80} color={theme.subText} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Results Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.subText }]}>
                Try adjusting your search terms.
              </Text>
            </View>
          ) : renderEmptyState()
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  conversationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  conversationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  startChatButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startChatText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatHistoryScreen;
