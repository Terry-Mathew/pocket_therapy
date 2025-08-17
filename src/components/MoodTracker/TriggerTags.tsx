/**
 * TriggerTags Component
 * 
 * Optional trigger selection with predefined tags and custom input
 * Used in mood check-in flow to identify mood influences
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';

interface TriggerTagsProps {
  selectedTriggers: string[];
  onTriggersChange: (triggers: string[]) => void;
  maxTriggers?: number;
  disabled?: boolean;
}

const PREDEFINED_TRIGGERS = [
  'Work/School',
  'Relationships',
  'Health',
  'Money',
  'Family',
  'Social Media',
  'News',
  'Sleep',
  'Exercise',
  'Weather',
  'Exams',
  'Deadlines',
  'Social Events',
  'Travel',
  'Technology',
  'Food',
];

export const TriggerTags: React.FC<TriggerTagsProps> = ({
  selectedTriggers,
  onTriggersChange,
  maxTriggers = 5,
  disabled = false
}) => {
  const [customTrigger, setCustomTrigger] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleTriggerToggle = useCallback((trigger: string) => {
    if (disabled) return;

    if (selectedTriggers.includes(trigger)) {
      // Remove trigger
      onTriggersChange(selectedTriggers.filter(t => t !== trigger));
    } else if (selectedTriggers.length < maxTriggers) {
      // Add trigger
      onTriggersChange([...selectedTriggers, trigger]);
    } else {
      // Show limit reached message
      Alert.alert(
        'Limit reached',
        `You can select up to ${maxTriggers} triggers. Remove one to add another.`,
        [{ text: 'OK' }]
      );
    }
  }, [selectedTriggers, onTriggersChange, maxTriggers, disabled]);

  const handleCustomTriggerAdd = useCallback(() => {
    const trimmedTrigger = customTrigger.trim();
    
    if (!trimmedTrigger) {
      return;
    }

    if (trimmedTrigger.length > 20) {
      Alert.alert(
        'Too long',
        'Trigger tags should be 20 characters or less.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (selectedTriggers.includes(trimmedTrigger)) {
      Alert.alert(
        'Already added',
        'This trigger is already in your list.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (selectedTriggers.length >= maxTriggers) {
      Alert.alert(
        'Limit reached',
        `You can select up to ${maxTriggers} triggers. Remove one to add another.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Add custom trigger
    onTriggersChange([...selectedTriggers, trimmedTrigger]);
    setCustomTrigger('');
    setShowCustomInput(false);
  }, [customTrigger, selectedTriggers, onTriggersChange, maxTriggers]);

  const handleCustomTriggerCancel = useCallback(() => {
    setCustomTrigger('');
    setShowCustomInput(false);
  }, []);

  const renderTriggerTag = (trigger: string, isCustom: boolean = false) => {
    const isSelected = selectedTriggers.includes(trigger);
    
    return (
      <TouchableOpacity
        key={trigger}
        style={[
          styles.triggerTag,
          isSelected && styles.selectedTag,
          disabled && styles.disabledTag
        ]}
        onPress={() => handleTriggerToggle(trigger)}
        disabled={disabled}
        accessibilityLabel={`${trigger} trigger - ${isSelected ? 'selected' : 'not selected'}`}
        accessibilityHint={`Tap to ${isSelected ? 'remove' : 'add'} ${trigger} as a trigger`}
        accessibilityState={{ selected: isSelected, disabled }}
      >
        <Text style={[
          styles.triggerText,
          isSelected && styles.selectedText,
          disabled && styles.disabledText
        ]}>
          {trigger}
        </Text>
        {isSelected && (
          <Text style={styles.removeIcon}>×</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What might have influenced your mood?</Text>
      <Text style={styles.subtitle}>
        Select any that apply (optional, up to {maxTriggers})
      </Text>

      <ScrollView 
        style={styles.tagsContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected triggers first */}
        {selectedTriggers.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionTitle}>Selected:</Text>
            <View style={styles.tagsGrid}>
              {selectedTriggers.map(trigger => renderTriggerTag(trigger))}
            </View>
          </View>
        )}

        {/* Predefined triggers */}
        <View style={styles.predefinedSection}>
          <Text style={styles.sectionTitle}>Common triggers:</Text>
          <View style={styles.tagsGrid}>
            {PREDEFINED_TRIGGERS
              .filter(trigger => !selectedTriggers.includes(trigger))
              .map(trigger => renderTriggerTag(trigger))
            }
          </View>
        </View>

        {/* Custom trigger input */}
        <View style={styles.customSection}>
          {!showCustomInput ? (
            <TouchableOpacity
              style={[
                styles.addCustomButton,
                disabled && styles.disabledButton
              ]}
              onPress={() => setShowCustomInput(true)}
              disabled={disabled || selectedTriggers.length >= maxTriggers}
              accessibilityLabel="Add custom trigger"
              accessibilityHint="Tap to add a custom trigger not in the list"
            >
              <Text style={[
                styles.addCustomText,
                disabled && styles.disabledText
              ]}>
                + Add custom trigger
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                value={customTrigger}
                onChangeText={setCustomTrigger}
                placeholder="Enter custom trigger..."
                placeholderTextColor={therapeuticColors.textSecondary}
                maxLength={20}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCustomTriggerAdd}
                accessibilityLabel="Custom trigger input"
                accessibilityHint="Enter a custom trigger and press done to add it"
              />
              <View style={styles.customInputActions}>
                <TouchableOpacity
                  style={styles.customActionButton}
                  onPress={handleCustomTriggerCancel}
                  accessibilityLabel="Cancel custom trigger"
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.customActionButton,
                    styles.addButton
                  ]}
                  onPress={handleCustomTriggerAdd}
                  accessibilityLabel="Add custom trigger"
                >
                  <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Counter */}
      <Text style={styles.counter}>
        {selectedTriggers.length}/{maxTriggers} triggers selected
      </Text>
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
  
  tagsContainer: {
    maxHeight: 300,
    marginBottom: spacing['4x'], // 16px
  },
  
  selectedSection: {
    marginBottom: spacing['6x'], // 24px
  },
  
  predefinedSection: {
    marginBottom: spacing['6x'], // 24px
  },
  
  customSection: {
    marginBottom: spacing['4x'], // 16px
  },
  
  sectionTitle: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['3x'], // 12px
    fontWeight: '500',
  },
  
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2x'], // 8px
  },
  
  triggerTag: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing['3x'], // 12px
    paddingVertical: spacing['2x'], // 8px
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2x'], // 8px
  },
  
  selectedTag: {
    backgroundColor: therapeuticColors.primary + '20',
    borderColor: therapeuticColors.primary,
  },
  
  disabledTag: {
    opacity: 0.5,
  },
  
  triggerText: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
  },
  
  selectedText: {
    color: therapeuticColors.primary,
    fontWeight: '500',
  },
  
  disabledText: {
    opacity: 0.6,
  },
  
  removeIcon: {
    ...typography.bodySmall,
    color: therapeuticColors.primary,
    marginLeft: spacing['1x'], // 4px
    fontWeight: 'bold',
  },
  
  addCustomButton: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing['4x'], // 16px
    paddingVertical: spacing['3x'], // 12px
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  
  disabledButton: {
    opacity: 0.5,
  },
  
  addCustomText: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  
  customInputContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['4x'], // 16px
    borderWidth: 1,
    borderColor: therapeuticColors.primary,
  },
  
  customInput: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: therapeuticColors.border,
    paddingVertical: spacing['2x'], // 8px
    marginBottom: spacing['3x'], // 12px
  },
  
  customInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing['3x'], // 12px
  },
  
  customActionButton: {
    paddingHorizontal: spacing['4x'], // 16px
    paddingVertical: spacing['2x'], // 8px
    borderRadius: 8,
  },
  
  addButton: {
    backgroundColor: therapeuticColors.primary,
  },
  
  cancelText: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  
  addText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
  counter: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginTop: spacing['2x'], // 8px
  },
});

export default TriggerTags;
