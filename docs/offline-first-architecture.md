# Offline-First Architecture

## Overview
PocketTherapy implements a comprehensive offline-first architecture ensuring core mental health features work reliably without internet connectivity, with seamless data synchronization when online.

## Data Storage Strategy

### Local Data Retention Policies
```typescript
const DATA_RETENTION = {
  mood_logs: {
    local_storage: '90_days', // 3 months local history
    sync_priority: 'high',
    compression: true,
    max_entries: 1000
  },
  exercise_completions: {
    local_storage: '30_days', // 1 month completion history  
    sync_priority: 'medium',
    compression: true,
    max_entries: 500
  },
  user_settings: {
    local_storage: 'indefinite', // Never auto-delete settings
    sync_priority: 'low',
    backup_frequency: 'weekly'
  },
  crisis_logs: {
    local_storage: '7_days', // Brief retention for patterns
    sync_priority: 'immediate',
    anonymization: true,
    max_entries: 50
  }
};
```

### Auto-Cleanup Implementation
```typescript
const cleanupOldData = async () => {
  const now = Date.now();
  const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  // Cleanup mood logs older than 90 days
  const moodLogs = await AsyncStorage.getItem('moodLogs');
  if (moodLogs) {
    const parsed = JSON.parse(moodLogs);
    const filteredLogs = parsed.filter(log => log.timestamp > ninetyDaysAgo);
    await AsyncStorage.setItem('moodLogs', JSON.stringify(filteredLogs));
  }
  
  // Cleanup exercise completions older than 30 days
  const exerciseCompletions = await AsyncStorage.getItem('exerciseCompletions');
  if (exerciseCompletions) {
    const parsed = JSON.parse(exerciseCompletions);
    const filteredCompletions = parsed.filter(completion => 
      completion.timestamp > thirtyDaysAgo
    );
    await AsyncStorage.setItem('exerciseCompletions', JSON.stringify(filteredCompletions));
  }
  
  // Cleanup crisis logs older than 7 days
  const crisisLogs = await AsyncStorage.getItem('crisisLogs');
  if (crisisLogs) {
    const parsed = JSON.parse(crisisLogs);
    const filteredCrisis = parsed.filter(log => log.timestamp > sevenDaysAgo);
    await AsyncStorage.setItem('crisisLogs', JSON.stringify(filteredCrisis));
  }
};

// Schedule cleanup to run daily
const scheduleDataCleanup = () => {
  setInterval(cleanupOldData, 24 * 60 * 60 * 1000); // Every 24 hours
};
```

## Guest-to-Authenticated Migration

### Seamless Data Migration Strategy
```typescript
interface GuestMigrationData {
  moodLogs: MoodLog[];
  exerciseCompletions: ExerciseCompletion[];
  userSettings: UserSettings;
  migrationTimestamp: number;
}

const migrateGuestData = async (newUserId: string): Promise<boolean> => {
  try {
    // 1. Retrieve all local guest data
    const guestData = await gatherGuestData();
    
    // 2. Validate and clean data before upload
    const validatedData = validateMoodData(guestData);
    
    // 3. Show migration progress to user
    showMigrationProgress(0, "Preparing your data...");
    
    // 4. Batch upload to user's account
    const migrationBatch: GuestMigrationData = {
      moodLogs: validatedData.moodLogs,
      exerciseCompletions: validatedData.exercises,
      userSettings: validatedData.settings,
      migrationTimestamp: Date.now()
    };
    
    // 5. Upload with progress feedback
    await uploadWithProgress(migrationBatch, (progress) => {
      showMigrationProgress(progress, `Saving your data... ${Math.round(progress)}%`);
    });
    
    // 6. Verify upload success before clearing local data
    const uploadVerified = await verifyMigration(newUserId, migrationBatch);
    if (uploadVerified) {
      await clearGuestData();
      showMigrationSuccess("Your data is safely backed up!");
      return true;
    } else {
      throw new Error('Migration verification failed');
    }
    
  } catch (error) {
    // Keep local data safe, show retry option
    showMigrationError(
      "Couldn't back up your data. Your local data is still safe. Try again?",
      () => migrateGuestData(newUserId)
    );
    return false;
  }
};

const gatherGuestData = async (): Promise<any> => {
  const [moodLogs, exerciseCompletions, userSettings] = await Promise.all([
    AsyncStorage.getItem('moodLogs'),
    AsyncStorage.getItem('exerciseCompletions'),
    AsyncStorage.getItem('userSettings')
  ]);
  
  return {
    moodLogs: moodLogs ? JSON.parse(moodLogs) : [],
    exerciseCompletions: exerciseCompletions ? JSON.parse(exerciseCompletions) : [],
    userSettings: userSettings ? JSON.parse(userSettings) : {}
  };
};
```

