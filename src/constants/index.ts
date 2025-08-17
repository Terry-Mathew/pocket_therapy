/**
 * App Constants for PocketTherapy
 *
 * This file contains all the constants used throughout the app.
 * Based on the design system defined in the documentation.
 */

// ============================================================================
// THERAPEUTIC COLOR SYSTEM
// ============================================================================

export const Colors = {
  // Primary Therapeutic Colors
  primary: {
    sage: '#A8C09A', // Soft sage - primary brand color
    sageLight: '#C4D4B8', // Light sage - hover states
    sageDark: '#8FA882', // Dark sage - pressed states
    cream: '#F5F2E8', // Warm cream - main background
    creamLight: '#F9F7F2', // Light cream - elevated surfaces
    creamDark: '#F0EDE0', // Dark cream - borders
    rose: '#E8B4B8', // Dusty rose - accent color
    roseLight: '#F0C8CC', // Light rose - hover states
    roseDark: '#D99FA4', // Dark rose - pressed states
  },

  // Mood-Specific Colors with Variations
  mood: {
    veryLow: {
      primary: '#E8B4B8', // Dusty rose for very low mood
      light: '#F0C8CC', // Light variant
      dark: '#D99FA4', // Dark variant
      background: '#FDF9FA', // Very light background
    },
    low: {
      primary: '#F4D1AE', // Warm peach for low mood
      light: '#F8DFC2', // Light variant
      dark: '#EFC299', // Dark variant
      background: '#FEFCF8', // Very light background
    },
    neutral: {
      primary: '#F5F2E8', // Warm cream for neutral mood
      light: '#F9F7F2', // Light variant
      dark: '#F0EDE0', // Dark variant
      background: '#FEFEFE', // Very light background
    },
    good: {
      primary: '#D4E4AA', // Light sage for good mood
      light: '#E0EBBE', // Light variant
      dark: '#C8DD96', // Dark variant
      background: '#FBFDF7', // Very light background
    },
    veryGood: {
      primary: '#A8C09A', // Soft sage for very good mood
      light: '#C4D4B8', // Light variant
      dark: '#8FA882', // Dark variant
      background: '#F7FAF5', // Very light background
    },
  },

  // Neutral Colors with Variations
  neutral: {
    charcoal: '#3C4142', // Charcoal soft - primary text
    charcoalLight: '#5A5E5F', // Light charcoal - secondary text
    grey: '#6B7B7C', // Sage grey - tertiary text
    greyLight: '#8A9394', // Light grey - disabled text
    lightGrey: '#EFEBE2', // Light cream - card backgrounds
    lightGreyHover: '#E8E3D8', // Hover state for light grey
    white: '#FFFFFF', // Pure white - contrast
    black: '#000000', // Pure black - high contrast text
    overlay: 'rgba(60, 65, 66, 0.6)', // Modal overlay
  },

  // Semantic Colors with Variations
  semantic: {
    success: {
      primary: '#A8C09A', // Success states
      light: '#C4D4B8', // Light success
      dark: '#8FA882', // Dark success
      background: '#F7FAF5', // Success background
    },
    warning: {
      primary: '#F4D1AE', // Warning states
      light: '#F8DFC2', // Light warning
      dark: '#EFC299', // Dark warning
      background: '#FEFCF8', // Warning background
    },
    error: {
      primary: '#E8B4B8', // Error states
      light: '#F0C8CC', // Light error
      dark: '#D99FA4', // Dark error
      background: '#FDF9FA', // Error background
    },
    info: {
      primary: '#A8C09A', // Info states
      light: '#C4D4B8', // Light info
      dark: '#8FA882', // Dark info
      background: '#F7FAF5', // Info background
    },
  },

  // SOS/Crisis Colors with Variations
  crisis: {
    urgent: {
      primary: '#E8B4B8', // Urgent but not alarming
      light: '#F0C8CC', // Light urgent
      dark: '#D99FA4', // Dark urgent
      background: '#FDF9FA', // Urgent background
    },
    calm: {
      primary: '#A8C09A', // Calming for breathing exercises
      light: '#C4D4B8', // Light calm
      dark: '#8FA882', // Dark calm
      background: '#F7FAF5', // Calm background
    },
    safe: {
      primary: '#F5F2E8', // Safe space background
      light: '#F9F7F2', // Light safe
      dark: '#F0EDE0', // Dark safe
      background: '#FEFEFE', // Safe background
    },
  },

  // Interactive States
  interactive: {
    hover: 'rgba(168, 192, 154, 0.1)', // Sage hover overlay
    pressed: 'rgba(168, 192, 154, 0.2)', // Sage pressed overlay
    focus: 'rgba(168, 192, 154, 0.3)', // Sage focus overlay
    disabled: 'rgba(107, 123, 124, 0.3)', // Disabled overlay
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(60, 65, 66, 0.08)', // Light shadow
    medium: 'rgba(60, 65, 66, 0.12)', // Medium shadow
    heavy: 'rgba(60, 65, 66, 0.16)', // Heavy shadow
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const Typography = {
  // Font Family with fallbacks for better reliability
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    // Fallback fonts for when Inter fails to load
    fallback: 'System',
  },

  // Font Sizes (following 4pt scale)
  fontSize: {
    xs: 12, // Small labels, captions
    sm: 14, // Body text, secondary info
    base: 16, // Primary body text
    lg: 18, // Subheadings
    xl: 20, // Section headings
    '2xl': 24, // Page headings
    '3xl': 32, // Display text
    '4xl': 40, // Large display
  },

  // Line Heights
  lineHeight: {
    tight: 1.2, // For headings
    normal: 1.5, // For body text
    relaxed: 1.75, // For reading content
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },

  // Text Styles (combining font size, weight, line height)
  styles: {
    // Display styles
    display: {
      fontSize: 40,
      fontFamily: 'Inter_700Bold',
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h1: {
      fontSize: 32,
      fontFamily: 'Inter_700Bold',
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    h3: {
      fontSize: 20,
      fontFamily: 'Inter_600SemiBold',
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 18,
      fontFamily: 'Inter_500Medium',
      lineHeight: 1.4,
      letterSpacing: 0,
    },

    // Body styles
    bodyLarge: {
      fontSize: 18,
      fontFamily: 'Inter_400Regular',
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      lineHeight: 1.5,
      letterSpacing: 0,
    },

    // UI element styles
    button: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      lineHeight: 1.2,
      letterSpacing: 0.5,
    },
    buttonSmall: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      lineHeight: 1.2,
      letterSpacing: 0.5,
    },
    buttonLarge: {
      fontSize: 18,
      fontFamily: 'Inter_500Medium',
      lineHeight: 1.2,
      letterSpacing: 0.5,
    },

    // Label and caption styles
    label: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      lineHeight: 1.3,
      letterSpacing: 0.5,
    },
    caption: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      lineHeight: 1.3,
      letterSpacing: 0.5,
    },
    overline: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      lineHeight: 1.3,
      letterSpacing: 1,
    },

    // Therapeutic-specific styles
    moodLabel: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      lineHeight: 1.3,
      letterSpacing: 0.5,
    },
    exerciseTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    exerciseInstruction: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    breathingCount: {
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
      lineHeight: 1.2,
      letterSpacing: 0,
    },
    sosButton: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      lineHeight: 1.2,
      letterSpacing: 0.5,
    },
  },
} as const;

