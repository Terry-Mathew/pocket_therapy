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
import { theme, getElevation } from '@constants/theme';
import { triggerHaptic } from '@utils';
import type { CardProps } from '@types';

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
    const elevation = elevated ? getElevation('medium') : getElevation('small');
    
    return {
      backgroundColor: theme.components.card.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.layout.cardPadding,
      borderWidth: 1,
      borderColor: theme.components.card.border,
      ...elevation,
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
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.styles.h4,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral.grey,
  },
  content: {
    flex: 1,
  },
  exerciseMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary.creamDark,
  },
  metadataText: {
    ...theme.typography.styles.caption,
    color: theme.colors.neutral.grey,
  },
  moodMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  dateText: {
    ...theme.typography.styles.caption,
    color: theme.colors.neutral.grey,
  },
  moodIndicator: {
    backgroundColor: theme.colors.primary.creamLight,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  moodText: {
    ...theme.typography.styles.caption,
    color: theme.colors.primary.sage,
    fontFamily: theme.typography.fontFamily.medium,
  },
  insightCard: {
    backgroundColor: theme.colors.primary.creamLight,
    borderColor: theme.colors.primary.sage,
  },
});

export default Card;
