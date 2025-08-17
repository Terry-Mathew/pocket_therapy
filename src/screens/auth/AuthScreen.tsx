/**
 * Authentication Screen for PocketTherapy
 * 
 * Main authentication screen with Google OAuth and guest mode options.
 * Features therapeutic design with gentle onboarding and privacy-first messaging.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  LoadingSpinner,
  Card,
} from '../../components';
import { useAuth } from '../../store';
import { theme } from '@constants/theme';
// import { triggerHaptic } from '../../utils'; // Commented out for now

const AuthScreen: React.FC = () => {
  const { signInWithGoogle, signInAsGuest, isLoading } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await triggerHaptic('light');
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setIsGuestLoading(true);
      await triggerHaptic('light');
      await signInAsGuest();
    } catch (error) {
      console.error('Guest sign-in failed:', error);
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleLearnMore = async () => {
    await triggerHaptic('light');
    Alert.alert(
      'About PocketTherapy',
      'PocketTherapy is a privacy-first mental health app that provides therapeutic exercises, mood tracking, and crisis support. Your data stays private and secure.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner
          size="large"
          message="Loading PocketTherapy..."
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌱</Text>
        </View>
        <Text style={styles.title}>Welcome to PocketTherapy</Text>
        <Text style={styles.subtitle}>
          Your personal space for mental wellness and therapeutic support
        </Text>
      </View>

      {/* Features Section */}
      <Card style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>What you'll get:</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🧘‍♀️</Text>
            <Text style={styles.featureText}>Guided breathing & grounding exercises</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Private mood tracking & insights</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🆘</Text>
            <Text style={styles.featureText}>24/7 crisis support & resources</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Privacy-first design & local storage</Text>
          </View>
        </View>
      </Card>

      {/* Authentication Options */}
      <View style={styles.authSection}>
        <Text style={styles.authTitle}>Choose how to continue:</Text>
        
        {/* Google Sign In */}
        <PrimaryButton
          title="Continue with Google"
          onPress={handleGoogleSignIn}
          loading={isGoogleLoading}
          disabled={isGuestLoading}
          style={styles.authButton}
          testID="google-signin-button"
        />

        {/* Guest Mode */}
        <SecondaryButton
          title="Try as Guest"
          onPress={handleGuestSignIn}
          loading={isGuestLoading}
          disabled={isGoogleLoading}
          style={styles.authButton}
          testID="guest-signin-button"
        />

        {/* Learn More */}
        <OutlineButton
          title="Learn More"
          onPress={handleLearnMore}
          disabled={isGoogleLoading || isGuestLoading}
          style={styles.learnMoreButton}
          testID="learn-more-button"
        />
      </View>

      {/* Privacy Notice */}
      <Card style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
        <Text style={styles.privacyText}>
          • Guest mode keeps all data on your device{'\n'}
          • Google account enables sync across devices{'\n'}
          • You can upgrade from guest to account anytime{'\n'}
          • All data remains private and secure
        </Text>
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our therapeutic approach to mental health support
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
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary.sage,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.elevation.medium,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.neutral.charcoal,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.grey,
    textAlign: 'center',
    maxWidth: 280,
  },
  featuresCard: {
    marginBottom: theme.spacing.xl,
  },
  featuresTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.md,
  },
  featuresList: {
    gap: theme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
    width: 24,
  },
  featureText: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.charcoal,
    flex: 1,
  },
  authSection: {
    marginBottom: theme.spacing.xl,
  },
  authTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.neutral.charcoal,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  authButton: {
    marginBottom: theme.spacing.md,
  },
  learnMoreButton: {
    marginTop: theme.spacing.sm,
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
  footer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.styles.caption,
    color: theme.colors.neutral.grey,
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default AuthScreen;
