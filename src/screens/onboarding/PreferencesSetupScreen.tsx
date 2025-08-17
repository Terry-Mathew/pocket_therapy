/**
 * PreferencesSetupScreen
 * 
 * Onboarding screen for configuring relief style preferences
 * including sound, haptics, and ambience with gentle explanations
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { useActions } from '../../store';

interface PreferencesSetupScreenProps {
  navigation: any;
}

const AMBIENT_SOUND_OPTIONS = [
  { id: 'none', label: 'None', description: 'Silence for focus' },
  { id: 'rain', label: 'Rain', description: 'Gentle rainfall sounds' },
  { id: 'forest', label: 'Forest', description: 'Birds and rustling leaves' },
  { id: 'ocean', label: 'Ocean', description: 'Soft waves and water' },
  { id: 'white_noise', label: 'White Noise', description: 'Consistent background sound' },
];

export const PreferencesSetupScreen: React.FC<PreferencesSetupScreenProps> = ({ navigation }) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [selectedAmbientSound, setSelectedAmbientSound] = useState('none');
  const [volume, setVolume] = useState(0.5);
  
  const { updateAudioSettings, updateNotificationSettings } = useActions();

  const handleContinue = useCallback(() => {
    // Save preferences
    updateAudioSettings({
      enabled: audioEnabled,
      background_sounds: selectedAmbientSound as any,
      volume: audioEnabled ? volume : 0,
      haptic_feedback: hapticEnabled,
    });

    // Navigate to first micro-session
    navigation.navigate('FirstMicroSession');
  }, [audioEnabled, hapticEnabled, selectedAmbientSound, volume, updateAudioSettings, navigation]);

  const handleSkip = useCallback(() => {
    // Use default settings
    updateAudioSettings({
      enabled: false,
      background_sounds: 'none',
      volume: 0.5,
      haptic_feedback: true,
    });

    navigation.navigate('FirstMicroSession');
  }, [updateAudioSettings, navigation]);

  const handleAudioToggle = useCallback((enabled: boolean) => {
    setAudioEnabled(enabled);
    if (!enabled) {
      setSelectedAmbientSound('none');
    }
  }, []);

  const handleAmbientSoundSelect = useCallback((soundId: string) => {
    setSelectedAmbientSound(soundId);
    if (soundId !== 'none' && !audioEnabled) {
      setAudioEnabled(true);
    }
  }, [audioEnabled]);

  const renderAmbientSoundOption = (option: typeof AMBIENT_SOUND_OPTIONS[0]) => {
    const isSelected = selectedAmbientSound === option.id;
    const isDisabled = !audioEnabled && option.id !== 'none';
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.soundOption,
          isSelected && styles.selectedSoundOption,
          isDisabled && styles.disabledSoundOption
        ]}
        onPress={() => handleAmbientSoundSelect(option.id)}
        disabled={isDisabled}
        accessibilityLabel={`${option.label} ambient sound`}
        accessibilityHint={option.description}
        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      >
        <View style={styles.soundOptionContent}>
          <Text style={[
            styles.soundOptionLabel,
            isSelected && styles.selectedSoundOptionLabel,
            isDisabled && styles.disabledSoundOptionLabel
          ]}>
            {option.label}
          </Text>
          <Text style={[
            styles.soundOptionDescription,
            isDisabled && styles.disabledSoundOptionDescription
          ]}>
            {option.description}
          </Text>
        </View>
        {isSelected && (
          <Text style={styles.selectedIcon}>✓</Text>
        )}
      </TouchableOpacity>
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
          <Text style={styles.title}>How would you like to experience relief?</Text>
          <Text style={styles.subtitle}>
            Customize your experience with gentle sounds and feedback. You can change these anytime.
          </Text>
        </View>

        {/* Haptic Feedback Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gentle Touch Feedback</Text>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ 
                false: therapeuticColors.border, 
                true: therapeuticColors.primary + '40' 
              }}
              thumbColor={hapticEnabled ? therapeuticColors.primary : therapeuticColors.textSecondary}
              accessibilityLabel="Enable haptic feedback"
              accessibilityHint="Toggle gentle vibrations during exercises"
            />
          </View>
          <Text style={styles.sectionDescription}>
            Gentle vibrations help guide your breathing and provide calming feedback during exercises.
          </Text>
          
          {hapticEnabled && (
            <View style={styles.featureNote}>
              <Text style={styles.featureNoteText}>
                💡 Haptic feedback works even when your phone is on silent mode
              </Text>
            </View>
          )}
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Background Sounds</Text>
            <Switch
              value={audioEnabled}
              onValueChange={handleAudioToggle}
              trackColor={{ 
                false: therapeuticColors.border, 
                true: therapeuticColors.primary + '40' 
              }}
              thumbColor={audioEnabled ? therapeuticColors.primary : therapeuticColors.textSecondary}
              accessibilityLabel="Enable background sounds"
              accessibilityHint="Toggle ambient sounds during exercises"
            />
          </View>
          <Text style={styles.sectionDescription}>
            Calming background sounds can enhance your relaxation experience.
          </Text>

          {/* Ambient Sound Options */}
          <View style={styles.soundOptionsContainer}>
            {AMBIENT_SOUND_OPTIONS.map(renderAmbientSoundOption)}
          </View>

          {audioEnabled && selectedAmbientSound !== 'none' && (
            <View style={styles.volumeContainer}>
              <Text style={styles.volumeLabel}>Volume</Text>
              <View style={styles.volumeSlider}>
                <TouchableOpacity
                  style={styles.volumeButton}
                  onPress={() => setVolume(Math.max(0.1, volume - 0.1))}
                  accessibilityLabel="Decrease volume"
                >
                  <Text style={styles.volumeButtonText}>−</Text>
                </TouchableOpacity>
                
                <View style={styles.volumeIndicator}>
                  <View style={styles.volumeTrack}>
                    <View 
                      style={[
                        styles.volumeFill,
                        { width: `${volume * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.volumeButton}
                  onPress={() => setVolume(Math.min(1.0, volume + 0.1))}
                  accessibilityLabel="Increase volume"
                >
                  <Text style={styles.volumeButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            🔒 These preferences are stored locally on your device. You can change them anytime in Settings.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            accessibilityLabel="Continue with selected preferences"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityLabel="Skip preferences setup"
          >
            <Text style={styles.skipButtonText}>Use defaults</Text>
          </TouchableOpacity>
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
  
  title: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['4x'], // 16px
  },
  
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  section: {
    marginBottom: spacing['8x'], // 32px
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3x'], // 12px
  },
  
  sectionTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
  },
  
  sectionDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing['4x'], // 16px
  },
  
  featureNote: {
    backgroundColor: therapeuticColors.accent + '15',
    borderRadius: 12,
    padding: spacing['3x'], // 12px
    marginTop: spacing['3x'], // 12px
  },
  
  featureNoteText: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  soundOptionsContainer: {
    gap: spacing['3x'], // 12px
    marginBottom: spacing['4x'], // 16px
  },
  
  soundOption: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['4x'], // 16px
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  selectedSoundOption: {
    borderColor: therapeuticColors.primary,
    backgroundColor: therapeuticColors.primary + '10',
  },
  
  disabledSoundOption: {
    opacity: 0.5,
  },
  
  soundOptionContent: {
    flex: 1,
  },
  
  soundOptionLabel: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing['1x'], // 4px
  },
  
  selectedSoundOptionLabel: {
    color: therapeuticColors.primary,
  },
  
  disabledSoundOptionLabel: {
    opacity: 0.6,
  },
  
  soundOptionDescription: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
  },
  
  disabledSoundOptionDescription: {
    opacity: 0.6,
  },
  
  selectedIcon: {
    ...typography.body,
    color: therapeuticColors.primary,
    fontWeight: 'bold',
  },
  
  volumeContainer: {
    marginTop: spacing['4x'], // 16px
  },
  
  volumeLabel: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['3x'], // 12px
    fontWeight: '500',
  },
  
  volumeSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4x'], // 16px
  },
  
  volumeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: therapeuticColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  
  volumeButtonText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: 'bold',
  },
  
  volumeIndicator: {
    flex: 1,
    alignItems: 'center',
    gap: spacing['2x'], // 8px
  },
  
  volumeTrack: {
    width: '100%',
    height: 4,
    backgroundColor: therapeuticColors.border,
    borderRadius: 2,
  },
  
  volumeFill: {
    height: '100%',
    backgroundColor: therapeuticColors.primary,
    borderRadius: 2,
  },
  
  volumeText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  
  privacyNote: {
    backgroundColor: therapeuticColors.accent + '15',
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
    backgroundColor: therapeuticColors.primary,
    borderRadius: 28,
    paddingVertical: spacing['4x'], // 16px
    paddingHorizontal: spacing['6x'], // 24px
    alignItems: 'center',
    marginBottom: spacing['2x'], // 8px
  },
  
  continueButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    paddingVertical: spacing['4x'], // 16px
    paddingHorizontal: spacing['6x'], // 24px
    alignItems: 'center',
    opacity: 0.8,
  },
  
  skipButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
});

export default PreferencesSetupScreen;
