/**
 * Sync Queue Service
 * 
 * Automatic sync queue for offline data with retry logic,
 * conflict resolution, and network state monitoring
 */

import NetInfo from '@react-native-community/netinfo';
import { localStorageService } from './localStorage';
import { supabase } from './supabase';
import { SyncQueueItem, MoodLog, ExerciseSession } from '../types';

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

interface ConflictResolution {
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  resolvedData?: any;
}

class SyncQueueService {
  private isOnline = false;
  private syncInProgress = false;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private maxRetries = 3;
  private baseRetryDelay = 1000; // 1 second

  constructor() {
    this.initializeNetworkMonitoring();
  }

  /**
   * Initialize network state monitoring
   */
  private initializeNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected || false;
      
      // If we just came online, attempt sync
      if (!wasOnline && this.isOnline) {
        console.log('Network connection restored, attempting sync...');
        this.processQueue();
      }
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      this.isOnline = state.isConnected || false;
    });
  }

  /**
   * Add item to sync queue
   */
  async addToQueue(
    type: 'mood' | 'exercise' | 'preferences',
    action: 'create' | 'update' | 'delete',
    data: any,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: this.generateId(),
      type,
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      priority,
      lastAttempt: null,
    };

    await localStorageService.addToSyncQueue(queueItem);
    
    // Attempt immediate sync if online
    if (this.isOnline) {
      this.processQueue();
    }
  }

  /**
   * Process the entire sync queue
   */
  async processQueue(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline) {
      return { success: false, synced: 0, failed: 0, errors: ['Sync already in progress or offline'] };
    }

    this.syncInProgress = true;
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      const queue = await localStorageService.getSyncQueue();
      
      if (queue.length === 0) {
        this.syncInProgress = false;
        return { success: true, synced: 0, failed: 0, errors: [] };
      }

      // Sort by priority and timestamp
      const sortedQueue = this.sortQueueByPriority(queue);

      // Process each item
      for (const item of sortedQueue) {
        try {
          await this.syncSingleItem(item);
          syncedCount++;
          
          // Remove from queue on success
          await this.removeFromQueue(item.id);
          
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          failedCount++;
          errors.push(`${item.type}:${item.action} - ${error.message}`);
          
          // Update retry count and schedule retry
          await this.handleSyncFailure(item, error as Error);
        }
      }

      // Update last sync timestamp
      await localStorageService.setLastSync(new Date().toISOString());

      this.syncInProgress = false;
      return { success: true, synced: syncedCount, failed: failedCount, errors };

    } catch (error) {
      console.error('Sync queue processing failed:', error);
      this.syncInProgress = false;
      return { success: false, synced: syncedCount, failed: failedCount, errors: [error.message] };
    }
  }

  /**
   * Sync a single queue item
   */
  private async syncSingleItem(item: SyncQueueItem): Promise<void> {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update last attempt timestamp
    item.lastAttempt = new Date().toISOString();

    switch (item.type) {
      case 'mood':
        await this.syncMoodLog(item, user.id);
        break;
      case 'exercise':
        await this.syncExerciseSession(item, user.id);
        break;
      case 'preferences':
        await this.syncUserPreferences(item, user.id);
        break;
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  }

  /**
   * Sync mood log
   */
  private async syncMoodLog(item: SyncQueueItem, userId: string): Promise<void> {
    const moodLog = item.data as MoodLog;

    switch (item.action) {
      case 'create':
        // Check for conflicts
        const existingLog = await this.checkMoodLogConflict(moodLog.id, userId);
        if (existingLog) {
          const resolution = await this.resolveMoodLogConflict(moodLog, existingLog);
          if (resolution.strategy === 'client_wins') {
            await this.updateMoodLogOnServer(moodLog, userId);
          } else if (resolution.strategy === 'server_wins') {
            await this.updateMoodLogLocally(existingLog);
          }
        } else {
          await this.createMoodLogOnServer(moodLog, userId);
        }
        break;

      case 'update':
        await this.updateMoodLogOnServer(moodLog, userId);
        break;

      case 'delete':
        await this.deleteMoodLogOnServer(moodLog.id, userId);
        break;
    }
  }

  /**
   * Sync exercise session
   */
  private async syncExerciseSession(item: SyncQueueItem, userId: string): Promise<void> {
    const session = item.data as ExerciseSession;

    switch (item.action) {
      case 'create':
        await supabase
          .from('user_exercise_logs')
          .insert({
            id: session.id,
            user_id: userId,
            exercise_id: session.exerciseId,
            duration_seconds: session.durationSeconds,
            completed: session.completed,
            rating: session.rating,
            notes: session.notes,
            timestamp: session.timestamp,
          });
        break;

      case 'update':
        await supabase
          .from('user_exercise_logs')
          .update({
            duration_seconds: session.durationSeconds,
            completed: session.completed,
            rating: session.rating,
            notes: session.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.id)
          .eq('user_id', userId);
        break;

      case 'delete':
        await supabase
          .from('user_exercise_logs')
          .delete()
          .eq('id', session.id)
          .eq('user_id', userId);
        break;
    }
  }

  /**
   * Sync user preferences
   */
  private async syncUserPreferences(item: SyncQueueItem, userId: string): Promise<void> {
    const preferences = item.data;

    await supabase
      .from('users')
      .update({
        preferences: preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  /**
   * Conflict resolution for mood logs
   */
  private async checkMoodLogConflict(logId: string, userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('id', logId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  }

  private async resolveMoodLogConflict(localLog: MoodLog, serverLog: any): Promise<ConflictResolution> {
    // Simple timestamp-based resolution: newer wins
    const localTime = new Date(localLog.timestamp).getTime();
    const serverTime = new Date(serverLog.timestamp).getTime();

    if (localTime > serverTime) {
      return { strategy: 'client_wins' };
    } else {
      return { strategy: 'server_wins' };
    }
  }

  /**
   * Server operations
   */
  private async createMoodLogOnServer(moodLog: MoodLog, userId: string): Promise<void> {
    const { error } = await supabase
      .from('mood_logs')
      .insert({
        id: moodLog.id,
        user_id: userId,
        mood: moodLog.mood,
        triggers: moodLog.triggers,
        note: moodLog.note,
        timestamp: moodLog.timestamp,
        created_at: moodLog.createdAt,
      });

    if (error) throw error;
  }

  private async updateMoodLogOnServer(moodLog: MoodLog, userId: string): Promise<void> {
    const { error } = await supabase
      .from('mood_logs')
      .update({
        mood: moodLog.mood,
        triggers: moodLog.triggers,
        note: moodLog.note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', moodLog.id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  private async deleteMoodLogOnServer(logId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('mood_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  private async updateMoodLogLocally(serverLog: any): Promise<void> {
    const localLog: MoodLog = {
      id: serverLog.id,
      mood: serverLog.mood,
      triggers: serverLog.triggers || [],
      note: serverLog.note || '',
      timestamp: serverLog.timestamp,
      createdAt: serverLog.created_at,
      synced: true,
    };

    await localStorageService.updateMoodLog(serverLog.id, localLog);
  }

  /**
   * Queue management
   */
  private async removeFromQueue(itemId: string): Promise<void> {
    const queue = await localStorageService.getSyncQueue();
    const filteredQueue = queue.filter(item => item.id !== itemId);
    await localStorageService.updateSyncQueue(filteredQueue);
  }

  private async handleSyncFailure(item: SyncQueueItem, error: Error): Promise<void> {
    item.retryCount++;
    item.lastError = error.message;

    if (item.retryCount >= this.maxRetries) {
      console.warn(`Max retries reached for item ${item.id}, removing from queue`);
      await this.removeFromQueue(item.id);
      return;
    }

    // Update item in queue
    const queue = await localStorageService.getSyncQueue();
    const index = queue.findIndex(queueItem => queueItem.id === item.id);
    if (index !== -1) {
      queue[index] = item;
      await localStorageService.updateSyncQueue(queue);
    }

    // Schedule retry with exponential backoff
    const retryDelay = this.baseRetryDelay * Math.pow(2, item.retryCount - 1);
    const timeoutId = setTimeout(() => {
      this.retryTimeouts.delete(item.id);
      this.processQueue();
    }, retryDelay);

    this.retryTimeouts.set(item.id, timeoutId);
  }

  private sortQueueByPriority(queue: SyncQueueItem[]): SyncQueueItem[] {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    
    return queue.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by timestamp (older first)
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }

  /**
   * Public methods
   */
  async getQueueStatus(): Promise<{
    totalItems: number;
    pendingItems: number;
    failedItems: number;
    lastSync: string | null;
    isOnline: boolean;
  }> {
    const queue = await localStorageService.getSyncQueue();
    const lastSync = await localStorageService.getLastSync();
    
    const failedItems = queue.filter(item => item.retryCount > 0).length;
    
    return {
      totalItems: queue.length,
      pendingItems: queue.length - failedItems,
      failedItems,
      lastSync,
      isOnline: this.isOnline,
    };
  }

  async forceSyncNow(): Promise<SyncResult> {
    if (!this.isOnline) {
      return { success: false, synced: 0, failed: 0, errors: ['Device is offline'] };
    }
    
    return await this.processQueue();
  }

  async clearQueue(): Promise<void> {
    // Clear all retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    
    // Clear the queue
    await localStorageService.clearSyncQueue();
  }

  private generateId(): string {
    return 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const syncQueueService = new SyncQueueService();

// Export class for testing
export { SyncQueueService };
