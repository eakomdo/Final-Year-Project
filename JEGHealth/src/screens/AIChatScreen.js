import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { showError } from '../utils/NotificationHelper';
import ChatHistoryManager from '../utils/ChatHistoryManager';

// Simple text formatter for AI messages
const formatAIMessage = (text) => {
  if (!text) return text;
  
  // Simple formatting for basic markdown-like text
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers for now
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers for now
    .trim();
};

const AIChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm Dr. JEG, your AI health assistant. I'm here to help you with health-related questions, wellness tips, and general medical guidance. How can I assist you today?",
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const flatListRef = useRef(null);
  const router = useRouter();

  // Initialize conversation ID
  useEffect(() => {
    setCurrentConversationId(`conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Save conversation to history when messages change (and there are user messages)
  useEffect(() => {
    const saveConversationData = async () => {
      if (messages.length <= 1 || !currentConversationId) return; // Don't save initial message only
      
      const userMessages = messages.filter(msg => msg.isUser);
      if (userMessages.length === 0) return; // Don't save if no user messages
      
      const conversation = {
        id: currentConversationId,
        messages: messages,
        title: ChatHistoryManager.generateConversationTitle(messages),
        messageCount: messages.length,
      };

      try {
        await ChatHistoryManager.saveConversation(conversation);
        console.log('Conversation saved successfully');
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    };

    const debounceTimer = setTimeout(saveConversationData, 1000); // Debounce saves
    return () => clearTimeout(debounceTimer);
  }, [messages, currentConversationId]);

  // Generate conversation title from first user message
  const generateConversationTitle = (messages) => {
    return ChatHistoryManager.generateConversationTitle(messages);
  };

  // Start a new conversation
  const startNewConversation = () => {
    Alert.alert(
      'New Conversation',
      'Start a fresh conversation with Dr. JEG?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start New',
          onPress: () => {
            setCurrentConversationId(`conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
            setMessages([
              {
                id: `initial-${Date.now()}`,
                text: "Hello! I'm Dr. JEG, your AI health assistant. I'm here to help you with health-related questions, wellness tips, and general medical guidance. How can I assist you today?",
                isUser: false,
                timestamp: new Date().toISOString(),
              },
            ]);
          },
        },
      ]
    );
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Simulate AI responses (replace with actual AI service)
  const getAIResponse = async (userMessage) => {
    try {
      console.log('=== DR. JEG API CALL ===');
      console.log('Sending message to Dr. JEG:', userMessage);
      console.log('Current conversation ID:', currentConversationId);
      
      // Use the ChatHistoryManager to send message to Dr. JEG API
      const response = await ChatHistoryManager.sendMessage(userMessage, currentConversationId);
      
      console.log('Dr. JEG API response:', response);
      
      if (response) {
        // Update current conversation ID if this is a new conversation
        if (!currentConversationId && response.id) {
          setCurrentConversationId(response.id);
          console.log('Updated conversation ID:', response.id);
        }
        
        // Extract the AI response from the conversation data
        if (response.messages && response.messages.length > 0) {
          console.log('Found messages in response:', response.messages.length);
          const lastMessage = response.messages[response.messages.length - 1];
          if (!lastMessage.isUser && lastMessage.text) {
            console.log('Using AI message from conversation:', lastMessage.text);
            return lastMessage.text;
          }
        }
        
        // Check for direct response fields
        if (response.response) {
          console.log('Using direct response field:', response.response);
          return response.response;
        }
        
        if (response.message) {
          console.log('Using message field:', response.message);
          return response.message;
        }
        
        // Check for answer field
        if (response.answer) {
          console.log('Using answer field:', response.answer);
          return response.answer;
        }
        
        console.log('No valid response text found, using fallback');
        return "I'm here to help with your health questions!";
      } else {
        throw new Error('No response received from Dr. JEG');
      }
    } catch (error) {
      console.error('Error calling Dr. JEG API:', error);
      
      // Fallback to mock response if API fails
      const fallbackResponses = [
        "I apologize, but I'm having trouble connecting to my services right now. Please try again in a moment.",
        "I'm experiencing some technical difficulties. For immediate health concerns, please consult with a healthcare professional.",
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    const messageText = inputText.trim();
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(messageText);
      
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      showError('Error', 'Sorry, I encountered an issue. Please try again.');
      
      // Remove the user message if AI response failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble
      ]}>
        {!item.isUser && (
          <View style={styles.aiHeader}>
            <View style={styles.aiAvatar}>
              <Ionicons name="medical" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.aiName}>Dr. JEG</Text>
          </View>
        )}
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userText : styles.aiText
        ]}>
          {item.isUser ? item.text : formatAIMessage(item.text)}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage]}>
      <View style={[styles.messageBubble, styles.aiBubble]}>
        <View style={styles.aiHeader}>
          <View style={styles.aiAvatar}>
            <Ionicons name="medical" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.aiName}>Dr. JEG</Text>
        </View>
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.typingText}>Typing...</Text>
        </View>
      </View>
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
        <View style={styles.headerContent}>
          <View style={styles.headerAvatar}>
            <Ionicons name="medical" size={24} color={Colors.textOnPrimary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Dr. JEG</Text>
            <Text style={styles.headerSubtitle}>AI Health Assistant</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/chat-history')}
          >
            <Ionicons name="time-outline" size={24} color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={startNewConversation}
          >
            <Ionicons name="add" size={24} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id || `message-${index}`}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={10}
          windowSize={10}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Dr. JEG a health question..."
              placeholderTextColor={Colors.placeholder}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isTyping) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={(!inputText.trim() || isTyping) ? Colors.textTertiary : Colors.textOnPrimary} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            Dr. JEG provides general information only. Consult healthcare professionals for medical advice.
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textOnPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textOnPrimary,
    opacity: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.featureIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.textOnPrimary,
  },
  aiText: {
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.backgroundGray,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
});

export default AIChatScreen;