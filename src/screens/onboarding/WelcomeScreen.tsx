/**
 * WelcomeScreen
 * 
 * First onboarding screen with gentle introduction and
 * "What brings you here?" chip selection
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { TherapeuticButton } from '../../components/common/TherapeuticButton';
import { useActions } from '../../store';

interface WelcomeScreenProps {
  navigation: any;
}

const WELCOME_REASONS = [
  { id: 'anxiety', label: 'Managing anxiety', emoji: '🌊' },
  { id: 'stress', label: 'Dealing with stress', emoji: '🍃' },
  { id: 'mood', label: 'Understanding my mood', emoji: '🌱' },
  { id: 'sleep', label: 'Better sleep', emoji: '🌙' },
  { id: 'focus', label: 'Improving focus', emoji: '🎯' },
  { id: 'relationships', label: 'Relationship support', emoji: '💝' },
  { id: 'work', label: 'Work-life balance', emoji: '⚖️' },
  { id: 'general', label: 'General wellbeing', emoji: '✨' },
  { id: 'curious', label: 'Just curious', emoji: '🤔' },
];

const { width: screenWidth } = Dimensions.get('window');

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const { updateUserProfile } = useActions();

  const handleReasonToggle = useCallback((reasonId: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  }, []);

  const handleContinue = useCallback(() => {
    // Store selected reasons for personalization
    // This could be used later for exercise recommendations
    console.log('Selected reasons:', selectedReasons);
    
    navigation.navigate('MoodBaseline');
  }, [selectedReasons, navigation]);

  const handleSkip = useCallback(() => {
    navigation.navigate('MoodBaseline');
  }, [navigation]);

  const renderReasonChip = (reason: typeof WELCOME_REASONS[0]) => {
    const isSelected = selectedReasons.includes(reason.id);
    
    return (
      <TherapeuticButton
        key={reason.id}
        title={`${reason.emoji} ${reason.label}`}
        variant={isSelected ? 'primary' : 'secondary'}
        size="medium"
        onPress={() => handleReasonToggle(reason.id)}
        style={[
          styles.reasonChip,
          isSelected && styles.selectedChip
        ]}
        accessibilityLabel={`${reason.label} - ${isSelected ? 'selected' : 'not selected'}`}
        accessibilityHint={`Tap to ${isSelected ? 'deselect' : 'select'} ${reason.label}`}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeTitle}>Welcome to PocketTherapy</Text>
          <Text style={styles.welcomeSubtitle}>
            Your personal space for mental wellness, designed with care for your privacy and wellbeing.
          </Text>
        </View>

        {/* Illustration placeholder */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustration}>🌱</Text>
          <Text style={styles.illustrationCaption}>
            A safe space to grow and heal
          </Text>
        </View>

        {/* What brings you here section */}
        <View style={styles.reasonsSection}>
          <Text style={styles.reasonsTitle}>What brings you here today?</Text>
          <Text style={styles.reasonsSubtitle}>
            Select any that resonate with you. This helps us personalize your experience.
          </Text>
          
          <View style={styles.reasonsGrid}>
            {WELCOME_REASONS.map(renderReasonChip)}
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            🔒 Your data stays private. Everything is stored locally on your device unless you choose to create an account.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TherapeuticButton
            title="Continue"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleContinue}
            style={styles.continueButton}
            accessibilityLabel="Continue to mood baseline setup"
          />
          
          <TherapeuticButton
            title="Skip for now"
            variant="ghost"
            size="medium"
            fullWidth
            onPress={handleSkip}
            style={styles.skipButton}
            accessibilityLabel="Skip reason selection and continue"
          />
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
    flexGrow: 1,
    paddingHorizontal: spacing['6x'], // 24px
    paddingBottom: spacing['8x'], // 32px
  },
  
  header: {
    alignItems: 'center',
    paddingTop: spacing['8x'], // 32px
    paddingBottom: spacing['6x'], // 24px
  },
  
  welcomeTitle: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['4x'], // 16px
  },
  
  welcomeSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: screenWidth * 0.8,
  },
  
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: spacing['8x'], // 32px
  },
  
  illustration: {
    fontSize: 80,
    marginBottom: spacing['4x'], // 16px
  },
  
  illustrationCaption: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  reasonsSection: {
    marginBottom: spacing['8x'], // 32px
  },
  
  reasonsTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['3x'], // 12px
  },
  
  reasonsSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['6x'], // 24px
    lineHeight: 22,
  },
  
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing['3x'], // 12px
  },
  
  reasonChip: {
    marginHorizontal: spacing['1x'], // 4px
    marginVertical: spacing['1x'], // 4px
    minWidth: 140,
    maxWidth: (screenWidth - spacing['12x']) / 2 - spacing['2x'], // Responsive width
  },
  
  selectedChip: {
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  privacyNote: {
    backgroundColor: therapeuticColors.accent + '15', // 15% opacity
    borderRadius: 12,
    padding: spacing['4x'], // 16px
    marginBottom: spacing['8x'], // 32px
    borderLeftWidth: 4,
    borderLeftColor: therapeuticColors.primary,
  },
  
  privacyText: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  
  actionButtons: {
    gap: spacing['4x'], // 16px
    marginTop: 'auto',
    paddingTop: spacing['6x'], // 24px
  },
  
  continueButton: {
    marginBottom: spacing['2x'], // 8px
  },
  
  skipButton: {
    opacity: 0.8,
  },
});

export default WelcomeScreen;
