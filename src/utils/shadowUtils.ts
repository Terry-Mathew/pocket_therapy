/**
 * Shadow Utilities for Cross-Platform Compatibility
 * 
 * Handles the deprecation of shadow* style props in favor of boxShadow on web
 * while maintaining native shadow support for iOS/Android.
 */

import { Platform, ViewStyle } from 'react-native';

export interface ShadowConfig {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

/**
 * Creates cross-platform shadow styles
 * Uses boxShadow for web and traditional shadow props for native
 */
export const createShadow = (config: ShadowConfig): ViewStyle => {
  const {
    shadowColor = '#000',
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity = 0.1,
    shadowRadius = 4,
    elevation = 3
  } = config;

  if (Platform.OS === 'web') {
    // Use boxShadow for web to avoid deprecation warnings
    const { width, height } = shadowOffset;
    const alpha = Math.round(shadowOpacity * 255).toString(16).padStart(2, '0');
    const shadowColorWithAlpha = `${shadowColor}${alpha}`;
    
    return {
      boxShadow: `${width}px ${height}px ${shadowRadius}px ${shadowColorWithAlpha}`,
    } as ViewStyle;
  }

  // Use traditional shadow props for native platforms
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation, // Android elevation
  };
};

/**
 * Predefined shadow presets for consistent design
 */
export const shadowPresets = {
  none: createShadow({
    shadowOpacity: 0,
    elevation: 0,
  }),
  
  small: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  }),
  
  medium: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  }),
  
  large: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  }),
  
  crisis: createShadow({
    shadowColor: '#DC2626', // Crisis red
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  }),
};

/**
 * Helper to get elevation styles for cards and surfaces
 */
export const getElevationStyle = (level: 'none' | 'small' | 'medium' | 'large' | 'crisis' = 'medium'): ViewStyle => {
  return shadowPresets[level];
};
