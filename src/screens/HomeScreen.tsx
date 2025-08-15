/**
 * Home Screen for PocketTherapy
 * 
 * Main dashboard with greeting, mood check-in, and exercise recommendations.
 * Placeholder implementation for navigation testing.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, PrimaryButton, SecondaryButton } from '@components';
import { useAuth } from '@context/AuthContext';
import { theme } from '@constants/theme';

const HomeScreen: React.FC = () => {
  const { user, isGuest } = useAuth();

  const handleMoodCheckIn = () => {
    console.log('Navigate to mood check-in');
  };

  const handleQuickExercise = () => {
    console.log('Navigate to quick exercise');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>
          Good {getTimeOfDay()}, {(user as any)?.display_name || 'there'}! 👋
        </Text>
        <Text style={styles.subGreeting}>
          How are you feeling today?
        </Text>
      </View>

      {/* Quick Check-in */}
      <Card title="Quick Check-in" style={styles.checkInCard}>
        <Text style={styles.cardDescription}>
          Take 30 seconds to check in with yourself
        </Text>
        <PrimaryButton
          title="How am I feeling?"
          onPress={handleMoodCheckIn}
          testID="mood-checkin-button"
        />
      </Card>

      {/* Quick Exercise */}
      <Card title="Quick Relief" style={styles.exerciseCard}>
        <Text style={styles.cardDescription}>
          Try a 2-minute breathing exercise
        </Text>
        <SecondaryButton
          title="Start 4-7-8 Breathing"
          onPress={handleQuickExercise}
          testID="quick-exercise-button"
        />
      </Card>

      {/* Account Status */}
      {isGuest && (
        <Card style={styles.guestCard}>
          <Text style={styles.guestTitle}>Guest Mode</Text>
          <Text style={styles.guestDescription}>
            Your data is stored locally. Upgrade to sync across devices.
          </Text>
        </Card>
      )}

      {/* Placeholder for more content */}
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
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
  greetingSection: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    ...theme.typography.styles.h2,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.xs,
  },
  subGreeting: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.grey,
  },
  checkInCard: {
    marginBottom: theme.spacing.lg,
  },
  exerciseCard: {
    marginBottom: theme.spacing.lg,
  },
  cardDescription: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.grey,
    marginBottom: theme.spacing.md,
  },
  guestCard: {
    backgroundColor: theme.colors.primary.creamLight,
    borderColor: theme.colors.primary.sage,
    marginBottom: theme.spacing.lg,
  },
  guestTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.primary.sage,
    marginBottom: theme.spacing.xs,
  },
  guestDescription: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral.charcoal,
  },
  spacer: {
    height: 100, // Space for SOS button
  },
});

export default HomeScreen;
