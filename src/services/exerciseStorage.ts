/**
 * Exercise Storage Service
 * 
 * Manages local storage of exercises with offline support
 * and text-only fallbacks for complete offline functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, ExerciseSession } from '../types';

const STORAGE_KEYS = {
  EXERCISES: 'exercises_library',
  SESSIONS: 'exercise_sessions',
  FAVORITES: 'favorite_exercises',
  DOWNLOADS: 'downloaded_exercises',
  OFFLINE_CONTENT: 'offline_exercise_content',
} as const;

interface OfflineExerciseContent {
  exerciseId: string;
  textInstructions: string[];
  audioTranscript?: string;
  estimatedDuration: number;
  lastUpdated: string;
}

interface ExerciseDownload {
  exerciseId: string;
  downloadedAt: string;
  size: number;
  hasAudio: boolean;
  hasVideo: boolean;
}

class ExerciseStorageService {
  /**
   * Store exercises in local storage
   */
  async storeExercises(exercises: Exercise[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.EXERCISES,
        JSON.stringify(exercises)
      );
      console.log(`Stored ${exercises.length} exercises locally`);
    } catch (error) {
      console.error('Failed to store exercises:', error);
      throw new Error('Failed to save exercises locally');
    }
  }

  /**
   * Get exercises from local storage
   */
  async getExercises(): Promise<Exercise[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (!stored) return [];
      
      const exercises = JSON.parse(stored) as Exercise[];
      return exercises;
    } catch (error) {
      console.error('Failed to get exercises:', error);
      return [];
    }
  }

  /**
   * Store exercise session
   */
  async storeSession(session: ExerciseSession): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const updatedSessions = [...sessions, session];
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(updatedSessions)
      );
    } catch (error) {
      console.error('Failed to store session:', error);
      throw new Error('Failed to save exercise session');
    }
  }

  /**
   * Get exercise sessions
   */
  async getSessions(): Promise<ExerciseSession[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!stored) return [];
      
      return JSON.parse(stored) as ExerciseSession[];
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  /**
   * Add exercise to favorites
   */
  async addToFavorites(exerciseId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(exerciseId)) {
        const updatedFavorites = [...favorites, exerciseId];
        await AsyncStorage.setItem(
          STORAGE_KEYS.FAVORITES,
          JSON.stringify(updatedFavorites)
        );
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw new Error('Failed to add exercise to favorites');
    }
  }

  /**
   * Remove exercise from favorites
   */
  async removeFromFavorites(exerciseId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== exerciseId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw new Error('Failed to remove exercise from favorites');
    }
  }

  /**
   * Get favorite exercise IDs
   */
  async getFavorites(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (!stored) return [];
      
      return JSON.parse(stored) as string[];
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  /**
   * Store offline exercise content for complete offline support
   */
  async storeOfflineContent(content: OfflineExerciseContent[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_CONTENT,
        JSON.stringify(content)
      );
      console.log(`Stored offline content for ${content.length} exercises`);
    } catch (error) {
      console.error('Failed to store offline content:', error);
      throw new Error('Failed to save offline exercise content');
    }
  }

  /**
   * Get offline exercise content
   */
  async getOfflineContent(exerciseId?: string): Promise<OfflineExerciseContent[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CONTENT);
      if (!stored) return [];
      
      const content = JSON.parse(stored) as OfflineExerciseContent[];
      
      if (exerciseId) {
        return content.filter(item => item.exerciseId === exerciseId);
      }
      
      return content;
    } catch (error) {
      console.error('Failed to get offline content:', error);
      return [];
    }
  }

  /**
   * Check if exercise is available offline
   */
  async isExerciseAvailableOffline(exerciseId: string): Promise<boolean> {
    try {
      const offlineContent = await this.getOfflineContent(exerciseId);
      return offlineContent.length > 0;
    } catch (error) {
      console.error('Failed to check offline availability:', error);
      return false;
    }
  }

  /**
   * Get exercise with offline fallback
   */
  async getExerciseWithFallback(exerciseId: string): Promise<Exercise | null> {
    try {
      const exercises = await this.getExercises();
      const exercise = exercises.find(ex => ex.id === exerciseId);
      
      if (!exercise) return null;

      // Check if we have offline content
      const offlineContent = await this.getOfflineContent(exerciseId);
      if (offlineContent.length > 0) {
        const content = offlineContent[0];
        return {
          ...exercise,
          instructions: content.textInstructions,
          duration: content.estimatedDuration,
          audioUrl: null, // Force text-only for offline
          isOfflineAvailable: true,
        };
      }

      return exercise;
    } catch (error) {
      console.error('Failed to get exercise with fallback:', error);
      return null;
    }
  }

  /**
   * Clear all stored data (for testing or reset)
   */
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.EXERCISES),
        AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.removeItem(STORAGE_KEYS.DOWNLOADS),
        AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_CONTENT),
      ]);
      console.log('Cleared all exercise storage data');
    } catch (error) {
      console.error('Failed to clear exercise data:', error);
      throw new Error('Failed to clear exercise data');
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    exerciseCount: number;
    sessionCount: number;
    favoriteCount: number;
    offlineContentCount: number;
  }> {
    try {
      const [exercises, sessions, favorites, offlineContent] = await Promise.all([
        this.getExercises(),
        this.getSessions(),
        this.getFavorites(),
        this.getOfflineContent(),
      ]);

      return {
        exerciseCount: exercises.length,
        sessionCount: sessions.length,
        favoriteCount: favorites.length,
        offlineContentCount: offlineContent.length,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        exerciseCount: 0,
        sessionCount: 0,
        favoriteCount: 0,
        offlineContentCount: 0,
      };
    }
  }
}

export const exerciseStorageService = new ExerciseStorageService();
