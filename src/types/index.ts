/**
 * TypeScript Type Definitions for PocketTherapy
 *
 * This file contains all the TypeScript interfaces and types used throughout the app.
 * Organized by feature area for easy maintenance.
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type AuthState = 'loading' | 'authenticated' | 'guest' | 'unauthenticated';

export interface GuestUser {
  id: string;
  display_name?: string;
  timezone?: string;
  onboarding_completed: boolean;
  isGuest: true;
  createdAt: string;
  profile?: UserProfile;
}

export interface User {
  id: string;
  email?: string;
  googleId?: string;
  display_name?: string;
  avatar_url?: string;
  timezone?: string;
  onboarding_completed: boolean;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  timezone: string;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: {
    enabled: boolean;
    morningTime: string; // HH:MM format
    eveningTime: string; // HH:MM format
    smartNudges: boolean;
  };
  audio: {
    enabled: boolean;
    volume: number; // 0-1
  };
  haptics: {
    enabled: boolean;
    intensity: 'light' | 'medium' | 'heavy';
  };
  privacy: {
    localOnly: boolean;
    dataRetentionDays: number;
  };
}

// ============================================================================
// MOOD TRACKING TYPES
// ============================================================================

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodLog {
  id: string;
  userId: string;
  mood: MoodLevel;
  triggers?: string[];
  note?: string;
  timestamp: string;
  synced: boolean;
  createdAt: string;
}

export interface MoodTrend {
  period: 'day' | 'week' | 'month';
  averageMood: number;
  moodCounts: Record<MoodLevel, number>;
  commonTriggers: string[];
  insights: string[];
}

// ============================================================================
// EXERCISE TYPES
// ============================================================================

export type ExerciseCategory = 'breathing' | 'grounding' | 'cognitive';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  duration: number; // in seconds
  steps: ExerciseStep[];
  audioUrl?: string;
  tags: string[];
  isOfflineAvailable: boolean;
  createdAt: string;
}

export interface ExerciseStep {
  id: string;
  instruction: string;
  duration?: number; // in seconds
  hapticPattern?: 'light' | 'medium' | 'heavy';
  audioCue?: string;
}

export interface ExerciseSession {
  id: string;
  userId: string;
  exerciseId: string;
  startedAt: string;
  completedAt?: string;
  rating?: number; // 1-5 helpfulness rating
  notes?: string;
  synced: boolean;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface GoogleAuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// GuestUser interface is defined above

// AuthState type is defined above as a union type

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Exercises: undefined;
  Insights: undefined;
  Profile: undefined;
};

export type ExerciseStackParamList = {
  ExerciseLibrary: undefined;
  ExercisePlayer: { exerciseId: string };
  ExerciseCompletion: { exerciseId: string; sessionId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  Privacy: undefined;
  CrisisResources: undefined;
};

export type SOSStackParamList = {
  SOSBreathing: undefined;
  SOSGrounding: undefined;
  SOSResources: undefined;
};

// Navigation types are defined above - removing duplicates

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

export interface StorageItem<T> {
  data: T;
  timestamp: string;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'mood' | 'exercise' | 'user';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

export interface ScheduledNotification {
  id: string;
  type: 'reminder' | 'nudge' | 'celebration';
  payload: NotificationPayload;
  scheduledFor: string;
  recurring: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  testID?: string;
  style?: any;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'crisis';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  elevated?: boolean;
}
