/**
 * FirstMicroSessionScreen
 * 
 * 60-90 second introductory breathing exercise with haptics-only default
 * Gentle introduction to the app's therapeutic approach
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Vibration,
  Animated
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { useSettings, useActions } from '../../store';

interface FirstMicroSessionScreenProps {
  navigation: any;
}

const INTRO_EXERCISE = {
  id: 'intro_breathing',
  title: 'Welcome Breathing',
  description: 'A gentle introduction to mindful breathing',
  duration_seconds: 90,
  steps: [
    {
      type: 'text' as const,
      content: 'Welcome to your first moment of calm',
      seconds: 5
    },
    {
      type: 'text' as const,
      content: 'Let\'s take a few deep breaths together',
      seconds: 3
    },
    {
      type: 'breath' as const,
      content: 'Breathe in slowly',
      seconds: 4
    },
    {
      type: 'breath' as const,
      content: 'Hold gently',
      seconds: 4
    },
    {
      type: 'breath' as const,
      content: 'Breathe out slowly',
      seconds: 6
    },
    {
      type: 'breath' as const,
      content: 'Breathe in slowly',
      seconds: 4
    },
    {
      type: 'breath' as const,
      content: 'Hold gently',
      seconds: 4
    },
    {
      type: 'breath' as const,
      content: 'Breathe out slowly',
      seconds: 6
    },
    {
      type: 'breath' as const,
      content: 'Breathe in slowly',
      seconds: 4
    },
    {
      type: 'breath' as const,
      content: 'Hold gently',
      seconds: 4
    },
    {
      type: 'breath' as const,
      content: 'Breathe out slowly',
      seconds: 6
    },
    {
      type: 'text' as const,
      content: 'Beautiful. You\'ve completed your first session.',
      seconds: 5
    },
    {
      type: 'text' as const,
      content: 'Notice how you feel right now',
      seconds: 5
    }
  ]
};

export const FirstMicroSessionScreen: React.FC<FirstMicroSessionScreenProps> = ({ navigation }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  const { audio } = useSettings();
  const { completeExercise } = useActions();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  const currentStep = INTRO_EXERCISE.steps[currentStepIndex];
  const isLastStep = currentStepIndex === INTRO_EXERCISE.steps.length - 1;
  const progress = (currentStepIndex + 1) / INTRO_EXERCISE.steps.length;

  // Breathing animation for breath steps
  useEffect(() => {
    if (isPlaying && currentStep?.type === 'breath') {
      const isInhale = currentStep.content.toLowerCase().includes('in');
      const isHold = currentStep.content.toLowerCase().includes('hold');
      
      if (isInhale) {
        // Expand animation for inhale
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: currentStep.seconds * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1.0,
            duration: currentStep.seconds * 1000,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (isHold) {
        // Hold animation
        // Keep current scale and opacity
      } else {
        // Contract animation for exhale
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: currentStep.seconds * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.5,
            duration: currentStep.seconds * 1000,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [currentStepIndex, isPlaying, currentStep, scaleAnim, opacityAnim]);

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

  // Haptic feedback for breathing
  useEffect(() => {
    if (isPlaying && audio.haptic_feedback && currentStep?.type === 'breath') {
      const content = currentStep.content.toLowerCase();
      
      if (content.includes('in')) {
        Vibration.vibrate(100); // Gentle start vibration
      } else if (content.includes('out')) {
        Vibration.vibrate([0, 50, 50, 50]); // Gentle release pattern
      } else if (content.includes('hold')) {
        Vibration.vibrate(50); // Brief hold indication
      }
    }
  }, [currentStepIndex, isPlaying, audio.haptic_feedback, currentStep]);

  const handleStepComplete = useCallback(() => {
    if (isLastStep) {
      handleSessionComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [isLastStep]);

  const handleSessionComplete = useCallback(() => {
    setIsPlaying(false);
    
    // Completion haptic feedback
    if (audio.haptic_feedback) {
      Vibration.vibrate([0, 100, 100, 100, 100, 200]);
    }
    
    // Record completion
    completeExercise(5, 'First micro-session completed');
    
    // Navigate to main app
    setTimeout(() => {
      navigation.navigate('MainApp');
    }, 2000);
  }, [audio.haptic_feedback, completeExercise, navigation]);

  const handleStart = useCallback(() => {
    setHasStarted(true);
    setIsPlaying(true);
    
    if (audio.haptic_feedback) {
      Vibration.vibrate(50);
    }
  }, [audio.haptic_feedback]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    
    if (audio.haptic_feedback) {
      Vibration.vibrate(30);
    }
  }, [audio.haptic_feedback]);

  const handleResume = useCallback(() => {
    setIsPlaying(true);
    
    if (audio.haptic_feedback) {
      Vibration.vibrate(50);
    }
  }, [audio.haptic_feedback]);

  const handleSkip = useCallback(() => {
    navigation.navigate('MainApp');
  }, [navigation]);

  const renderPreStart = () => (
    <View style={styles.preStartContainer}>
      <Text style={styles.welcomeTitle}>Ready for your first moment of calm?</Text>
      <Text style={styles.welcomeDescription}>
        This is a gentle 90-second breathing exercise to help you get started with PocketTherapy.
      </Text>
      
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>What to expect:</Text>
        <Text style={styles.benefitItem}>• Gentle breathing guidance</Text>
        <Text style={styles.benefitItem}>• Soft haptic feedback (if enabled)</Text>
        <Text style={styles.benefitItem}>• A moment of peace</Text>
      </View>

      <View style={styles.preStartActions}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          accessibilityLabel="Start first breathing session"
        >
          <Text style={styles.startButtonText}>Begin</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityLabel="Skip first session"
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSession = () => (
    <View style={styles.sessionContainer}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% complete
        </Text>
      </View>

      {/* Breathing circle */}
      <View style={styles.breathingContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
      </View>

      {/* Step content */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepContent}>{currentStep?.content}</Text>
        {currentStep?.seconds && timeRemaining > 0 && (
          <Text style={styles.stepTimer}>
            {timeRemaining}
          </Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={isPlaying ? handlePause : handleResume}
          accessibilityLabel={isPlaying ? 'Pause session' : 'Resume session'}
        >
          <Text style={styles.controlButtonText}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!hasStarted ? renderPreStart() : renderSession()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
    paddingHorizontal: spacing['6x'], // 24px
  },
  
  preStartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['8x'], // 32px
  },
  
  welcomeTitle: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['6x'], // 24px
  },
  
  welcomeDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['8x'], // 32px
  },
  
  benefitsContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['6x'], // 24px
    marginBottom: spacing['8x'], // 32px
    width: '100%',
  },
  
  benefitsTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['4x'], // 16px
  },
  
  benefitItem: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['2x'], // 8px
    lineHeight: 22,
  },
  
  preStartActions: {
    width: '100%',
    gap: spacing['4x'], // 16px
  },
  
  startButton: {
    backgroundColor: therapeuticColors.primary,
    borderRadius: 28,
    paddingVertical: spacing['5x'], // 20px
    paddingHorizontal: spacing['8x'], // 32px
    alignItems: 'center',
  },
  
  startButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    paddingVertical: spacing['4x'], // 16px
    paddingHorizontal: spacing['6x'], // 24px
    alignItems: 'center',
  },
  
  skipButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  
  sessionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing['8x'], // 32px
  },
  
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing['8x'], // 32px
  },
  
  progressBar: {
    width: '100%',
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
  },
  
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: therapeuticColors.primary,
    shadowColor: therapeuticColors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  stepContainer: {
    alignItems: 'center',
    marginVertical: spacing['8x'], // 32px
  },
  
  stepContent: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['4x'], // 16px
  },
  
  stepTimer: {
    ...typography.h1,
    color: therapeuticColors.primary,
    fontVariant: ['tabular-nums'],
  },
  
  controlsContainer: {
    alignItems: 'center',
    marginTop: spacing['8x'], // 32px
  },
  
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: therapeuticColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: therapeuticColors.primary,
  },
  
  controlButtonText: {
    fontSize: 24,
    color: therapeuticColors.primary,
  },
});

export default FirstMicroSessionScreen;
