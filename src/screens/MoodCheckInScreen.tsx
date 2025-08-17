/**
 * MoodCheckInScreen
 * 
 * Multi-step mood check-in flow with crisis detection
 * Implements offline-first storage and therapeutic design
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MoodLevel, CrisisLevel } from '../types';
import { therapeuticColors, spacing, typography } from '../constants/theme';
import { crisisDetectionService, EMERGENCY_CONTACTS } from '../services/crisisDetection';
import { useActions, useMood } from '../store';
import MoodPicker from '../components/MoodTracker/MoodPicker';
import { TherapeuticButton } from '../components/common/TherapeuticButton';

interface MoodCheckInScreenProps {
  navigation: any;
}

const COMMON_TRIGGERS = [
  'Work/School', 'Relationships', 'Health', 'Money', 'Family',
  'Social Media', 'News', 'Sleep', 'Exercise', 'Weather'
];

export const MoodCheckInScreen: React.FC<MoodCheckInScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addMoodLog } = useActions();
  const { lastCheckIn } = useMood();

  // Check if user has already checked in today
  useEffect(() => {
    if (lastCheckIn) {
      const today = new Date().toDateString();
      const lastCheckInDate = new Date(lastCheckIn).toDateString();
      
      if (today === lastCheckInDate) {
        Alert.alert(
          'Already checked in today',
          'You\'ve already logged your mood today. Would you like to view your insights instead?',
          [
            { text: 'Go back', onPress: () => navigation.goBack() },
            { text: 'View insights', onPress: () => navigation.navigate('Insights') }
          ]
        );
      }
    }
  }, [lastCheckIn, navigation]);

  const handleMoodSelect = useCallback((mood: MoodLevel) => {
    setSelectedMood(mood);
    
    // Auto-advance after mood selection
    setTimeout(() => {
      setCurrentStep(2);
    }, 1000);
  }, []);

  const handleCrisisDetected = useCallback((level: CrisisLevel) => {
    if (level === 'IMMEDIATE') {
      Alert.alert(
        'We\'re here to help',
        'It sounds like you\'re going through a really tough time. Would you like immediate support?',
        [
          {
            text: 'Get help now',
            onPress: () => navigation.navigate('SOS', { immediate: true })
          },
          {
            text: 'I\'m safe, continue',
            style: 'cancel'
          }
        ]
      );
    } else if (level === 'MODERATE') {
      Alert.alert(
        'Support available',
        'Having a tough time? Support resources are available if you need them.',
        [
          {
            text: 'View resources',
            onPress: () => navigation.navigate('CrisisResources')
          },
          {
            text: 'Continue check-in',
            style: 'cancel'
          }
        ]
      );
    }
  }, [navigation]);

  const handleTriggerToggle = useCallback((trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  }, []);

  const handleNoteChange = useCallback(async (text: string) => {
    setNote(text);
    
    // Real-time crisis detection on note input
    if (text.length > 10) { // Only check meaningful text
      const detection = await crisisDetectionService.detectInText(text);
      if (detection.level !== 'NONE') {
        handleCrisisDetected(detection.level);
      }
    }
  }, [handleCrisisDetected]);

  const handleSubmit = useCallback(async () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    
    try {
      // Create mood log
      const moodLog = {
        mood: selectedMood,
        triggers: selectedTriggers,
        note: note.trim() || undefined,
        timestamp: new Date().toISOString()
      };
      
      // Add to store (handles offline storage and sync queue)
      addMoodLog(moodLog);
      
      // Show success and navigate
      Alert.alert(
        'Mood logged successfully',
        'Thank you for checking in. Here are some exercises that might help.',
        [
          {
            text: 'View recommendations',
            onPress: () => navigation.navigate('ExerciseRecommendations', { mood: selectedMood })
          }
        ]
      );
      
    } catch (error) {
      Alert.alert(
        'Something went wrong',
        'Your mood data is saved locally. We\'ll sync it when you\'re back online.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedMood, selectedTriggers, note, addMoodLog, navigation]);

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <MoodPicker
        selectedMood={selectedMood}
        onMoodSelect={handleMoodSelect}
        onCrisisDetected={handleCrisisDetected}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What might have influenced your mood?</Text>
      <Text style={styles.stepSubtitle}>Select any that apply (optional)</Text>
      
      <View style={styles.triggersGrid}>
        {COMMON_TRIGGERS.map((trigger) => (
          <TherapeuticButton
            key={trigger}
            title={trigger}
            variant={selectedTriggers.includes(trigger) ? 'primary' : 'secondary'}
            size="small"
            onPress={() => handleTriggerToggle(trigger)}
            style={styles.triggerButton}
          />
        ))}
      </View>
      
      <View style={styles.stepActions}>
        <TherapeuticButton
          title="Back"
          variant="ghost"
          onPress={() => setCurrentStep(1)}
          style={styles.backButton}
        />
        <TherapeuticButton
          title="Continue"
          variant="primary"
          onPress={() => setCurrentStep(3)}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Anything else you'd like to note?</Text>
      <Text style={styles.stepSubtitle}>Share what's on your mind (optional)</Text>
      
      <TextInput
        style={styles.noteInput}
        value={note}
        onChangeText={handleNoteChange}
        placeholder="How are you feeling? What's happening in your life?"
        placeholderTextColor={therapeuticColors.textSecondary}
        multiline
        numberOfLines={4}
        maxLength={500}
        accessibilityLabel="Mood note input"
        accessibilityHint="Optional text field to describe your current feelings"
      />
      
      <Text style={styles.characterCount}>{note.length}/500</Text>
      
      <View style={styles.stepActions}>
        <TherapeuticButton
          title="Back"
          variant="ghost"
          onPress={() => setCurrentStep(2)}
          style={styles.backButton}
        />
        <TherapeuticButton
          title="Complete Check-in"
          variant="primary"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!selectedMood}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentStep / 3) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>Step {currentStep} of 3</Text>
          </View>

          {/* Step content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  
  keyboardAvoid: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['8x'], // 32px
  },
  
  progressContainer: {
    paddingHorizontal: spacing['6x'], // 24px
    paddingVertical: spacing['4x'], // 16px
  },
  
  progressBar: {
    height: 4,
    backgroundColor: therapeuticColors.surface,
    borderRadius: 2,
    marginBottom: spacing['2x'], // 8px
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: therapeuticColors.primary,
    borderRadius: 2,
  },
  
  progressText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
  },
  
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing['6x'], // 24px
  },
  
  stepTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2x'], // 8px
  },
  
  stepSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['8x'], // 32px
  },
  
  triggersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing['2x'], // 8px
    marginBottom: spacing['8x'], // 32px
  },
  
  triggerButton: {
    marginHorizontal: spacing['1x'], // 4px
    marginVertical: spacing['1x'], // 4px
  },
  
  noteInput: {
    ...typography.body,
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['4x'], // 16px
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'], // 8px
  },
  
  characterCount: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing['8x'], // 32px
  },
  
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing['4x'], // 16px
  },
  
  backButton: {
    flex: 1,
  },
});

export default MoodCheckInScreen;
