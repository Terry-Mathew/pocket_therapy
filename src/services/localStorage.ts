/**
 * Local Storage Service
 * 
 * Centralized local data storage using AsyncStorage
 * with proper data structure and error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, MoodLog, ExerciseSession, SyncQueueItem } from '../types';

// Storage keys
const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  MOOD_LOGS: 'mood_logs',
  EXERCISE_SESSIONS: 'exercise_sessions',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync',
  ONBOARDING_STATE: 'onboarding_state',
  AUTH_STATE: 'auth_state',
  CRISIS_LOGS: 'crisis_logs',
  APP_VERSION: 'app_version',
  FIRST_LAUNCH: 'first_launch',
} as const;

// Default values
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  notifications: {
    enabled: false,
    morning_reminder: false,
    evening_reminder: false,
    morning_time: '09:00',
    evening_time: '21:00',
  },
  audio: {
    enabled: false,
    background_sounds: 'none',
    volume: 0.5,
    haptic_feedback: true,
  },
  privacy: {
    local_only: false,
    data_retention_days: 90,
    analytics_enabled: false,
  },
  accessibility: {
    reduced_motion: false,
    high_contrast: false,
    large_text: false,
  },
  theme: 'light',
  language: 'en',
};

class LocalStorageService {
  /**
   * Generic storage methods
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        return defaultValue || null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return defaultValue || null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * User Preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    const preferences = await this.getItem<UserPreferences>(
      STORAGE_KEYS.USER_PREFERENCES,
      DEFAULT_USER_PREFERENCES
    );
    
    // Merge with defaults to ensure all properties exist
    return {
      ...DEFAULT_USER_PREFERENCES,
      ...preferences,
      notifications: {
        ...DEFAULT_USER_PREFERENCES.notifications,
        ...preferences?.notifications,
      },
      audio: {
        ...DEFAULT_USER_PREFERENCES.audio,
        ...preferences?.audio,
      },
      privacy: {
        ...DEFAULT_USER_PREFERENCES.privacy,
        ...preferences?.privacy,
      },
      accessibility: {
        ...DEFAULT_USER_PREFERENCES.accessibility,
        ...preferences?.accessibility,
      },
    };
  }

  async setUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const currentPreferences = await this.getUserPreferences();
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
    };
    await this.setItem(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences);
  }

  /**
   * Mood Logs
   */
  async getMoodLogs(limit?: number): Promise<MoodLog[]> {
    const logs = await this.getItem<MoodLog[]>(STORAGE_KEYS.MOOD_LOGS, []);
    if (!logs) return [];
    
    // Sort by timestamp (newest first)
    const sortedLogs = logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? sortedLogs.slice(0, limit) : sortedLogs;
  }

  async addMoodLog(moodLog: MoodLog): Promise<void> {
    const logs = await this.getMoodLogs();
    logs.unshift(moodLog); // Add to beginning
    
    // Keep only last 1000 logs to prevent storage bloat
    if (logs.length > 1000) {
      logs.splice(1000);
    }
    
    await this.setItem(STORAGE_KEYS.MOOD_LOGS, logs);
  }

  async updateMoodLog(id: string, updates: Partial<MoodLog>): Promise<boolean> {
    const logs = await this.getMoodLogs();
    const index = logs.findIndex(log => log.id === id);
    
    if (index === -1) return false;
    
    logs[index] = { ...logs[index], ...updates };
    await this.setItem(STORAGE_KEYS.MOOD_LOGS, logs);
    return true;
  }

  async deleteMoodLog(id: string): Promise<boolean> {
    const logs = await this.getMoodLogs();
    const filteredLogs = logs.filter(log => log.id !== id);
    
    if (filteredLogs.length === logs.length) return false;
    
    await this.setItem(STORAGE_KEYS.MOOD_LOGS, filteredLogs);
    return true;
  }

  /**
   * Exercise Sessions
   */
  async getExerciseSessions(limit?: number): Promise<ExerciseSession[]> {
    const sessions = await this.getItem<ExerciseSession[]>(STORAGE_KEYS.EXERCISE_SESSIONS, []);
    if (!sessions) return [];
    
    // Sort by timestamp (newest first)
    const sortedSessions = sessions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? sortedSessions.slice(0, limit) : sortedSessions;
  }

  async addExerciseSession(session: ExerciseSession): Promise<void> {
    const sessions = await this.getExerciseSessions();
    sessions.unshift(session); // Add to beginning
    
    // Keep only last 500 sessions
    if (sessions.length > 500) {
      sessions.splice(500);
    }
    
    await this.setItem(STORAGE_KEYS.EXERCISE_SESSIONS, sessions);
  }

  /**
   * Sync Queue
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return await this.getItem<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE, []) || [];
  }

  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push(item);
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  async updateSyncQueue(queue: SyncQueueItem[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  async clearSyncQueue(): Promise<void> {
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, []);
  }

  /**
   * Onboarding State
   */
  async getOnboardingState(): Promise<{
    completed: boolean;
    currentStep: number;
    completedSteps: string[];
  }> {
    return await this.getItem(STORAGE_KEYS.ONBOARDING_STATE, {
      completed: false,
      currentStep: 0,
      completedSteps: [],
    });
  }

  async setOnboardingState(state: {
    completed?: boolean;
    currentStep?: number;
    completedSteps?: string[];
  }): Promise<void> {
    const currentState = await this.getOnboardingState();
    const updatedState = { ...currentState, ...state };
    await this.setItem(STORAGE_KEYS.ONBOARDING_STATE, updatedState);
  }

  /**
   * Auth State
   */
  async getAuthState(): Promise<{
    isAuthenticated: boolean;
    isGuest: boolean;
    userId?: string;
    lastLogin?: string;
  }> {
    return await this.getItem(STORAGE_KEYS.AUTH_STATE, {
      isAuthenticated: false,
      isGuest: true,
    });
  }

  async setAuthState(state: {
    isAuthenticated?: boolean;
    isGuest?: boolean;
    userId?: string;
    lastLogin?: string;
  }): Promise<void> {
    const currentState = await this.getAuthState();
    const updatedState = { ...currentState, ...state };
    await this.setItem(STORAGE_KEYS.AUTH_STATE, updatedState);
  }

  /**
   * Crisis Logs (for safety monitoring)
   */
  async addCrisisLog(log: {
    timestamp: string;
    level: 'moderate' | 'immediate';
    keywords: string[];
    context: string;
  }): Promise<void> {
    const logs = await this.getItem<any[]>(STORAGE_KEYS.CRISIS_LOGS, []);
    logs.unshift(log);
    
    // Keep only last 50 crisis logs
    if (logs.length > 50) {
      logs.splice(50);
    }
    
    await this.setItem(STORAGE_KEYS.CRISIS_LOGS, logs);
  }

  /**
   * App Metadata
   */
  async getLastSync(): Promise<string | null> {
    return await this.getItem<string>(STORAGE_KEYS.LAST_SYNC);
  }

  async setLastSync(timestamp: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  async isFirstLaunch(): Promise<boolean> {
    const firstLaunch = await this.getItem<boolean>(STORAGE_KEYS.FIRST_LAUNCH);
    if (firstLaunch === null) {
      await this.setItem(STORAGE_KEYS.FIRST_LAUNCH, false);
      return true;
    }
    return false;
  }

  async getAppVersion(): Promise<string | null> {
    return await this.getItem<string>(STORAGE_KEYS.APP_VERSION);
  }

  async setAppVersion(version: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.APP_VERSION, version);
  }

  /**
   * Data Migration and Cleanup
   */
  async migrateData(fromVersion: string, toVersion: string): Promise<void> {
    console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
    
    // Add migration logic here as needed
    // For now, just update the version
    await this.setAppVersion(toVersion);
  }

  async cleanupOldData(): Promise<void> {
    const preferences = await this.getUserPreferences();
    const retentionDays = preferences.privacy.data_retention_days;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Clean up old mood logs
    const moodLogs = await this.getMoodLogs();
    const filteredMoodLogs = moodLogs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );
    await this.setItem(STORAGE_KEYS.MOOD_LOGS, filteredMoodLogs);

    // Clean up old exercise sessions
    const exerciseSessions = await this.getExerciseSessions();
    const filteredSessions = exerciseSessions.filter(session => 
      new Date(session.timestamp) > cutoffDate
    );
    await this.setItem(STORAGE_KEYS.EXERCISE_SESSIONS, filteredSessions);
  }

  /**
   * Export/Import for account migration
   */
  async exportUserData(): Promise<{
    moodLogs: MoodLog[];
    exerciseSessions: ExerciseSession[];
    preferences: UserPreferences;
    onboardingState: any;
    exportDate: string;
  }> {
    const [moodLogs, exerciseSessions, preferences, onboardingState] = await Promise.all([
      this.getMoodLogs(),
      this.getExerciseSessions(),
      this.getUserPreferences(),
      this.getOnboardingState(),
    ]);

    return {
      moodLogs,
      exerciseSessions,
      preferences,
      onboardingState,
      exportDate: new Date().toISOString(),
    };
  }

  async importUserData(data: {
    moodLogs?: MoodLog[];
    exerciseSessions?: ExerciseSession[];
    preferences?: UserPreferences;
    onboardingState?: any;
  }): Promise<void> {
    if (data.moodLogs) {
      await this.setItem(STORAGE_KEYS.MOOD_LOGS, data.moodLogs);
    }
    
    if (data.exerciseSessions) {
      await this.setItem(STORAGE_KEYS.EXERCISE_SESSIONS, data.exerciseSessions);
    }
    
    if (data.preferences) {
      await this.setUserPreferences(data.preferences);
    }
    
    if (data.onboardingState) {
      await this.setOnboardingState(data.onboardingState);
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();

// Export class for testing
export { LocalStorageService };
