/**
 * BreathingCircle Component
 * 
 * Animated breathing guide for therapeutic exercises
 * Implements 4-7-8 breathing pattern with accessibility support
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  AccessibilityInfo
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';

interface BreathingCircleProps {
  isActive: boolean;
  pattern?: '4-7-8' | 'box' | 'triangle';
  onCycleComplete?: () => void;
  size?: number;
  showInstructions?: boolean;
}

const BREATHING_PATTERNS = {
  '4-7-8': {
    inhale: 4000,   // 4 seconds
    hold: 7000,     // 7 seconds
    exhale: 8000,   // 8 seconds
    name: '4-7-8 Breathing'
  },
  'box': {
    inhale: 4000,   // 4 seconds
    hold: 4000,     // 4 seconds
    exhale: 4000,   // 4 seconds
    hold2: 4000,    // 4 seconds hold after exhale
    name: 'Box Breathing'
  },
  'triangle': {
    inhale: 4000,   // 4 seconds
    hold: 4000,     // 4 seconds
    exhale: 4000,   // 4 seconds
    name: 'Triangle Breathing'
  }
};

const { width: screenWidth } = Dimensions.get('window');

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  isActive,
  pattern = '4-7-8',
  onCycleComplete,
  size = Math.min(screenWidth * 0.6, 240),
  showInstructions = true
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold2'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  const breathingPattern = BREATHING_PATTERNS[pattern];

  // Check for reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotion);
  }, []);

  // Main breathing animation loop
  useEffect(() => {
    if (!isActive) {
      // Reset to initial state when stopped
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentPhase('inhale');
      return;
    }

    const runBreathingCycle = () => {
      // Inhale phase
      setCurrentPhase('inhale');
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: breathingPattern.inhale,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1.0,
          duration: breathingPattern.inhale,
          useNativeDriver: true,
        }),
      ]).start(() => {
        
        // Hold phase
        setCurrentPhase('hold');
        setTimeout(() => {
          
          // Exhale phase
          setCurrentPhase('exhale');
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: breathingPattern.exhale,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: breathingPattern.exhale,
              useNativeDriver: true,
            }),
          ]).start(() => {
            
            // Optional second hold (for box breathing)
            if (breathingPattern.hold2) {
              setCurrentPhase('hold2');
              setTimeout(() => {
                setCycleCount(prev => prev + 1);
                onCycleComplete?.();
                if (isActive) runBreathingCycle();
              }, breathingPattern.hold2);
            } else {
              setCycleCount(prev => prev + 1);
              onCycleComplete?.();
              if (isActive) runBreathingCycle();
            }
          });
        }, breathingPattern.hold);
      });
    };

    runBreathingCycle();
  }, [isActive, pattern, scaleAnim, opacityAnim, breathingPattern, onCycleComplete]);

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe in slowly';
      case 'hold':
        return 'Hold your breath';
      case 'exhale':
        return 'Breathe out slowly';
      case 'hold2':
        return 'Hold empty';
      default:
        return 'Ready to begin';
    }
  };

  const getPhaseDescription = () => {
    switch (currentPhase) {
      case 'inhale':
        return `Breathing in for ${breathingPattern.inhale / 1000} seconds`;
      case 'hold':
        return `Holding breath for ${breathingPattern.hold / 1000} seconds`;
      case 'exhale':
        return `Breathing out for ${breathingPattern.exhale / 1000} seconds`;
      case 'hold2':
        return `Holding empty for ${breathingPattern.hold2! / 1000} seconds`;
      default:
        return 'Preparing to start breathing exercise';
    }
  };

  // Reduced motion alternative
  if (isReducedMotion) {
    return (
      <View style={styles.reducedMotionContainer}>
        <View style={[styles.staticCircle, { width: size, height: size }]}>
          <Text style={styles.staticPhaseText}>{getPhaseInstruction()}</Text>
        </View>
        {showInstructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>{getPhaseDescription()}</Text>
            <Text style={styles.cycleCounter}>Cycle: {cycleCount}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Breathing Circle */}
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
          accessibilityRole="image"
          accessibilityLabel={`Breathing guide circle, currently ${currentPhase}`}
          accessibilityHint={getPhaseDescription()}
        >
          {/* Inner circle for visual depth */}
          <View style={[styles.innerCircle, { 
            width: size * 0.6, 
            height: size * 0.6,
            borderRadius: (size * 0.6) / 2 
          }]} />
        </Animated.View>
        
        {/* Phase indicator */}
        <View style={styles.phaseIndicator}>
          <Text style={styles.phaseText}>{getPhaseInstruction()}</Text>
        </View>
      </View>

      {/* Instructions and counter */}
      {showInstructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            {isActive ? getPhaseDescription() : 'Tap start to begin breathing'}
          </Text>
          {cycleCount > 0 && (
            <Text style={styles.cycleCounter}>Completed cycles: {cycleCount}</Text>
          )}
          <Text style={styles.patternName}>{breathingPattern.name}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  breathingCircle: {
    backgroundColor: therapeuticColors.primary,
    borderWidth: 4,
    borderColor: therapeuticColors.primary,
    shadowColor: therapeuticColors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  innerCircle: {
    backgroundColor: therapeuticColors.primary + '40', // 40% opacity
    borderWidth: 2,
    borderColor: therapeuticColors.primary + '60', // 60% opacity
  },
  
  phaseIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  phaseText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  instructionsContainer: {
    marginTop: spacing['8x'], // 32px
    alignItems: 'center',
    maxWidth: 280,
  },
  
  instructionText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2x'], // 8px
    lineHeight: 22,
  },
  
  cycleCounter: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['2x'], // 8px
  },
  
  patternName: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '500',
  },
  
  // Reduced motion styles
  reducedMotionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  staticCircle: {
    backgroundColor: therapeuticColors.primary,
    borderWidth: 4,
    borderColor: therapeuticColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: therapeuticColors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  
  staticPhaseText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BreathingCircle;
