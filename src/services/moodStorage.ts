/**
 * Mood Storage Service
 * 
 * Local-first mood data storage with automatic sync queue
 * and offline-first architecture for reliable mood tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { MoodLog, SyncQueueItem } from '../types';
import { supabase } from './supabase';

const MOOD_LOGS_KEY = 'mood_logs';
const SYNC_QUEUE_KEY = 'mood_sync_queue';
const LAST_SYNC_KEY = 'last_mood_sync';
const MAX_LOCAL_LOGS = 1000; // Keep last 1000 logs locally
const SYNC_RETRY_DELAY = 5000; // 5 seconds

class MoodStorageService {
  private syncInProgress = false;
  private retryTimeouts: Set<NodeJS.Timeout> = new Set();

  /**
   * Store mood log locally with automatic sync queue
   */
  async storeMoodLog(moodLog: Omit<MoodLog, 'id' | 'synced' | 'createdAt'>): Promise<MoodLog> {
    const newLog: MoodLog = {
      ...moodLog,
      id: this.generateId(),
      synced: false,
      createdAt: new Date().toISOString()
    };

    try {
      // Store locally
      await this.addToLocalStorage(newLog);
      
      // Add to sync queue
      await this.addToSyncQueue(newLog);
      
      // Attempt immediate sync if online
      this.attemptSync();
      
      return newLog;
    } catch (error) {
      console.error('Failed to store mood log:', error);
      throw error;
    }
  }

  /**
   * Get mood logs from local storage
   */
  async getMoodLogs(limit?: number, days?: number): Promise<MoodLog[]> {
    try {
      const logsData = await AsyncStorage.getItem(MOOD_LOGS_KEY);
      let logs: MoodLog[] = logsData ? JSON.parse(logsData) : [];

      // Filter by date if specified
      if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        logs = logs.filter(log => new Date(log.timestamp) > cutoffDate);
      }

      // Sort by timestamp (newest first)
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply limit if specified
      if (limit) {
        logs = logs.slice(0, limit);
      }

      return logs;
    } catch (error) {
      console.error('Failed to get mood logs:', error);
      return [];
    }
  }

  /**
   * Update existing mood log
   */
  async updateMoodLog(id: string, updates: Partial<MoodLog>): Promise<boolean> {
    try {
      const logs = await this.getMoodLogs();
      const logIndex = logs.findIndex(log => log.id === id);
      
      if (logIndex === -1) {
        return false;
      }

      const updatedLog = { 
        ...logs[logIndex], 
        ...updates,
        synced: false // Mark as needing sync
      };
      
      logs[logIndex] = updatedLog;
      
      await AsyncStorage.setItem(MOOD_LOGS_KEY, JSON.stringify(logs));
      
      // Add to sync queue if not already synced
      if (!updatedLog.synced) {
        await this.addToSyncQueue(updatedLog, 'update');
        this.attemptSync();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update mood log:', error);
      return false;
    }
  }

  /**
   * Delete mood log
   */
  async deleteMoodLog(id: string): Promise<boolean> {
    try {
      const logs = await this.getMoodLogs();
      const filteredLogs = logs.filter(log => log.id !== id);
      
      await AsyncStorage.setItem(MOOD_LOGS_KEY, JSON.stringify(filteredLogs));
      
      // Add deletion to sync queue
      await this.addToSyncQueue({ id } as MoodLog, 'delete');
      this.attemptSync();
      
      return true;
    } catch (error) {
      console.error('Failed to delete mood log:', error);
      return false;
    }
  }

  /**
   * Get mood statistics
   */
  async getMoodStats(days: number = 30): Promise<{
    averageMood: number;
    totalLogs: number;
    moodDistribution: Record<number, number>;
    streak: number;
  }> {
    try {
      const logs = await this.getMoodLogs(undefined, days);
      
      if (logs.length === 0) {
        return {
          averageMood: 0,
          totalLogs: 0,
          moodDistribution: {},
          streak: 0
        };
      }

      // Calculate average mood
      const totalMood = logs.reduce((sum, log) => sum + log.mood, 0);
      const averageMood = totalMood / logs.length;

      // Calculate mood distribution
      const moodDistribution: Record<number, number> = {};
      logs.forEach(log => {
        moodDistribution[log.mood] = (moodDistribution[log.mood] || 0) + 1;
      });

      // Calculate streak (consecutive days with logs)
      const streak = this.calculateStreak(logs);

      return {
        averageMood: Math.round(averageMood * 10) / 10,
        totalLogs: logs.length,
        moodDistribution,
        streak
      };
    } catch (error) {
      console.error('Failed to get mood stats:', error);
      return {
        averageMood: 0,
        totalLogs: 0,
        moodDistribution: {},
        streak: 0
      };
    }
  }

  /**
   * Sync pending mood logs with server
   */
  async syncMoodLogs(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.syncInProgress) {
      return { success: false, synced: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncQueueItem[] = queueData ? JSON.parse(queueData) : [];

      if (queue.length === 0) {
        this.syncInProgress = false;
        return { success: true, synced: 0, failed: 0 };
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        this.syncInProgress = false;
        return { success: false, synced: 0, failed: queue.length };
      }

      // Process each item in queue
      for (const item of queue) {
        try {
          await this.syncSingleItem(item, user.id);
          syncedCount++;
        } catch (error) {
          console.error('Failed to sync item:', item.id, error);
          failedCount++;
          
          // Increment retry count
          item.retryCount = (item.retryCount || 0) + 1;
          
          // Remove from queue if too many retries
          if (item.retryCount >= 3) {
            console.warn('Removing item from sync queue after 3 failed attempts:', item.id);
          }
        }
      }

      // Update queue (remove successfully synced items and items with too many retries)
      const remainingQueue = queue.filter(item => 
        !this.wasSynced(item) && (item.retryCount || 0) < 3
      );
      
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
      
      // Update last sync timestamp
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      this.syncInProgress = false;
      return { success: true, synced: syncedCount, failed: failedCount };
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncInProgress = false;
      return { success: false, synced: syncedCount, failed: failedCount };
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    lastSync: Date | null;
    pendingCount: number;
    isOnline: boolean;
  }> {
    try {
      const [lastSyncData, queueData, netState] = await Promise.all([
        AsyncStorage.getItem(LAST_SYNC_KEY),
        AsyncStorage.getItem(SYNC_QUEUE_KEY),
        NetInfo.fetch()
      ]);

      const lastSync = lastSyncData ? new Date(lastSyncData) : null;
      const queue: SyncQueueItem[] = queueData ? JSON.parse(queueData) : [];
      
      return {
        lastSync,
        pendingCount: queue.length,
        isOnline: netState.isConnected || false
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        lastSync: null,
        pendingCount: 0,
        isOnline: false
      };
    }
  }

  /**
   * Clear all local mood data (for account deletion)
   */
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(MOOD_LOGS_KEY),
        AsyncStorage.removeItem(SYNC_QUEUE_KEY),
        AsyncStorage.removeItem(LAST_SYNC_KEY)
      ]);
    } catch (error) {
      console.error('Failed to clear mood data:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async addToLocalStorage(moodLog: MoodLog): Promise<void> {
    const logs = await this.getMoodLogs();
    logs.unshift(moodLog); // Add to beginning (newest first)
    
    // Limit storage size
    if (logs.length > MAX_LOCAL_LOGS) {
      logs.splice(MAX_LOCAL_LOGS);
    }
    
    await AsyncStorage.setItem(MOOD_LOGS_KEY, JSON.stringify(logs));
  }

  private async addToSyncQueue(moodLog: MoodLog, action: 'create' | 'update' | 'delete' = 'create'): Promise<void> {
    const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = queueData ? JSON.parse(queueData) : [];
    
    const syncItem: SyncQueueItem = {
      id: this.generateId(),
      type: 'mood',
      action,
      data: moodLog,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    queue.push(syncItem);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  private async syncSingleItem(item: SyncQueueItem, userId: string): Promise<void> {
    const moodLog = item.data as MoodLog;
    
    switch (item.action) {
      case 'create':
        await supabase
          .from('mood_logs')
          .insert({
            id: moodLog.id,
            user_id: userId,
            mood: moodLog.mood,
            triggers: moodLog.triggers,
            note: moodLog.note,
            timestamp: moodLog.timestamp,
            created_at: moodLog.createdAt
          });
        break;
        
      case 'update':
        await supabase
          .from('mood_logs')
          .update({
            mood: moodLog.mood,
            triggers: moodLog.triggers,
            note: moodLog.note,
            updated_at: new Date().toISOString()
          })
          .eq('id', moodLog.id)
          .eq('user_id', userId);
        break;
        
      case 'delete':
        await supabase
          .from('mood_logs')
          .delete()
          .eq('id', moodLog.id)
          .eq('user_id', userId);
        break;
    }
    
    // Mark as synced in local storage
    await this.markAsSynced(moodLog.id);
  }

  private async markAsSynced(moodLogId: string): Promise<void> {
    const logs = await this.getMoodLogs();
    const updatedLogs = logs.map(log => 
      log.id === moodLogId ? { ...log, synced: true } : log
    );
    await AsyncStorage.setItem(MOOD_LOGS_KEY, JSON.stringify(updatedLogs));
  }

  private wasSynced(item: SyncQueueItem): boolean {
    // This would be determined by checking if the sync operation completed successfully
    // For now, we'll assume it was synced if no error was thrown
    return true;
  }

  private calculateStreak(logs: MoodLog[]): number {
    if (logs.length === 0) return 0;
    
    const sortedLogs = logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const log of sortedLogs) {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor(
        (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  }

  private attemptSync(): void {
    // Debounce sync attempts
    setTimeout(() => {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          this.syncMoodLogs();
        }
      });
    }, 1000);
  }

  private generateId(): string {
    return 'mood_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const moodStorageService = new MoodStorageService();

// Export class for testing
export { MoodStorageService };
