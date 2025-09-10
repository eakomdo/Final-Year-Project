import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { showSuccess, showError } from '../utils/NotificationHelper';

const ChatDetailScreen = () => {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef(null);

  // Load conversation data
  useEffect(() => {
    const loadConversation = async () => {
      try {
        if (params.conversationData) {
          const conversationData = JSON.parse(params.conversationData);
          setConversation(conversationData);
        } else if (params.conversationId) {
          // Fallback: load from storage if only ID is provided
          const savedConversations = await AsyncStorage.getItem('chatHistory');
          if (savedConversations) {
            try {
              const conversations = JSON.parse(savedConversations);
              // Ensure conversations is an array
              if (Array.isArray(conversations)) {
                const foundConversation = conversations.find(conv => conv && conv.id === params.conversationId);
                if (foundConversation) {
                  setConversation(foundConversation);
                } else {
                  showError('Error', 'Conversation not found');
                  router.back();
                }
              } else {
                showError('Error', 'Invalid conversation data');
                router.back();
              }
            } catch (parseError) {
              console.error('Failed to parse conversation data:', parseError);
              showError('Error', 'Failed to load conversation');
              router.back();
            }
          }
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        showError('Error', 'Failed to load conversation');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [params.conversationData, params.conversationId, router]);

  // Format timestamp for messages
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Delete this conversation
  const deleteConversation = () => {
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
            try {
              const savedConversations = await AsyncStorage.getItem('chatHistory');
              if (savedConversations) {
                try {
                  const conversations = JSON.parse(savedConversations);
                  // Ensure conversations is an array before filtering
                  if (Array.isArray(conversations)) {
                    const updatedConversations = conversations.filter(conv => conv && conv.id !== conversation.id);
                    await AsyncStorage.setItem('chatHistory', JSON.stringify(updatedConversations));
                    showSuccess('Success', 'Conversation deleted');
                    router.back();
                  } else {
                    showError('Error', 'Invalid conversation data');
                  }
                } catch (parseError) {
                  console.error('Failed to parse conversation data for deletion:', parseError);
                  showError('Error', 'Failed to delete conversation');
                }
              }
            } catch (error) {
              showError('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  // Share conversation
  const shareConversation = async () => {
    try {
      // Ensure conversation and messages exist
      if (!conversation || !Array.isArray(conversation.messages)) {
        showError('Error', 'No conversation data to share');
        return;
      }
      
      const conversationText = conversation.messages
        .map(msg => msg && msg.text ? `${msg.isUser ? 'You' : 'Dr. JEG'}: ${msg.text}` : '')
        .filter(text => text.length > 0)
        .join('\n\n');
      
      const shareContent = `Dr. JEG Conversation\n\n${conversationText}`;
      
      await Share.share({
        message: shareContent,
        title: 'Dr. JEG Chat History',
      });
    } catch (error) {
      showError('Error', 'Failed to share conversation');
    }
  };

  // Continue conversation (navigate back to chat with this context)
  const continueConversation = () => {
    // This would require updating the main chat screen to accept conversation context
    Alert.alert(
      'Continue Conversation',
      'This will start a new chat session. Previous context may not be maintained.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => router.push('/(tabs)/ai-chat'),
        },
      ]
    );
  };

  // Render message item
  const renderMessage = ({ item, index }) => {
    const isUser = item.isUser;
    const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
    const showTimestamp = index === 0 || 
      (messages[index - 1] && 
       new Date(item.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000); // 5 minutes

    return (
      <View style={styles.messageWrapper}>
        {showTimestamp && (
          <Text style={[styles.timestamp, { color: theme.subText }]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        )}
        <View style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage
        ]}>
          <View style={[
            styles.messageBubble,
            isUser ? { backgroundColor: theme.primary } : { backgroundColor: theme.card }
          ]}>
            {!isUser && (
              <View style={styles.aiHeader}>
                <Ionicons name="medical" size={16} color={theme.primary} />
                <Text style={[styles.aiName, { color: theme.primary }]}>Dr. JEG</Text>
              </View>
            )}
            <Text style={[
              styles.messageText,
              isUser 
                ? { color: theme.buttonText || '#fff' }
                : { color: theme.text }
            ]}>
              {item.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading conversation...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>
            Conversation not found
          </Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backToHistoryButton, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.backToHistoryText, { color: theme.buttonText }]}>
              Back to History
            </Text>
          </TouchableOpacity>
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
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, dynamicStyles.text]} numberOfLines={1}>
            {conversation.title || 'Chat with Dr. JEG'}
          </Text>
          <Text style={[styles.headerSubtitle, dynamicStyles.subText]}>
            {new Date(conversation.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={shareConversation} style={styles.headerButton}>
            <Ionicons name="share-outline" size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteConversation} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={22} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={Array.isArray(conversation.messages) ? conversation.messages : []}
        keyExtractor={(item, index) => item?.id || `message-${index}-${Date.now()}`}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Footer Actions */}
      <View style={[styles.footer, dynamicStyles.card, dynamicStyles.border]}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: theme.primary }]}
          onPress={continueConversation}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color={theme.buttonText || '#fff'} />
          <Text style={[styles.continueButtonText, { color: theme.buttonText || '#fff' }]}>
            Continue Conversation
          </Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backToHistoryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backToHistoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  timestamp: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ChatDetailScreen;
