/**
 * Data Migration Hook
 * 
 * Manages the data migration flow from guest to authenticated user
 * with proper state management and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { MigrationResult } from '../services/dataMigrationService';

interface MigrationState {
  isChecking: boolean;
  hasGuestData: boolean;
  showMigrationModal: boolean;
  isCompleted: boolean;
  result: MigrationResult | null;
  error: string | null;
}

interface UseMigrationReturn {
  migrationState: MigrationState;
  checkForMigration: (userId: string) => Promise<void>;
  startMigration: (userId: string) => Promise<void>;
  completeMigration: () => void;
  skipMigration: () => void;
  resetMigration: () => void;
}

export const useDataMigration = (): UseMigrationReturn => {
  const { actions } = useAppStore();
  
  const [migrationState, setMigrationState] = useState<MigrationState>({
    isChecking: false,
    hasGuestData: false,
    showMigrationModal: false,
    isCompleted: false,
    result: null,
    error: null,
  });

  /**
   * Check if user has guest data that needs migration
   */
  const checkForMigration = useCallback(async (userId: string) => {
    try {
      setMigrationState(prev => ({ ...prev, isChecking: true, error: null }));

      // First check if migration was already completed
      const migrationStatus = await actions.getMigrationStatus();
      if (migrationStatus.completed && migrationStatus.userId === userId) {
        setMigrationState(prev => ({
          ...prev,
          isChecking: false,
          isCompleted: true,
          hasGuestData: false,
        }));
        return;
      }

      // Check for guest data
      const hasGuestData = await actions.checkForGuestData();
      
      setMigrationState(prev => ({
        ...prev,
        isChecking: false,
        hasGuestData,
        showMigrationModal: hasGuestData,
      }));
    } catch (error) {
      console.error('Failed to check for migration:', error);
      setMigrationState(prev => ({
        ...prev,
        isChecking: false,
        error: error.message,
      }));
    }
  }, [actions]);

  /**
   * Start the migration process
   */
  const startMigration = useCallback(async (userId: string) => {
    try {
      setMigrationState(prev => ({ ...prev, error: null }));

      const result = await actions.migrateGuestData(userId);
      
      setMigrationState(prev => ({
        ...prev,
        result,
        isCompleted: result.success,
        error: result.success ? null : result.errors.join(', '),
      }));
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationState(prev => ({
        ...prev,
        error: error.message,
        result: {
          success: false,
          migratedItems: { moodLogs: 0, exerciseSessions: 0, preferences: false, favorites: 0 },
          conflicts: [],
          errors: [error.message],
        },
      }));
    }
  }, [actions]);

  /**
   * Complete the migration flow
   */
  const completeMigration = useCallback(() => {
    setMigrationState(prev => ({
      ...prev,
      showMigrationModal: false,
      isCompleted: true,
    }));
  }, []);

  /**
   * Skip migration and start fresh
   */
  const skipMigration = useCallback(() => {
    setMigrationState(prev => ({
      ...prev,
      showMigrationModal: false,
      hasGuestData: false,
      isCompleted: true,
    }));
  }, []);

  /**
   * Reset migration state (for testing or retry)
   */
  const resetMigration = useCallback(() => {
    setMigrationState({
      isChecking: false,
      hasGuestData: false,
      showMigrationModal: false,
      isCompleted: false,
      result: null,
      error: null,
    });
  }, []);

  return {
    migrationState,
    checkForMigration,
    startMigration,
    completeMigration,
    skipMigration,
    resetMigration,
  };
};

/**
 * Hook for checking migration status on app startup
 */
export const useMigrationCheck = () => {
  const { migrationState, checkForMigration } = useDataMigration();
  const [hasChecked, setHasChecked] = useState(false);

  const performMigrationCheck = useCallback(async (userId?: string) => {
    if (!userId || hasChecked) return;

    try {
      await checkForMigration(userId);
      setHasChecked(true);
    } catch (error) {
      console.error('Migration check failed:', error);
      setHasChecked(true);
    }
  }, [checkForMigration, hasChecked]);

  return {
    migrationState,
    performMigrationCheck,
    hasChecked,
  };
};

/**
 * Hook for migration analytics and reporting
 */
export const useMigrationAnalytics = () => {
  const trackMigrationEvent = useCallback((event: string, data?: any) => {
    // This would integrate with analytics service
    console.log('Migration event:', event, data);
  }, []);

  const trackMigrationStart = useCallback((userId: string) => {
    trackMigrationEvent('migration_started', { userId });
  }, [trackMigrationEvent]);

  const trackMigrationComplete = useCallback((result: MigrationResult) => {
    trackMigrationEvent('migration_completed', {
      success: result.success,
      migratedItems: result.migratedItems,
      conflictCount: result.conflicts.length,
      errorCount: result.errors.length,
    });
  }, [trackMigrationEvent]);

  const trackMigrationSkipped = useCallback((reason: string) => {
    trackMigrationEvent('migration_skipped', { reason });
  }, [trackMigrationEvent]);

  const trackMigrationError = useCallback((error: string) => {
    trackMigrationEvent('migration_error', { error });
  }, [trackMigrationEvent]);

  return {
    trackMigrationStart,
    trackMigrationComplete,
    trackMigrationSkipped,
    trackMigrationError,
  };
};

export default useDataMigration;
