/**
 * SOSScreen
 * 
 * Crisis support screen with immediate breathing exercises
 * Implements crisis-safe design with no accidental exits
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Vibration,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../constants/theme';
import { EMERGENCY_CONTACTS } from '../services/crisisDetection';
import { TherapeuticButton } from '../components/common/TherapeuticButton';
import { BreathingCircle } from '../components/exercises/BreathingCircle';
import SOSCheckIn from '../components/SOSCheckIn';
import { sosSessionManager } from '../services/sosSessionManager';

interface SOSScreenProps {
  navigation: any;
  route: {
    params?: {
      immediate?: boolean;
      exercise?: string;
    };
  };
}

export const SOSScreen: React.FC<SOSScreenProps> = ({ navigation, route }) => {
  const [currentView, setCurrentView] = useState<'resources' | 'breathing'>('resources');
  const [isBreathing, setIsBreathing] = useState(false);
  const [exitConfirmation, setExitConfirmation] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);

  const { immediate = false, exercise = 'breathing' } = route.params || {};

  // Initialize SOS session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Try to resume existing session first
        const existingSession = await sosSessionManager.resumeSession();

        if (existingSession) {
          setCurrentSession(existingSession);
          setSessionStartTime(new Date(existingSession.startedAt));
          console.log('Resumed existing SOS session');
        } else {
          // Start new session
          const newSession = await sosSessionManager.startSession({
            exerciseId: exercise === 'breathing' ? 'breathing-478' : undefined,
            autoCheckInInterval: 60, // 60 seconds
          });
          setCurrentSession(newSession);
          setSessionStartTime(new Date());
          console.log('Started new SOS session');
        }
      } catch (error) {
        console.error('Failed to initialize SOS session:', error);
        setSessionStartTime(new Date()); // Fallback
      }
    };

    initializeSession();

    // Schedule first check-in after 60 seconds
    const checkInTimer = setTimeout(() => {
      setShowCheckIn(true);
    }, 60000);

    return () => clearTimeout(checkInTimer);
  }, []);

  // Auto-start breathing if immediate crisis
  useEffect(() => {
    if (immediate) {
      setCurrentView('breathing');
      setIsBreathing(true);
    }
  }, [immediate]);

  // Prevent accidental back navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!exitConfirmation) {
        e.preventDefault();
        handleExitAttempt();
      }
    });

    return unsubscribe;
  }, [navigation, exitConfirmation]);

  // Handle check-in responses
  const handleCheckInResponse = useCallback(async (response: 'better' | 'same' | 'worse' | 'need_help') => {
    try {
      await sosSessionManager.addCheckIn({
        type: 'manual',
        response,
      });

      setShowCheckIn(false);

      // Handle different responses
      if (response === 'need_help') {
        // Show crisis resources
        setCurrentView('resources');
      } else if (response === 'better') {
        // Gentle celebration and continue
        Alert.alert(
          'That\'s wonderful',
          'I\'m so glad you\'re feeling better. You\'re doing great.',
          [{ text: 'Continue', style: 'default' }]
        );
      } else if (response === 'worse') {
        // Offer additional support
        Alert.alert(
          'I hear you',
          'It\'s okay that you\'re still struggling. Let\'s try a different approach.',
          [
            { text: 'Try breathing exercise', onPress: () => setCurrentView('breathing') },
            { text: 'See resources', onPress: () => setCurrentView('resources') },
          ]
        );
      }

      // Schedule next check-in in 2 minutes
      setTimeout(() => {
        setShowCheckIn(true);
      }, 120000);
    } catch (error) {
      console.error('Failed to handle check-in response:', error);
      setShowCheckIn(false);
    }
  }, []);

  const handleCheckInDismiss = useCallback(() => {
    setShowCheckIn(false);
    // Schedule next check-in in 2 minutes
    setTimeout(() => {
      setShowCheckIn(true);
    }, 120000);
  }, []);

  const handleExitAttempt = useCallback(() => {
    Alert.alert(
      'Are you feeling safer now?',
      'We want to make sure you\'re okay before you leave.',
      [
        {
          text: 'No, keep helping',
          style: 'cancel'
        },
        {
          text: 'Yes, I\'m better',
          onPress: async () => {
            try {
              // End the SOS session
              await sosSessionManager.endSession('completed', 'User reported feeling better');
              setExitConfirmation(true);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to end SOS session:', error);
              setExitConfirmation(true);
              navigation.goBack();
            }
          }
        }
      ]
    );
  }, [navigation]);

  const handleEmergencyCall = useCallback((phoneNumber: string) => {
    Alert.alert(
      'Call Emergency Services',
      `This will call ${phoneNumber}. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`);
          }
        }
      ]
    );
  }, []);

  const handleStartBreathing = useCallback(() => {
    setCurrentView('breathing');
    setIsBreathing(true);
    Vibration.vibrate(100); // Gentle haptic feedback
  }, []);

  const renderCrisisResources = () => (
    <View style={styles.resourcesContainer}>
      <Text style={styles.crisisTitle}>You're not alone</Text>
      <Text style={styles.crisisSubtitle}>
        If you are in immediate danger, please contact emergency services or go to your nearest emergency room.
      </Text>

      {/* Emergency Services */}
      <View style={styles.emergencySection}>
        <TherapeuticButton
          title="🚨 Emergency Services (112)"
          variant="crisis"
          size="large"
          fullWidth
          onPress={() => handleEmergencyCall('112')}
          accessibilityLabel="Call emergency services 112"
          accessibilityHint="Calls emergency services immediately"
        />
      </View>

      {/* Mental Health Helplines */}
      <View style={styles.helplineSection}>
        <Text style={styles.sectionTitle}>Mental Health Support</Text>
        
        {EMERGENCY_CONTACTS.india.mental_health.map((contact, index) => (
          <TherapeuticButton
            key={index}
            title={`📞 ${contact.name}`}
            subtitle={contact.phone}
            variant="secondary"
            size="medium"
            fullWidth
            onPress={() => handleEmergencyCall(contact.phone)}
            style={styles.helplineButton}
          />
        ))}
      </View>

      {/* Immediate Coping */}
      <View style={styles.copingSection}>
        <Text style={styles.sectionTitle}>Immediate Relief</Text>
        
        <TherapeuticButton
          title="🫁 Start Calm Breathing"
          subtitle="Guided breathing to help you feel safer"
          variant="primary"
          size="large"
          fullWidth
          onPress={handleStartBreathing}
          style={styles.breathingButton}
        />
        
        <TherapeuticButton
          title="🌱 Grounding Exercise"
          subtitle="5-4-3-2-1 technique to feel present"
          variant="secondary"
          size="medium"
          fullWidth
          onPress={() => navigation.navigate('ExercisePlayer', { 
            exerciseId: 'ground_54321',
            source: 'sos'
          })}
          style={styles.groundingButton}
        />
      </View>

      {/* Safety Planning */}
      <View style={styles.safetySection}>
        <Text style={styles.sectionTitle}>Stay Safe</Text>
        <View style={styles.safetyTips}>
          <Text style={styles.safetyTip}>• Remove any harmful objects from your area</Text>
          <Text style={styles.safetyTip}>• Stay with someone you trust if possible</Text>
          <Text style={styles.safetyTip}>• Remember: This feeling will pass</Text>
          <Text style={styles.safetyTip}>• You matter and your life has value</Text>
        </View>
      </View>
    </View>
  );

  const renderBreathingExercise = () => (
    <View style={styles.breathingContainer}>
      <Text style={styles.breathingTitle}>Let's breathe together</Text>
      <Text style={styles.breathingSubtitle}>
        Focus on the circle and breathe with the rhythm
      </Text>

      <BreathingCircle
        isActive={isBreathing}
        pattern="4-7-8" // 4 seconds in, 7 hold, 8 out
        onCycleComplete={() => {
          // Gentle haptic feedback on each cycle
          Vibration.vibrate(50);
        }}
      />

      <View style={styles.breathingControls}>
        <TherapeuticButton
          title={isBreathing ? "Pause" : "Start"}
          variant="primary"
          size="large"
          onPress={() => setIsBreathing(!isBreathing)}
          style={styles.breathingControlButton}
        />
        
        <TherapeuticButton
          title="View Resources"
          variant="secondary"
          size="medium"
          onPress={() => setCurrentView('resources')}
          style={styles.resourcesButton}
        />
      </View>

      <View style={styles.breathingTips}>
        <Text style={styles.tipText}>
          💡 If this feels too intense, try breathing naturally and just watch the circle
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {currentView === 'resources' ? renderCrisisResources() : renderBreathingExercise()}
      
      {/* Always visible exit button with confirmation */}
      <View style={styles.exitContainer}>
        <TherapeuticButton
          title="I'm feeling safer"
          variant="ghost"
          size="small"
          onPress={handleExitAttempt}
          accessibilityLabel="Exit crisis support"
          accessibilityHint="Confirms you're feeling safer and exits crisis support"
        />
      </View>

      {/* Gentle check-in modal */}
      <SOSCheckIn
        visible={showCheckIn}
        onResponse={handleCheckInResponse}
        onDismiss={handleCheckInDismiss}
        sessionDuration={sessionStartTime ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000) : 0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  
  resourcesContainer: {
    flex: 1,
    paddingHorizontal: spacing['6x'], // 24px
    paddingVertical: spacing['4x'], // 16px
  },
  
  crisisTitle: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2x'], // 8px
  },
  
  crisisSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['8x'], // 32px
    lineHeight: 24,
  },
  
  emergencySection: {
    marginBottom: spacing['8x'], // 32px
  },
  
  helplineSection: {
    marginBottom: spacing['8x'], // 32px
  },
  
  copingSection: {
    marginBottom: spacing['8x'], // 32px
  },
  
  safetySection: {
    marginBottom: spacing['4x'], // 16px
  },
  
  sectionTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['4x'], // 16px
  },
  
  helplineButton: {
    marginBottom: spacing['3x'], // 12px
  },
  
  breathingButton: {
    marginBottom: spacing['3x'], // 12px
  },
  
  groundingButton: {
    marginBottom: spacing['3x'], // 12px
  },
  
  safetyTips: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['4x'], // 16px
  },
  
  safetyTip: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'], // 8px
    lineHeight: 22,
  },
  
  breathingContainer: {
    flex: 1,
    paddingHorizontal: spacing['6x'], // 24px
    paddingVertical: spacing['4x'], // 16px
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  breathingTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2x'], // 8px
  },
  
  breathingSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['8x'], // 32px
  },
  
  breathingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['4x'], // 16px
    marginTop: spacing['8x'], // 32px
    marginBottom: spacing['6x'], // 24px
  },
  
  breathingControlButton: {
    minWidth: 120,
  },
  
  resourcesButton: {
    minWidth: 120,
  },
  
  breathingTips: {
    backgroundColor: therapeuticColors.accent + '20', // 20% opacity
    borderRadius: 12,
    padding: spacing['4x'], // 16px
    maxWidth: 300,
  },
  
  tipText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  exitContainer: {
    paddingHorizontal: spacing['6x'], // 24px
    paddingVertical: spacing['4x'], // 16px
    borderTopWidth: 1,
    borderTopColor: therapeuticColors.border,
    alignItems: 'center',
  },
});

export default SOSScreen;