## Sync Conflict Resolution

### Timestamp-Based Resolution with User Control
```typescript
interface SyncConflict {
  id: string;
  local: any;
  server: any;
  type: 'MOOD_LOG_CONFLICT' | 'SETTINGS_CONFLICT' | 'EXERCISE_CONFLICT';
  conflictReason: string;
}

const resolveSyncConflicts = async (localData: any[], serverData: any[]): Promise<any[]> => {
  const conflicts: SyncConflict[] = [];
  
  for (const localItem of localData) {
    const serverItem = serverData.find(s => s.id === localItem.id);
    
    if (serverItem && serverItem.updated_at !== localItem.updated_at) {
      // Conflict detected - determine type and severity
      const conflict: SyncConflict = {
        id: localItem.id,
        local: localItem,
        server: serverItem,
        type: determineConflictType(localItem),
        conflictReason: getConflictReason(localItem, serverItem)
      };
      
      conflicts.push(conflict);
    }
  }
  
  if (conflicts.length > 0) {
    const resolution = await showConflictResolution(conflicts);
    return await applyConflictResolution(conflicts, resolution);
  }
  
  // No conflicts - proceed with merge
  return await mergeData(localData, serverData);
};

// User-friendly conflict resolution UI
const showConflictResolution = async (conflicts: SyncConflict[]): Promise<ConflictResolution> => {
  return new Promise((resolve) => {
    const conflictCount = conflicts.length;
    const conflictTypes = [...new Set(conflicts.map(c => c.type))];
    
    showModal({
      title: "Found some differences",
      message: `Your data was updated on another device. We found ${conflictCount} difference${conflictCount > 1 ? 's' : ''}. Which version would you like to keep?`,
      options: [
        { 
          text: "Keep phone version", 
          description: "Use the data from this device",
          action: () => resolve('LOCAL') 
        },
        { 
          text: "Use cloud version", 
          description: "Use the data from the cloud",
          action: () => resolve('SERVER') 
        },
        { 
          text: "Keep both (merge)", 
          description: "Combine both versions when possible",
          action: () => resolve('MERGE') 
        }
      ]
    });
  });
};

type ConflictResolution = 'LOCAL' | 'SERVER' | 'MERGE';

const applyConflictResolution = async (
  conflicts: SyncConflict[], 
  resolution: ConflictResolution
): Promise<any[]> => {
  const resolvedData = [];
  
  for (const conflict of conflicts) {
    switch (resolution) {
      case 'LOCAL':
        resolvedData.push(conflict.local);
        break;
      case 'SERVER':
        resolvedData.push(conflict.server);
        break;
      case 'MERGE':
        resolvedData.push(await mergeConflictedItems(conflict.local, conflict.server));
        break;
    }
  }
  
  return resolvedData;
};
```

## Exercise Content Strategy

