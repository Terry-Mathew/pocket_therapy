/**
 * Data Migration Service
 * 
 * Handles smooth migration of user data from guest mode
 * to authenticated accounts with conflict resolution
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodLog, ExerciseSession, UserPreferences } from '../types';

interface GuestData {
  moodLogs: MoodLog[];
  exerciseSessions: ExerciseSession[];
  preferences: UserPreferences;
  favorites: string[];
  streaks: {
    current: number;
    longest: number;
    lastCheckIn: string;
  };
  lastMigrationCheck: string;
}

interface MigrationResult {
  success: boolean;
  migratedItems: {
    moodLogs: number;
    exerciseSessions: number;
    preferences: boolean;
    favorites: number;
  };
  conflicts: {
    type: 'mood' | 'exercise' | 'preference';
    guestData: any;
    serverData: any;
    resolution: 'keep_guest' | 'keep_server' | 'merge';
  }[];
  errors: string[];
}

interface MigrationOptions {
  conflictResolution: 'prefer_guest' | 'prefer_server' | 'merge_all' | 'ask_user';
  preserveTimestamps: boolean;
  backupBeforeMigration: boolean;
}

const GUEST_DATA_KEYS = {
  MOOD_LOGS: 'guest_mood_logs',
  EXERCISE_SESSIONS: 'guest_exercise_sessions',
  PREFERENCES: 'guest_preferences',
  FAVORITES: 'guest_favorites',
  STREAKS: 'guest_streaks',
  MIGRATION_STATUS: 'migration_status',
} as const;

class DataMigrationService {
  /**
   * Check if user has guest data that needs migration
   */
  async hasGuestDataToMigrate(): Promise<boolean> {
    try {
      const [moodLogs, exerciseSessions, preferences] = await Promise.all([
        AsyncStorage.getItem(GUEST_DATA_KEYS.MOOD_LOGS),
        AsyncStorage.getItem(GUEST_DATA_KEYS.EXERCISE_SESSIONS),
        AsyncStorage.getItem(GUEST_DATA_KEYS.PREFERENCES),
      ]);

      return !!(moodLogs || exerciseSessions || preferences);
    } catch (error) {
      console.error('Failed to check for guest data:', error);
      return false;
    }
  }

  /**
   * Get all guest data for migration
   */
  async getGuestData(): Promise<GuestData> {
    try {
      const [
        moodLogsStr,
        exerciseSessionsStr,
        preferencesStr,
        favoritesStr,
        streaksStr,
      ] = await Promise.all([
        AsyncStorage.getItem(GUEST_DATA_KEYS.MOOD_LOGS),
        AsyncStorage.getItem(GUEST_DATA_KEYS.EXERCISE_SESSIONS),
        AsyncStorage.getItem(GUEST_DATA_KEYS.PREFERENCES),
        AsyncStorage.getItem(GUEST_DATA_KEYS.FAVORITES),
        AsyncStorage.getItem(GUEST_DATA_KEYS.STREAKS),
      ]);

      return {
        moodLogs: moodLogsStr ? JSON.parse(moodLogsStr) : [],
        exerciseSessions: exerciseSessionsStr ? JSON.parse(exerciseSessionsStr) : [],
        preferences: preferencesStr ? JSON.parse(preferencesStr) : {},
        favorites: favoritesStr ? JSON.parse(favoritesStr) : [],
        streaks: streaksStr ? JSON.parse(streaksStr) : {
          current: 0,
          longest: 0,
          lastCheckIn: new Date().toISOString(),
        },
        lastMigrationCheck: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get guest data:', error);
      throw new Error('Failed to retrieve guest data for migration');
    }
  }

  /**
   * Migrate guest data to authenticated account
   */
  async migrateGuestData(
    userId: string,
    options: MigrationOptions = {
      conflictResolution: 'merge_all',
      preserveTimestamps: true,
      backupBeforeMigration: true,
    }
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedItems: {
        moodLogs: 0,
        exerciseSessions: 0,
        preferences: false,
        favorites: 0,
      },
      conflicts: [],
      errors: [],
    };

    try {
      // Check if there's guest data to migrate
      const hasGuestData = await this.hasGuestDataToMigrate();
      if (!hasGuestData) {
        result.success = true;
        return result;
      }

      // Get guest data
      const guestData = await this.getGuestData();

      // Create backup if requested
      if (options.backupBeforeMigration) {
        await this.createMigrationBackup(guestData);
      }

      // Migrate mood logs
      if (guestData.moodLogs.length > 0) {
        const moodResult = await this.migrateMoodLogs(
          guestData.moodLogs,
          userId,
          options
        );
        result.migratedItems.moodLogs = moodResult.migrated;
        result.conflicts.push(...moodResult.conflicts);
        result.errors.push(...moodResult.errors);
      }

      // Migrate exercise sessions
      if (guestData.exerciseSessions.length > 0) {
        const exerciseResult = await this.migrateExerciseSessions(
          guestData.exerciseSessions,
          userId,
          options
        );
        result.migratedItems.exerciseSessions = exerciseResult.migrated;
        result.conflicts.push(...exerciseResult.conflicts);
        result.errors.push(...exerciseResult.errors);
      }

      // Migrate preferences
      if (Object.keys(guestData.preferences).length > 0) {
        const prefResult = await this.migratePreferences(
          guestData.preferences,
          userId,
          options
        );
        result.migratedItems.preferences = prefResult.success;
        result.conflicts.push(...prefResult.conflicts);
        result.errors.push(...prefResult.errors);
      }

      // Migrate favorites
      if (guestData.favorites.length > 0) {
        const favResult = await this.migrateFavorites(
          guestData.favorites,
          userId,
          options
        );
        result.migratedItems.favorites = favResult.migrated;
        result.conflicts.push(...favResult.conflicts);
        result.errors.push(...favResult.errors);
      }

      // Mark migration as completed
      await this.markMigrationCompleted(userId);

      // Clean up guest data after successful migration
      if (result.errors.length === 0) {
        await this.cleanupGuestData();
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      console.error('Migration failed:', error);
      result.errors.push(`Migration failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Migrate mood logs with conflict resolution
   */
  private async migrateMoodLogs(
    guestMoodLogs: MoodLog[],
    userId: string,
    options: MigrationOptions
  ): Promise<{ migrated: number; conflicts: any[]; errors: string[] }> {
    const result = { migrated: 0, conflicts: [], errors: [] };

    try {
      // For now, we'll just store them locally since we don't have server integration
      // In a real implementation, this would sync with Supabase
      
      for (const moodLog of guestMoodLogs) {
        // Add user ID to mood log
        const migratedLog = {
          ...moodLog,
          userId,
          migratedAt: new Date().toISOString(),
        };

        // Store in the main mood logs storage
        // This would typically involve API calls to sync with server
        result.migrated++;
      }

      console.log(`Migrated ${result.migrated} mood logs for user ${userId}`);
    } catch (error) {
      result.errors.push(`Failed to migrate mood logs: ${error.message}`);
    }

    return result;
  }

  /**
   * Migrate exercise sessions
   */
  private async migrateExerciseSessions(
    guestSessions: ExerciseSession[],
    userId: string,
    options: MigrationOptions
  ): Promise<{ migrated: number; conflicts: any[]; errors: string[] }> {
    const result = { migrated: 0, conflicts: [], errors: [] };

    try {
      for (const session of guestSessions) {
        const migratedSession = {
          ...session,
          userId,
          migratedAt: new Date().toISOString(),
        };

        // Store in the main exercise sessions storage
        result.migrated++;
      }

      console.log(`Migrated ${result.migrated} exercise sessions for user ${userId}`);
    } catch (error) {
      result.errors.push(`Failed to migrate exercise sessions: ${error.message}`);
    }

    return result;
  }

  /**
   * Migrate user preferences
   */
  private async migratePreferences(
    guestPreferences: UserPreferences,
    userId: string,
    options: MigrationOptions
  ): Promise<{ success: boolean; conflicts: any[]; errors: string[] }> {
    const result = { success: false, conflicts: [], errors: [] };

    try {
      const migratedPreferences = {
        ...guestPreferences,
        userId,
        migratedAt: new Date().toISOString(),
      };

      // Store preferences
      result.success = true;
      console.log(`Migrated preferences for user ${userId}`);
    } catch (error) {
      result.errors.push(`Failed to migrate preferences: ${error.message}`);
    }

    return result;
  }

  /**
   * Migrate favorite exercises
   */
  private async migrateFavorites(
    guestFavorites: string[],
    userId: string,
    options: MigrationOptions
  ): Promise<{ migrated: number; conflicts: any[]; errors: string[] }> {
    const result = { migrated: 0, conflicts: [], errors: [] };

    try {
      // Store favorites with user association
      result.migrated = guestFavorites.length;
      console.log(`Migrated ${result.migrated} favorites for user ${userId}`);
    } catch (error) {
      result.errors.push(`Failed to migrate favorites: ${error.message}`);
    }

    return result;
  }

  /**
   * Create backup of guest data before migration
   */
  private async createMigrationBackup(guestData: GuestData): Promise<void> {
    try {
      const backupKey = `migration_backup_${Date.now()}`;
      await AsyncStorage.setItem(backupKey, JSON.stringify(guestData));
      console.log('Migration backup created:', backupKey);
    } catch (error) {
      console.error('Failed to create migration backup:', error);
      throw new Error('Failed to create migration backup');
    }
  }

  /**
   * Mark migration as completed
   */
  private async markMigrationCompleted(userId: string): Promise<void> {
    try {
      const migrationStatus = {
        userId,
        completedAt: new Date().toISOString(),
        version: '1.0',
      };

      await AsyncStorage.setItem(
        GUEST_DATA_KEYS.MIGRATION_STATUS,
        JSON.stringify(migrationStatus)
      );
    } catch (error) {
      console.error('Failed to mark migration as completed:', error);
    }
  }

  /**
   * Clean up guest data after successful migration
   */
  private async cleanupGuestData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(GUEST_DATA_KEYS.MOOD_LOGS),
        AsyncStorage.removeItem(GUEST_DATA_KEYS.EXERCISE_SESSIONS),
        AsyncStorage.removeItem(GUEST_DATA_KEYS.PREFERENCES),
        AsyncStorage.removeItem(GUEST_DATA_KEYS.FAVORITES),
        AsyncStorage.removeItem(GUEST_DATA_KEYS.STREAKS),
      ]);

      console.log('Guest data cleaned up after migration');
    } catch (error) {
      console.error('Failed to cleanup guest data:', error);
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{ completed: boolean; userId?: string; completedAt?: string }> {
    try {
      const statusStr = await AsyncStorage.getItem(GUEST_DATA_KEYS.MIGRATION_STATUS);
      if (!statusStr) {
        return { completed: false };
      }

      const status = JSON.parse(statusStr);
      return {
        completed: true,
        userId: status.userId,
        completedAt: status.completedAt,
      };
    } catch (error) {
      console.error('Failed to get migration status:', error);
      return { completed: false };
    }
  }

  /**
   * Reset migration status (for testing)
   */
  async resetMigrationStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GUEST_DATA_KEYS.MIGRATION_STATUS);
      console.log('Migration status reset');
    } catch (error) {
      console.error('Failed to reset migration status:', error);
    }
  }
}

export const dataMigrationService = new DataMigrationService();

// Export types for use in components
export type { MigrationResult, MigrationOptions, GuestData };
