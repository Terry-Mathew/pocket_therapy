/**
 * Home Screen for PocketTherapy
 * 
 * Main dashboard with greeting, mood check-in, and exercise recommendations.
 * Placeholder implementation for navigation testing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../constants/theme';
import { useAuth } from '../store';
import { moodStorageService } from '../services/moodStorage';

interface HomeScreenProps {
  navigation?: any;
}

const GREETINGS = {
  morning: [
    "Good morning! How are you feeling today?",
    "Rise and shine! Ready to check in with yourself?",
    "Morning! Let's start the day mindfully.",
    "Hello there! How did you sleep?",
  ],
  afternoon: [
    "Good afternoon! How's your day going?",
    "Hey! Time for a midday check-in?",
    "Afternoon! How are you feeling right now?",
    "Hi! Ready to pause and reflect?",
  ],
  evening: [
    "Good evening! How was your day?",
    "Evening! Time to wind down and reflect.",
    "Hey! How are you feeling this evening?",
    "Hello! Ready to check in before the day ends?",
  ],
  night: [
    "Good night! How are you feeling?",
    "Evening! Time for a gentle check-in.",
    "Hey! How was your day overall?",
    "Hello! Ready for some evening reflection?",
  ]
};

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

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [greeting, setGreeting] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [moodStats, setMoodStats] = useState({
    averageMood: 0,
    totalLogs: 0,
    streak: 0,
    lastMood: null as number | null,
    lastMoodTime: null as string | null
  });
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  // Get time-based greeting
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let period: typeof timeOfDay;

      if (hour >= 5 && hour < 12) {
        period = 'morning';
      } else if (hour >= 12 && hour < 17) {
        period = 'afternoon';
      } else if (hour >= 17 && hour < 21) {
        period = 'evening';
      } else {
        period = 'night';
      }

      setTimeOfDay(period);

      const greetings = GREETINGS[period];
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      setGreeting(randomGreeting);
    };

    updateGreeting();

    // Update greeting every hour
    const interval = setInterval(updateGreeting, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load mood statistics
  const loadMoodStats = useCallback(async () => {
    try {
      const [stats, recentLogs] = await Promise.all([
        moodStorageService.getMoodStats(30),
        moodStorageService.getMoodLogs(1)
      ]);

      setMoodStats({
        averageMood: stats.averageMood,
        totalLogs: stats.totalLogs,
        streak: stats.streak,
        lastMood: recentLogs[0]?.mood || null,
        lastMoodTime: recentLogs[0]?.timestamp || null
      });
    } catch (error) {
      console.error('Failed to load mood stats:', error);
    }
  }, []);

  useEffect(() => {
    loadMoodStats();
  }, [loadMoodStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMoodStats();
    setRefreshing(false);
  }, [loadMoodStats]);

  const handleMoodCheckIn = useCallback(() => {
    if (navigation) {
      navigation.navigate('MoodCheckIn');
    } else {
      console.log('Navigate to mood check-in');
    }
  }, [navigation]);

  const handleViewInsights = useCallback(() => {
    if (navigation) {
      navigation.navigate('Insights');
    } else {
      console.log('Navigate to insights');
    }
  }, [navigation]);

  const handleViewExercises = useCallback(() => {
    if (navigation) {
      navigation.navigate('Exercises');
    } else {
      console.log('Navigate to exercises');
    }
  }, [navigation]);

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const renderGreetingSection = () => (
    <View style={styles.greetingSection}>
      <Text style={styles.greeting}>{greeting}</Text>
      {user?.name && (
        <Text style={styles.userName}>Welcome back, {user.name}!</Text>
      )}
    </View>
  );

  const renderMoodSummary = () => (
    <View style={styles.moodSummaryCard}>
      <Text style={styles.cardTitle}>Your Mood</Text>

      {moodStats.lastMood ? (
        <View style={styles.lastMoodContainer}>
          <View style={styles.moodDisplay}>
            <Text style={styles.moodEmoji}>
              {MOOD_EMOJIS[moodStats.lastMood as keyof typeof MOOD_EMOJIS]}
            </Text>
            <View style={styles.moodInfo}>
              <Text style={styles.moodLabel}>
                {MOOD_LABELS[moodStats.lastMood as keyof typeof MOOD_LABELS]}
              </Text>
              <Text style={styles.moodTime}>
                {moodStats.lastMoodTime && getTimeAgo(moodStats.lastMoodTime)}
              </Text>
            </View>
          </View>

          {moodStats.streak > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>
                🔥 {moodStats.streak} day{moodStats.streak !== 1 ? 's' : ''} streak
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noMoodContainer}>
          <Text style={styles.noMoodText}>No mood logged yet today</Text>
          <Text style={styles.noMoodSubtext}>
            Take a moment to check in with yourself
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={therapeuticColors.primary}
            colors={[therapeuticColors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderGreetingSection()}
        {renderMoodSummary()}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.primaryAction}
            onPress={handleMoodCheckIn}
            accessibilityLabel="Start mood check-in"
            accessibilityHint="Begin a 30-second mood check-in process"
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionEmoji}>💭</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>
                  {moodStats.lastMood ? 'Update Mood' : 'Check In'}
                </Text>
                <Text style={styles.actionSubtitle}>
                  {moodStats.lastMood ? 'How are you feeling now?' : '30-second mood check-in'}
                </Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={handleViewExercises}
              accessibilityLabel="View exercises"
            >
              <Text style={styles.secondaryActionEmoji}>🧘‍♀️</Text>
              <Text style={styles.secondaryActionText}>Exercises</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={handleViewInsights}
              accessibilityLabel="View insights"
            >
              <Text style={styles.secondaryActionEmoji}>📊</Text>
              <Text style={styles.secondaryActionText}>Insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Preview */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>This Month</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{moodStats.totalLogs}</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {moodStats.averageMood > 0 ? moodStats.averageMood.toFixed(1) : '—'}
              </Text>
              <Text style={styles.statLabel}>Avg Mood</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{moodStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          {moodStats.totalLogs > 0 && (
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleViewInsights}
              accessibilityLabel="View detailed insights"
            >
              <Text style={styles.viewMoreText}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>
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

  scrollContent: {
    paddingHorizontal: spacing['6x'], // 24px
    paddingBottom: spacing['8x'], // 32px
  },

  greetingSection: {
    paddingTop: spacing['6x'], // 24px
    paddingBottom: spacing['8x'], // 32px
  },

  greeting: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'], // 8px
    lineHeight: 32,
  },

  userName: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 24,
  },

  sectionTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['4x'], // 16px
  },

  moodSummaryCard: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['6x'], // 24px
    marginBottom: spacing['6x'], // 24px
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },

  cardTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['4x'], // 16px
  },

  lastMoodContainer: {
    gap: spacing['4x'], // 16px
  },

  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4x'], // 16px
  },

  moodEmoji: {
    fontSize: 48,
  },

  moodInfo: {
    flex: 1,
  },

  moodLabel: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['1x'], // 4px
  },

  moodTime: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
  },

  streakContainer: {
    backgroundColor: therapeuticColors.success + '15',
    borderRadius: 12,
    padding: spacing['3x'], // 12px
    alignItems: 'center',
  },

  streakText: {
    ...typography.bodySmall,
    color: therapeuticColors.success,
    fontWeight: '600',
  },

  noMoodContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4x'], // 16px
  },

  noMoodText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['2x'], // 8px
  },

  noMoodSubtext: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
  },

  quickActionsSection: {
    marginBottom: spacing['6x'], // 24px
  },

  primaryAction: {
    backgroundColor: therapeuticColors.primary,
    borderRadius: 16,
    padding: spacing['5x'], // 20px
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['4x'], // 16px
    shadowColor: therapeuticColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  actionEmoji: {
    fontSize: 24,
    marginRight: spacing['4x'], // 16px
  },

  actionText: {
    flex: 1,
  },

  actionTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    marginBottom: spacing['1x'], // 4px
  },

  actionSubtitle: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  actionArrow: {
    ...typography.h2,
    color: '#FFFFFF',
    opacity: 0.8,
  },

  secondaryActions: {
    flexDirection: 'row',
    gap: spacing['4x'], // 16px
  },

  secondaryAction: {
    flex: 1,
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['4x'], // 16px
    alignItems: 'center',
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },

  secondaryActionEmoji: {
    fontSize: 24,
    marginBottom: spacing['2x'], // 8px
  },

  secondaryActionText: {
    ...typography.bodySmall,
    color: therapeuticColors.textPrimary,
    fontWeight: '500',
  },

  statsCard: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['6x'], // 24px
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing['4x'], // 16px
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
    textAlign: 'center',
  },

  viewMoreButton: {
    backgroundColor: therapeuticColors.primary + '15',
    borderRadius: 8,
    paddingVertical: spacing['2x'], // 8px
    paddingHorizontal: spacing['4x'], // 16px
    alignItems: 'center',
  },

  viewMoreText: {
    ...typography.bodySmall,
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
});

export default HomeScreen;
