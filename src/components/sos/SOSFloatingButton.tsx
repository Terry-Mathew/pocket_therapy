/**
 * SOSFloatingButton Component
 * 
 * Always-visible floating action button for crisis support
 * Implements crisis-first design with accessibility and safety features
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Platform,
  Dimensions
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SOSFloatingButtonProps {
  onPress: () => void;
  visible?: boolean;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SOSFloatingButton: React.FC<SOSFloatingButtonProps> = ({
  onPress,
  visible = true,
  position = 'bottom-right',
  size = 'large'
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const insets = useSafeAreaInsets();

  // Gentle pulsing animation to draw attention without being overwhelming
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  // Visibility animation
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, opacityAnim]);

  const handlePress = () => {
    // Immediate haptic feedback for crisis situations
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 200, 100, 200]); // Strong pattern
    } else {
      Vibration.vibrate(200);
    }

    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const getSizeStyles = () => {
    const sizes = {
      small: { width: 56, height: 56, borderRadius: 28 },
      medium: { width: 64, height: 64, borderRadius: 32 },
      large: { width: 72, height: 72, borderRadius: 36 }
    };
    return sizes[size];
  };

  const getPositionStyles = () => {
    const baseBottom = insets.bottom + spacing['6x']; // 24px + safe area
    const baseHorizontal = spacing['6x']; // 24px

    const positions = {
      'bottom-right': {
        position: 'absolute' as const,
        bottom: baseBottom,
        right: baseHorizontal,
      },
      'bottom-center': {
        position: 'absolute' as const,
        bottom: baseBottom,
        left: (screenWidth - getSizeStyles().width) / 2,
      },
      'bottom-left': {
        position: 'absolute' as const,
        bottom: baseBottom,
        left: baseHorizontal,
      }
    };

    return positions[position];
  };

  const getTextSize = () => {
    const textSizes = {
      small: { fontSize: 14, fontWeight: '600' as const },
      medium: { fontSize: 16, fontWeight: '700' as const },
      large: { fontSize: 18, fontWeight: '700' as const }
    };
    return textSizes[size];
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyles(),
        {
          opacity: opacityAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          getSizeStyles(),
          styles.shadowStyle
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="SOS - Emergency mental health support"
        accessibilityHint="Tap for immediate crisis support and breathing exercises"
        // Enhanced touch area for crisis situations
        hitSlop={{
          top: 15,
          bottom: 15,
          left: 15,
          right: 15
        }}
      >
        {/* Background gradient effect */}
        <View style={[styles.backgroundGradient, getSizeStyles()]} />
        
        {/* SOS Text */}
        <Text style={[styles.sosText, getTextSize()]}>
          SOS
        </Text>
        
        {/* Subtle indicator ring */}
        <View style={[styles.indicatorRing, getSizeStyles()]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000, // Ensure it's always on top
  },
  
  button: {
    backgroundColor: therapeuticColors.crisis,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  
  backgroundGradient: {
    position: 'absolute',
    backgroundColor: therapeuticColors.crisis,
    opacity: 0.9,
  },
  
  sosText: {
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 2,
  },
  
  indicatorRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    opacity: 0.3,
  },
  
  shadowStyle: {
    // iOS shadow
    shadowColor: therapeuticColors.crisis,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    
    // Android shadow
    elevation: 12,
  },
});

export default SOSFloatingButton;
