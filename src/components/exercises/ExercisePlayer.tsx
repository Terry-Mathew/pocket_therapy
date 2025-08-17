/**
 * ExercisePlayer Component
 * 
 * Minimal exercise player with step-by-step guidance,
 * progress dots, and audio/haptic controls
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Dimensions
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { Exercise, ExerciseStep } from '../../types';
import { useSettings } from '../../store';

interface ExercisePlayerProps {
  exercise: Exercise;
  onComplete: (rating?: number, notes?: string) => void;
  onExit: () => void;
  autoStart?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exercise,
  onComplete,
  onExit,
  autoStart = false
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  
  const { audio, accessibility } = useSettings();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentStep = exercise.steps[currentStepIndex];
  const isLastStep = currentStepIndex === exercise.steps.length - 1;
  const progress = (currentStepIndex + 1) / exercise.steps.length;

  // Timer management
  useEffect(() => {
    if (isPlaying && currentStep?.seconds) {
      setTimeRemaining(currentStep.seconds);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleStepComplete();
            return 0;
          }
          return prev - 1;
        });
        
        setTotalElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, currentStep]);

  // Haptic feedback for breathing exercises
  useEffect(() => {
    if (isPlaying && audio.haptic_feedback && currentStep?.type === 'breath') {
      const hapticPattern = currentStep.content.toLowerCase();
      
      if (hapticPattern.includes('inhale')) {
        Vibration.vibrate(100);
      } else if (hapticPattern.includes('exhale')) {
        Vibration.vibrate([0, 50, 50, 50]);
      } else if (hapticPattern.includes('hold')) {
        Vibration.vibrate(50);
      }
    }
  }, [currentStepIndex, isPlaying, audio.haptic_feedback, currentStep]);

  const handleStepComplete = useCallback(() => {
    if (isLastStep) {
      handleExerciseComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [isLastStep]);

  const handleExerciseComplete = useCallback(() => {
    setIsPlaying(false);
    const sessionDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    // Completion haptic feedback
    if (audio.haptic_feedback) {
      Vibration.vibrate([0, 100, 100, 100, 100, 200]);
    }
    
    onComplete();
  }, [onComplete, audio.haptic_feedback]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
    
    if (audio.haptic_feedback) {
      Vibration.vibrate(50);
    }
  }, [audio.haptic_feedback]);

  const handlePreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setTimeRemaining(exercise.steps[currentStepIndex - 1]?.seconds || 0);
    }
  }, [currentStepIndex, exercise.steps]);

  const handleNextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleExerciseComplete();
    }
  }, [isLastStep, handleExerciseComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProgressDots = () => {
    return (
      <View style={styles.progressContainer}>
        {exercise.steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStepIndex && styles.activeDot,
              index === currentStepIndex && styles.currentDot
            ]}
          />
        ))}
      </View>
    );
  };

  const renderStepContent = () => {
    switch (currentStep?.type) {
      case 'text':
        return (
          <View style={styles.textStepContainer}>
            <Text style={styles.stepContent}>{currentStep.content}</Text>
            {currentStep.instruction && (
              <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>
            )}
          </View>
        );

      case 'breath':
        return (
          <View style={styles.breathStepContainer}>
            <Text style={styles.breathAction}>{currentStep.content}</Text>
            {currentStep.seconds && (
              <Text style={styles.breathTimer}>
                {formatTime(timeRemaining)}
              </Text>
            )}
            {currentStep.instruction && (
              <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>
            )}
          </View>
        );

      case 'reflection':
        return (
          <View style={styles.reflectionContainer}>
            <Text style={styles.reflectionPrompt}>{currentStep.content}</Text>
            <Text style={styles.reflectionNote}>
              Take a moment to reflect on this...
            </Text>
          </View>
        );

      default:
        return (
          <View style={styles.defaultContainer}>
            <Text style={styles.stepContent}>{currentStep?.content}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={onExit}
          accessibilityLabel="Exit exercise"
          accessibilityHint="Return to previous screen"
        >
          <Text style={styles.exitText}>×</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          <Text style={styles.exerciseDuration}>
            {formatTime(exercise.duration_seconds)}
          </Text>
        </View>
      </View>

      {/* Progress */}
      {renderProgressDots()}

      {/* Step Content */}
      <View style={styles.contentContainer}>
        {renderStepContent()}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            currentStepIndex === 0 && styles.disabledButton
          ]}
          onPress={handlePreviousStep}
          disabled={currentStepIndex === 0}
          accessibilityLabel="Previous step"
        >
          <Text style={[
            styles.controlButtonText,
            currentStepIndex === 0 && styles.disabledButtonText
          ]}>
            ‹ Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={handlePlayPause}
          accessibilityLabel={isPlaying ? 'Pause exercise' : 'Play exercise'}
        >
          <Text style={styles.playPauseText}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleNextStep}
          accessibilityLabel={isLastStep ? 'Complete exercise' : 'Next step'}
        >
          <Text style={styles.controlButtonText}>
            {isLastStep ? 'Complete' : 'Next ›'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overall Progress */}
      <View style={styles.overallProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStepIndex + 1} of {exercise.steps.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
    paddingHorizontal: spacing['6x'], // 24px
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['4x'], // 16px
    borderBottomWidth: 1,
    borderBottomColor: therapeuticColors.border,
  },
  
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: therapeuticColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  exitText: {
    fontSize: 24,
    color: therapeuticColors.textSecondary,
    fontWeight: '300',
  },
  
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  
  exerciseTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
  },
  
  exerciseDuration: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginTop: spacing['1x'], // 4px
  },
  
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['6x'], // 24px
    gap: spacing['2x'], // 8px
  },
  
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: therapeuticColors.border,
  },
  
  activeDot: {
    backgroundColor: therapeuticColors.primary,
  },
  
  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: therapeuticColors.primary,
  },
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['8x'], // 32px
  },
  
  textStepContainer: {
    alignItems: 'center',
    maxWidth: screenWidth * 0.8,
  },
  
  breathStepContainer: {
    alignItems: 'center',
    maxWidth: screenWidth * 0.8,
  },
  
  reflectionContainer: {
    alignItems: 'center',
    maxWidth: screenWidth * 0.8,
  },
  
  defaultContainer: {
    alignItems: 'center',
    maxWidth: screenWidth * 0.8,
  },
  
  stepContent: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  
  stepInstruction: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginTop: spacing['4x'], // 16px
    lineHeight: 24,
  },
  
  breathAction: {
    ...typography.h1,
    color: therapeuticColors.primary,
    textAlign: 'center',
    marginBottom: spacing['4x'], // 16px
  },
  
  breathTimer: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  
  reflectionPrompt: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: spacing['4x'], // 16px
  },
  
  reflectionNote: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['6x'], // 24px
  },
  
  controlButton: {
    paddingHorizontal: spacing['4x'], // 16px
    paddingVertical: spacing['3x'], // 12px
    borderRadius: 20,
    backgroundColor: therapeuticColors.surface,
    minWidth: 80,
  },
  
  disabledButton: {
    opacity: 0.5,
  },
  
  controlButtonText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  disabledButtonText: {
    opacity: 0.6,
  },
  
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: therapeuticColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: therapeuticColors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  playPauseText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  
  overallProgress: {
    paddingBottom: spacing['6x'], // 24px
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
});

export default ExercisePlayer;
