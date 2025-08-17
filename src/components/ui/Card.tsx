/**
 * Card Component for PocketTherapy
 * 
 * Therapeutic card component with soft shadows and calming design.
 * Supports different elevations, interactive states, and accessibility.
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
// import { triggerHaptic } from '../../utils'; // Commented out for now
import { getElevationStyle } from '../../utils/shadowUtils';
import type { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  onPress,
  elevated = false,
  style,
  testID,
  children,
}) => {
  const handlePress = async () => {
    if (!onPress) return;

    // Gentle haptic feedback for interactive cards
    await triggerHaptic('light');
    onPress();
  };

  const getCardStyle = (): ViewStyle => {
    return {
      backgroundColor: therapeuticColors.surface,
      borderRadius: 16,
      padding: spacing['5x'], // 20px
      borderWidth: 1,
      borderColor: therapeuticColors.border,
      ...getElevationStyle(elevated ? 'medium' : 'small'),
    };
  };

  const renderHeader = () => {
    if (!title && !subtitle) return null;

    return (
      <View style={styles.header}>
        {title && (
          <Text
            style={styles.title}
            testID={`${testID}-title`}
            accessibilityRole="header"
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={styles.subtitle}
            testID={`${testID}-subtitle`}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  const renderContent = () => {
    return (
      <View style={styles.content}>
        {renderHeader()}
        {children}
      </View>
    );
  };

  // If onPress is provided, make the card interactive
  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={handlePress}
        activeOpacity={0.95}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={title || 'Card'}
        accessibilityHint={`Tap to ${title ? title.toLowerCase() : 'interact with card'}`}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Static card without interaction
  return (
    <View
      style={[getCardStyle(), style]}
      testID={testID}
    >
      {renderContent()}
    </View>
  );
};

// Specialized card variants for common use cases
export const ExerciseCard: React.FC<CardProps & { 
  duration?: string;
  category?: string;
  difficulty?: string;
}> = ({ 
  duration, 
  category, 
  difficulty, 
  ...props 
}) => (
  <Card {...props} elevated>
    {props.children}
    {(duration || category || difficulty) && (
      <View style={styles.exerciseMetadata}>
        {duration && (
          <Text style={styles.metadataText}>{duration}</Text>
        )}
        {category && (
          <Text style={styles.metadataText}>{category}</Text>
        )}
        {difficulty && (
          <Text style={styles.metadataText}>{difficulty}</Text>
        )}
      </View>
    )}
  </Card>
);

export const MoodCard: React.FC<CardProps & { 
  moodLevel?: number;
  date?: string;
}> = ({ 
  moodLevel, 
  date, 
  ...props 
}) => (
  <Card {...props}>
    {props.children}
    {(moodLevel || date) && (
      <View style={styles.moodMetadata}>
        {date && (
          <Text style={styles.dateText}>{date}</Text>
        )}
        {moodLevel && (
          <View style={styles.moodIndicator}>
            <Text style={styles.moodText}>Mood: {moodLevel}/5</Text>
          </View>
        )}
      </View>
    )}
  </Card>
);

export const InsightCard: React.FC<CardProps> = (props) => (
  <Card {...props} elevated style={[styles.insightCard, props.style]}>
    {props.children}
  </Card>
);

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing['3x'], // 12px
  },
  title: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'], // 8px
  },
  subtitle: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
  },
  content: {
    flex: 1,
  },
  exerciseMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing['3x'], // 12px
    paddingTop: spacing['3x'], // 12px
    borderTopWidth: 1,
    borderTopColor: therapeuticColors.border,
  },
  metadataText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  moodMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['3x'], // 12px
  },
  dateText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  moodIndicator: {
    backgroundColor: therapeuticColors.primary + '20',
    paddingHorizontal: spacing['2x'], // 8px
    paddingVertical: spacing['1x'], // 4px
    borderRadius: 8,
  },
  moodText: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '500',
  },
  insightCard: {
    backgroundColor: therapeuticColors.accent + '15',
    borderColor: therapeuticColors.accent,
  },
});

export default Card;