### Pre-bundled Core Exercises
```typescript
// exercises-bundle.json (included in app bundle)
const CORE_EXERCISES = {
  breathing: [
    { 
      id: 'breath_478', 
      title: '4-7-8 Breathing', 
      offline: true, 
      size: '2kb',
      content: {
        steps: [
          "Sit comfortably and close your eyes",
          "Breathe in through your nose for 4 counts",
          "Hold your breath for 7 counts", 
          "Exhale through your mouth for 8 counts"
        ],
        duration: 240, // 4 minutes
        category: 'breathing'
      }
    },
    { 
      id: 'box_breath', 
      title: 'Box Breathing', 
      offline: true, 
      size: '1.8kb',
      content: {
        steps: [
          "Breathe in for 4 counts",
          "Hold for 4 counts",
          "Breathe out for 4 counts",
          "Hold empty for 4 counts"
        ],
        duration: 180,
        category: 'breathing'
      }
    }
    // ... 8 more core breathing exercises
  ],
  grounding: [
    { 
      id: 'ground_54321', 
      title: '5-4-3-2-1 Grounding', 
      offline: true, 
      size: '2.2kb',
      content: {
        steps: [
          "Name 5 things you can see",
          "Name 4 things you can touch",
          "Name 3 things you can hear",
          "Name 2 things you can smell",
          "Name 1 thing you can taste"
        ],
        duration: 300,
        category: 'grounding'
      }
    }
    // ... 9 more core grounding exercises
  ],
  cognitive: [
    { 
      id: 'thought_challenge', 
      title: 'Thought Challenge', 
      offline: true, 
      size: '3kb',
      content: {
        steps: [
          "Notice the anxious thought",
          "Ask: Is this thought helpful?",
          "Ask: Is this thought realistic?",
          "Replace with a balanced thought"
        ],
        duration: 360,
        category: 'cognitive'
      }
    }
    // ... 9 more core cognitive exercises
  ]
};

// Total bundled content: ~60KB (30 exercises × 2KB average)
```

### Exercise Access Strategy
```typescript
const getExercise = async (exerciseId: string): Promise<Exercise | null> => {
  // 1. Check bundled exercises first (always available)
  const bundledExercise = findInBundledExercises(exerciseId);
  if (bundledExercise) {
    return bundledExercise;
  }
  
  // 2. Check cached downloads
  const cachedExercise = await getCachedExercise(exerciseId);
  if (cachedExercise) {
    return cachedExercise;
  }
  
  // 3. Download if online and premium user
  if (isOnline() && isPremiumUser()) {
    try {
      const downloadedExercise = await downloadExercise(exerciseId);
      await cacheExercise(downloadedExercise);
      return downloadedExercise;
    } catch (error) {
      // Fall through to alternative
    }
  }
  
  // 4. Fallback to similar bundled exercise
  return getBestAlternative(exerciseId);
};

const getBestAlternative = (requestedId: string): Exercise => {
  // Intelligent fallback based on exercise category and user preferences
  const category = extractCategory(requestedId);
  const userPreferences = getUserPreferences();
  
  const alternatives = CORE_EXERCISES[category] || CORE_EXERCISES.breathing;
  
  // Return most suitable alternative based on user history
  return alternatives.find(ex => 
    userPreferences.favoriteExercises.includes(ex.id)
  ) || alternatives[0];
};
```

## Network State Management

### Offline Detection and Handling
```typescript
import NetInfo from '@react-native-community/netinfo';

class NetworkStateManager {
  private isOnline: boolean = true;
  private syncQueue: SyncAction[] = [];
  
  constructor() {
    this.initializeNetworkMonitoring();
  }
  
  private initializeNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      if (!wasOnline && this.isOnline) {
        // Just came online - process sync queue
        this.processSyncQueue();
      } else if (wasOnline && !this.isOnline) {
        // Just went offline - show offline indicator
        this.showOfflineIndicator();
      }
    });
  }
  
  private async processSyncQueue() {
    if (this.syncQueue.length === 0) return;
    
    showSyncProgress(0, "Syncing your data...");
    
    for (let i = 0; i < this.syncQueue.length; i++) {
      const action = this.syncQueue[i];
      try {
        await this.executeSync Action(action);
        this.syncQueue.splice(i, 1);
        i--; // Adjust index after removal
        
        const progress = ((this.syncQueue.length) / (this.syncQueue.length + i + 1)) * 100;
        showSyncProgress(progress, "Syncing your data...");
      } catch (error) {
        // Keep action in queue for retry
        console.warn('Sync failed for action:', action.type, error);
      }
    }
    
    hideSyncProgress();
  }
  
  queueForSync(action: SyncAction) {
    this.syncQueue.push(action);
    
    // Try immediate sync if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }
}
```

This offline-first architecture ensures PocketTherapy provides reliable mental health support regardless of connectivity while maintaining seamless data synchronization and user experience.
