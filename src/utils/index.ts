/**
 * Utility Functions for PocketTherapy
 *
 * This file contains helper functions used throughout the app.
 * Organized by functionality for easy maintenance.
 */

import { MoodLevel } from '../types';

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Format a date for display in the app
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'time' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    default:
      return dateObj.toLocaleDateString();
  }
};

/**
 * Get a greeting based on the current time
 */
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return dateObj.toDateString() === today.toDateString();
};

/**
 * Get days between two dates
 */
export const getDaysBetween = (
  date1: Date | string,
  date2: Date | string
): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ============================================================================
// MOOD UTILITIES
// ============================================================================

/**
 * Get mood emoji for a given mood level
 */
export const getMoodEmoji = (mood: MoodLevel): string => {
  const emojis = {
    1: '😢',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😊',
  };
  return emojis[mood];
};

/**
 * Get mood label for a given mood level
 */
export const getMoodLabel = (mood: MoodLevel): string => {
  const labels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Neutral',
    4: 'Good',
    5: 'Very Good',
  };
  return labels[mood];
};

/**
 * Calculate average mood from an array of mood values
 */
export const calculateAverageMood = (moods: MoodLevel[]): number => {
  if (moods.length === 0) return 0;

  const sum = moods.reduce((acc, mood) => acc + mood, 0);
  return Math.round((sum / moods.length) * 10) / 10; // Round to 1 decimal
};

/**
 * Get mood trend direction
 */
export const getMoodTrend = (
  currentAvg: number,
  previousAvg: number
): 'up' | 'down' | 'stable' => {
  const difference = currentAvg - previousAvg;

  if (difference > 0.2) return 'up';
  if (difference < -0.2) return 'down';
  return 'stable';
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Remove duplicates from an array
 */
export const removeDuplicates = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Shuffle an array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp!;
  }
  return shuffled;
};

/**
 * Group array items by a key
 */
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 */
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate mood level
 */
export const isValidMoodLevel = (mood: any): mood is MoodLevel => {
  return (
    typeof mood === 'number' && mood >= 1 && mood <= 5 && Number.isInteger(mood)
  );
};

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

/**
 * Safe JSON stringify
 */
export const safeJsonStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
};

// ============================================================================
// HAPTIC UTILITIES
// ============================================================================

/**
 * Trigger haptic feedback safely
 */
export const triggerHaptic = async (
  type: 'light' | 'medium' | 'heavy' = 'medium'
): Promise<void> => {
  try {
    const Haptics = await import('expo-haptics');

    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  } catch (error) {
    // Haptics not available on this device
    console.warn('Haptics not available:', error);
  }
};

// ============================================================================
// EXERCISE UTILITIES
// ============================================================================

/**
 * Format exercise duration for display
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Calculate exercise completion percentage
 */
export const calculateProgress = (
  currentStep: number,
  totalSteps: number
): number => {
  if (totalSteps === 0) return 0;
  return Math.round((currentStep / totalSteps) * 100);
};

// ============================================================================
// DEBUGGING UTILITIES
// ============================================================================

/**
 * Safe console log that only logs in development
 */
export const debugLog = (message: string, data?: any): void => {
  if (__DEV__) {
    console.log(`[PocketTherapy] ${message}`, data || '');
  }
};

/**
 * Performance timer for debugging
 */
export const createTimer = (label: string) => {
  const start = Date.now();

  return {
    end: () => {
      const duration = Date.now() - start;
      debugLog(`Timer [${label}]: ${duration}ms`);
      return duration;
    },
  };
};
