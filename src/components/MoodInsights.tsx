/**
 * Mood Insights Component
 * 
 * Displays AI-powered mood pattern analysis with insights,
 * trends, recommendations, and visual pattern representations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';

interface MoodInsightsProps {
  timeframe?: 'week' | 'month' | 'quarter';
  onRefresh?: () => void;
}

export const MoodInsights: React.FC<MoodInsightsProps> = ({
  timeframe = 'month',
  onRefresh,
}) => {
  const { actions, mood, exercises } = useAppStore();
  
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadInsights();
  }, [timeframe]);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      
      const analysis = await actions.getAIMoodAnalysis(timeframe);
      setInsights(analysis);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load mood insights:', error);
      Alert.alert(
        'Insights Unavailable',
        'Unable to generate mood insights right now. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadInsights();
    onRefresh?.();
  };

  const renderInsightCard = (
    title: string,
    items: string[],
    icon: string,
    color: string
  ) => (
    <View style={[styles.insightCard, { borderLeftColor: color }]}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightIcon}>{icon}</Text>
        <Text style={styles.insightTitle}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <Text key={index} style={styles.insightText}>
          • {item}
        </Text>
      ))}
    </View>
  );

  const renderPatternCard = () => {
    if (!insights?.patterns) return null;

    const { patterns } = insights;
    const stabilityPercentage = Math.round(patterns.moodStability * 100);
    const averageMoodText = patterns.averageMood.toFixed(1);

    return (
      <View style={[styles.insightCard, { borderLeftColor: therapeuticColors.primary }]}>
        <View style={styles.insightHeader}>
          <Text style={styles.insightIcon}>📊</Text>
          <Text style={styles.insightTitle}>Your Patterns</Text>
        </View>
        
        <View style={styles.patternGrid}>
          <View style={styles.patternItem}>
            <Text style={styles.patternValue}>{averageMoodText}/5</Text>
            <Text style={styles.patternLabel}>Average Mood</Text>
          </View>
          
          <View style={styles.patternItem}>
            <Text style={styles.patternValue}>{stabilityPercentage}%</Text>
            <Text style={styles.patternLabel}>Stability</Text>
          </View>
        </View>

        {Object.keys(patterns.triggerPatterns).length > 0 && (
          <View style={styles.triggerSection}>
            <Text style={styles.triggerTitle}>Common Triggers:</Text>
            <View style={styles.triggerList}>
              {Object.entries(patterns.triggerPatterns)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([trigger, count]) => (
                  <View key={trigger} style={styles.triggerTag}>
                    <Text style={styles.triggerText}>{trigger}</Text>
                    <Text style={styles.triggerCount}>{count}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeSelector}>
      {(['week', 'month', 'quarter'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.timeframeButton,
            timeframe === period && styles.timeframeButtonActive,
          ]}
          onPress={() => {
            if (timeframe !== period) {
              // This would trigger a re-analysis with new timeframe
              console.log(`Switch to ${period} analysis`);
            }
          }}
        >
          <Text style={[
            styles.timeframeButtonText,
            timeframe === period && styles.timeframeButtonTextActive,
          ]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={therapeuticColors.primary} />
        <Text style={styles.loadingText}>Analyzing your mood patterns...</Text>
        <Text style={styles.loadingSubtext}>This may take a moment</Text>
      </View>
    );
  }

  if (!insights) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No Insights Yet</Text>
        <Text style={styles.emptyText}>
          Keep tracking your mood to unlock personalized insights about your patterns and trends.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInsights}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Mood Insights</Text>
        <Text style={styles.subtitle}>
          AI-powered analysis of your emotional patterns
        </Text>
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Updated {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </View>

      {renderTimeframeSelector()}
      {renderPatternCard()}

      {insights.insights && insights.insights.length > 0 && 
        renderInsightCard(
          'Key Insights',
          insights.insights,
          '💡',
          therapeuticColors.secondary
        )}

      {insights.trends && insights.trends.length > 0 && 
        renderInsightCard(
          'Trends',
          insights.trends,
          '📈',
          therapeuticColors.primary
        )}

      {insights.strengths && insights.strengths.length > 0 && 
        renderInsightCard(
          'Your Strengths',
          insights.strengths,
          '⭐',
          therapeuticColors.success
        )}

      {insights.recommendations && insights.recommendations.length > 0 && 
        renderInsightCard(
          'Recommendations',
          insights.recommendations,
          '🎯',
          therapeuticColors.warning
        )}

      {insights.riskFactors && insights.riskFactors.length > 0 && 
        renderInsightCard(
          'Things to Watch',
          insights.riskFactors,
          '⚠️',
          therapeuticColors.error
        )}

      <View style={styles.refreshSection}>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh Insights</Text>
        </TouchableOpacity>
        
        <Text style={styles.refreshNote}>
          Insights are generated using AI and should complement, not replace, professional mental health support.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['6x'],
  },
  loadingText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    marginTop: spacing['4x'],
    textAlign: 'center',
  },
  loadingSubtext: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginTop: spacing['2x'],
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['6x'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing['4x'],
  },
  emptyTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['4x'],
  },
  retryButton: {
    backgroundColor: therapeuticColors.primary,
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['3x'],
    borderRadius: 12,
  },
  retryButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  header: {
    padding: spacing['4x'],
    paddingBottom: spacing['2x'],
  },
  title: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['1x'],
  },
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['2x'],
  },
  lastUpdated: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
  },
  timeframeSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['4x'],
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['1x'],
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: spacing['2x'],
    alignItems: 'center',
    borderRadius: 8,
  },
  timeframeButtonActive: {
    backgroundColor: therapeuticColors.primary,
  },
  timeframeButtonText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  timeframeButtonTextActive: {
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: therapeuticColors.surface,
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['4x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['3x'],
  },
  insightIcon: {
    fontSize: 20,
    marginRight: spacing['2x'],
  },
  insightTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
  },
  insightText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing['2x'],
  },
  patternGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing['3x'],
  },
  patternItem: {
    alignItems: 'center',
  },
  patternValue: {
    ...typography.h3,
    color: therapeuticColors.primary,
    fontWeight: '700',
  },
  patternLabel: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginTop: spacing['1x'],
  },
  triggerSection: {
    marginTop: spacing['2x'],
  },
  triggerTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['2x'],
  },
  triggerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2x'],
  },
  triggerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: therapeuticColors.primary + '20',
    paddingHorizontal: spacing['3x'],
    paddingVertical: spacing['1x'],
    borderRadius: 16,
  },
  triggerText: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '500',
  },
  triggerCount: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '700',
    marginLeft: spacing['1x'],
  },
  refreshSection: {
    padding: spacing['4x'],
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: therapeuticColors.secondary,
    paddingHorizontal: spacing['6x'],
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    marginBottom: spacing['3x'],
  },
  refreshButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  refreshNote: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MoodInsights;
