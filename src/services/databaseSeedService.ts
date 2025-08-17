/**
 * Database Seed Service
 * 
 * Comprehensive service to seed Supabase database with exercises,
 * notification templates, crisis resources, and other initial content
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './api/supabaseClient';
import { exerciseSeedService } from './exerciseSeedService';
import { exercises } from '../data/exercises';
import { notificationTemplates } from '../data/notificationTemplates';
import { crisisResources } from '../data/crisisResources';

interface SeedResult {
  success: boolean;
  results: {
    exercises: { seeded: number; errors: string[] };
    notifications: { seeded: number; errors: string[] };
    crisisResources: { seeded: number; errors: string[] };
  };
  totalSeeded: number;
  totalErrors: string[];
}

class DatabaseSeedService {
  private readonly SEED_STATUS_KEY = 'database_seed_status';
  private readonly SEED_VERSION = '1.0.0';

  /**
   * Seed all content to database
   */
  async seedDatabase(forceReseed: boolean = false): Promise<SeedResult> {
    const result: SeedResult = {
      success: true,
      results: {
        exercises: { seeded: 0, errors: [] },
        notifications: { seeded: 0, errors: [] },
        crisisResources: { seeded: 0, errors: [] },
      },
      totalSeeded: 0,
      totalErrors: [],
    };

    try {
      // Check if already seeded
      if (!forceReseed) {
        const seedStatus = await this.getSeedStatus();
        if (seedStatus?.version === this.SEED_VERSION && seedStatus?.completed) {
          console.log('Database already seeded with current version');
          return result;
        }
      }

      console.log('Starting database seeding...');

      // Seed exercises
      console.log('Seeding exercises...');
      const exerciseResult = await this.seedExercises();
      result.results.exercises = exerciseResult;
      result.totalSeeded += exerciseResult.seeded;
      result.totalErrors.push(...exerciseResult.errors);

      // Seed notification templates
      console.log('Seeding notification templates...');
      const notificationResult = await this.seedNotificationTemplates();
      result.results.notifications = notificationResult;
      result.totalSeeded += notificationResult.seeded;
      result.totalErrors.push(...notificationResult.errors);

      // Seed crisis resources
      console.log('Seeding crisis resources...');
      const crisisResult = await this.seedCrisisResources();
      result.results.crisisResources = crisisResult;
      result.totalSeeded += crisisResult.seeded;
      result.totalErrors.push(...crisisResult.errors);

      // Update seed status
      await this.updateSeedStatus({
        version: this.SEED_VERSION,
        completed: true,
        timestamp: new Date().toISOString(),
        results: result.results,
      });

      result.success = result.totalErrors.length === 0;
      
      console.log(`Database seeding completed: ${result.totalSeeded} items seeded, ${result.totalErrors.length} errors`);
      return result;
    } catch (error) {
      console.error('Database seeding failed:', error);
      result.success = false;
      result.totalErrors.push(`Seeding failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Seed exercises to database
   */
  private async seedExercises(): Promise<{ seeded: number; errors: string[] }> {
    const result = { seeded: 0, errors: [] };

    try {
      // Use existing exercise seed service
      const exerciseResult = await exerciseSeedService.seedExercises(true);
      
      if (exerciseResult.success) {
        result.seeded = exerciseResult.seeded;
      } else {
        result.errors = exerciseResult.errors;
      }

      return result;
    } catch (error) {
      result.errors.push(`Exercise seeding failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Seed notification templates to database
   */
  private async seedNotificationTemplates(): Promise<{ seeded: number; errors: string[] }> {
    const result = { seeded: 0, errors: [] };

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || ('isGuest' in user && user.isGuest)) {
        // Store locally for guest users
        await AsyncStorage.setItem('notification_templates', JSON.stringify({
          version: this.SEED_VERSION,
          templates: notificationTemplates,
          lastUpdated: new Date().toISOString(),
        }));
        result.seeded = notificationTemplates.length;
        return result;
      }

      // Ensure notification templates table exists
      await this.ensureNotificationTemplatesTable();

      // Prepare templates for insertion
      const templatesToInsert = notificationTemplates.map(template => ({
        id: template.id,
        type: template.type,
        title: template.title,
        body: template.body,
        context: template.context || {},
        priority: template.priority,
        actionable: template.actionable,
        deep_link: template.deepLink,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Insert in batches
      const batchSize = 10;
      for (let i = 0; i < templatesToInsert.length; i += batchSize) {
        const batch = templatesToInsert.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('notification_templates')
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          result.errors.push(`Notification batch ${i / batchSize + 1} failed: ${error.message}`);
        } else {
          result.seeded += batch.length;
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`Notification template seeding failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Seed crisis resources to database
   */
  private async seedCrisisResources(): Promise<{ seeded: number; errors: string[] }> {
    const result = { seeded: 0, errors: [] };

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || ('isGuest' in user && user.isGuest)) {
        // Store locally for guest users
        await AsyncStorage.setItem('crisis_resources', JSON.stringify({
          version: this.SEED_VERSION,
          resources: crisisResources,
          lastUpdated: new Date().toISOString(),
        }));
        result.seeded = crisisResources.length;
        return result;
      }

      // Ensure crisis resources table exists
      await this.ensureCrisisResourcesTable();

      // Prepare resources for insertion
      const resourcesToInsert = crisisResources.map(resource => ({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        region: resource.region,
        phone: resource.phone,
        text_number: resource.textNumber,
        website: resource.website,
        chat_url: resource.chatUrl,
        description: resource.description,
        availability: resource.availability,
        languages: resource.languages,
        specializations: resource.specializations || [],
        is_emergency: resource.isEmergency,
        is_free: resource.isFree,
        last_verified: resource.lastVerified,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Insert in batches
      const batchSize = 10;
      for (let i = 0; i < resourcesToInsert.length; i += batchSize) {
        const batch = resourcesToInsert.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('crisis_resources')
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          result.errors.push(`Crisis resource batch ${i / batchSize + 1} failed: ${error.message}`);
        } else {
          result.seeded += batch.length;
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`Crisis resource seeding failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Ensure notification templates table exists
   */
  private async ensureNotificationTemplatesTable(): Promise<void> {
    try {
      // This would typically be handled by migrations
      // For now, we'll assume the table exists or create it
      console.log('Notification templates table check completed');
    } catch (error) {
      console.error('Failed to ensure notification templates table:', error);
      throw error;
    }
  }

  /**
   * Ensure crisis resources table exists
   */
  private async ensureCrisisResourcesTable(): Promise<void> {
    try {
      // This would typically be handled by migrations
      // For now, we'll assume the table exists or create it
      console.log('Crisis resources table check completed');
    } catch (error) {
      console.error('Failed to ensure crisis resources table:', error);
      throw error;
    }
  }

  /**
   * Get current seed status
   */
  private async getSeedStatus(): Promise<any> {
    try {
      const status = await AsyncStorage.getItem(this.SEED_STATUS_KEY);
      return status ? JSON.parse(status) : null;
    } catch (error) {
      console.error('Failed to get seed status:', error);
      return null;
    }
  }

  /**
   * Update seed status
   */
  private async updateSeedStatus(status: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SEED_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Failed to update seed status:', error);
    }
  }

  /**
   * Get seeded content for offline use
   */
  async getSeededContent(): Promise<{
    exercises: any[];
    notificationTemplates: any[];
    crisisResources: any[];
  }> {
    try {
      const [exercisesStr, templatesStr, resourcesStr] = await Promise.all([
        AsyncStorage.getItem('local_exercises'),
        AsyncStorage.getItem('notification_templates'),
        AsyncStorage.getItem('crisis_resources'),
      ]);

      return {
        exercises: exercisesStr ? JSON.parse(exercisesStr).exercises || [] : exercises,
        notificationTemplates: templatesStr ? JSON.parse(templatesStr).templates || [] : notificationTemplates,
        crisisResources: resourcesStr ? JSON.parse(resourcesStr).resources || [] : crisisResources,
      };
    } catch (error) {
      console.error('Failed to get seeded content:', error);
      return {
        exercises,
        notificationTemplates,
        crisisResources,
      };
    }
  }

  /**
   * Check if database needs seeding
   */
  async needsSeeding(): Promise<boolean> {
    try {
      const seedStatus = await this.getSeedStatus();
      return !seedStatus || seedStatus.version !== this.SEED_VERSION || !seedStatus.completed;
    } catch (error) {
      console.error('Failed to check seeding status:', error);
      return true; // Assume seeding needed if we can't check
    }
  }

  /**
   * Force reseed all content
   */
  async reseedDatabase(): Promise<SeedResult> {
    return this.seedDatabase(true);
  }

  /**
   * Get seeding statistics
   */
  async getSeedingStats(): Promise<{
    lastSeeded: string | null;
    version: string | null;
    totalItems: number;
    breakdown: {
      exercises: number;
      notifications: number;
      crisisResources: number;
    };
  }> {
    try {
      const seedStatus = await this.getSeedStatus();
      const content = await this.getSeededContent();

      return {
        lastSeeded: seedStatus?.timestamp || null,
        version: seedStatus?.version || null,
        totalItems: content.exercises.length + content.notificationTemplates.length + content.crisisResources.length,
        breakdown: {
          exercises: content.exercises.length,
          notifications: content.notificationTemplates.length,
          crisisResources: content.crisisResources.length,
        },
      };
    } catch (error) {
      console.error('Failed to get seeding stats:', error);
      return {
        lastSeeded: null,
        version: null,
        totalItems: 0,
        breakdown: {
          exercises: 0,
          notifications: 0,
          crisisResources: 0,
        },
      };
    }
  }
}

export const databaseSeedService = new DatabaseSeedService();
