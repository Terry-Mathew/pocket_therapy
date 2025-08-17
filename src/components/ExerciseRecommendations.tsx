/**
 * Exercise Recommendations Component
 * 
 * Displays personalized exercise recommendations based on
 * mood, time of day, and user history
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';
import { exerciseRecommendationEngine } from '../services/exerciseRecommendationEngine';
import { Exercise } from '../types';

interface ExerciseRecommendation {
  exercise: Exercise;
  score: number;
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface ExerciseRecommendationsProps {
  onExerciseSelect: (exercise: Exercise) => void;
  maxRecommendations?: number;
  showReasons?: boolean;
  compact?: boolean;
}

export const ExerciseRecommendations: React.FC<ExerciseRecommendationsProps> = ({
  onExerciseSelect,
  maxRecommendations = 3,
  showReasons = true,
  compact = false,
}) => {
  const { exercises, mood, user } = useAppStore();
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [exercises.library, mood.logs]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);

      if (exercises.library.length === 0) {
        setRecommendations([]);
        return;
      }

      // Get current context
      const currentMood = mood.logs.length > 0 ? mood.logs[mood.logs.length - 1].value : undefined;
      const timeOfDay = exerciseRecommendationEngine.getTimeOfDay();
      const recentMoods = mood.logs.slice(-7); // Last 7 mood logs
      const exerciseHistory = exercises.completions;

      // Generate recommendations
      const recs = exerciseRecommendationEngine.getRecommendations(
        exercises.library,
        {
          currentMood,
          timeOfDay,
          recentMoods,
          exerciseHistory,
          userPreferences: {
            preferredDuration: 180, // 3 minutes default
          },
        },
        maxRecommendations
      );

      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return therapeuticColors.success;
      case 'medium':
        return therapeuticColors.primary;
      default:
        return therapeuticColors.textTertiary;
    }
  };

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'Highly recommended';
      case 'medium':
        return 'Good match';
      default:
        return 'Worth trying';
    }
  };

  const renderRecommendationCard = (recommendation: ExerciseRecommendation, index: number) => {
    const { exercise, reasons, confidence } = recommendation;

    return (
      <TouchableOpacity
        key={exercise.id}
        style={[
          styles.recommendationCard,
          compact && styles.recommendationCardCompact,
          index === 0 && styles.topRecommendation,
        ]}
        onPress={() => onExerciseSelect(exercise)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[
              styles.exerciseTitle,
              compact && styles.exerciseTitleCompact,
            ]}>
              {exercise.title}
            </Text>
            {index === 0 && (
              <View style={styles.topBadge}>
                <Text style={styles.topBadgeText}>✨ Top pick</Text>
              </View>
            )}
          </View>
          
          <View style={styles.metaInfo}>
            <Text style={styles.duration}>
              {Math.ceil(exercise.duration / 60)} min
            </Text>
            <View style={[
              styles.confidenceBadge,
              { backgroundColor: getConfidenceColor(confidence) + '20' }
            ]}>
              <Text style={[
                styles.confidenceText,
                { color: getConfidenceColor(confidence) }
              ]}>
                {getConfidenceText(confidence)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[
          styles.exerciseDescription,
          compact && styles.exerciseDescriptionCompact,
        ]} numberOfLines={compact ? 1 : 2}>
          {exercise.description}
        </Text>

        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{exercise.category}</Text>
          </View>
        </View>

        {showReasons && reasons.length > 0 && !compact && (
          <View style={styles.reasonsContainer}>
            <Text style={styles.reasonsTitle}>Why this might help:</Text>
            {reasons.slice(0, 2).map((reason, reasonIndex) => (
              <Text key={reasonIndex} style={styles.reasonText}>
                • {reason}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={therapeuticColors.primary} />
        <Text style={styles.loadingText}>Finding exercises for you...</Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No recommendations yet</Text>
        <Text style={styles.emptyDescription}>
          Complete a mood check-in to get personalized exercise suggestions
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!compact && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recommended for you</Text>
          <Text style={styles.headerSubtitle}>
            Based on your mood and preferences
          </Text>
        </View>
      )}

      <ScrollView
        horizontal={compact}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={compact ? styles.horizontalContainer : undefined}
      >
        {recommendations.map((recommendation, index) => 
          renderRecommendationCard(recommendation, index)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['4x'],
    paddingBottom: spacing['3x'],
  },
  headerTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['1x'],
  },
  headerSubtitle: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  horizontalContainer: {
    paddingHorizontal: spacing['4x'],
  },
  recommendationCard: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['4x'],
    marginHorizontal: spacing['4x'],
    marginVertical: spacing['2x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    shadowColor: therapeuticColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationCardCompact: {
    width: 280,
    marginHorizontal: spacing['2x'],
    padding: spacing['3x'],
  },
  topRecommendation: {
    borderColor: therapeuticColors.primary,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2x'],
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing['2x'],
  },
  exerciseTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['1x'],
  },
  exerciseTitleCompact: {
    ...typography.body,
    fontWeight: '600',
  },
  topBadge: {
    backgroundColor: therapeuticColors.primary + '20',
    paddingHorizontal: spacing['2x'],
    paddingVertical: spacing['0.5x'],
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  topBadgeText: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  duration: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
    marginBottom: spacing['1x'],
  },
  confidenceBadge: {
    paddingHorizontal: spacing['2x'],
    paddingVertical: spacing['0.5x'],
    borderRadius: 6,
  },
  confidenceText: {
    ...typography.caption,
    fontWeight: '500',
    fontSize: 10,
  },
  exerciseDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['3x'],
    lineHeight: 20,
  },
  exerciseDescriptionCompact: {
    ...typography.caption,
    marginBottom: spacing['2x'],
  },
  categoryContainer: {
    marginBottom: spacing['2x'],
  },
  categoryBadge: {
    backgroundColor: therapeuticColors.primary + '15',
    paddingHorizontal: spacing['2x'],
    paddingVertical: spacing['1x'],
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reasonsContainer: {
    backgroundColor: therapeuticColors.background,
    borderRadius: 8,
    padding: spacing['3x'],
    borderLeftWidth: 3,
    borderLeftColor: therapeuticColors.primary,
  },
  reasonsTitle: {
    ...typography.caption,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  reasonText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing['0.5x'],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['6x'],
  },
  loadingText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginLeft: spacing['2x'],
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing['6x'],
  },
  emptyTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ExerciseRecommendations;
