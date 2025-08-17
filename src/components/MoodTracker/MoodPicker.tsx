/**
 * MoodPicker Component
 * 
 * 5-emoji mood selection with crisis detection integration
 * Implements therapeutic design principles and accessibility
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Alert
} from 'react-native';
import { MoodLevel, CrisisLevel } from '../../types';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { crisisDetectionService } from '../../services/crisisDetection';
import { useActions } from '../../store';

interface MoodPickerProps {
  selectedMood?: MoodLevel;
  onMoodSelect: (mood: MoodLevel) => void;
  onCrisisDetected?: (level: CrisisLevel) => void;
  disabled?: boolean;
}

const MOOD_DATA = {
  1: { 
    emoji: '😢', 
    label: 'Very sad', 
    color: therapeuticColors.moodColors[1],
    description: 'Feeling very down or distressed'
  },
  2: { 
    emoji: '😕', 
    label: 'Sad', 
    color: therapeuticColors.moodColors[2],
    description: 'Feeling low or unhappy'
  },
  3: { 
    emoji: '😐', 
    label: 'Neutral', 
    color: therapeuticColors.moodColors[3],
    description: 'Feeling okay, neither good nor bad'
  },
  4: { 
    emoji: '🙂', 
    label: 'Good', 
    color: therapeuticColors.moodColors[4],
    description: 'Feeling positive and content'
  },
  5: { 
    emoji: '😊', 
    label: 'Great', 
    color: therapeuticColors.moodColors[5],
    description: 'Feeling very happy and energetic'
  }
};

export const MoodPicker: React.FC<MoodPickerProps> = ({
  selectedMood,
  onMoodSelect,
  onCrisisDetected,
  disabled = false
}) => {
  const [pressedMood, setPressedMood] = useState<MoodLevel | null>(null);

  const handleMoodPress = useCallback(async (mood: MoodLevel) => {
    if (disabled) return;

    // Haptic feedback
    Vibration.vibrate(50);
    
    // Visual feedback
    setPressedMood(mood);
    setTimeout(() => setPressedMood(null), 200);
    
    // Crisis detection for very low moods
    if (mood === 1) {
      const crisisDetection = await crisisDetectionService.detectInText('feeling very sad');
      if (crisisDetection.level !== 'NONE' && onCrisisDetected) {
        onCrisisDetected(crisisDetection.level);
      }
    }
    
    onMoodSelect(mood);
  }, [disabled, onMoodSelect, onCrisisDetected]);

  const renderMoodOption = (mood: MoodLevel) => {
    const moodData = MOOD_DATA[mood];
    const isSelected = selectedMood === mood;
    const isPressed = pressedMood === mood;
    
    return (
      <TouchableOpacity
        key={mood}
        style={[
          styles.moodOption,
          isSelected && [styles.selectedMood, { borderColor: moodData.color }],
          isPressed && styles.pressedMood
        ]}
        onPress={() => handleMoodPress(mood)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Select ${moodData.label} mood`}
        accessibilityHint={moodData.description}
        accessibilityState={{ selected: isSelected, disabled }}
      >
        <Text style={[
          styles.emoji,
          isPressed && styles.pressedEmoji
        ]}>
          {moodData.emoji}
        </Text>
        <Text style={[
          styles.moodLabel,
          isSelected && styles.selectedLabel,
          disabled && styles.disabledLabel
        ]}>
          {moodData.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling right now?</Text>
      <Text style={styles.subtitle}>Tap the emoji that best describes your mood</Text>
      
      <View style={styles.moodGrid}>
        {([1, 2, 3, 4, 5] as MoodLevel[]).map(renderMoodOption)}
      </View>
      
      {selectedMood && (
        <View style={styles.selectedFeedback}>
          <Text style={styles.feedbackText}>
            You selected: {MOOD_DATA[selectedMood].label}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing['6x'], // 24px
    paddingVertical: spacing['4x'], // 16px
  },
  
  title: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2x'], // 8px
  },
  
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['8x'], // 32px
  },
  
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['6x'], // 24px
  },
  
  moodOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: therapeuticColors.surface,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  selectedMood: {
    borderWidth: 3,
    backgroundColor: therapeuticColors.primary + '10', // 10% opacity
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  
  pressedMood: {
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  emoji: {
    fontSize: 32,
    marginBottom: spacing['1x'], // 4px
  },
  
  pressedEmoji: {
    transform: [{ scale: 1.1 }],
  },
  
  moodLabel: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    fontSize: 10,
  },
  
  selectedLabel: {
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  
  disabledLabel: {
    opacity: 0.5,
  },
  
  selectedFeedback: {
    backgroundColor: therapeuticColors.primary + '10',
    borderRadius: 12,
    paddingVertical: spacing['3x'], // 12px
    paddingHorizontal: spacing['4x'], // 16px
    alignItems: 'center',
  },
  
  feedbackText: {
    ...typography.body,
    color: therapeuticColors.primary,
    fontWeight: '500',
  },
});

export default MoodPicker;
