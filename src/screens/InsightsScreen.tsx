/**
 * InsightsScreen
 *
 * Privacy-first insights dashboard showing mood trends, patterns,
 * and personalized recommendations with local-only analytics
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../constants/theme';
import { MoodHistory } from '../components/mood/MoodHistory';
import { useAuth, useMood } from '../store';
import { MoodLog } from '../types';

interface InsightsScreenProps {
  navigation?: any;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { auth } = useAuth();
  const { logs } = useMood();
  // const { library } = useExercises(); // Commented out for now

  const isGuest = auth === 'guest';

  // Calculate insights data
  const insightsData = useMemo(() => {
    const recentLogs = logs.slice(-30); // Last 30 days
    const recentSessions: any[] = []; // Placeholder for exercise sessions

    return {
      totalCheckIns: recentLogs.length,
      averageMood: recentLogs.length > 0
        ? recentLogs.reduce((sum, log) => sum + log.mood, 0) / recentLogs.length
        : 0,
      exercisesCompleted: recentSessions.length,
      streakDays: calculateStreak(recentLogs),
      topTriggers: getTopTriggers(recentLogs),
      moodTrend: calculateMoodTrend(recentLogs),
      bestExercises: getBestExercises(recentSessions),
    };
  }, [logs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh data from store
    setTimeout(() => setRefreshing(false), 1000);
  };

  // const handleTabPress = (tabId: string) => {
  //   setActiveTab(tabId);
  // };

  // Helper functions for calculations
  const calculateStreak = (logs: MoodLog[]): number => {
    if (logs.length === 0) return 0;

    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const hasLogForDate = logs.some(log => {
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === checkDate.toDateString();
      });

      if (hasLogForDate) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }

    return streak;
  };

  const getTopTriggers = (logs: MoodLog[]): Array<{trigger: string, count: number}> => {
    const triggerCounts: Record<string, number> = {};

    logs.forEach(log => {
      if (log.triggers) {
        log.triggers.forEach(trigger => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
      }
    });

    return Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([trigger, count]) => ({ trigger, count }));
  };

  const calculateMoodTrend = (logs: MoodLog[]): 'improving' | 'stable' | 'declining' | 'insufficient' => {
    if (logs.length < 7) return 'insufficient';

    const recent = logs.slice(-7);
    const previous = logs.slice(-14, -7);

    if (previous.length === 0) return 'insufficient';

    const recentAvg = recent.reduce((sum, log) => sum + log.mood, 0) / recent.length;
    const previousAvg = previous.reduce((sum, log) => sum + log.mood, 0) / previous.length;

    const difference = recentAvg - previousAvg;

    if (difference > 0.3) return 'improving';
    if (difference < -0.3) return 'declining';
    return 'stable';
  };

  const getBestExercises = (sessions: any[]): Array<{name: string, rating: number}> => {
    const exerciseRatings: Record<string, {total: number, count: number}> = {};

    sessions.forEach(session => {
      if (session.rating && session.exerciseId) {
        if (!exerciseRatings[session.exerciseId]) {
          exerciseRatings[session.exerciseId] = { total: 0, count: 0 };
        }
        exerciseRatings[session.exerciseId]!.total += session.rating;
        exerciseRatings[session.exerciseId]!.count += 1;
      }
    });

    return Object.entries(exerciseRatings)
      .map(([id, data]) => ({
        name: id, // Would map to actual exercise name
        rating: data.total / data.count
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>
        Your personal mental wellness patterns
      </Text>
    </View>
  );

  const renderGuestNotice = () => {
    if (!isGuest) return null;

    return (
      <View style={styles.guestNotice}>
        <Text style={styles.guestTitle}>🔒 Privacy-First Insights</Text>
        <Text style={styles.guestDescription}>
          Your insights are calculated locally on your device.
          Create an account to sync across devices.
        </Text>
      </View>
    );
  };

  const renderOverviewStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>This Month</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{insightsData.totalCheckIns}</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{insightsData.exercisesCompleted}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{insightsData.streakDays}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {insightsData.averageMood > 0 ? insightsData.averageMood.toFixed(1) : '--'}
          </Text>
          <Text style={styles.statLabel}>Avg Mood</Text>
        </View>
      </View>
    </View>
  );

  const renderMoodTrend = () => {
    const trendEmoji = {
      improving: '📈',
      stable: '➡️',
      declining: '📉',
      insufficient: '📊'
    };

    const trendText = {
      improving: 'Your mood is trending upward',
      stable: 'Your mood has been stable',
      declining: 'Your mood needs attention',
      insufficient: 'Not enough data yet'
    };

    return (
      <View style={styles.trendContainer}>
        <Text style={styles.sectionTitle}>Mood Trend</Text>
        <View style={styles.trendCard}>
          <Text style={styles.trendEmoji}>{trendEmoji[insightsData.moodTrend]}</Text>
          <Text style={styles.trendText}>{trendText[insightsData.moodTrend]}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderGuestNotice()}
        {renderOverviewStats()}
        {renderMoodTrend()}

        <MoodHistory
          timeRange="month"
          showPatterns={true}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },

  scrollView: {
    flex: 1,
  },

  header: {
    paddingHorizontal: spacing['6x'], // 24px
    paddingTop: spacing['6x'], // 24px
    paddingBottom: spacing['4x'], // 16px
  },

  title: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'], // 8px
  },

  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 24,
  },

  guestNotice: {
    backgroundColor: therapeuticColors.primary + '15',
    borderRadius: 16,
    padding: spacing['5x'], // 20px
    marginHorizontal: spacing['6x'], // 24px
    marginBottom: spacing['6x'], // 24px
    borderWidth: 1,
    borderColor: therapeuticColors.primary + '30',
  },

  guestTitle: {
    ...typography.h3,
    color: therapeuticColors.primary,
    marginBottom: spacing['2x'], // 8px
  },

  guestDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 22,
  },

  statsContainer: {
    paddingHorizontal: spacing['6x'], // 24px
    marginBottom: spacing['6x'], // 24px
  },

  sectionTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['4x'], // 16px
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3x'], // 12px
  },

  statCard: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['5x'], // 20px
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },

  statNumber: {
    ...typography.h2,
    color: therapeuticColors.primary,
    marginBottom: spacing['1x'], // 4px
  },

  statLabel: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
  },

  trendContainer: {
    paddingHorizontal: spacing['6x'], // 24px
    marginBottom: spacing['6x'], // 24px
  },

  trendCard: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['5x'], // 20px
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },

  trendEmoji: {
    fontSize: 32,
    marginRight: spacing['4x'], // 16px
  },

  trendText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    flex: 1,
  },
});

export default InsightsScreen;
