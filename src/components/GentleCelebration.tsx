/**
 * Gentle Celebration Component
 * 
 * Provides gentle, therapeutic celebration animations
 * and messages for completed activities
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface GentleCelebrationProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  duration?: number;
  onComplete?: () => void;
  style?: any;
}

export const GentleCelebration: React.FC<GentleCelebrationProps> = ({
  title,
  subtitle,
  emoji = '🌟',
  duration = 2000,
  onComplete,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const sparkleAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Main celebration animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animations with staggered timing
    const sparkleAnimations = sparkleAnims.map((anim, index) =>
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(sparkleAnimations).start();

    // Auto-complete after duration
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const renderSparkles = () => {
    const sparklePositions = [
      { top: '20%', left: '15%' },
      { top: '25%', right: '20%' },
      { bottom: '30%', left: '10%' },
      { bottom: '25%', right: '15%' },
    ];

    return sparkleAnims.map((anim, index) => (
      <Animated.View
        key={index}
        style={[
          styles.sparkle,
          sparklePositions[index],
          {
            opacity: anim,
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1.2, 0.8],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>
    ));
  };

  return (
    <View style={[styles.container, style]}>
      {renderSparkles()}
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </Animated.View>
    </View>
  );
};

/**
 * Celebration Messages for different contexts
 */
export const celebrationMessages = {
  exerciseComplete: {
    titles: [
      'Well done!',
      'Beautiful work!',
      'You did it!',
      'Wonderful!',
      'Great job!',
    ],
    subtitles: [
      'You took time for yourself',
      'Every step matters',
      'You\'re taking care of yourself',
      'That was brave of you',
      'You should feel proud',
    ],
  },
  moodLogged: {
    titles: [
      'Thank you for sharing',
      'Your feelings matter',
      'Well done checking in',
      'That took courage',
    ],
    subtitles: [
      'Awareness is the first step',
      'You\'re being mindful',
      'Self-awareness is strength',
      'You\'re taking care of yourself',
    ],
  },
  streakAchieved: {
    titles: [
      'Amazing consistency!',
      'You\'re building great habits!',
      'Look at you go!',
      'Incredible dedication!',
    ],
    subtitles: [
      'Small steps, big progress',
      'You\'re investing in yourself',
      'Consistency is key',
      'You should be proud',
    ],
  },
};

/**
 * Get random celebration message
 */
export const getRandomCelebration = (type: keyof typeof celebrationMessages) => {
  const messages = celebrationMessages[type];
  const randomTitle = messages.titles[Math.floor(Math.random() * messages.titles.length)];
  const randomSubtitle = messages.subtitles[Math.floor(Math.random() * messages.subtitles.length)];
  
  return {
    title: randomTitle,
    subtitle: randomSubtitle,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: therapeuticColors.background,
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    padding: spacing['6x'],
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing['3x'],
  },
  title: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2x'],
  },
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 20,
  },
});

export default GentleCelebration;
