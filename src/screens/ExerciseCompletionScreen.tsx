/**
 * Exercise Completion Screen
 * 
 * Gentle completion flow with helpfulness rating,
 * optional notes, and celebration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';

interface ExerciseCompletionScreenProps {
  route: {
    params: {
      exerciseId: string;
      exerciseTitle: string;
      duration: number;
    };
  };
  navigation: any;
}

export const ExerciseCompletionScreen: React.FC<ExerciseCompletionScreenProps> = ({
  route,
  navigation,
}) => {
  const { exerciseId, exerciseTitle, duration } = route.params;
  const { actions } = useAppStore();
  
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Gentle entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      
      // Complete the exercise with rating and notes
      actions.completeExercise(rating || undefined, notes || undefined);
      
      // Small delay for gentle UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate back to home or exercises
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to complete exercise:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Complete without rating/notes
    actions.completeExercise();
    navigation.navigate('Home');
  };

  const renderRatingStars = () => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>How helpful was this exercise?</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              style={styles.starButton}
              onPress={() => handleRatingSelect(star)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.starText,
                { color: rating && star <= rating ? therapeuticColors.primary : therapeuticColors.border }
              ]}>
                ⭐
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.ratingLabels}>
          <Text style={styles.ratingLabelText}>Not helpful</Text>
          <Text style={styles.ratingLabelText}>Very helpful</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Celebration Header */}
          <View style={styles.celebrationHeader}>
            <Text style={styles.celebrationEmoji}>🌟</Text>
            <Text style={styles.celebrationTitle}>Well done!</Text>
            <Text style={styles.celebrationSubtitle}>
              You completed "{exerciseTitle}"
            </Text>
            <Text style={styles.durationText}>
              {Math.ceil(duration / 60)} minutes of self-care
            </Text>
          </View>

          {/* Rating Section */}
          {renderRatingStars()}

          {/* Optional Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>
              How are you feeling? (optional)
            </Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Share your thoughts or feelings..."
              placeholderTextColor={therapeuticColors.textTertiary}
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {notes.length}/200
            </Text>
          </View>

          {/* Gentle Encouragement */}
          <View style={styles.encouragementContainer}>
            <Text style={styles.encouragementText}>
              Every small step matters. You're taking care of yourself, and that's something to be proud of.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.completeButton,
              { opacity: isSubmitting ? 0.6 : 1 }
            ]}
            onPress={handleComplete}
            disabled={isSubmitting}
          >
            <Text style={styles.completeButtonText}>
              {isSubmitting ? 'Saving...' : 'Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  content: {
    flex: 1,
    padding: spacing['4x'],
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: spacing['6x'],
    paddingVertical: spacing['4x'],
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: spacing['2x'],
  },
  celebrationTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['1x'],
  },
  celebrationSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['1x'],
  },
  durationText: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  ratingContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['4x'],
    marginBottom: spacing['4x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  ratingLabel: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['3x'],
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing['2x'],
  },
  starButton: {
    padding: spacing['2x'],
    marginHorizontal: spacing['1x'],
  },
  starText: {
    fontSize: 32,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2x'],
  },
  ratingLabelText: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
  },
  notesContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['4x'],
    marginBottom: spacing['4x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  notesLabel: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
    fontWeight: '500',
  },
  notesInput: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    backgroundColor: therapeuticColors.background,
    borderRadius: 12,
    padding: spacing['3x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    minHeight: 80,
    marginBottom: spacing['1x'],
  },
  characterCount: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
    textAlign: 'right',
  },
  encouragementContainer: {
    backgroundColor: therapeuticColors.primary + '10',
    borderRadius: 12,
    padding: spacing['4x'],
    marginBottom: spacing['6x'],
    borderLeftWidth: 4,
    borderLeftColor: therapeuticColors.primary,
  },
  encouragementText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing['3x'],
    paddingTop: spacing['4x'],
  },
  skipButton: {
    flex: 1,
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    backgroundColor: therapeuticColors.surface,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  completeButton: {
    flex: 2,
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    backgroundColor: therapeuticColors.primary,
    alignItems: 'center',
  },
  completeButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
});

export default ExerciseCompletionScreen;
