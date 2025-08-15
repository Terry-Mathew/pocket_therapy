/**
 * Onboarding Screen for PocketTherapy
 * 
 * Gentle onboarding flow for new users.
 * Placeholder implementation for navigation testing.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, PrimaryButton, SecondaryButton } from '@components';
import { useAuth } from '@context/AuthContext';
import { theme } from '@constants/theme';

const OnboardingScreen: React.FC = () => {
  const { updateProfile } = useAuth();

  const handleCompleteOnboarding = async () => {
    try {
      // Mark onboarding as completed
      await updateProfile({ onboarding_completed: true });
      console.log('Onboarding completed - navigate to main app');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const handleSkipOnboarding = async () => {
    try {
      // Skip onboarding and go to main app
      await updateProfile({ onboarding_completed: true });
      console.log('Onboarding skipped - navigate to main app');
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeEmoji}>🌱</Text>
        <Text style={styles.welcomeTitle}>Welcome to PocketTherapy</Text>
        <Text style={styles.welcomeSubtitle}>
          Let's take a moment to set up your personal mental wellness space
        </Text>
      </View>

      {/* What to Expect */}
      <Card title="What to expect" style={styles.expectationCard}>
        <View style={styles.expectationItem}>
          <Text style={styles.expectationIcon}>🧘‍♀️</Text>
          <Text style={styles.expectationText}>
            Gentle exercises for breathing, grounding, and cognitive support
          </Text>
        </View>
        <View style={styles.expectationItem}>
          <Text style={styles.expectationIcon}>📊</Text>
          <Text style={styles.expectationText}>
            Private mood tracking to understand your patterns
          </Text>
        </View>
        <View style={styles.expectationItem}>
          <Text style={styles.expectationIcon}>🆘</Text>
          <Text style={styles.expectationText}>
            24/7 crisis support with immediate breathing exercises
          </Text>
        </View>
        <View style={styles.expectationItem}>
          <Text style={styles.expectationIcon}>🔒</Text>
          <Text style={styles.expectationText}>
            Your data stays private and secure on your device
          </Text>
        </View>
      </Card>

      {/* Quick Setup */}
      <Card title="Quick setup" style={styles.setupCard}>
        <Text style={styles.setupDescription}>
          We'll help you personalize your experience in just a few steps:
        </Text>
        <View style={styles.setupSteps}>
          <Text style={styles.setupStep}>1. Set your mood baseline</Text>
          <Text style={styles.setupStep}>2. Choose your preferred exercises</Text>
          <Text style={styles.setupStep}>3. Configure gentle reminders</Text>
        </View>
      </Card>

      {/* Privacy Assurance */}
      <Card style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Your privacy matters</Text>
        <Text style={styles.privacyText}>
          Everything you share stays on your device unless you choose to sync with a secure account. 
          You're always in control of your data.
        </Text>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <PrimaryButton
          title="Let's get started"
          onPress={handleCompleteOnboarding}
          testID="start-onboarding-button"
          style={styles.primaryButton}
        />
        <SecondaryButton
          title="Skip for now"
          onPress={handleSkipOnboarding}
          testID="skip-onboarding-button"
          style={styles.secondaryButton}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          You can always change these settings later in your profile
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.cream,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 2,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  welcomeEmoji: {
    fontSize: 60,
    marginBottom: theme.spacing.md,
  },
  welcomeTitle: {
    ...theme.typography.styles.h1,
    color: theme.colors.neutral.charcoal,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  welcomeSubtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.grey,
    textAlign: 'center',
    maxWidth: 280,
  },
  expectationCard: {
    marginBottom: theme.spacing.lg,
  },
  expectationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  expectationIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  expectationText: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.charcoal,
    flex: 1,
  },
  setupCard: {
    marginBottom: theme.spacing.lg,
  },
  setupDescription: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.md,
  },
  setupSteps: {
    gap: theme.spacing.xs,
  },
  setupStep: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.grey,
  },
  privacyCard: {
    backgroundColor: theme.colors.primary.creamLight,
    borderColor: theme.colors.primary.sage,
    marginBottom: theme.spacing.xl,
  },
  privacyTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.primary.sage,
    marginBottom: theme.spacing.sm,
  },
  privacyText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral.charcoal,
    lineHeight: 20,
  },
  actionButtons: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  primaryButton: {
    // Additional styling if needed
  },
  secondaryButton: {
    // Additional styling if needed
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...theme.typography.styles.caption,
    color: theme.colors.neutral.grey,
    textAlign: 'center',
    maxWidth: 250,
  },
});

export default OnboardingScreen;
