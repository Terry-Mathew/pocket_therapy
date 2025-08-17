/**
 * TherapeuticButton Component
 * 
 * Core button component with therapeutic design principles
 * Implements accessibility, haptic feedback, and crisis-safe styling
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Vibration,
  ViewStyle,
  TextStyle
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';

interface TherapeuticButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'crisis';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

export const TherapeuticButton: React.FC<TherapeuticButtonProps> = ({
  title,
  subtitle,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  icon,
  iconPosition = 'left',
  style
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Haptic feedback based on variant
    const hapticPattern = {
      primary: 100,
      secondary: 50,
      ghost: 30,
      crisis: 150
    };
    
    Vibration.vibrate(hapticPattern[variant]);
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      flexDirection: icon ? 'row' : 'column',
    };

    // Size variations
    const sizeStyles = {
      small: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 44, // Accessibility minimum
      },
      medium: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        minHeight: 48,
      },
      large: {
        paddingVertical: 20,
        paddingHorizontal: 32,
        minHeight: 56,
      }
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: therapeuticColors.primary,
        shadowColor: therapeuticColors.primary,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: therapeuticColors.primary,
        shadowOpacity: 0,
      },
      ghost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
      },
      crisis: {
        backgroundColor: therapeuticColors.crisis,
        shadowColor: therapeuticColors.crisis,
        shadowOpacity: 0.25,
        minHeight: 72, // Larger for crisis actions
      }
    };

    // State modifications
    const stateStyles: ViewStyle = {};
    if (disabled) {
      stateStyles.opacity = 0.5;
      stateStyles.shadowOpacity = 0;
    }
    if (fullWidth) {
      stateStyles.width = '100%';
    }

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyles,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      textAlign: 'center',
      fontWeight: '600',
    };

    // Size-based text styles
    const sizeTextStyles = {
      small: typography.bodySmall,
      medium: typography.body,
      large: typography.h3,
    };

    // Variant-based text colors
    const variantTextStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: therapeuticColors.primary },
      ghost: { color: therapeuticColors.textSecondary },
      crisis: { color: '#FFFFFF' },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const getSubtitleStyle = (): TextStyle => {
    return {
      ...typography.caption,
      color: variant === 'primary' || variant === 'crisis' 
        ? '#FFFFFF' 
        : therapeuticColors.textSecondary,
      marginTop: 2,
      opacity: 0.8,
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          color={
            variant === 'secondary' || variant === 'ghost' 
              ? therapeuticColors.primary 
              : '#FFFFFF'
          }
          size={size === 'small' ? 'small' : 'large'}
        />
      );
    }

    const textContent = (
      <View style={styles.textContainer}>
        <Text style={getTextStyle()}>{title}</Text>
        {subtitle && (
          <Text style={getSubtitleStyle()}>{subtitle}</Text>
        )}
      </View>
    );

    if (!icon) {
      return textContent;
    }

    const iconElement = (
      <Text style={[
        getTextStyle(), 
        { 
          marginRight: iconPosition === 'left' ? spacing['2x'] : 0,
          marginLeft: iconPosition === 'right' ? spacing['2x'] : 0,
        }
      ]}>
        {icon}
      </Text>
    );

    return (
      <>
        {iconPosition === 'left' && iconElement}
        {textContent}
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ 
        disabled: disabled || loading,
        busy: loading 
      }}
      // Enhanced touch area for crisis buttons
      hitSlop={variant === 'crisis' ? {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      } : undefined}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});

export default TherapeuticButton;
