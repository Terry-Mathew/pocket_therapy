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
import { theme } from '@constants/theme';

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
        ? theme.components.input.backgroundFocus 
        : theme.components.input.background,
      borderColor: error 
        ? theme.components.input.borderError 
        : isFocused 
        ? theme.components.input.borderFocus 
        : theme.components.input.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.components.input.text,
      minHeight: theme.accessibility.minimumTouchTarget,
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
        placeholderTextColor={theme.components.input.placeholder}
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
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.styles.label,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.xs,
  },
  required: {
    color: theme.colors.semantic.error.primary,
  },
  error: {
    ...theme.typography.styles.caption,
    color: theme.colors.semantic.error.primary,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    ...theme.typography.styles.caption,
    color: theme.colors.neutral.grey,
    marginTop: theme.spacing.xs,
  },
  moodNoteInput: {
    minHeight: 80,
    paddingTop: theme.spacing.sm,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.medium,
    letterSpacing: theme.typography.letterSpacing.wider,
  },
});

Input.displayName = 'Input';

export default Input;
