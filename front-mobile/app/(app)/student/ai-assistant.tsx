// @ts-nocheck - Disable TypeScript checking for this file to avoid style type conflicts
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '../../../theme';
import { aiProfileService } from '../../../services/ai-profile';
import { messageService } from '../../../services/message';

const AIAssistantScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Function to navigate to a chat with the AI assistant
  const navigateToAIChat = async (initialPrompt = '') => {
    try {
      setLoading(true);
      
      // Get AI assistant ID
      const AI_ASSISTANT_ID = 'ai-assistant-1';
      
      // If there's an initial prompt, send it immediately
      if (initialPrompt) {
        await messageService.sendMessage({
          receiverId: AI_ASSISTANT_ID,
          subject: 'AI Assistance',
          content: initialPrompt
        });
      }
      
      // Navigate to messages screen
      router.push('/student/messages');
      
      // Need to set active conversation to AI assistant
      // This will be done through state management in a real app
      
    } catch (error) {
      console.error('Error navigating to AI chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Capabilities of the AI assistant
  const capabilities = [
    {
      title: 'Homework Help',
      description: 'Get assistance with assignments, explanations for difficult concepts, and guided problem-solving.',
      icon: 'book-outline',
      prompt: 'I need help with my homework assignment.'
    },
    {
      title: 'Exam Preparation',
      description: 'Prepare for exams with practice questions, summaries of key topics, and study strategies.',
      icon: 'school-outline',
      prompt: 'Help me prepare for my upcoming exam.'
    },
    {
      title: 'Learning Support',
      description: 'Get personalized explanations for complex topics and additional learning resources.',
      icon: 'bulb-outline',
      prompt: 'Can you explain this concept in a way that\'s easier to understand?'
    },
    {
      title: 'Planning & Organization',
      description: 'Get help with planning study schedules, organizing assignments, and managing deadlines.',
      icon: 'calendar-outline',
      prompt: 'Help me create a study plan for the next two weeks.'
    },
    {
      title: 'Research Assistance',
      description: 'Get guidance on research projects, sources, and structuring papers or presentations.',
      icon: 'search-outline',
      prompt: 'I need help finding sources for my research paper.'
    }
  ];

  // Render capability card
  const renderCapabilityCard = (capability, index) => (
    <TouchableOpacity 
      key={index}
      style={styles.capabilityCard}
      onPress={() => navigateToAIChat(capability.prompt)}
      disabled={loading}
    >
      <View style={styles.capabilityIconContainer}>
        <Ionicons name={capability.icon} size={32} color={COLORS.secondary.DEFAULT} />
      </View>
      <View style={styles.capabilityContent}>
        <Text style={styles.capabilityTitle}>{capability.title}</Text>
        <Text style={styles.capabilityDescription}>{capability.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.grey[400]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Assistant</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.aiIconContainer}>
            <Ionicons name="sparkles" size={48} color={COLORS.secondary.DEFAULT} />
          </View>
          <Text style={styles.heroTitle}>Your Personal Learning Assistant</Text>
          <Text style={styles.heroDescription}>
            Get help with homework, exam preparation, and more using our AI-powered assistant.
          </Text>
          <TouchableOpacity 
            style={styles.startChatButton}
            onPress={() => navigateToAIChat()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.startChatButtonText}>Start a Conversation</Text>
                <Ionicons name="chatbubble-outline" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.capabilitiesSection}>
          <Text style={styles.sectionTitle}>What I Can Help With</Text>
          {capabilities.map(renderCapabilityCard)}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips for Best Results</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipNumber}>1</Text>
            <Text style={styles.tipText}>Be specific in your questions for more accurate answers.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipNumber}>2</Text>
            <Text style={styles.tipText}>Ask follow-up questions if you need more clarification.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipNumber}>3</Text>
            <Text style={styles.tipText}>Use the suggested prompts for quick assistance.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  aiIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  startChatButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary.DEFAULT,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startChatButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  capabilitiesSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  capabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  capabilityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  capabilityContent: {
    flex: 1,
  },
  capabilityTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  capabilityDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  tipsSection: {
    marginBottom: SPACING.xl,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary.light,
    color: COLORS.secondary.DEFAULT,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    marginRight: SPACING.md,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
});

export default AIAssistantScreen; 
 
 
 