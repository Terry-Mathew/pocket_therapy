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
// CRISIS DETECTION TYPES
// ============================================================================

export type CrisisLevel = 'IMMEDIATE' | 'MODERATE' | 'NONE';

export interface CrisisDetection {
  level: CrisisLevel;
  keywords: string[];
  confidence: number;
}

export interface CrisisEvent {
  id: string;
  level: CrisisLevel;
  timestamp: Date;
  user_actions: string[];
  session_id: string;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface AppState {
  auth: AuthState;
  user: User | GuestUser | null;
  mood: MoodState;
  exercises: ExerciseState;
  settings: SettingsState;
  system: SystemState;
}

export interface MoodState {
  logs: MoodLog[];
  currentStreak: number;
  lastCheckIn: Date | null;
  pendingSync: MoodLog[];
  insights: MoodTrend[];
}

export interface ExerciseState {
  library: Exercise[];
  favorites: string[];
  completions: ExerciseSession[];
  currentSession: ExerciseSession | null;
  recommendations: Exercise[];
}

export interface SettingsState {
  notifications: NotificationSettings;
  audio: AudioSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface SystemState {
  isOnline: boolean;
  isLoading: boolean;
  lastSync: Date | null;
  pendingActions: SyncQueueItem[];
  errorState: ErrorState | null;
}

export interface ErrorState {
  type: 'network' | 'sync' | 'storage' | 'exercise' | 'auth';
  message: string;
  timestamp: Date;
  recoverable: boolean;
  retryAction?: () => void;
}

export interface NotificationSettings {
  daily_reminders: boolean;
  reminder_time: string;
  exercise_suggestions: boolean;
  streak_celebrations: boolean;
  crisis_alerts: boolean;
}

export interface AudioSettings {
  enabled: boolean;
  background_sounds: 'none' | 'rain' | 'forest' | 'ocean' | 'white_noise';
  volume: number;
  haptic_feedback: boolean;
}

export interface PrivacySettings {
  analytics_enabled: boolean;
  crisis_detection_enabled: boolean;
  cloud_backup_enabled: boolean;
  data_sharing_enabled: boolean;
}

export interface AccessibilitySettings {
  high_contrast: boolean;
  reduced_motion: boolean;
  large_text: boolean;
  voice_guidance: boolean;
  screen_reader_optimized: boolean;
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
