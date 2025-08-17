/**
 * Exercise Session Screen
 * 
 * Displays exercise instructions and guides user through
 * the exercise with timer and completion flow
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';
import { Exercise } from '../types';

interface ExerciseSessionScreenProps {
  route: {
    params: {
      exercise: Exercise;
    };
  };
  navigation: any;
}

export const ExerciseSessionScreen: React.FC<ExerciseSessionScreenProps> = ({
  route,
  navigation,
}) => {
  const { exercise } = route.params;
  const { actions } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Start the exercise session
    actions.startExercise(exercise.id);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    } else if (!isActive && timeElapsed !== 0) {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeElapsed]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleNextStep = () => {
    if (currentStep < exercise.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    
    // Navigate to completion screen
    navigation.navigate('ExerciseCompletion', {
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      duration: timeElapsed,
    });
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Exercise',
      'Are you sure you want to exit? Your progress won\'t be saved.',
      [
        {
          text: 'Continue Exercise',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentStep + 1) / exercise.instructions.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          <Text style={styles.timeElapsed}>{formatTime(timeElapsed)}</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {exercise.instructions.length}
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            {exercise.instructions[currentStep]}
          </Text>
        </View>

        {/* Exercise Category Badge */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{exercise.category}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentStep === 0 && styles.navButtonDisabled
            ]}
            onPress={handlePreviousStep}
            disabled={currentStep === 0}
          >
            <Text style={[
              styles.navButtonText,
              currentStep === 0 && styles.navButtonTextDisabled
            ]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextStep}
          >
            <Text style={styles.navButtonText}>
              {currentStep === exercise.instructions.length - 1 ? 'Complete' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.timerButton,
            { backgroundColor: isActive ? therapeuticColors.warning : therapeuticColors.primary }
          ]}
          onPress={isActive ? handlePause : handleStart}
        >
          <Text style={styles.timerButtonText}>
            {isActive ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['3x'],
    borderBottomWidth: 1,
    borderBottomColor: therapeuticColors.border,
  },
  exitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: therapeuticColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '600',
  },
  headerInfo: {
    alignItems: 'center',
  },
  exerciseTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
  },
  timeElapsed: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '600',
    marginTop: spacing['1x'],
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['3x'],
  },
  progressBar: {
    height: 4,
    backgroundColor: therapeuticColors.border,
    borderRadius: 2,
    marginBottom: spacing['2x'],
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
  content: {
    flex: 1,
    paddingHorizontal: spacing['4x'],
  },
  instructionContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['6x'],
    marginVertical: spacing['4x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    minHeight: 200,
    justifyContent: 'center',
  },
  instructionText: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  categoryContainer: {
    alignItems: 'center',
    marginBottom: spacing['4x'],
  },
  categoryBadge: {
    backgroundColor: therapeuticColors.primary + '20',
    paddingHorizontal: spacing['3x'],
    paddingVertical: spacing['2x'],
    borderRadius: 8,
  },
  categoryText: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  controls: {
    padding: spacing['4x'],
    borderTopWidth: 1,
    borderTopColor: therapeuticColors.border,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing['3x'],
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing['3x'],
    paddingHorizontal: spacing['4x'],
    borderRadius: 12,
    backgroundColor: therapeuticColors.surface,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    marginHorizontal: spacing['1x'],
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: therapeuticColors.textTertiary,
  },
  timerButton: {
    paddingVertical: spacing['4x'],
    borderRadius: 12,
    alignItems: 'center',
  },
  timerButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
    fontSize: 18,
  },
});

export default ExerciseSessionScreen;
