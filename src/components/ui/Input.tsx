/**
 * Input Component for PocketTherapy
 * 
 * Therapeutic input component with gentle focus states and accessibility.
 * Supports labels, error states, and various input types.
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  required?: boolean;
  testID?: string;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  labelStyle,
  required = false,
  testID,
  onFocus,
  onBlur,
  ...textInputProps
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      backgroundColor: isFocused
        ? therapeuticColors.surface
        : therapeuticColors.surface,
      borderColor: error
        ? therapeuticColors.error
        : isFocused
        ? therapeuticColors.primary
        : therapeuticColors.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: spacing['4x'], // 16px
      paddingVertical: spacing['3x'], // 12px
      fontSize: 16,
      color: therapeuticColors.textPrimary,
      minHeight: 44,
    };

    return baseStyle;
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <Text
        style={[styles.label, labelStyle]}
        testID={`${testID}-label`}
      >
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Text
        style={styles.error}
        testID={`${testID}-error`}
        accessibilityRole="alert"
      >
        {error}
      </Text>
    );
  };

  const renderHelperText = () => {
    if (!helperText || error) return null;

    return (
      <Text
        style={styles.helperText}
        testID={`${testID}-helper`}
      >
        {helperText}
      </Text>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderLabel()}
      <TextInput
        ref={ref}
        style={[getInputStyle(), inputStyle]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={therapeuticColors.textSecondary}
        testID={testID}
        accessibilityLabel={label}
        accessibilityHint={required ? 'Required field' : undefined}
        {...textInputProps}
      />
      {renderError()}
      {renderHelperText()}
    </View>
  );
});

// Specialized input variants for common use cases
export const MoodNoteInput: React.FC<Omit<InputProps, 'multiline' | 'maxLength'>> = (props) => (
  <Input
    {...props}
    multiline
    maxLength={280}
    placeholder="How are you feeling? (optional)"
    helperText="Share what's on your mind - this stays private"
    textAlignVertical="top"
    style={[styles.moodNoteInput, props.inputStyle]}
  />
);

export const SearchInput: React.FC<Omit<InputProps, 'returnKeyType'>> = (props) => (
  <Input
    {...props}
    returnKeyType="search"
    placeholder="Search exercises..."
    autoCapitalize="none"
    autoCorrect={false}
  />
);

export const EmailInput: React.FC<Omit<InputProps, 'keyboardType' | 'autoCapitalize' | 'autoCorrect'>> = (props) => (
  <Input
    {...props}
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    placeholder="Enter your email"
    textContentType="emailAddress"
  />
);

export const OTPInput: React.FC<Omit<InputProps, 'keyboardType' | 'maxLength' | 'textAlign'>> = (props) => (
  <Input
    {...props}
    keyboardType="number-pad"
    maxLength={6}
    textAlign="center"
    placeholder="000000"
    textContentType="oneTimeCode"
    style={[styles.otpInput, props.inputStyle]}
  />
);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['4x'], // 16px
  },
  label: {
    ...typography.bodySmall,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'], // 8px
    fontWeight: '500',
  },
  required: {
    color: therapeuticColors.error,
  },
  error: {
    ...typography.caption,
    color: therapeuticColors.error,
    marginTop: spacing['2x'], // 8px
  },
  helperText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginTop: spacing['2x'], // 8px
  },
  moodNoteInput: {
    minHeight: 80,
    paddingTop: spacing['3x'], // 12px
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: 2,
  },
});

Input.displayName = 'Input';

export default Input;
