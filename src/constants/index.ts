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
    cream: '#F5F2E8', // Warm cream - main background
    rose: '#E8B4B8', // Dusty rose - accent color
  },

  // Mood-Specific Colors
  mood: {
    veryLow: '#E8B4B8', // Dusty rose for very low mood
    low: '#F4D1AE', // Warm peach for low mood
    neutral: '#F5F2E8', // Warm cream for neutral mood
    good: '#D4E4AA', // Light sage for good mood
    veryGood: '#A8C09A', // Soft sage for very good mood
  },

  // Neutral Colors
  neutral: {
    charcoal: '#3C4142', // Charcoal soft - primary text
    grey: '#6B7B7C', // Sage grey - secondary text
    lightGrey: '#EFEBE2', // Light cream - card backgrounds
    white: '#FFFFFF', // Pure white - contrast
    black: '#000000', // Pure black - high contrast text
  },

  // Semantic Colors
  semantic: {
    success: '#A8C09A', // Success states
    warning: '#F4D1AE', // Warning states
    error: '#E8B4B8', // Error states
    info: '#A8C09A', // Info states
  },

  // SOS/Crisis Colors
  crisis: {
    urgent: '#E8B4B8', // Urgent but not alarming
    calm: '#A8C09A', // Calming for breathing exercises
    safe: '#F5F2E8', // Safe space background
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const Typography = {
  // Font Family
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
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
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

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
