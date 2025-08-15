/**
 * Insights Screen for PocketTherapy
 * 
 * Mood trends, patterns, and analytics dashboard.
 * Placeholder implementation for navigation testing.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, SecondaryButton } from '@components';
import { useAuth } from '@context/AuthContext';
import { theme } from '@constants/theme';

const InsightsScreen: React.FC = () => {
  const { isGuest } = useAuth();

  const handleViewTrends = () => {
    console.log('Navigate to mood trends');
  };

  const handleViewPatterns = () => {
    console.log('Navigate to pattern analysis');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>
          Understand your mood patterns and progress
        </Text>
      </View>

      {/* Guest Mode Notice */}
      {isGuest && (
        <Card style={styles.guestNotice}>
          <Text style={styles.guestTitle}>Limited Insights in Guest Mode</Text>
          <Text style={styles.guestDescription}>
            Upgrade to a full account to see detailed mood trends and patterns across devices.
          </Text>
        </Card>
      )}

      {/* Weekly Overview */}
      <Card title="This Week" style={styles.weeklyCard}>
        <View style={styles.weeklyStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>😊</Text>
            <Text style={styles.statLabel}>Avg Mood</Text>
          </View>
        </View>
        <SecondaryButton
          title="View Detailed Trends"
          onPress={handleViewTrends}
          size="small"
          testID="view-trends-button"
        />
      </Card>

      {/* Mood Patterns */}
      <Card title="Patterns" style={styles.patternsCard}>
        <Text style={styles.patternText}>
          📈 Your mood tends to improve after breathing exercises
        </Text>
        <Text style={styles.patternText}>
          🌅 Mornings are typically your best time of day
        </Text>
        <Text style={styles.patternText}>
          🧘‍♀️ Grounding exercises work well for you
        </Text>
        <SecondaryButton
          title="Explore Patterns"
          onPress={handleViewPatterns}
          size="small"
          style={styles.patternsButton}
          testID="view-patterns-button"
        />
      </Card>

      {/* Exercise Effectiveness */}
      <Card title="Most Helpful Exercises" style={styles.effectivenessCard}>
        <View style={styles.exerciseItem}>
          <Text style={styles.exerciseTitle}>4-7-8 Breathing</Text>
          <Text style={styles.exerciseRating}>⭐⭐⭐⭐⭐</Text>
        </View>
        <View style={styles.exerciseItem}>
          <Text style={styles.exerciseTitle}>5-4-3-2-1 Grounding</Text>
          <Text style={styles.exerciseRating}>⭐⭐⭐⭐⭐</Text>
        </View>
        <View style={styles.exerciseItem}>
          <Text style={styles.exerciseTitle}>Box Breathing</Text>
          <Text style={styles.exerciseRating}>⭐⭐⭐⭐</Text>
        </View>
      </Card>

      {/* Privacy Notice */}
      <Card style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Your Privacy</Text>
        <Text style={styles.privacyText}>
          All insights are generated locally on your device. Your personal data never leaves your control.
        </Text>
      </Card>

      {/* Spacer for SOS button */}
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.cream,
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.grey,
  },
  guestNotice: {
    backgroundColor: theme.colors.semantic.warning.background,
    borderColor: theme.colors.semantic.warning.primary,
    marginBottom: theme.spacing.lg,
  },
  guestTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.semantic.warning.primary,
    marginBottom: theme.spacing.xs,
  },
  guestDescription: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral.charcoal,
  },
  weeklyCard: {
    marginBottom: theme.spacing.lg,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...theme.typography.styles.h2,
    color: theme.colors.primary.sage,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.neutral.grey,
  },
  patternsCard: {
    marginBottom: theme.spacing.lg,
  },
  patternText: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.sm,
  },
  patternsButton: {
    marginTop: theme.spacing.sm,
  },
  effectivenessCard: {
    marginBottom: theme.spacing.lg,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  exerciseTitle: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.charcoal,
    flex: 1,
  },
  exerciseRating: {
    ...theme.typography.styles.body,
  },
  privacyCard: {
    backgroundColor: theme.colors.primary.creamLight,
    borderColor: theme.colors.primary.sage,
    marginBottom: theme.spacing.lg,
  },
  privacyTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.primary.sage,
    marginBottom: theme.spacing.xs,
  },
  privacyText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral.charcoal,
  },
  spacer: {
    height: 100, // Space for SOS button
  },
});

export default InsightsScreen;
