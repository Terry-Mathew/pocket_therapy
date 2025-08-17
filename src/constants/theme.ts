/**
 * Theme System for PocketTherapy
 * 
 * Provides a structured theme object that combines colors, typography, spacing,
 * and other design tokens for consistent usage throughout the app.
 */

import { Colors, Typography, Spacing, BorderRadius, Animation, therapeuticColors, spacing, typography } from './index';

// Re-export the simplified design system
export { therapeuticColors, spacing, typography };

// ============================================================================
// THEME OBJECT
// ============================================================================

export const theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  animation: Animation,

  // Component-specific color mappings
  components: {
    // Button color mappings
    button: {
      primary: {
        background: Colors.primary.sage,
        backgroundHover: Colors.primary.sageLight,
        backgroundPressed: Colors.primary.sageDark,
        text: Colors.neutral.white,
        border: Colors.primary.sage,
      },
      secondary: {
        background: Colors.neutral.white,
        backgroundHover: Colors.primary.creamLight,
        backgroundPressed: Colors.primary.cream,
        text: Colors.primary.sage,
        border: Colors.primary.sage,
      },
      outline: {
        background: 'transparent',
        backgroundHover: Colors.interactive.hover,
        backgroundPressed: Colors.interactive.pressed,
        text: Colors.primary.sage,
        border: Colors.primary.sage,
      },
      ghost: {
        background: 'transparent',
        backgroundHover: Colors.interactive.hover,
        backgroundPressed: Colors.interactive.pressed,
        text: Colors.primary.sage,
        border: 'transparent',
      },
      crisis: {
        background: Colors.crisis.urgent.primary,
        backgroundHover: Colors.crisis.urgent.light,
        backgroundPressed: Colors.crisis.urgent.dark,
        text: Colors.neutral.white,
        border: Colors.crisis.urgent.primary,
      },
    },

    // Card color mappings
    card: {
      background: Colors.neutral.white,
      backgroundElevated: Colors.primary.creamLight,
      border: Colors.primary.creamDark,
      shadow: Colors.shadow.light,
    },

    // Input color mappings
    input: {
      background: Colors.neutral.white,
      backgroundFocus: Colors.primary.creamLight,
      border: Colors.primary.creamDark,
      borderFocus: Colors.primary.sage,
      borderError: Colors.semantic.error.primary,
      text: Colors.neutral.charcoal,
      placeholder: Colors.neutral.grey,
    },

    // Modal color mappings
    modal: {
      background: Colors.neutral.white,
      overlay: Colors.neutral.overlay,
      border: Colors.primary.creamDark,
      shadow: Colors.shadow.heavy,
    },

    // Navigation color mappings
    navigation: {
      background: Colors.neutral.white,
      backgroundActive: Colors.primary.creamLight,
      border: Colors.primary.creamDark,
      text: Colors.neutral.charcoal,
      textActive: Colors.primary.sage,
      icon: Colors.neutral.grey,
      iconActive: Colors.primary.sage,
    },

    // Mood picker color mappings
    moodPicker: {
      veryLow: Colors.mood.veryLow,
      low: Colors.mood.low,
      neutral: Colors.mood.neutral,
      good: Colors.mood.good,
      veryGood: Colors.mood.veryGood,
    },
  },

  // Layout constants
  layout: {
    headerHeight: 56,
    tabBarHeight: 60,
    sosButtonSize: 56,
    screenPadding: Spacing.md,
    cardPadding: Spacing.md,
    sectionSpacing: Spacing.xl,
  },

  // Elevation system (for shadows and z-index) - DEPRECATED
  // Use shadowPresets from utils/shadowUtils.ts instead
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    small: {
      shadowColor: Colors.shadow.light,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: Colors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: Colors.shadow.heavy,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  // Accessibility helpers
  accessibility: {
    minimumTouchTarget: 44,
    focusOutlineWidth: 2,
    focusOutlineColor: Colors.primary.sage,
    highContrastText: Colors.neutral.black,
    lowContrastText: Colors.neutral.grey,
  },
} as const;

// ============================================================================
// THEME UTILITIES
// ============================================================================

/**
 * Get mood color by mood level
 */
export const getMoodColor = (moodLevel: 1 | 2 | 3 | 4 | 5) => {
  const moodMap = {
    1: theme.colors.mood.veryLow,
    2: theme.colors.mood.low,
    3: theme.colors.mood.neutral,
    4: theme.colors.mood.good,
    5: theme.colors.mood.veryGood,
  };
  return moodMap[moodLevel];
};

/**
 * Get semantic color by type
 */
export const getSemanticColor = (type: 'success' | 'warning' | 'error' | 'info') => {
  return theme.colors.semantic[type];
};

/**
 * Get crisis color by urgency level
 */
export const getCrisisColor = (level: 'urgent' | 'calm' | 'safe') => {
  return theme.colors.crisis[level];
};

/**
 * Get button colors by variant
 */
export const getButtonColors = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'crisis') => {
  return theme.components.button[variant];
};

/**
 * Get elevation style by level
 */
export const getElevation = (level: 'none' | 'small' | 'medium' | 'large') => {
  return theme.elevation[level];
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Theme = typeof theme;
export type ThemeColors = typeof Colors;
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type SemanticType = 'success' | 'warning' | 'error' | 'info';
export type CrisisLevel = 'urgent' | 'calm' | 'safe';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'crisis';
export type ElevationLevel = 'none' | 'small' | 'medium' | 'large';

export default theme;