// ============================================================================
// FONT UTILITIES
// ============================================================================

/**
 * Get font family with fallback support
 * Returns system font if Inter fonts fail to load
 */
export const getFontFamily = (weight: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular'): string => {
  // In React Native, if a custom font fails to load, it falls back to system font
  // We can safely return the Inter font name as React Native handles fallbacks
  return Typography.fontFamily[weight];
};

// ============================================================================
// SPACING SYSTEM (4pt base scale)
// ============================================================================

export const Spacing = {
  xs: 4, // 4pt - minimal spacing
  sm: 8, // 8pt - small spacing
  md: 16, // 16pt - medium spacing (base)
  lg: 24, // 24pt - large spacing
  xl: 32, // 32pt - extra large spacing
  '2xl': 48, // 48pt - section spacing
  '3xl': 64, // 64pt - page spacing
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BorderRadius = {
  none: 0,
  sm: 4, // Small elements
  md: 8, // Cards, buttons
  lg: 12, // Larger cards
  xl: 16, // Modals
  full: 9999, // Circular elements
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const Animation = {
  duration: {
    fast: 150, // Quick transitions
    normal: 200, // Standard transitions
    slow: 300, // Gentle, therapeutic transitions
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ============================================================================
// APP CONFIGURATION
// ============================================================================

export const Config = {
  // API Configuration
  api: {
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Storage Configuration
  storage: {
    maxRetentionDays: 365,
    syncBatchSize: 50,
    maxOfflineItems: 1000,
  },

  // Mood Tracking
  mood: {
    maxNotesLength: 280, // Twitter-like limit
    reminderIntervalHours: 8,
    trendAnalysisDays: 7,
  },

  // Exercises
  exercises: {
    maxDurationMinutes: 30,
    defaultBreathingCycles: 4,
    ratingScale: 5,
  },

  // Notifications
  notifications: {
    defaultMorningTime: '09:00',
    defaultEveningTime: '20:00',
    maxDailyNotifications: 3,
  },
} as const;

// ============================================================================
// MOOD CONSTANTS
// ============================================================================

export const MoodEmojis = {
  1: '😢', // Very low
  2: '😕', // Low
  3: '😐', // Neutral
  4: '🙂', // Good
  5: '😊', // Very good
} as const;

export const MoodLabels = {
  1: 'Very Low',
  2: 'Low',
  3: 'Neutral',
  4: 'Good',
  5: 'Very Good',
} as const;

// ============================================================================
// EXERCISE CONSTANTS
// ============================================================================

export const ExerciseCategories = {
  breathing: {
    label: 'Breathing',
    icon: '🫁',
    color: Colors.primary.sage,
    description: 'Calm your mind with guided breathing',
  },
  grounding: {
    label: 'Grounding',
    icon: '🌱',
    color: Colors.primary.cream,
    description: 'Connect with the present moment',
  },
  cognitive: {
    label: 'Cognitive',
    icon: '🧠',
    color: Colors.primary.rose,
    description: 'Reframe thoughts and perspectives',
  },
} as const;

// ============================================================================
// NAVIGATION CONSTANTS
// ============================================================================

export const TabBarHeight = 60;
export const HeaderHeight = 56;
export const SOSButtonSize = 56;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const Accessibility = {
  minimumTouchTarget: 44, // iOS HIG minimum
  contrastRatio: {
    normal: 4.5, // WCAG AA
    large: 3.0, // WCAG AA for large text
  },
} as const;

// ============================================================================
// HAPTIC PATTERNS
// ============================================================================

export const HapticPatterns = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;

// ============================================================================
// CRISIS RESOURCES
// ============================================================================

export const CrisisHelplines = {
  // These will be populated based on user location
  default: {
    name: 'Crisis Text Line',
    number: '741741',
    text: 'Text HOME to 741741',
    available: '24/7',
  },
} as const;

// ============================================================================
// THERAPEUTIC DESIGN SYSTEM EXPORTS
// ============================================================================

// Simplified color system for components
export const therapeuticColors = {
  // Primary colors
  primary: Colors.primary.sage,
  secondary: Colors.primary.rose,
  accent: Colors.primary.rose,

  // Background colors
  background: Colors.primary.cream,
  surface: Colors.primary.creamLight,

  // Text colors
  textPrimary: Colors.neutral.charcoal,
  textSecondary: Colors.neutral.grey,

  // Border colors
  border: Colors.primary.creamDark,

  // Semantic colors
  success: Colors.semantic.success.primary,
  warning: Colors.semantic.warning.primary,
  error: Colors.semantic.error.primary,

  // Crisis colors
  crisis: Colors.crisis.urgent.primary,
} as const;

// Simplified spacing system (using 4px base)
export const spacing = {
  '1x': 4,   // 4px
  '2x': 8,   // 8px
  '3x': 12,  // 12px
  '4x': 16,  // 16px
  '5x': 20,  // 20px
  '6x': 24,  // 24px
  '7x': 28,  // 28px
  '8x': 32,  // 32px
  '10x': 40, // 40px
  '12x': 48, // 48px
  '16x': 64, // 64px
} as const;

// Simplified typography system
export const typography = {
  // Display styles
  display: Typography.styles.display,
  h1: Typography.styles.h1,
  h2: Typography.styles.h2,
  h3: Typography.styles.h3,
  h4: Typography.styles.h4,

  // Body styles
  bodyLarge: Typography.styles.bodyLarge,
  body: Typography.styles.body,
  bodySmall: Typography.styles.bodySmall,

  // UI styles
  button: Typography.styles.button,
  label: Typography.styles.label,
  caption: Typography.styles.caption,

  // Therapeutic styles
  moodLabel: Typography.styles.moodLabel,
  exerciseTitle: Typography.styles.exerciseTitle,
  breathingCount: Typography.styles.breathingCount,
} as const;
