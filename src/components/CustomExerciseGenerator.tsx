/**
 * Custom Exercise Generator Component
 * 
 * Allows users to generate personalized exercises using AI
 * based on their current mood, available time, and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';

interface CustomExerciseGeneratorProps {
  currentMood: number;
  onExerciseGenerated: (exercise: any) => void;
  onClose: () => void;
}

export const CustomExerciseGenerator: React.FC<CustomExerciseGeneratorProps> = ({
  currentMood,
  onExerciseGenerated,
  onClose,
}) => {
  const { actions } = useAppStore();
  
  const [selectedTime, setSelectedTime] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [selectedStressLevel, setSelectedStressLevel] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const timeOptions = [
    { value: 2, label: '2 minutes', description: 'Quick relief' },
    { value: 5, label: '5 minutes', description: 'Short practice' },
    { value: 10, label: '10 minutes', description: 'Focused session' },
    { value: 15, label: '15 minutes', description: 'Deep practice' },
  ];

  const categoryOptions = [
    { value: 'breathing', label: 'Breathing', emoji: '🫁', description: 'Focus on breath work' },
    { value: 'grounding', label: 'Grounding', emoji: '🌱', description: 'Connect with the present' },
    { value: 'cognitive', label: 'Cognitive', emoji: '🧠', description: 'Reframe thoughts' },
    { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘', description: 'Awareness practice' },
  ];

  const environmentOptions = [
    { value: 'home', label: 'At Home', emoji: '🏠' },
    { value: 'work', label: 'At Work', emoji: '💼' },
    { value: 'public', label: 'In Public', emoji: '🚶' },
    { value: 'outdoors', label: 'Outdoors', emoji: '🌳' },
  ];

  const stressLevelOptions = [
    { value: 'low', label: 'Low Stress', emoji: '😌' },
    { value: 'medium', label: 'Medium Stress', emoji: '😐' },
    { value: 'high', label: 'High Stress', emoji: '😰' },
  ];

  const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };

  const handleGenerateExercise = async () => {
    try {
      setIsGenerating(true);

      const context = {
        mood: currentMood,
        timeOfDay: getCurrentTimeOfDay(),
        availableTime: selectedTime,
        preferredCategory: selectedCategory || undefined,
        environment: selectedEnvironment || undefined,
        stressLevel: selectedStressLevel || undefined,
      };

      const customExercise = await actions.generateCustomExercise(context);

      if (customExercise) {
        onExerciseGenerated(customExercise);
        Alert.alert(
          'Exercise Generated! ✨',
          `Created "${customExercise.title}" just for you. Ready to try it?`,
          [
            { text: 'Maybe Later', style: 'cancel' },
            { text: 'Start Exercise', onPress: () => onClose() },
          ]
        );
      } else {
        Alert.alert(
          'Generation Failed',
          'Unable to generate a custom exercise right now. Please try again or choose from our library.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to generate custom exercise:', error);
      Alert.alert(
        'Something Went Wrong',
        'We had trouble creating your exercise. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const renderOptionGroup = (
    title: string,
    options: any[],
    selectedValue: string,
    onSelect: (value: string) => void,
    allowDeselect = true
  ) => (
    <View style={styles.optionGroup}>
      <Text style={styles.optionGroupTitle}>{title}</Text>
      <View style={styles.optionGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              selectedValue === option.value && styles.optionButtonSelected,
            ]}
            onPress={() => {
              if (allowDeselect && selectedValue === option.value) {
                onSelect('');
              } else {
                onSelect(option.value);
              }
            }}
          >
            {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
            <Text style={[
              styles.optionLabel,
              selectedValue === option.value && styles.optionLabelSelected,
            ]}>
              {option.label}
            </Text>
            {option.description && (
              <Text style={[
                styles.optionDescription,
                selectedValue === option.value && styles.optionDescriptionSelected,
              ]}>
                {option.description}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Exercise ✨</Text>
          <Text style={styles.description}>
            Let's create a personalized exercise based on how you're feeling right now
          </Text>
        </View>

        <View style={styles.moodDisplay}>
          <Text style={styles.moodLabel}>Current Mood</Text>
          <Text style={styles.moodValue}>{currentMood}/5</Text>
        </View>

        {renderOptionGroup(
          'How much time do you have?',
          timeOptions,
          selectedTime.toString(),
          (value) => setSelectedTime(parseInt(value)),
          false
        )}

        {renderOptionGroup(
          'What type of exercise? (optional)',
          categoryOptions,
          selectedCategory,
          setSelectedCategory
        )}

        {renderOptionGroup(
          'Where are you? (optional)',
          environmentOptions,
          selectedEnvironment,
          setSelectedEnvironment
        )}

        {renderOptionGroup(
          'How stressed do you feel? (optional)',
          stressLevelOptions,
          selectedStressLevel,
          setSelectedStressLevel
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerateExercise}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={therapeuticColors.background} />
            ) : (
              <Text style={styles.generateButtonText}>Generate Exercise</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.aiNote}>
          <Text style={styles.aiNoteText}>
            💡 This exercise will be created using AI based on your current state and preferences. 
            Each exercise is unique and designed specifically for you.
          </Text>
        </View>
      </ScrollView>
    </View>
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
  header: {
    padding: spacing['4x'],
    paddingBottom: spacing['6x'],
  },
  title: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  moodDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: therapeuticColors.primary + '10',
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['6x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: therapeuticColors.primary,
  },
  moodLabel: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '500',
  },
  moodValue: {
    ...typography.h3,
    color: therapeuticColors.primary,
    fontWeight: '700',
  },
  optionGroup: {
    marginBottom: spacing['6x'],
  },
  optionGroupTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['3x'],
    paddingHorizontal: spacing['4x'],
  },
  optionGrid: {
    paddingHorizontal: spacing['4x'],
  },
  optionButton: {
    backgroundColor: therapeuticColors.surface,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    borderRadius: 12,
    padding: spacing['4x'],
    marginBottom: spacing['2x'],
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: therapeuticColors.primary + '20',
    borderColor: therapeuticColors.primary,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: spacing['2x'],
  },
  optionLabel: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  optionLabelSelected: {
    color: therapeuticColors.primary,
  },
  optionDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
  },
  optionDescriptionSelected: {
    color: therapeuticColors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing['3x'],
    paddingHorizontal: spacing['4x'],
    marginBottom: spacing['4x'],
  },
  cancelButton: {
    flex: 1,
    backgroundColor: therapeuticColors.surface,
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  generateButton: {
    flex: 2,
    backgroundColor: therapeuticColors.primary,
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  aiNote: {
    backgroundColor: therapeuticColors.secondary + '10',
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['6x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: therapeuticColors.secondary,
  },
  aiNoteText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default CustomExerciseGenerator;
