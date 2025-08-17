/**
 * Helpfulness Rating Component
 * 
 * Gentle 5-star rating system for exercise feedback
 * with therapeutic language and smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface HelpfulnessRatingProps {
  onRatingChange: (rating: number) => void;
  initialRating?: number;
  title?: string;
  showLabels?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const HelpfulnessRating: React.FC<HelpfulnessRatingProps> = ({
  onRatingChange,
  initialRating = 0,
  title = 'How helpful was this?',
  showLabels = true,
  disabled = false,
  size = 'medium',
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleRatingPress = (selectedRating: number) => {
    if (disabled) return;
    
    setRating(selectedRating);
    onRatingChange(selectedRating);
    
    // Gentle bounce animation for selected star
    Animated.sequence([
      Animated.timing(scaleAnims[selectedRating - 1], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[selectedRating - 1], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStarHover = (starIndex: number) => {
    if (disabled) return;
    setHoveredRating(starIndex);
  };

  const handleStarHoverEnd = () => {
    if (disabled) return;
    setHoveredRating(0);
  };

  const getStarColor = (starIndex: number) => {
    const displayRating = hoveredRating || rating;
    
    if (starIndex <= displayRating) {
      return therapeuticColors.primary;
    }
    
    return therapeuticColors.border;
  };

  const getStarSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 40;
      default:
        return 32;
    }
  };

  const getRatingMessage = (currentRating: number) => {
    const messages = [
      '', // 0 stars
      'Not helpful right now',
      'Somewhat helpful',
      'Helpful',
      'Very helpful',
      'Extremely helpful',
    ];
    
    return messages[currentRating] || '';
  };

  const starSize = getStarSize();

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[
          styles.title,
          size === 'small' && styles.titleSmall,
          size === 'large' && styles.titleLarge,
        ]}>
          {title}
        </Text>
      )}
      
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <TouchableOpacity
            key={starIndex}
            style={[
              styles.starButton,
              size === 'small' && styles.starButtonSmall,
              size === 'large' && styles.starButtonLarge,
            ]}
            onPress={() => handleRatingPress(starIndex)}
            onPressIn={() => handleStarHover(starIndex)}
            onPressOut={handleStarHoverEnd}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Animated.Text
              style={[
                styles.starText,
                {
                  fontSize: starSize,
                  color: getStarColor(starIndex),
                  transform: [{ scale: scaleAnims[starIndex - 1] }],
                },
                disabled && styles.starDisabled,
              ]}
            >
              ⭐
            </Animated.Text>
          </TouchableOpacity>
        ))}
      </View>

      {showLabels && (
        <View style={styles.labelsContainer}>
          <Text style={[
            styles.labelText,
            size === 'small' && styles.labelTextSmall,
          ]}>
            Not helpful
          </Text>
          <Text style={[
            styles.labelText,
            size === 'small' && styles.labelTextSmall,
          ]}>
            Very helpful
          </Text>
        </View>
      )}

      {(rating > 0 || hoveredRating > 0) && (
        <Text style={[
          styles.ratingMessage,
          size === 'small' && styles.ratingMessageSmall,
        ]}>
          {getRatingMessage(hoveredRating || rating)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['3x'],
    fontWeight: '500',
  },
  titleSmall: {
    ...typography.caption,
    marginBottom: spacing['2x'],
  },
  titleLarge: {
    ...typography.h4,
    marginBottom: spacing['4x'],
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    padding: spacing['2x'],
    marginHorizontal: spacing['1x'],
  },
  starButtonSmall: {
    padding: spacing['1x'],
    marginHorizontal: spacing['0.5x'],
  },
  starButtonLarge: {
    padding: spacing['3x'],
    marginHorizontal: spacing['1.5x'],
  },
  starText: {
    textAlign: 'center',
  },
  starDisabled: {
    opacity: 0.5,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing['2x'],
    marginTop: spacing['2x'],
  },
  labelText: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
  },
  labelTextSmall: {
    fontSize: 10,
  },
  ratingMessage: {
    ...typography.caption,
    color: therapeuticColors.primary,
    marginTop: spacing['2x'],
    fontWeight: '500',
    textAlign: 'center',
  },
  ratingMessageSmall: {
    fontSize: 11,
    marginTop: spacing['1x'],
  },
});

export default HelpfulnessRating;
