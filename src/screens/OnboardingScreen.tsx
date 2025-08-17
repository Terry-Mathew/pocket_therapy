/**
 * Onboarding Screen
 *
 * Complete onboarding flow including welcome, micro-session,
 * and setup completion with gentle introduction to the app
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import FirstMicroSession from '../components/FirstMicroSession';
import { useAppStore } from '../store';

interface OnboardingScreenProps {
  navigation: any;
}

type OnboardingStep = 'welcome' | 'micro-session' | 'completion';

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  const { actions } = useAppStore();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');

  const handleMicroSessionComplete = () => {
    setCurrentStep('completion');
  };

  const handleMicroSessionSkip = () => {
    setCurrentStep('completion');
  };

  const handleOnboardingComplete = async () => {
    try {
      // Mark onboarding as completed
      await actions.updateUserProfile({ onboardingCompleted: true });
      // Navigate to main app
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Navigate anyway
      navigation.replace('MainTabs');
    }
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeHeader}>
        <Text style={styles.appName}>PocketTherapy</Text>
        <Text style={styles.welcomeTitle}>Welcome to Your Safe Space</Text>
        <Text style={styles.welcomeSubtitle}>
          A gentle companion for your mental wellness journey
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>🌱</Text>
          <Text style={styles.featureTitle}>Gentle Support</Text>
          <Text style={styles.featureDescription}>
            Compassionate tools designed with your wellbeing in mind
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>🔒</Text>
          <Text style={styles.featureTitle}>Private & Secure</Text>
          <Text style={styles.featureDescription}>
            Your data stays on your device. Complete privacy guaranteed.
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>🆘</Text>
          <Text style={styles.featureTitle}>Crisis Support</Text>
          <Text style={styles.featureDescription}>
            Immediate help available whenever you need it most
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCurrentStep('micro-session')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleOnboardingComplete}
        >
          <Text style={styles.secondaryButtonText}>Skip Introduction</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        This app complements but doesn't replace professional mental health care
      </Text>
    </View>
  );

  const renderCompletionStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completionHeader}>
        <Text style={styles.completionEmoji}>🎉</Text>
        <Text style={styles.completionTitle}>You're All Set!</Text>
        <Text style={styles.completionSubtitle}>
          Your personal wellness companion is ready to support you
        </Text>
      </View>

      <View style={styles.nextStepsContainer}>
        <Text style={styles.nextStepsTitle}>What's next:</Text>

        <View style={styles.nextStepItem}>
          <Text style={styles.stepNumber}>1</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Check in with your mood</Text>
            <Text style={styles.stepDescription}>
              Quick daily check-ins help you understand your patterns
            </Text>
          </View>
        </View>

        <View style={styles.nextStepItem}>
          <Text style={styles.stepNumber}>2</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Explore exercises</Text>
            <Text style={styles.stepDescription}>
              Breathing, grounding, and mindfulness practices
            </Text>
          </View>
        </View>

        <View style={styles.nextStepItem}>
          <Text style={styles.stepNumber}>3</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Remember the SOS button</Text>
            <Text style={styles.stepDescription}>
              Immediate support is always available when you need it
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleOnboardingComplete}
      >
        <Text style={styles.primaryButtonText}>Enter PocketTherapy</Text>
      </TouchableOpacity>

      <Text style={styles.supportText}>
        Remember: You're not alone in this journey 💙
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={therapeuticColors.background}
      />

      {currentStep === 'welcome' && renderWelcomeStep()}
      {currentStep === 'micro-session' && (
        <FirstMicroSession
          onComplete={handleMicroSessionComplete}
          onSkip={handleMicroSessionSkip}
        />
      )}
      {currentStep === 'completion' && renderCompletionStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  stepContainer: {
    flex: 1,
    padding: spacing['6x'],
    justifyContent: 'center',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: spacing['8x'],
  },
  appName: {
    ...typography.h1,
    color: therapeuticColors.primary,
    fontWeight: '700',
    marginBottom: spacing['2x'],
  },
  welcomeTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['3x'],
  },
  welcomeSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
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
  // New styles for micro-session onboarding
  featuresContainer: {
    marginBottom: spacing['8x'],
  },
  featureItem: {
    alignItems: 'center',
    marginBottom: spacing['6x'],
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: spacing['2x'],
  },
  featureTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
    textAlign: 'center',
  },
  featureDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: spacing['3x'],
    marginBottom: spacing['6x'],
  },
  primaryButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  disclaimer: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  completionHeader: {
    alignItems: 'center',
    marginBottom: spacing['8x'],
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: spacing['4x'],
  },
  completionTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['3x'],
  },
  completionSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  nextStepsContainer: {
    marginBottom: spacing['8x'],
  },
  nextStepsTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['4x'],
    textAlign: 'center',
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing['4x'],
    backgroundColor: therapeuticColors.surface,
    padding: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  stepNumber: {
    ...typography.h4,
    color: therapeuticColors.primary,
    fontWeight: '700',
    marginRight: spacing['3x'],
    minWidth: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  stepDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
  supportText: {
    ...typography.body,
    color: therapeuticColors.primary,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: spacing['4x'],
  },
});

export default OnboardingScreen;
