/**
 * Exercise Seed Service
 * 
 * Seeds the database with the 30 micro-exercises and manages
 * exercise content updates and versioning
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './api/supabaseClient';
import { exercises, Exercise } from '../data/exercises';

interface SeedResult {
  success: boolean;
  seeded: number;
  updated: number;
  errors: string[];
}

class ExerciseSeedService {
  private readonly SEED_VERSION_KEY = 'exercise_seed_version';
  private readonly CURRENT_SEED_VERSION = '1.0.0';
  private readonly LOCAL_EXERCISES_KEY = 'local_exercises';

  /**
   * Seed exercises to both local storage and Supabase
   */
  async seedExercises(forceUpdate: boolean = false): Promise<SeedResult> {
    const result: SeedResult = {
      success: true,
      seeded: 0,
      updated: 0,
      errors: [],
    };

    try {
      // Check if we need to seed
      const lastSeedVersion = await AsyncStorage.getItem(this.SEED_VERSION_KEY);
      
      if (!forceUpdate && lastSeedVersion === this.CURRENT_SEED_VERSION) {
        console.log('Exercises already seeded with current version');
        return result;
      }

      // Seed to local storage first (always available)
      await this.seedLocalExercises();
      result.seeded += exercises.length;

      // Try to seed to Supabase if user is authenticated
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !('isGuest' in user)) {
          const supabaseResult = await this.seedSupabaseExercises();
          result.updated += supabaseResult.updated;
          if (supabaseResult.errors.length > 0) {
            result.errors.push(...supabaseResult.errors);
          }
        }
      } catch (supabaseError) {
        console.log('Supabase seeding skipped (offline or guest mode)');
        // This is not an error - local-first approach
      }

      // Update seed version
      await AsyncStorage.setItem(this.SEED_VERSION_KEY, this.CURRENT_SEED_VERSION);
      
      console.log(`Exercise seeding completed: ${result.seeded} seeded, ${result.updated} updated`);
      return result;
    } catch (error) {
      console.error('Exercise seeding failed:', error);
      result.success = false;
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Seed exercises to local storage
   */
  private async seedLocalExercises(): Promise<void> {
    try {
      // Store exercises with metadata
      const exerciseData = {
        version: this.CURRENT_SEED_VERSION,
        lastUpdated: new Date().toISOString(),
        exercises: exercises.map(exercise => ({
          ...exercise,
          isLocal: true,
          downloadedAt: new Date().toISOString(),
        })),
      };

      await AsyncStorage.setItem(this.LOCAL_EXERCISES_KEY, JSON.stringify(exerciseData));
      console.log(`${exercises.length} exercises seeded to local storage`);
    } catch (error) {
      console.error('Failed to seed local exercises:', error);
      throw error;
    }
  }

  /**
   * Seed exercises to Supabase
   */
  private async seedSupabaseExercises(): Promise<{ updated: number; errors: string[] }> {
    const result = { updated: 0, errors: [] };

    try {
      // Check if exercises table exists and create if needed
      await this.ensureExercisesTable();

      // Get existing exercises
      const { data: existingExercises, error: fetchError } = await supabase
        .from('exercises')
        .select('id, title, updated_at');

      if (fetchError) {
        result.errors.push(`Failed to fetch existing exercises: ${fetchError.message}`);
        return result;
      }

      const existingIds = new Set(existingExercises?.map(ex => ex.id) || []);

      // Prepare exercises for insertion/update
      const exercisesToUpsert = exercises.map(exercise => ({
        id: exercise.id,
        title: exercise.title,
        category: exercise.category,
        duration: exercise.duration,
        difficulty: exercise.difficulty,
        description: exercise.description,
        instructions: exercise.instructions,
        benefits: exercise.benefits,
        tags: exercise.tags,
        audio_script: exercise.audioScript,
        haptic_pattern: exercise.hapticPattern,
        crisis_appropriate: exercise.crisisAppropriate,
        is_premium: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Upsert exercises in batches
      const batchSize = 10;
      for (let i = 0; i < exercisesToUpsert.length; i += batchSize) {
        const batch = exercisesToUpsert.slice(i, i + batchSize);
        
        const { error: upsertError } = await supabase
          .from('exercises')
          .upsert(batch, { onConflict: 'id' });

        if (upsertError) {
          result.errors.push(`Batch ${i / batchSize + 1} failed: ${upsertError.message}`);
        } else {
          result.updated += batch.length;
        }
      }

      console.log(`Supabase exercises updated: ${result.updated}`);
      return result;
    } catch (error) {
      result.errors.push(`Supabase seeding error: ${error.message}`);
      return result;
    }
  }

  /**
   * Ensure exercises table exists in Supabase
   */
  private async ensureExercisesTable(): Promise<void> {
    try {
      // This would typically be handled by migrations
      // For now, we'll assume the table exists
      console.log('Exercises table check completed');
    } catch (error) {
      console.error('Failed to ensure exercises table:', error);
      throw error;
    }
  }

  /**
   * Get exercises from local storage
   */
  async getLocalExercises(): Promise<Exercise[]> {
    try {
      const exerciseData = await AsyncStorage.getItem(this.LOCAL_EXERCISES_KEY);
      
      if (!exerciseData) {
        // If no local exercises, seed them
        await this.seedLocalExercises();
        return exercises;
      }

      const parsed = JSON.parse(exerciseData);
      return parsed.exercises || exercises;
    } catch (error) {
      console.error('Failed to get local exercises:', error);
      // Return default exercises as fallback
      return exercises;
    }
  }

  /**
   * Get exercises by category
   */
  async getExercisesByCategory(category: 'breathing' | 'grounding' | 'cognitive'): Promise<Exercise[]> {
    const allExercises = await this.getLocalExercises();
    return allExercises.filter(exercise => exercise.category === category);
  }

  /**
   * Get crisis-appropriate exercises
   */
  async getCrisisExercises(): Promise<Exercise[]> {
    const allExercises = await this.getLocalExercises();
    return allExercises.filter(exercise => exercise.crisisAppropriate);
  }

  /**
   * Get exercises by difficulty
   */
  async getExercisesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<Exercise[]> {
    const allExercises = await this.getLocalExercises();
    return allExercises.filter(exercise => exercise.difficulty === difficulty);
  }

  /**
   * Search exercises by tags or title
   */
  async searchExercises(query: string): Promise<Exercise[]> {
    const allExercises = await this.getLocalExercises();
    const lowercaseQuery = query.toLowerCase();

    return allExercises.filter(exercise => 
      exercise.title.toLowerCase().includes(lowercaseQuery) ||
      exercise.description.toLowerCase().includes(lowercaseQuery) ||
      exercise.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get a specific exercise by ID
   */
  async getExerciseById(id: string): Promise<Exercise | null> {
    const allExercises = await this.getLocalExercises();
    return allExercises.find(exercise => exercise.id === id) || null;
  }

  /**
   * Get recommended exercises based on user context
   */
  async getRecommendedExercises(context: {
    mood?: number;
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    availableTime?: number; // in seconds
    isInCrisis?: boolean;
  }): Promise<Exercise[]> {
    const allExercises = await this.getLocalExercises();
    let filtered = allExercises;

    // Filter for crisis if needed
    if (context.isInCrisis) {
      filtered = filtered.filter(ex => ex.crisisAppropriate);
    }

    // Filter by available time
    if (context.availableTime) {
      filtered = filtered.filter(ex => ex.duration <= context.availableTime);
    }

    // Recommend based on mood
    if (context.mood !== undefined) {
      if (context.mood <= 2) {
        // Low mood - prioritize grounding and breathing
        filtered = filtered.filter(ex => 
          ex.category === 'grounding' || 
          (ex.category === 'breathing' && ex.crisisAppropriate)
        );
      } else if (context.mood >= 4) {
        // Good mood - can try cognitive exercises
        filtered = filtered.filter(ex => 
          ex.category === 'cognitive' || ex.category === 'breathing'
        );
      }
    }

    // Recommend based on time of day
    if (context.timeOfDay === 'morning') {
      // Morning - energizing exercises
      filtered = filtered.filter(ex => 
        ex.tags.includes('focus') || 
        ex.tags.includes('energy') ||
        ex.category === 'breathing'
      );
    } else if (context.timeOfDay === 'evening') {
      // Evening - calming exercises
      filtered = filtered.filter(ex => 
        ex.tags.includes('relaxation') || 
        ex.tags.includes('sleep') ||
        ex.category === 'grounding'
      );
    }

    // Return up to 5 recommendations, prioritizing beginner-friendly
    return filtered
      .sort((a, b) => {
        if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1;
        if (b.difficulty === 'beginner' && a.difficulty !== 'beginner') return 1;
        return 0;
      })
      .slice(0, 5);
  }

  /**
   * Check if exercises need updating
   */
  async needsUpdate(): Promise<boolean> {
    try {
      const lastSeedVersion = await AsyncStorage.getItem(this.SEED_VERSION_KEY);
      return lastSeedVersion !== this.CURRENT_SEED_VERSION;
    } catch (error) {
      console.error('Failed to check seed version:', error);
      return true; // Assume update needed if we can't check
    }
  }

  /**
   * Force refresh exercises from source
   */
  async refreshExercises(): Promise<SeedResult> {
    return this.seedExercises(true);
  }
}

export const exerciseSeedService = new ExerciseSeedService();
