/**
 * Guest Mode Service
 * 
 * Handles local-only user sessions with data storage
 * and option to upgrade to full account later
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuestUser, MoodLog, ExerciseSession, UserPreferences } from '../types';

const GUEST_USER_KEY = 'guest_user';
const GUEST_MOOD_LOGS_KEY = 'guest_mood_logs';
const GUEST_EXERCISE_SESSIONS_KEY = 'guest_exercise_sessions';
const GUEST_PREFERENCES_KEY = 'guest_preferences';

class GuestModeService {
  /**
   * Creates a new guest user session
   * @returns Promise<GuestUser>
   */
  async createGuestUser(): Promise<GuestUser> {
    const guestUser: GuestUser = {
      id: this.generateGuestId(),
      display_name: 'Guest User',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      onboarding_completed: false,
      isGuest: true,
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
    return guestUser;
  }

  /**
   * Gets the current guest user
   * @returns Promise<GuestUser | null>
   */
  async getGuestUser(): Promise<GuestUser | null> {
    try {
      const userData = await AsyncStorage.getItem(GUEST_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get guest user:', error);
      return null;
    }
  }

  /**
   * Updates guest user data
   * @param updates - Partial guest user data to update
   * @returns Promise<GuestUser | null>
   */
  async updateGuestUser(updates: Partial<GuestUser>): Promise<GuestUser | null> {
    try {
      const currentUser = await this.getGuestUser();
      if (!currentUser) return null;

      const updatedUser = { ...currentUser, ...updates };
      await AsyncStorage.setItem(GUEST_USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Failed to update guest user:', error);
      return null;
    }
  }

  /**
   * Stores mood log for guest user
   * @param moodLog - Mood log to store
   */
  async storeMoodLog(moodLog: MoodLog): Promise<void> {
    try {
      const existingLogs = await this.getGuestMoodLogs();
      const updatedLogs = [...existingLogs, moodLog];
      
      // Keep only last 90 days of data for privacy
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const filteredLogs = updatedLogs.filter(log => 
        new Date(log.timestamp) > ninetyDaysAgo
      );

      await AsyncStorage.setItem(GUEST_MOOD_LOGS_KEY, JSON.stringify(filteredLogs));
    } catch (error) {
      console.error('Failed to store guest mood log:', error);
    }
  }

  /**
   * Gets all mood logs for guest user
   * @returns Promise<MoodLog[]>
   */
  async getGuestMoodLogs(): Promise<MoodLog[]> {
    try {
      const logsData = await AsyncStorage.getItem(GUEST_MOOD_LOGS_KEY);
      return logsData ? JSON.parse(logsData) : [];
    } catch (error) {
      console.error('Failed to get guest mood logs:', error);
      return [];
    }
  }

  /**
   * Stores exercise session for guest user
   * @param session - Exercise session to store
   */
  async storeExerciseSession(session: ExerciseSession): Promise<void> {
    try {
      const existingSessions = await this.getGuestExerciseSessions();
      const updatedSessions = [...existingSessions, session];
      
      // Keep only last 90 days of data
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const filteredSessions = updatedSessions.filter(session => 
        new Date(session.startedAt) > ninetyDaysAgo
      );

      await AsyncStorage.setItem(GUEST_EXERCISE_SESSIONS_KEY, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Failed to store guest exercise session:', error);
    }
  }

  /**
   * Gets all exercise sessions for guest user
   * @returns Promise<ExerciseSession[]>
   */
  async getGuestExerciseSessions(): Promise<ExerciseSession[]> {
    try {
      const sessionsData = await AsyncStorage.getItem(GUEST_EXERCISE_SESSIONS_KEY);
      return sessionsData ? JSON.parse(sessionsData) : [];
    } catch (error) {
      console.error('Failed to get guest exercise sessions:', error);
      return [];
    }
  }

  /**
   * Stores user preferences for guest
   * @param preferences - User preferences to store
   */
  async storeGuestPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(GUEST_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to store guest preferences:', error);
    }
  }

  /**
   * Gets user preferences for guest
   * @returns Promise<UserPreferences | null>
   */
  async getGuestPreferences(): Promise<UserPreferences | null> {
    try {
      const preferencesData = await AsyncStorage.getItem(GUEST_PREFERENCES_KEY);
      return preferencesData ? JSON.parse(preferencesData) : null;
    } catch (error) {
      console.error('Failed to get guest preferences:', error);
      return null;
    }
  }

  /**
   * Prepares guest data for migration to authenticated account
   * @returns Promise<GuestMigrationData>
   */
  async prepareDataForMigration(): Promise<{
    user: GuestUser | null;
    moodLogs: MoodLog[];
    exerciseSessions: ExerciseSession[];
    preferences: UserPreferences | null;
  }> {
    const [user, moodLogs, exerciseSessions, preferences] = await Promise.all([
      this.getGuestUser(),
      this.getGuestMoodLogs(),
      this.getGuestExerciseSessions(),
      this.getGuestPreferences(),
    ]);

    return {
      user,
      moodLogs,
      exerciseSessions,
      preferences,
    };
  }

  /**
   * Clears all guest data after successful migration
   */
  async clearGuestData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(GUEST_USER_KEY),
        AsyncStorage.removeItem(GUEST_MOOD_LOGS_KEY),
        AsyncStorage.removeItem(GUEST_EXERCISE_SESSIONS_KEY),
        AsyncStorage.removeItem(GUEST_PREFERENCES_KEY),
      ]);
    } catch (error) {
      console.error('Failed to clear guest data:', error);
    }
  }

  /**
   * Checks if user is currently in guest mode
   * @returns Promise<boolean>
   */
  async isGuestMode(): Promise<boolean> {
    const guestUser = await this.getGuestUser();
    return guestUser !== null;
  }

  /**
   * Gets guest data summary for display
   * @returns Promise<GuestDataSummary>
   */
  async getGuestDataSummary(): Promise<{
    moodLogsCount: number;
    exerciseSessionsCount: number;
    daysSinceFirstUse: number;
    hasPreferences: boolean;
  }> {
    const [moodLogs, exerciseSessions, user, preferences] = await Promise.all([
      this.getGuestMoodLogs(),
      this.getGuestExerciseSessions(),
      this.getGuestUser(),
      this.getGuestPreferences(),
    ]);

    const daysSinceFirstUse = user 
      ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      moodLogsCount: moodLogs.length,
      exerciseSessionsCount: exerciseSessions.length,
      daysSinceFirstUse,
      hasPreferences: preferences !== null,
    };
  }

  /**
   * Validates guest data integrity
   * @returns Promise<boolean>
   */
  async validateGuestData(): Promise<boolean> {
    try {
      const [user, moodLogs, exerciseSessions] = await Promise.all([
        this.getGuestUser(),
        this.getGuestMoodLogs(),
        this.getGuestExerciseSessions(),
      ]);

      // Check if user exists and has valid structure
      if (!user || !user.id || !user.isGuest) {
        return false;
      }

      // Validate mood logs structure
      const validMoodLogs = moodLogs.every(log => 
        log.id && log.mood && log.timestamp && typeof log.synced === 'boolean'
      );

      // Validate exercise sessions structure
      const validExerciseSessions = exerciseSessions.every(session => 
        session.id && session.exerciseId && session.startedAt && typeof session.synced === 'boolean'
      );

      return validMoodLogs && validExerciseSessions;
    } catch (error) {
      console.error('Failed to validate guest data:', error);
      return false;
    }
  }

  /**
   * Generates a unique guest user ID
   * @returns string
   */
  private generateGuestId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleans up old guest data (privacy protection)
   */
  async cleanupOldData(): Promise<void> {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Clean mood logs
      const moodLogs = await this.getGuestMoodLogs();
      const recentMoodLogs = moodLogs.filter(log => 
        new Date(log.timestamp) > ninetyDaysAgo
      );
      await AsyncStorage.setItem(GUEST_MOOD_LOGS_KEY, JSON.stringify(recentMoodLogs));

      // Clean exercise sessions
      const exerciseSessions = await this.getGuestExerciseSessions();
      const recentSessions = exerciseSessions.filter(session => 
        new Date(session.startedAt) > ninetyDaysAgo
      );
      await AsyncStorage.setItem(GUEST_EXERCISE_SESSIONS_KEY, JSON.stringify(recentSessions));

    } catch (error) {
      console.error('Failed to cleanup old guest data:', error);
    }
  }
}

// Export singleton instance
export const guestModeService = new GuestModeService();

// Export class for testing
export { GuestModeService };
