/**
 * Button Component for PocketTherapy
 * 
 * Therapeutic button component with calming design principles.
 * Supports multiple variants, sizes, and accessibility features.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme, getButtonColors, getElevation } from '@constants/theme';
import { triggerHaptic } from '@utils';
import type { ButtonProps } from '@types';

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  testID,
  children,
}) => {
  const buttonColors = getButtonColors(variant);
  const elevation = variant === 'ghost' ? getElevation('none') : getElevation('small');

  const handlePress = async () => {
    if (disabled || loading) return;

    // Gentle haptic feedback for therapeutic UX
    await triggerHaptic('light');
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: buttonColors.background,
      borderColor: buttonColors.border,
      borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: getSizePadding(),
      paddingVertical: getSizeVerticalPadding(),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: theme.accessibility.minimumTouchTarget,
      opacity: disabled ? 0.6 : 1,
      ...elevation,
    };

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const textStyle = getTextStyleForSize();
    return {
      ...textStyle,
      color: buttonColors.text,
      textAlign: 'center',
    };
  };

  const getSizePadding = (): number => {
    switch (size) {
      case 'small':
        return theme.spacing.sm;
      case 'large':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  };

  const getSizeVerticalPadding = (): number => {
    switch (size) {
      case 'small':
        return theme.spacing.xs;
      case 'large':
        return theme.spacing.md;
      default:
        return theme.spacing.sm;
    }
  };

  const getTextStyleForSize = () => {
    switch (size) {
      case 'small':
        return theme.typography.styles.buttonSmall;
      case 'large':
        return theme.typography.styles.buttonLarge;
      default:
        return theme.typography.styles.button;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={buttonColors.text}
          testID={`${testID}-loading`}
        />
      );
    }

    if (children) {
      return children;
    }

    return (
      <Text style={getTextStyle()} testID={`${testID}-text`}>
        {title}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      accessibilityHint={
        disabled
          ? 'Button is disabled'
          : loading
          ? 'Button is loading'
          : `Tap to ${title.toLowerCase()}`
      }
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// Predefined button styles for common use cases
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="secondary" />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="outline" />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="ghost" />
);

export const CrisisButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="crisis" />
);

// Styles are dynamically generated for better theme integration

export default Button;
