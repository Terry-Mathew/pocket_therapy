/**
 * TriggerSelectionScreen
 * 
 * Onboarding screen for selecting common triggers and goals
 * to personalize the user experience
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

interface TriggerSelectionScreenProps {
  navigation: any;
}

const COMMON_TRIGGERS = [
  { id: 'exams', label: 'Exams & Tests', emoji: '📚' },
  { id: 'work', label: 'Work Stress', emoji: '💼' },
  { id: 'social', label: 'Social Situations', emoji: '👥' },
  { id: 'family', label: 'Family Issues', emoji: '🏠' },
  { id: 'relationships', label: 'Relationships', emoji: '💕' },
  { id: 'money', label: 'Financial Worries', emoji: '💰' },
  { id: 'health', label: 'Health Concerns', emoji: '🏥' },
  { id: 'future', label: 'Future Uncertainty', emoji: '🔮' },
  { id: 'sleep', label: 'Sleep Issues', emoji: '😴' },
  { id: 'news', label: 'News & World Events', emoji: '📰' },
];

const WELLNESS_GOALS = [
  { id: 'anxiety', label: 'Manage anxiety better', emoji: '🌊' },
  { id: 'sleep', label: 'Improve sleep quality', emoji: '🌙' },
  { id: 'stress', label: 'Reduce daily stress', emoji: '🍃' },
  { id: 'focus', label: 'Better focus & concentration', emoji: '🎯' },
  { id: 'confidence', label: 'Build self-confidence', emoji: '💪' },
  { id: 'relationships', label: 'Improve relationships', emoji: '🤝' },
  { id: 'mindfulness', label: 'Be more mindful', emoji: '🧘' },
  { id: 'emotions', label: 'Understand my emotions', emoji: '🌈' },
];

export const TriggerSelectionScreen: React.FC<TriggerSelectionScreenProps> = ({ navigation }) => {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const handleTriggerToggle = useCallback((triggerId: string) => {
    setSelectedTriggers(prev => 
      prev.includes(triggerId)
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    );
  }, []);

  const handleGoalToggle = useCallback((goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else if (prev.length < 2) {
        return [...prev, goalId];
      } else {
        // Replace the first goal if already at limit
        return [prev[1], goalId];
      }
    });
  }, []);

  const handleContinue = useCallback(() => {
    // Store selected triggers and goals
    console.log('Selected triggers:', selectedTriggers);
    console.log('Selected goals:', selectedGoals);
    navigation.navigate('PreferencesSetup');
  }, [selectedTriggers, selectedGoals, navigation]);

  const handleSkip = useCallback(() => {
    navigation.navigate('PreferencesSetup');
  }, [navigation]);

  const renderTriggerChip = (trigger: typeof COMMON_TRIGGERS[0]) => {
    const isSelected = selectedTriggers.includes(trigger.id);
    
    return (
      <TouchableOpacity
        key={trigger.id}
        style={[
          styles.chip,
          isSelected && styles.selectedChip
        ]}
        onPress={() => handleTriggerToggle(trigger.id)}
        accessibilityLabel={`${trigger.label} trigger - ${isSelected ? 'selected' : 'not selected'}`}
        accessibilityHint={`Tap to ${isSelected ? 'deselect' : 'select'} ${trigger.label} as a trigger`}
      >
        <Text style={[
          styles.chipText,
          isSelected && styles.selectedChipText
        ]}>
          {trigger.emoji} {trigger.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderGoalChip = (goal: typeof WELLNESS_GOALS[0]) => {
    const isSelected = selectedGoals.includes(goal.id);
    const isDisabled = !isSelected && selectedGoals.length >= 2;
    
    return (
      <TouchableOpacity
        key={goal.id}
        style={[
          styles.chip,
          isSelected && styles.selectedChip,
          isDisabled && styles.disabledChip
        ]}
        onPress={() => handleGoalToggle(goal.id)}
        disabled={isDisabled}
        accessibilityLabel={`${goal.label} goal - ${isSelected ? 'selected' : 'not selected'}`}
        accessibilityHint={`Tap to ${isSelected ? 'deselect' : 'select'} ${goal.label} as a goal`}
        accessibilityState={{ disabled: isDisabled }}
      >
        <Text style={[
          styles.chipText,
          isSelected && styles.selectedChipText,
          isDisabled && styles.disabledChipText
        ]}>
          {goal.emoji} {goal.label}
        </Text>
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
          <Text style={styles.title}>Let's personalize your experience</Text>
          <Text style={styles.subtitle}>
            Help us understand what affects your mood and what you'd like to work on.
          </Text>
        </View>

        {/* Triggers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What tends to affect your mood?</Text>
          <Text style={styles.sectionSubtitle}>
            Select any that apply. This helps us provide relevant support.
          </Text>
          
          <View style={styles.chipGrid}>
            {COMMON_TRIGGERS.map(renderTriggerChip)}
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to work on?</Text>
          <Text style={styles.sectionSubtitle}>
            Choose 1-2 goals to focus on. You can always change these later.
          </Text>
          
          <View style={styles.chipGrid}>
            {WELLNESS_GOALS.map(renderGoalChip)}
          </View>
          
          {selectedGoals.length > 0 && (
            <Text style={styles.goalCounter}>
              {selectedGoals.length}/2 goals selected
            </Text>
          )}
        </View>

        {/* Explanation */}
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationText}>
            💡 This information helps us suggest exercises and insights that are most relevant to you. Everything stays private on your device.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            accessibilityLabel="Continue to preferences setup"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityLabel="Skip trigger and goal selection"
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
  
  section: {
    marginBottom: spacing['8x'], // 32px
  },
  
  sectionTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'], // 8px
  },
  
  sectionSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['6x'], // 24px
    lineHeight: 22,
  },
  
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3x'], // 12px
  },
  
  chip: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing['4x'], // 16px
    paddingVertical: spacing['3x'], // 12px
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: spacing['2x'], // 8px
  },
  
  selectedChip: {
    backgroundColor: therapeuticColors.primary + '20',
    borderColor: therapeuticColors.primary,
  },
  
  disabledChip: {
    opacity: 0.5,
  },
  
  chipText: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
  },
  
  selectedChipText: {
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  
  disabledChipText: {
    opacity: 0.6,
  },
  
  goalCounter: {
    ...typography.caption,
    color: therapeuticColors.primary,
    textAlign: 'center',
    marginTop: spacing['4x'], // 16px
    fontWeight: '500',
  },
  
  explanationContainer: {
    backgroundColor: therapeuticColors.accent + '15', // 15% opacity
    borderRadius: 12,
    padding: spacing['4x'], // 16px
    marginBottom: spacing['8x'], // 32px
  },
  
  explanationText: {
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
  
  continueButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
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

export default TriggerSelectionScreen;
