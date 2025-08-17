/**
 * MoodNotes Component
 * 
 * Optional note input for mood check-ins with gentle prompts,
 * character limit, and crisis detection integration
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { crisisDetectionService } from '../../services/crisisDetection';
import { CrisisLevel } from '../../types';

interface MoodNotesProps {
  value: string;
  onChangeText: (text: string) => void;
  onCrisisDetected?: (level: CrisisLevel) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  showPrompts?: boolean;
}

const GENTLE_PROMPTS = [
  "What's on your mind?",
  "How are you feeling right now?",
  "What happened today?",
  "What's affecting your mood?",
  "Share what you're experiencing...",
  "What would help you feel better?",
  "Describe your current state...",
  "What's weighing on you?",
];

const ENCOURAGING_MESSAGES = [
  "Thank you for sharing 💙",
  "Your feelings are valid",
  "It's okay to feel this way",
  "You're being brave by expressing this",
  "Every feeling deserves acknowledgment",
];

export const MoodNotes: React.FC<MoodNotesProps> = ({
  value,
  onChangeText,
  onCrisisDetected,
  placeholder,
  maxLength = 280,
  disabled = false,
  showPrompts = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(GENTLE_PROMPTS[0]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [lastCrisisCheck, setLastCrisisCheck] = useState('');
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const encouragementAnim = React.useRef(new Animated.Value(0)).current;

  // Rotate prompts periodically when focused
  useEffect(() => {
    if (isFocused && showPrompts && value.length === 0) {
      const interval = setInterval(() => {
        setCurrentPrompt(prev => {
          const currentIndex = GENTLE_PROMPTS.indexOf(prev);
          const nextIndex = (currentIndex + 1) % GENTLE_PROMPTS.length;
          return GENTLE_PROMPTS[nextIndex];
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isFocused, showPrompts, value.length]);

  // Fade in animation when focused
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isFocused ? 1 : 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFocused, fadeAnim]);

  // Crisis detection with debouncing
  useEffect(() => {
    if (value.length > 10 && value !== lastCrisisCheck) {
      const timeoutId = setTimeout(async () => {
        try {
          const detection = await crisisDetectionService.detectInText(value);
          if (detection.level !== 'NONE' && onCrisisDetected) {
            onCrisisDetected(detection.level);
          }
          setLastCrisisCheck(value);
        } catch (error) {
          console.error('Crisis detection failed:', error);
        }
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [value, lastCrisisCheck, onCrisisDetected]);

  // Show encouragement when user types meaningful content
  useEffect(() => {
    if (value.length > 20 && !showEncouragement) {
      setShowEncouragement(true);
      Animated.timing(encouragementAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Hide after 3 seconds
      setTimeout(() => {
        Animated.timing(encouragementAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowEncouragement(false));
      }, 3000);
    }
  }, [value.length, showEncouragement, encouragementAnim]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleTextChange = useCallback((text: string) => {
    // Limit to maxLength
    const trimmedText = text.slice(0, maxLength);
    onChangeText(trimmedText);
  }, [onChangeText, maxLength]);

  const handleClearText = useCallback(() => {
    onChangeText('');
  }, [onChangeText]);

  const getCharacterCountColor = () => {
    const remaining = maxLength - value.length;
    if (remaining < 20) return therapeuticColors.warning;
    if (remaining < 50) return therapeuticColors.accent;
    return therapeuticColors.textSecondary;
  };

  const getRandomEncouragement = () => {
    return ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anything else you'd like to share?</Text>
      <Text style={styles.subtitle}>
        Optional - share what's on your mind or what influenced your mood
      </Text>

      <Animated.View 
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
          { opacity: fadeAnim }
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            disabled && styles.disabledInput
          ]}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || currentPrompt}
          placeholderTextColor={therapeuticColors.textSecondary}
          multiline
          numberOfLines={4}
          maxLength={maxLength}
          editable={!disabled}
          textAlignVertical="top"
          accessibilityLabel="Mood note input"
          accessibilityHint="Optional text field to describe your current feelings or what influenced your mood"
        />

        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearText}
            accessibilityLabel="Clear note"
            accessibilityHint="Remove all text from the note field"
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Character count */}
      <View style={styles.footerContainer}>
        <Text style={[
          styles.characterCount,
          { color: getCharacterCountColor() }
        ]}>
          {value.length}/{maxLength}
        </Text>

        {/* Helpful tips */}
        {isFocused && value.length === 0 && (
          <Text style={styles.helpText}>
            💡 You can mention what happened, how you're feeling, or what might help
          </Text>
        )}
      </View>

      {/* Encouragement message */}
      {showEncouragement && (
        <Animated.View 
          style={[
            styles.encouragementContainer,
            { opacity: encouragementAnim }
          ]}
        >
          <Text style={styles.encouragementText}>
            {getRandomEncouragement()}
          </Text>
        </Animated.View>
      )}

      {/* Privacy note */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Your notes are private and stored securely on your device
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing['4x'], // 16px
  },
  
  title: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'], // 8px
  },
  
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['6x'], // 24px
    lineHeight: 22,
  },
  
  inputContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: therapeuticColors.border,
    position: 'relative',
    marginBottom: spacing['3x'], // 12px
  },
  
  focusedInputContainer: {
    borderColor: therapeuticColors.primary,
    shadowColor: therapeuticColors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  textInput: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    padding: spacing['4x'], // 16px
    minHeight: 100,
    maxHeight: 150,
    lineHeight: 22,
  },
  
  disabledInput: {
    opacity: 0.6,
    backgroundColor: therapeuticColors.border + '20',
  },
  
  clearButton: {
    position: 'absolute',
    top: spacing['2x'], // 8px
    right: spacing['2x'], // 8px
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: therapeuticColors.textSecondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  clearButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['4x'], // 16px
  },
  
  characterCount: {
    ...typography.caption,
    fontWeight: '500',
  },
  
  helpText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing['4x'], // 16px
  },
  
  encouragementContainer: {
    backgroundColor: therapeuticColors.success + '15',
    borderRadius: 12,
    padding: spacing['3x'], // 12px
    marginBottom: spacing['4x'], // 16px
    borderLeftWidth: 3,
    borderLeftColor: therapeuticColors.success,
  },
  
  encouragementText: {
    ...typography.bodySmall,
    color: therapeuticColors.success,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  privacyNote: {
    backgroundColor: therapeuticColors.accent + '10',
    borderRadius: 8,
    padding: spacing['3x'], // 12px
  },
  
  privacyText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default MoodNotes;
