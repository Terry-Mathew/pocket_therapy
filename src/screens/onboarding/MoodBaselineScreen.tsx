/**
 * MoodBaselineScreen
 * 
 * Onboarding screen to establish user's mood baseline
 * with therapeutic explanations and gentle guidance
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { MoodLevel } from '../../types';

interface MoodBaselineScreenProps {
  navigation: any;
}

const MOOD_OPTIONS = [
  { 
    level: 1 as MoodLevel, 
    emoji: '😢', 
    label: 'Very sad', 
    description: 'Feeling very down, distressed, or overwhelmed'
  },
  { 
    level: 2 as MoodLevel, 
    emoji: '😕', 
    label: 'Sad', 
    description: 'Feeling low, unhappy, or a bit down'
  },
  { 
    level: 3 as MoodLevel, 
    emoji: '😐', 
    label: 'Neutral', 
    description: 'Feeling okay, neither particularly good nor bad'
  },
  { 
    level: 4 as MoodLevel, 
    emoji: '🙂', 
    label: 'Good', 
    description: 'Feeling positive, content, or generally well'
  },
  { 
    level: 5 as MoodLevel, 
    emoji: '😊', 
    label: 'Great', 
    description: 'Feeling very happy, energetic, or excellent'
  }
];

export const MoodBaselineScreen: React.FC<MoodBaselineScreenProps> = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);

  const handleMoodSelect = useCallback((mood: MoodLevel) => {
    setSelectedMood(mood);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedMood) {
      // Store baseline mood for future reference
      console.log('Baseline mood:', selectedMood);
      navigation.navigate('TriggerSelection');
    }
  }, [selectedMood, navigation]);

  const handleSkip = useCallback(() => {
    navigation.navigate('TriggerSelection');
  }, [navigation]);

  const renderMoodOption = (option: typeof MOOD_OPTIONS[0]) => {
    const isSelected = selectedMood === option.level;
    
    return (
      <TouchableOpacity
        key={option.level}
        style={[
          styles.moodOption,
          isSelected && styles.selectedMoodOption
        ]}
        onPress={() => handleMoodSelect(option.level)}
        accessibilityLabel={`Select ${option.label} mood`}
        accessibilityHint={option.description}
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={[
          styles.moodEmoji,
          isSelected && styles.selectedEmoji
        ]}>
          {option.emoji}
        </Text>
        <Text style={[
          styles.moodLabel,
          isSelected && styles.selectedLabel
        ]}>
          {option.label}
        </Text>
        {isSelected && (
          <Text style={styles.moodDescription}>
            {option.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling right now?</Text>
          <Text style={styles.subtitle}>
            This helps us understand your starting point. There's no right or wrong answer.
          </Text>
        </View>

        {/* Explanation */}
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Why we ask this</Text>
          <Text style={styles.explanationText}>
            Understanding your current mood helps us:
          </Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>• Suggest exercises that match how you're feeling</Text>
            <Text style={styles.benefitItem}>• Track your progress over time</Text>
            <Text style={styles.benefitItem}>• Provide personalized support</Text>
          </View>
        </View>

        {/* Mood Options */}
        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map(renderMoodOption)}
        </View>

        {/* Reassurance */}
        <View style={styles.reassuranceContainer}>
          <Text style={styles.reassuranceText}>
            💡 Remember: Moods change throughout the day. This is just a starting point to help us support you better.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedMood && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={!selectedMood}
            accessibilityLabel="Continue with selected mood"
            accessibilityState={{ disabled: !selectedMood }}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedMood && styles.disabledButtonText
            ]}>
              Continue
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityLabel="Skip mood baseline setup"
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['6x'], // 24px
    paddingBottom: spacing['8x'], // 32px
  },
  
  header: {
    alignItems: 'center',
    paddingTop: spacing['8x'], // 32px
    paddingBottom: spacing['6x'], // 24px
  },
  
  title: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['4x'], // 16px
  },
  
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  explanationContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['5x'], // 20px
    marginBottom: spacing['8x'], // 32px
    borderLeftWidth: 4,
    borderLeftColor: therapeuticColors.primary,
  },
  
  explanationTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['3x'], // 12px
  },
  
  explanationText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['3x'], // 12px
  },
  
  benefitsList: {
    paddingLeft: spacing['2x'], // 8px
  },
  
  benefitItem: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['1x'], // 4px
    lineHeight: 20,
  },
  
  moodGrid: {
    gap: spacing['4x'], // 16px
    marginBottom: spacing['8x'], // 32px
  },
  
  moodOption: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['5x'], // 20px
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  selectedMoodOption: {
    borderColor: therapeuticColors.primary,
    backgroundColor: therapeuticColors.primary + '10', // 10% opacity
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  
  moodEmoji: {
    fontSize: 48,
    marginBottom: spacing['2x'], // 8px
  },
  
  selectedEmoji: {
    transform: [{ scale: 1.1 }],
  },
  
  moodLabel: {
    ...typography.h3,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['2x'], // 8px
  },
  
  selectedLabel: {
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  
  moodDescription: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  reassuranceContainer: {
    backgroundColor: therapeuticColors.accent + '15', // 15% opacity
    borderRadius: 12,
    padding: spacing['4x'], // 16px
    marginBottom: spacing['8x'], // 32px
  },
  
  reassuranceText: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  actionButtons: {
    gap: spacing['4x'], // 16px
    marginTop: 'auto',
    paddingTop: spacing['6x'], // 24px
  },
  
  continueButton: {
    backgroundColor: therapeuticColors.primary,
    borderRadius: 28,
    paddingVertical: spacing['4x'], // 16px
    paddingHorizontal: spacing['6x'], // 24px
    alignItems: 'center',
    marginBottom: spacing['2x'], // 8px
  },
  
  disabledButton: {
    backgroundColor: therapeuticColors.textSecondary,
    opacity: 0.5,
  },
  
  continueButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  disabledButtonText: {
    opacity: 0.7,
  },
  
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    paddingVertical: spacing['4x'], // 16px
    paddingHorizontal: spacing['6x'], // 24px
    alignItems: 'center',
    opacity: 0.8,
  },
  
  skipButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
});

export default MoodBaselineScreen;
