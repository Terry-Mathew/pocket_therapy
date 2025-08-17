/**
 * LoadingSpinner Component for PocketTherapy
 * 
 * Therapeutic loading spinner with calming animation and accessibility.
 * Supports different sizes and overlay modes.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = therapeuticColors.primary,
  message,
  overlay = false,
  style,
  testID,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Gentle pulsing animation for therapeutic effect
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [fadeAnim, pulseAnim]);

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 'small' as const;
      case 'large':
        return 'large' as const;
      default:
        return 'small' as const; // ActivityIndicator only supports 'small' and 'large'
    }
  };

  const getContainerStyle = (): ViewStyle => {
    if (overlay) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(245, 242, 232, 0.9)', // Semi-transparent cream
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      };
    }

    return {
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing['4x'], // 16px
    };
  };

  const renderSpinner = () => (
    <Animated.View
      style={[
        styles.spinnerContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <ActivityIndicator
        size={getSpinnerSize()}
        color={color}
        testID={`${testID}-spinner`}
        accessibilityLabel="Loading"
      />
    </Animated.View>
  );

  const renderMessage = () => {
    if (!message) return null;

    return (
      <Animated.Text
        style={[
          styles.message,
          {
            opacity: fadeAnim,
          },
        ]}
        testID={`${testID}-message`}
        accessibilityLabel={message}
      >
        {message}
      </Animated.Text>
    );
  };

  return (
    <View
      style={[getContainerStyle(), style]}
      testID={testID}
    >
      {renderSpinner()}
      {renderMessage()}
    </View>
  );
};

// Specialized loading variants for common use cases
export const FullScreenLoader: React.FC<Omit<LoadingSpinnerProps, 'overlay'>> = (props) => (
  <LoadingSpinner {...props} overlay size="large" />
);

export const InlineLoader: React.FC<Omit<LoadingSpinnerProps, 'overlay'>> = (props) => (
  <LoadingSpinner {...props} overlay={false} size="small" />
);

export const ExerciseLoader: React.FC<Omit<LoadingSpinnerProps, 'message' | 'size'>> = (props) => (
  <LoadingSpinner
    {...props}
    message="Preparing your exercise..."
    size="medium"
  />
);

export const MoodSyncLoader: React.FC<Omit<LoadingSpinnerProps, 'message' | 'size'>> = (props) => (
  <LoadingSpinner
    {...props}
    message="Syncing your mood data..."
    size="small"
  />
);

export const AuthLoader: React.FC<Omit<LoadingSpinnerProps, 'message' | 'overlay'>> = (props) => (
  <LoadingSpinner
    {...props}
    message="Signing you in..."
    overlay
    size="medium"
  />
);

const styles = StyleSheet.create({
  spinnerContainer: {
    marginBottom: spacing['3x'], // 12px
  },
  message: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginTop: spacing['3x'], // 12px
    maxWidth: 200,
  },
});

export default LoadingSpinner;
