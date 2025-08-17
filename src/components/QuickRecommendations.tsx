/**
 * Quick Recommendations Component
 * 
 * Displays immediate, mood-based suggestions and quick actions
 * for users who need instant support
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';

interface QuickRecommendationsProps {
  mood: number;
  onActionPress?: (action: string) => void;
  compact?: boolean;
}

export const QuickRecommendations: React.FC<QuickRecommendationsProps> = ({
  mood,
  onActionPress,
  compact = false,
}) => {
  const { actions } = useAppStore();
  
  const recommendations = actions.getQuickRecommendations(mood);

  const getMoodEmoji = (moodValue: number) => {
    const emojis = ['', '😢', '😕', '😐', '🙂', '😊'];
    return emojis[moodValue] || '😐';
  };

  const getMoodColor = (moodValue: number) => {
    if (moodValue <= 2) return therapeuticColors.error;
    if (moodValue === 3) return therapeuticColors.warning;
    return therapeuticColors.success;
  };

  const getMoodMessage = (moodValue: number) => {
    const messages = {
      1: "I see you're having a really tough time right now.",
      2: "It sounds like things are difficult today.",
      3: "You're doing okay, and that's perfectly fine.",
      4: "It's nice to see you're feeling good today.",
      5: "What a wonderful mood you're in today!",
    };
    return messages[moodValue as keyof typeof messages] || messages[3];
  };

  const handleActionPress = (recommendation: string) => {
    // Convert recommendation to action
    let action = 'breathing';
    
    if (recommendation.includes('grounding') || recommendation.includes('5-4-3-2-1')) {
      action = 'grounding';
    } else if (recommendation.includes('gratitude')) {
      action = 'gratitude';
    } else if (recommendation.includes('mindful')) {
      action = 'mindfulness';
    }
    
    onActionPress?.(action);
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.header}>
        <View style={styles.moodIndicator}>
          <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
          <View style={[
            styles.moodDot,
            { backgroundColor: getMoodColor(mood) }
          ]} />
        </View>
        
        <View style={styles.messageContainer}>
          <Text style={[
            styles.moodMessage,
            compact && styles.moodMessageCompact,
          ]}>
            {getMoodMessage(mood)}
          </Text>
        </View>
      </View>

      <View style={styles.recommendationsContainer}>
        <Text style={[
          styles.recommendationsTitle,
          compact && styles.recommendationsTitleCompact,
        ]}>
          Here's what might help:
        </Text>
        
        {recommendations.map((recommendation, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.recommendationItem,
              compact && styles.recommendationItemCompact,
            ]}
            onPress={() => handleActionPress(recommendation)}
            activeOpacity={0.7}
          >
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={[
                styles.recommendationText,
                compact && styles.recommendationTextCompact,
              ]}>
                {recommendation}
              </Text>
            </View>
            
            {onActionPress && (
              <Text style={styles.actionHint}>Tap to try</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {mood <= 2 && (
        <View style={styles.supportMessage}>
          <Text style={styles.supportText}>
            Remember: You're not alone, and these feelings will pass. 
            Take it one moment at a time.
          </Text>
        </View>
      )}

      {mood >= 4 && (
        <View style={styles.celebrationMessage}>
          <Text style={styles.celebrationText}>
            It's wonderful that you're feeling good! 
            This is a great time to build positive habits.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['4x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  containerCompact: {
    padding: spacing['3x'],
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['3x'],
  },
  moodIndicator: {
    alignItems: 'center',
    marginRight: spacing['3x'],
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: spacing['1x'],
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messageContainer: {
    flex: 1,
  },
  moodMessage: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    lineHeight: 22,
  },
  moodMessageCompact: {
    ...typography.caption,
    lineHeight: 18,
  },
  recommendationsContainer: {
    marginBottom: spacing['3x'],
  },
  recommendationsTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['2x'],
  },
  recommendationsTitleCompact: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  recommendationItem: {
    backgroundColor: therapeuticColors.background,
    borderRadius: 8,
    padding: spacing['3x'],
    marginBottom: spacing['2x'],
    borderLeftWidth: 3,
    borderLeftColor: therapeuticColors.primary,
  },
  recommendationItemCompact: {
    padding: spacing['2x'],
    marginBottom: spacing['1x'],
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing['1x'],
  },
  recommendationBullet: {
    ...typography.body,
    color: therapeuticColors.primary,
    marginRight: spacing['2x'],
    fontWeight: '600',
  },
  recommendationText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  recommendationTextCompact: {
    ...typography.caption,
    lineHeight: 16,
  },
  actionHint: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  supportMessage: {
    backgroundColor: therapeuticColors.error + '10',
    borderRadius: 8,
    padding: spacing['3x'],
    borderLeftWidth: 3,
    borderLeftColor: therapeuticColors.error,
  },
  supportText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  celebrationMessage: {
    backgroundColor: therapeuticColors.success + '10',
    borderRadius: 8,
    padding: spacing['3x'],
    borderLeftWidth: 3,
    borderLeftColor: therapeuticColors.success,
  },
  celebrationText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default QuickRecommendations;
