/**
 * Data Export/Import Service
 * 
 * Handles secure export and import of user data with
 * privacy protection and data validation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { MoodLog, ExerciseSession, UserProfile } from '../types';

interface ExportData {
  version: string;
  exportDate: string;
  user: {
    id: string;
    email?: string;
    createdAt: string;
    profile?: UserProfile;
  } | null;
  moodLogs: MoodLog[];
  exerciseCompletions: ExerciseSession[];
  settings: any;
  summary: {
    totalMoodLogs: number;
    totalExercises: number;
    averageMood: number | null;
    dateRange: {
      earliest: string;
      latest: string;
    };
    mostUsedExercises: Record<string, number>;
  };
  privacy: {
    includesPersonalData: boolean;
    dataTypes: string[];
    retentionPeriod: number;
  };
}

interface ImportResult {
  success: boolean;
  imported: {
    moodLogs: number;
    exercises: number;
    settings: boolean;
  };
  errors: string[];
  warnings: string[];
}

class DataExportService {
  private readonly EXPORT_VERSION = '1.0.0';
  private readonly SUPPORTED_VERSIONS = ['1.0.0'];

  /**
   * Export user data to JSON file
   */
  async exportUserData(
    includePersonalData: boolean = true,
    dateRange?: { start: Date; end: Date }
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Get all user data
      const [
        moodLogsStr,
        exerciseCompletionsStr,
        userProfileStr,
        settingsStr,
      ] = await Promise.all([
        AsyncStorage.getItem('mood_logs'),
        AsyncStorage.getItem('exercise_completions'),
        AsyncStorage.getItem('user_profile'),
        AsyncStorage.getItem('app_settings'),
      ]);

      const moodLogs: MoodLog[] = moodLogsStr ? JSON.parse(moodLogsStr) : [];
      const exerciseCompletions: ExerciseSession[] = exerciseCompletionsStr ? JSON.parse(exerciseCompletionsStr) : [];
      const userProfile = userProfileStr ? JSON.parse(userProfileStr) : null;
      const settings = settingsStr ? JSON.parse(settingsStr) : {};

      // Filter by date range if specified
      let filteredMoodLogs = moodLogs;
      let filteredExercises = exerciseCompletions;

      if (dateRange) {
        filteredMoodLogs = moodLogs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= dateRange.start && logDate <= dateRange.end;
        });

        filteredExercises = exerciseCompletions.filter(session => {
          const sessionDate = new Date(session.startedAt);
          return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
        });
      }

      // Anonymize data if requested
      if (!includePersonalData) {
        // Remove personally identifiable information
        filteredMoodLogs = filteredMoodLogs.map(log => ({
          ...log,
          notes: log.notes ? '[REDACTED]' : undefined,
          triggers: log.triggers?.map(() => '[REDACTED]'),
        }));
      }

      // Calculate summary statistics
      const summary = this.calculateSummary(filteredMoodLogs, filteredExercises);

      // Create export data
      const exportData: ExportData = {
        version: this.EXPORT_VERSION,
        exportDate: new Date().toISOString(),
        user: includePersonalData ? userProfile : null,
        moodLogs: filteredMoodLogs,
        exerciseCompletions: filteredExercises,
        settings: includePersonalData ? settings : {},
        summary,
        privacy: {
          includesPersonalData,
          dataTypes: this.getDataTypes(filteredMoodLogs, filteredExercises, settings),
          retentionPeriod: settings.privacy?.dataRetention || 90,
        },
      };

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `pockettherapy-export-${timestamp}.json`;
      const filePath = `${FileSystem.documentDirectory}${filename}`;

      // Write to file
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(exportData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      console.log(`Data exported to: ${filePath}`);
      return { success: true, filePath };
    } catch (error) {
      console.error('Failed to export user data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Share exported data file
   */
  async shareExportedData(filePath: string): Promise<boolean> {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Share.share({
          url: filePath,
          title: 'PocketTherapy Data Export',
          message: 'Your PocketTherapy data export',
        });
        return true;
      } else {
        console.log('Sharing not supported on this platform');
        return false;
      }
    } catch (error) {
      console.error('Failed to share exported data:', error);
      return false;
    }
  }

  /**
   * Import user data from file
   */
  async importUserData(
    mergeWithExisting: boolean = false
  ): Promise<ImportResult> {
    try {
      // Pick file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') {
        return {
          success: false,
          imported: { moodLogs: 0, exercises: 0, settings: false },
          errors: ['Import cancelled by user'],
          warnings: [],
        };
      }

      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(result.uri);
      const importData: ExportData = JSON.parse(fileContent);

      // Validate import data
      const validation = this.validateImportData(importData);
      if (!validation.valid) {
        return {
          success: false,
          imported: { moodLogs: 0, exercises: 0, settings: false },
          errors: validation.errors,
          warnings: [],
        };
      }

      // Import data
      const importResult = await this.performImport(importData, mergeWithExisting);
      
      console.log('Data import completed:', importResult);
      return importResult;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return {
        success: false,
        imported: { moodLogs: 0, exercises: 0, settings: false },
        errors: [`Import failed: ${error.message}`],
        warnings: [],
      };
    }
  }

  /**
   * Validate import data structure and version
   */
  private validateImportData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!data.version) {
      errors.push('Missing version information');
    } else if (!this.SUPPORTED_VERSIONS.includes(data.version)) {
      errors.push(`Unsupported version: ${data.version}`);
    }

    if (!data.exportDate) {
      errors.push('Missing export date');
    }

    if (!Array.isArray(data.moodLogs)) {
      errors.push('Invalid mood logs data');
    }

    if (!Array.isArray(data.exerciseCompletions)) {
      errors.push('Invalid exercise completions data');
    }

    // Validate mood logs structure
    if (data.moodLogs && Array.isArray(data.moodLogs)) {
      data.moodLogs.forEach((log: any, index: number) => {
        if (!log.id || !log.timestamp || typeof log.value !== 'number') {
          errors.push(`Invalid mood log at index ${index}`);
        }
      });
    }

    // Validate exercise completions structure
    if (data.exerciseCompletions && Array.isArray(data.exerciseCompletions)) {
      data.exerciseCompletions.forEach((session: any, index: number) => {
        if (!session.id || !session.exerciseId || !session.startedAt) {
          errors.push(`Invalid exercise session at index ${index}`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Perform the actual import operation
   */
  private async performImport(
    importData: ExportData,
    mergeWithExisting: boolean
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: { moodLogs: 0, exercises: 0, settings: false },
      errors: [],
      warnings: [],
    };

    try {
      // Get existing data if merging
      let existingMoodLogs: MoodLog[] = [];
      let existingExercises: ExerciseSession[] = [];

      if (mergeWithExisting) {
        const [moodLogsStr, exercisesStr] = await Promise.all([
          AsyncStorage.getItem('mood_logs'),
          AsyncStorage.getItem('exercise_completions'),
        ]);

        existingMoodLogs = moodLogsStr ? JSON.parse(moodLogsStr) : [];
        existingExercises = exercisesStr ? JSON.parse(exercisesStr) : [];
      }

      // Import mood logs
      const newMoodLogs = mergeWithExisting
        ? this.mergeMoodLogs(existingMoodLogs, importData.moodLogs)
        : importData.moodLogs;

      await AsyncStorage.setItem('mood_logs', JSON.stringify(newMoodLogs));
      result.imported.moodLogs = importData.moodLogs.length;

      // Import exercise completions
      const newExercises = mergeWithExisting
        ? this.mergeExercises(existingExercises, importData.exerciseCompletions)
        : importData.exerciseCompletions;

      await AsyncStorage.setItem('exercise_completions', JSON.stringify(newExercises));
      result.imported.exercises = importData.exerciseCompletions.length;

      // Import settings (only if not merging or if explicitly requested)
      if (!mergeWithExisting && importData.settings) {
        await AsyncStorage.setItem('app_settings', JSON.stringify(importData.settings));
        result.imported.settings = true;
      }

      // Add warnings for data conflicts
      if (mergeWithExisting) {
        const duplicateMoods = this.findDuplicateMoodLogs(existingMoodLogs, importData.moodLogs);
        const duplicateExercises = this.findDuplicateExercises(existingExercises, importData.exerciseCompletions);

        if (duplicateMoods.length > 0) {
          result.warnings.push(`${duplicateMoods.length} duplicate mood logs were skipped`);
        }

        if (duplicateExercises.length > 0) {
          result.warnings.push(`${duplicateExercises.length} duplicate exercise sessions were skipped`);
        }
      }

      return result;
    } catch (error) {
      result.success = false;
      result.errors.push(`Import operation failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Calculate summary statistics for export
   */
  private calculateSummary(moodLogs: MoodLog[], exercises: ExerciseSession[]) {
    const averageMood = moodLogs.length > 0
      ? moodLogs.reduce((sum, log) => sum + log.value, 0) / moodLogs.length
      : null;

    const allDates = [
      ...moodLogs.map(log => log.timestamp),
      ...exercises.map(session => session.startedAt),
    ].sort();

    const exerciseCounts = exercises.reduce((acc, session) => {
      acc[session.exerciseId] = (acc[session.exerciseId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMoodLogs: moodLogs.length,
      totalExercises: exercises.length,
      averageMood,
      dateRange: {
        earliest: allDates[0] || new Date().toISOString(),
        latest: allDates[allDates.length - 1] || new Date().toISOString(),
      },
      mostUsedExercises: exerciseCounts,
    };
  }

  /**
   * Get list of data types included in export
   */
  private getDataTypes(moodLogs: MoodLog[], exercises: ExerciseSession[], settings: any): string[] {
    const types: string[] = [];

    if (moodLogs.length > 0) types.push('Mood Logs');
    if (exercises.length > 0) types.push('Exercise Sessions');
    if (settings && Object.keys(settings).length > 0) types.push('App Settings');

    return types;
  }

  /**
   * Merge mood logs, avoiding duplicates
   */
  private mergeMoodLogs(existing: MoodLog[], imported: MoodLog[]): MoodLog[] {
    const existingIds = new Set(existing.map(log => log.id));
    const newLogs = imported.filter(log => !existingIds.has(log.id));
    return [...existing, ...newLogs].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /**
   * Merge exercise sessions, avoiding duplicates
   */
  private mergeExercises(existing: ExerciseSession[], imported: ExerciseSession[]): ExerciseSession[] {
    const existingIds = new Set(existing.map(session => session.id));
    const newSessions = imported.filter(session => !existingIds.has(session.id));
    return [...existing, ...newSessions].sort((a, b) => 
      new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );
  }

  /**
   * Find duplicate mood logs
   */
  private findDuplicateMoodLogs(existing: MoodLog[], imported: MoodLog[]): MoodLog[] {
    const existingIds = new Set(existing.map(log => log.id));
    return imported.filter(log => existingIds.has(log.id));
  }

  /**
   * Find duplicate exercise sessions
   */
  private findDuplicateExercises(existing: ExerciseSession[], imported: ExerciseSession[]): ExerciseSession[] {
    const existingIds = new Set(existing.map(session => session.id));
    return imported.filter(session => existingIds.has(session.id));
  }
}

export const dataExportService = new DataExportService();
