/**
 * SOS Check-In Component
 * 
 * Gentle check-in interface for SOS sessions with
 * supportive messaging and escalation options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface SOSCheckInProps {
  visible: boolean;
  onResponse: (response: 'better' | 'same' | 'worse' | 'need_help') => void;
  onDismiss: () => void;
  sessionDuration?: number; // in seconds
}

export const SOSCheckIn: React.FC<SOSCheckInProps> = ({
  visible,
  onResponse,
  onDismiss,
  sessionDuration = 60,
}) => {
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleResponse = (response: 'better' | 'same' | 'worse' | 'need_help') => {
    setSelectedResponse(response);
    
    // Small delay for visual feedback
    setTimeout(() => {
      onResponse(response);
      setSelectedResponse(null);
    }, 200);
  };

  const getCheckInMessage = () => {
    const minutes = Math.floor(sessionDuration / 60);
    
    if (minutes < 1) {
      return "You've been here for about a minute. How are you feeling right now?";
    } else if (minutes === 1) {
      return "It's been about a minute. How are you doing?";
    } else {
      return `You've been here for ${minutes} minutes. How are you feeling?`;
    }
  };

  const responseOptions = [
    {
      key: 'better' as const,
      text: 'Feeling better',
      emoji: '🌱',
      color: therapeuticColors.success,
      description: 'Things are improving',
    },
    {
      key: 'same' as const,
      text: 'About the same',
      emoji: '🤝',
      color: therapeuticColors.primary,
      description: 'Staying steady',
    },
    {
      key: 'worse' as const,
      text: 'Still struggling',
      emoji: '💙',
      color: therapeuticColors.warning,
      description: 'Need more support',
    },
    {
      key: 'need_help' as const,
      text: 'Need more help',
      emoji: '🆘',
      color: therapeuticColors.error,
      description: 'Connect me with resources',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Gentle Check-In</Text>
            <Text style={styles.message}>
              {getCheckInMessage()}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {responseOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  selectedResponse === option.key && styles.optionButtonSelected,
                  { borderColor: option.color + '40' }
                ]}
                onPress={() => handleResponse(option.key)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionText,
                      selectedResponse === option.key && styles.optionTextSelected
                    ]}>
                      {option.text}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.supportMessage}>
            <Text style={styles.supportText}>
              Remember: There's no right or wrong answer. 
              We're here to support you through this.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={styles.dismissButtonText}>
              Continue without answering
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4x'],
  },
  container: {
    backgroundColor: therapeuticColors.background,
    borderRadius: 20,
    padding: spacing['6x'],
    width: '100%',
    maxWidth: 400,
    shadowColor: therapeuticColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['6x'],
  },
  title: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: spacing['6x'],
  },
  optionButton: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['4x'],
    marginBottom: spacing['3x'],
    borderWidth: 2,
    borderColor: therapeuticColors.border,
  },
  optionButtonSelected: {
    backgroundColor: therapeuticColors.primary + '10',
    borderColor: therapeuticColors.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: spacing['3x'],
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  optionTextSelected: {
    color: therapeuticColors.primary,
  },
  optionDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  supportMessage: {
    backgroundColor: therapeuticColors.primary + '10',
    borderRadius: 8,
    padding: spacing['4x'],
    marginBottom: spacing['4x'],
    borderLeftWidth: 4,
    borderLeftColor: therapeuticColors.primary,
  },
  supportText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  dismissButton: {
    alignSelf: 'center',
    paddingVertical: spacing['2x'],
    paddingHorizontal: spacing['4x'],
  },
  dismissButtonText: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
    textDecorationLine: 'underline',
  },
});

export default SOSCheckIn;
