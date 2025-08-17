/**
 * MoodHistory Component
 * 
 * Displays mood history with weekly trends and pattern recognition
 * for insights with privacy-first messaging
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { MoodLog } from '../../types';
import { moodStorageService } from '../../services/moodStorage';

interface MoodHistoryProps {
  timeRange?: 'week' | 'month' | 'quarter';
  showPatterns?: boolean;
  onMoodPress?: (moodLog: MoodLog) => void;
}

const MOOD_EMOJIS = {
  1: '😢',
  2: '😕', 
  3: '😐',
  4: '🙂',
  5: '😊'
};

const MOOD_LABELS = {
  1: 'Very sad',
  2: 'Sad',
  3: 'Neutral',
  4: 'Good',
  5: 'Great'
};

const MOOD_COLORS = {
  1: therapeuticColors.error,
  2: therapeuticColors.warning,
  3: therapeuticColors.textSecondary,
  4: therapeuticColors.accent,
  5: therapeuticColors.success
};

const { width: screenWidth } = Dimensions.get('window');

export const MoodHistory: React.FC<MoodHistoryProps> = ({
  timeRange = 'week',
  showPatterns = true,
  onMoodPress
}) => {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  // Load mood logs based on time range
  useEffect(() => {
    const loadMoodLogs = async () => {
      setLoading(true);
      try {
        const days = selectedTimeRange === 'week' ? 7 : 
                    selectedTimeRange === 'month' ? 30 : 90;
        const logs = await moodStorageService.getMoodLogs(undefined, days);
        setMoodLogs(logs);
      } catch (error) {
        console.error('Failed to load mood logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMoodLogs();
  }, [selectedTimeRange]);

  // Calculate mood statistics and patterns
  const moodStats = useMemo(() => {
    if (moodLogs.length === 0) {
      return {
        averageMood: 0,
        totalLogs: 0,
        moodDistribution: {},
        weeklyTrend: [],
        commonTriggers: [],
        bestDay: null,
        worstDay: null
      };
    }

    // Calculate average mood
    const totalMood = moodLogs.reduce((sum, log) => sum + log.mood, 0);
    const averageMood = totalMood / moodLogs.length;

    // Calculate mood distribution
    const moodDistribution: Record<number, number> = {};
    moodLogs.forEach(log => {
      moodDistribution[log.mood] = (moodDistribution[log.mood] || 0) + 1;
    });

    // Calculate weekly trend (last 7 days)
    const weeklyTrend = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayLogs = moodLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === date.toDateString();
      });
      
      const dayAverage = dayLogs.length > 0 
        ? dayLogs.reduce((sum, log) => sum + log.mood, 0) / dayLogs.length
        : null;
      
      weeklyTrend.push({
        date: date.toDateString(),
        average: dayAverage,
        count: dayLogs.length
      });
    }

    // Find common triggers
    const triggerCounts: Record<string, number> = {};
    moodLogs.forEach(log => {
      log.triggers.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    });
    
    const commonTriggers = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    // Find best and worst days
    const dayAverages = weeklyTrend
      .filter(day => day.average !== null)
      .map(day => ({ ...day, average: day.average! }));
    
    const bestDay = dayAverages.length > 0 
      ? dayAverages.reduce((best, day) => day.average > best.average ? day : best)
      : null;
    
    const worstDay = dayAverages.length > 0 
      ? dayAverages.reduce((worst, day) => day.average < worst.average ? day : worst)
      : null;

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      totalLogs: moodLogs.length,
      moodDistribution,
      weeklyTrend,
      commonTriggers,
      bestDay,
      worstDay
    };
  }, [moodLogs]);

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeSelector}>
      {(['week', 'month', 'quarter'] as const).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            selectedTimeRange === range && styles.selectedTimeRangeButton
          ]}
          onPress={() => setSelectedTimeRange(range)}
          accessibilityLabel={`View ${range} mood history`}
          accessibilityState={{ selected: selectedTimeRange === range }}
        >
          <Text style={[
            styles.timeRangeText,
            selectedTimeRange === range && styles.selectedTimeRangeText
          ]}>
            {range === 'week' ? '7 days' : 
             range === 'month' ? '30 days' : '90 days'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWeeklyTrend = () => (
    <View style={styles.trendContainer}>
      <Text style={styles.sectionTitle}>Weekly Trend</Text>
      <View style={styles.trendChart}>
        {moodStats.weeklyTrend.map((day, index) => (
          <View key={index} style={styles.trendDay}>
            <View style={styles.trendBar}>
              {day.average !== null && (
                <View 
                  style={[
                    styles.trendBarFill,
                    { 
                      height: `${(day.average / 5) * 100}%`,
                      backgroundColor: MOOD_COLORS[Math.round(day.average) as keyof typeof MOOD_COLORS]
                    }
                  ]} 
                />
              )}
            </View>
            <Text style={styles.trendDayLabel}>
              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
            </Text>
            {day.count > 0 && (
              <Text style={styles.trendDayCount}>{day.count}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderMoodDistribution = () => (
    <View style={styles.distributionContainer}>
      <Text style={styles.sectionTitle}>Mood Distribution</Text>
      <View style={styles.distributionChart}>
        {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => {
          const count = moodStats.moodDistribution[parseInt(mood)] || 0;
          const percentage = moodStats.totalLogs > 0 ? (count / moodStats.totalLogs) * 100 : 0;
          
          return (
            <View key={mood} style={styles.distributionItem}>
              <Text style={styles.distributionEmoji}>{emoji}</Text>
              <View style={styles.distributionBar}>
                <View 
                  style={[
                    styles.distributionBarFill,
                    { 
                      width: `${percentage}%`,
                      backgroundColor: MOOD_COLORS[parseInt(mood) as keyof typeof MOOD_COLORS]
                    }
                  ]} 
                />
              </View>
              <Text style={styles.distributionCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderPatterns = () => {
    if (!showPatterns || moodStats.totalLogs < 3) return null;

    return (
      <View style={styles.patternsContainer}>
        <Text style={styles.sectionTitle}>Patterns & Insights</Text>
        
        {/* Average mood */}
        <View style={styles.patternItem}>
          <Text style={styles.patternLabel}>Average mood</Text>
          <View style={styles.patternValue}>
            <Text style={styles.patternEmoji}>
              {MOOD_EMOJIS[Math.round(moodStats.averageMood) as keyof typeof MOOD_EMOJIS]}
            </Text>
            <Text style={styles.patternText}>
              {moodStats.averageMood.toFixed(1)} ({MOOD_LABELS[Math.round(moodStats.averageMood) as keyof typeof MOOD_LABELS]})
            </Text>
          </View>
        </View>

        {/* Best and worst days */}
        {moodStats.bestDay && (
          <View style={styles.patternItem}>
            <Text style={styles.patternLabel}>Best day</Text>
            <Text style={styles.patternText}>
              {new Date(moodStats.bestDay.date).toLocaleDateString('en', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })} ({moodStats.bestDay.average.toFixed(1)})
            </Text>
          </View>
        )}

        {/* Common triggers */}
        {moodStats.commonTriggers.length > 0 && (
          <View style={styles.patternItem}>
            <Text style={styles.patternLabel}>Common influences</Text>
            <View style={styles.triggersList}>
              {moodStats.commonTriggers.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.triggerChip}>
                  <Text style={styles.triggerText}>{item.trigger}</Text>
                  <Text style={styles.triggerCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>📊</Text>
      <Text style={styles.emptyStateTitle}>No mood data yet</Text>
      <Text style={styles.emptyStateDescription}>
        Start tracking your mood to see patterns and insights here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading mood history...</Text>
      </View>
    );
  }

  if (moodLogs.length === 0) {
    return renderEmptyState();
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderTimeRangeSelector()}
      
      <View style={styles.statsOverview}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{moodStats.totalLogs}</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{moodStats.averageMood.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {moodStats.commonTriggers.length}
          </Text>
          <Text style={styles.statLabel}>Triggers</Text>
        </View>
      </View>

      {renderWeeklyTrend()}
      {renderMoodDistribution()}
      {renderPatterns()}
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
    backgroundColor: therapeuticColors.background,
  },
  
  loadingText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
  },
  
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['1x'], // 4px
    margin: spacing['6x'], // 24px
    marginBottom: spacing['4x'], // 16px
  },
  
  timeRangeButton: {
    flex: 1,
    paddingVertical: spacing['2x'], // 8px
    paddingHorizontal: spacing['3x'], // 12px
    borderRadius: 8,
    alignItems: 'center',
  },
  
  selectedTimeRangeButton: {
    backgroundColor: therapeuticColors.primary,
  },
  
  timeRangeText: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  
  selectedTimeRangeText: {
    color: '#FFFFFF',
  },
  
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['6x'], // 24px
    marginHorizontal: spacing['6x'], // 24px
    marginBottom: spacing['6x'], // 24px
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statNumber: {
    ...typography.h2,
    color: therapeuticColors.primary,
    marginBottom: spacing['1x'], // 4px
  },
  
  statLabel: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  
  sectionTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['4x'], // 16px
  },
  
  trendContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['6x'], // 24px
    marginHorizontal: spacing['6x'], // 24px
    marginBottom: spacing['6x'], // 24px
  },
  
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  
  trendDay: {
    alignItems: 'center',
    flex: 1,
  },
  
  trendBar: {
    width: 20,
    height: 80,
    backgroundColor: therapeuticColors.border,
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: spacing['2x'], // 8px
  },
  
  trendBarFill: {
    borderRadius: 10,
    minHeight: 4,
  },
  
  trendDayLabel: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['1x'], // 4px
  },
  
  trendDayCount: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    fontSize: 10,
  },
  
  distributionContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['6x'], // 24px
    marginHorizontal: spacing['6x'], // 24px
    marginBottom: spacing['6x'], // 24px
  },
  
  distributionChart: {
    gap: spacing['3x'], // 12px
  },
  
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3x'], // 12px
  },
  
  distributionEmoji: {
    fontSize: 20,
    width: 30,
  },
  
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: therapeuticColors.border,
    borderRadius: 4,
  },
  
  distributionBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  
  distributionCount: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  
  patternsContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['6x'], // 24px
    marginHorizontal: spacing['6x'], // 24px
    marginBottom: spacing['6x'], // 24px
  },
  
  patternItem: {
    marginBottom: spacing['4x'], // 16px
  },
  
  patternLabel: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['2x'], // 8px
    fontWeight: '500',
  },
  
  patternValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2x'], // 8px
  },
  
  patternEmoji: {
    fontSize: 20,
  },
  
  patternText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
  },
  
  triggersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2x'], // 8px
  },
  
  triggerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: therapeuticColors.primary + '15',
    borderRadius: 12,
    paddingHorizontal: spacing['3x'], // 12px
    paddingVertical: spacing['1x'], // 4px
    gap: spacing['1x'], // 4px
  },
  
  triggerText: {
    ...typography.caption,
    color: therapeuticColors.primary,
  },
  
  triggerCount: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: 'bold',
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['8x'], // 32px
  },
  
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: spacing['4x'], // 16px
  },
  
  emptyStateTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2x'], // 8px
  },
  
  emptyStateDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MoodHistory;
