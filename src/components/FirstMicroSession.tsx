/**
 * First Micro-Session Component
 * 
 * Introductory 60-90 second breathing exercise for onboarding
 * with haptics-only default and gentle introduction to the app
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface FirstMicroSessionProps {
  onComplete: () => void;
  onSkip: () => void;
}

type SessionPhase = 'intro' | 'breathing' | 'completion';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;

export const FirstMicroSession: React.FC<FirstMicroSessionProps> = ({
  onComplete,
  onSkip,
}) => {
  const [phase, setPhase] = useState<SessionPhase>('intro');
  const [breathCount, setBreathCount] = useState(0);
  const [isInhaling, setIsInhaling] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(75); // 75 seconds total
  
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const breathingInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (breathingInterval.current) clearInterval(breathingInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const startBreathingSession = () => {
    setPhase('breathing');
    setTimeRemaining(75);
    
    // Start timer
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start breathing animation and haptics
    startBreathingCycle();
  };

  const startBreathingCycle = () => {
    const breathCycle = () => {
      // Inhale phase (4 seconds)
      setIsInhaling(true);
      trigger('impactLight');
      
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start();

      // Hold phase (2 seconds)
      setTimeout(() => {
        trigger('impactLight');
      }, 4000);

      // Exhale phase (6 seconds)
      setTimeout(() => {
        setIsInhaling(false);
        trigger('impactLight');
        
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]).start();
      }, 6000);

      // Complete cycle and increment count
      setTimeout(() => {
        setBreathCount(prev => prev + 1);
      }, 12000);
    };

    // Start first cycle immediately
    breathCycle();
    
    // Continue cycles every 12 seconds (4+2+6)
    breathingInterval.current = setInterval(breathCycle, 12000);
  };

  const completeSession = () => {
    if (breathingInterval.current) clearInterval(breathingInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    setPhase('completion');
    trigger('notificationSuccess');
    
    // Auto-complete after showing completion message
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const handleSkip = () => {
    if (breathingInterval.current) clearInterval(breathingInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    onSkip();
  };

  const renderIntroPhase = () => (
    <View style={styles.phaseContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Let's Try Something Together</Text>
        <Text style={styles.subtitle}>
          A gentle 60-second breathing exercise to help you feel centered
        </Text>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>What to expect:</Text>
        <Text style={styles.instructionText}>
          • Follow the gentle breathing circle{'\n'}
          • Feel soft vibrations to guide your breath{'\n'}
          • No pressure - just breathe naturally{'\n'}
          • You can stop anytime
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Maybe Later</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.startButton} onPress={startBreathingSession}>
          <Text style={styles.startButtonText}>Let's Begin</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        This is just a gentle introduction. You're in control.
      </Text>
    </View>
  );

  const renderBreathingPhase = () => (
    <View style={styles.phaseContainer}>
      <View style={styles.breathingHeader}>
        <Text style={styles.breathingTitle}>Breathe With Me</Text>
        <Text style={styles.timeText}>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</Text>
      </View>

      <View style={styles.breathingContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.innerCircle}>
            <Text style={styles.breathingText}>
              {isInhaling ? 'Breathe In' : 'Breathe Out'}
            </Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Breath {breathCount + 1}</Text>
        <View style={styles.progressDots}>
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= breathCount && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.stopButton} onPress={handleSkip}>
        <Text style={styles.stopButtonText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCompletionPhase = () => (
    <View style={styles.phaseContainer}>
      <View style={styles.completionContainer}>
        <Text style={styles.completionEmoji}>✨</Text>
        <Text style={styles.completionTitle}>Beautiful Work</Text>
        <Text style={styles.completionText}>
          You just completed your first mindful moment. 
          Notice how you feel right now.
        </Text>
        
        <View style={styles.completionStats}>
          <Text style={styles.statsText}>
            {breathCount} mindful breaths • {75 - timeRemaining} seconds
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {phase === 'intro' && renderIntroPhase()}
      {phase === 'breathing' && renderBreathingPhase()}
      {phase === 'completion' && renderCompletionPhase()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['6x'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['8x'],
  },
  title: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['3x'],
  },
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionCard: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['6x'],
    marginBottom: spacing['8x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  instructionTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['3x'],
    textAlign: 'center',
  },
  instructionText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing['4x'],
    marginBottom: spacing['6x'],
  },
  skipButton: {
    flex: 1,
    backgroundColor: therapeuticColors.surface,
    paddingVertical: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  startButton: {
    flex: 1,
    backgroundColor: therapeuticColors.primary,
    paddingVertical: spacing['4x'],
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  disclaimer: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  breathingHeader: {
    alignItems: 'center',
    marginBottom: spacing['8x'],
  },
  breathingTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
  },
  timeText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontFamily: 'monospace',
  },
  breathingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['8x'],
  },
  breathingCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: therapeuticColors.primary + '20',
    borderWidth: 2,
    borderColor: therapeuticColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: CIRCLE_SIZE * 0.7,
    height: CIRCLE_SIZE * 0.7,
    borderRadius: (CIRCLE_SIZE * 0.7) / 2,
    backgroundColor: therapeuticColors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingText: {
    ...typography.h4,
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing['6x'],
  },
  progressText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['3x'],
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing['2x'],
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: therapeuticColors.border,
  },
  progressDotActive: {
    backgroundColor: therapeuticColors.primary,
  },
  stopButton: {
    backgroundColor: therapeuticColors.surface,
    paddingHorizontal: spacing['6x'],
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  stopButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  completionContainer: {
    alignItems: 'center',
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: spacing['4x'],
  },
  completionTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['3x'],
    textAlign: 'center',
  },
  completionText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['6x'],
  },
  completionStats: {
    backgroundColor: therapeuticColors.success + '10',
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['2x'],
    borderRadius: 8,
  },
  statsText: {
    ...typography.caption,
    color: therapeuticColors.success,
    fontWeight: '500',
  },
});

export default FirstMicroSession;
