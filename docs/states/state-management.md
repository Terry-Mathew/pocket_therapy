# State Management Architecture

## Overview
PocketTherapy uses Zustand for global state management with a focus on offline-first functionality, data persistence, and therapeutic user experience patterns.

## Global State Structure

### Core State Schema
```typescript
interface AppState {
  // User authentication
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    guestMode: boolean;
    authProvider?: 'google' | 'apple' | 'email';
  };
  
  // Mood tracking
  mood: {
    logs: MoodLog[];
    currentStreak: number;
    lastCheckIn: Date | null;
    pendingSync: MoodLog[];
    insights: MoodInsight[];
  };
  
  // Exercises
  exercises: {
    library: Exercise[];
    favorites: string[]; // exercise IDs
    completions: Completion[];
    currentSession: Session | null;
    recommendations: Exercise[];
  };
  
  // App preferences
  settings: {
    notifications: NotificationSettings;
    audio: AudioSettings;
    privacy: PrivacySettings;
    accessibility: AccessibilitySettings;
    theme: ThemeSettings;
  };
  
  // System state
  system: {
    isOnline: boolean;
    isLoading: boolean;
    lastSync: Date | null;
    pendingActions: Action[];
    errorState: ErrorState | null;
  };
}
```

## Type Definitions

### User Types
```typescript
interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  preferences: UserPreferences;
}

interface UserPreferences {
  defaultExerciseDuration: number;
  preferredReminderTime: string;
  onboardingCompleted: boolean;
  dataCollectionConsent: boolean;
}
```

### Mood Types
```typescript
interface MoodLog {
  id: string;
  mood: 1 | 2 | 3 | 4 | 5;
  triggers?: string[];
  note?: string;
  timestamp: Date;
  synced: boolean;
  location?: 'home' | 'work' | 'school' | 'other';
}

interface MoodInsight {
  type: 'pattern' | 'improvement' | 'recommendation';
  title: string;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  actionable: boolean;
  relatedExercises?: string[];
}
```

### Exercise Types
```typescript
interface Exercise {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'grounding' | 'cognitive' | 'sleep';
  duration: number; // in seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  instructions: ExerciseStep[];
  audioUrl?: string;
  offlineCapable: boolean;
}

interface ExerciseStep {
  id: string;
  instruction: string;
  duration?: number;
  type: 'instruction' | 'breathing' | 'input' | 'reflection';
  audioCue?: string;
}

interface Completion {
  id: string;
  exerciseId: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}
```

### Settings Types
```typescript
interface NotificationSettings {
  dailyReminders: boolean;
  reminderTime: string;
  exerciseSuggestions: boolean;
  streakCelebrations: boolean;
  crisisAlerts: boolean;
}

interface AudioSettings {
  enabled: boolean;
  backgroundSounds: 'none' | 'rain' | 'forest' | 'ocean' | 'white_noise';
  volume: number;
  hapticFeedback: boolean;
}

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  voiceGuidance: boolean;
  screenReaderOptimized: boolean;
}
```

## State Management Patterns

### Zustand Store Implementation
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        isAuthenticated: false,
        user: null,
        guestMode: true
      },
      
      mood: {
        logs: [],
        currentStreak: 0,
        lastCheckIn: null,
        pendingSync: [],
        insights: []
      },
      
      exercises: {
        library: [],
        favorites: [],
        completions: [],
        currentSession: null,
        recommendations: []
      },
      
      settings: {
        notifications: {
          dailyReminders: true,
          reminderTime: '19:00',
          exerciseSuggestions: true,
          streakCelebrations: false,
          crisisAlerts: true
        },
        audio: {
          enabled: false,
          backgroundSounds: 'none',
          volume: 0.5,
          hapticFeedback: true
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          largeText: true,
          voiceGuidance: false,
          screenReaderOptimized: false
        }
      },
      
      system: {
        isOnline: true,
        isLoading: false,
        lastSync: null,
        pendingActions: [],
        errorState: null
      },
      
      // Actions
      actions: {
        // Mood actions
        addMoodLog: (moodLog: Omit<MoodLog, 'id' | 'synced'>) => {
          const newLog: MoodLog = {
            ...moodLog,
            id: generateId(),
            synced: false
          };
          
          set((state) => ({
            mood: {
              ...state.mood,
              logs: [...state.mood.logs, newLog],
              pendingSync: [...state.mood.pendingSync, newLog],
              lastCheckIn: newLog.timestamp,
              currentStreak: calculateStreak([...state.mood.logs, newLog])
            }
          }));
        },
        
        // Exercise actions
        startExercise: (exerciseId: string) => {
          const exercise = get().exercises.library.find(e => e.id === exerciseId);
          if (!exercise) return;
          
          const session: Session = {
            id: generateId(),
            exerciseId,
            startTime: new Date(),
            progress: 0,
            currentStep: 0
          };
          
          set((state) => ({
            exercises: {
              ...state.exercises,
              currentSession: session
            }
          }));
        },
        
        completeExercise: (rating?: number, notes?: string) => {
          const session = get().exercises.currentSession;
          if (!session) return;
          
          const completion: Completion = {
            id: generateId(),
            exerciseId: session.exerciseId,
            startTime: session.startTime,
            endTime: new Date(),
            completed: true,
            rating,
            notes
          };
          
          set((state) => ({
            exercises: {
              ...state.exercises,
              completions: [...state.exercises.completions, completion],
              currentSession: null
            }
          }));
        },
        
        // Settings actions
        updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
          set((state) => ({
            settings: {
              ...state.settings,
              notifications: {
                ...state.settings.notifications,
                ...settings
              }
            }
          }));
        },
        
        // System actions
        setOnlineStatus: (isOnline: boolean) => {
          set((state) => ({
            system: {
              ...state.system,
              isOnline
            }
          }));
          
          // Trigger sync if coming online
          if (isOnline && get().mood.pendingSync.length > 0) {
            get().actions.syncPendingData();
          }
        },
        
        syncPendingData: async () => {
          const { mood, system } = get();
          if (!system.isOnline || mood.pendingSync.length === 0) return;
          
          try {
            // Sync mood logs
            for (const log of mood.pendingSync) {
              await syncMoodLog(log);
            }
            
            set((state) => ({
              mood: {
                ...state.mood,
                pendingSync: []
              },
              system: {
                ...state.system,
                lastSync: new Date()
              }
            }));
          } catch (error) {
            console.error('Sync failed:', error);
          }
        }
      }
    }),
    {
      name: 'pockettherapy-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist certain parts of state
        auth: state.auth,
        mood: state.mood,
        exercises: {
          favorites: state.exercises.favorites,
          completions: state.exercises.completions
        },
        settings: state.settings
        // Don't persist system state or current session
      })
    }
  )
);
```

## Error State Management

### Error Types
```typescript
interface ErrorState {
  type: 'network' | 'sync' | 'storage' | 'exercise' | 'auth';
  message: string;
  timestamp: Date;
  recoverable: boolean;
  retryAction?: () => void;
}
```

### Error Handling Patterns
```typescript
const errorHandling = {
  network: {
    strategy: 'graceful_degradation',
    fallback: 'offline_mode',
    userMessage: 'Working offline - your data is safe'
  },
  sync: {
    strategy: 'retry_with_backoff',
    maxRetries: 3,
    userMessage: 'Syncing when connection improves'
  },
  storage: {
    strategy: 'data_recovery',
    fallback: 'fresh_start',
    userMessage: 'Restoring your data'
  }
};
```

## Loading State Patterns

### Loading States
```typescript
interface LoadingState {
  global: boolean;
  mood: boolean;
  exercises: boolean;
  sync: boolean;
  auth: boolean;
}
```

### Loading Management
```typescript
const loadingActions = {
  setLoading: (key: keyof LoadingState, loading: boolean) => {
    set((state) => ({
      system: {
        ...state.system,
        loading: {
          ...state.system.loading,
          [key]: loading
        }
      }
    }));
  },
  
  withLoading: async <T>(key: keyof LoadingState, action: () => Promise<T>): Promise<T> => {
    loadingActions.setLoading(key, true);
    try {
      return await action();
    } finally {
      loadingActions.setLoading(key, false);
    }
  }
};
```

## Offline-First Patterns

### Offline Queue Management
```typescript
interface QueuedAction {
  id: string;
  type: 'mood_log' | 'exercise_completion' | 'settings_update';
  data: any;
  timestamp: Date;
  retryCount: number;
}

const offlineQueue = {
  addAction: (action: Omit<QueuedAction, 'id' | 'retryCount'>) => {
    const queuedAction: QueuedAction = {
      ...action,
      id: generateId(),
      retryCount: 0
    };
    
    set((state) => ({
      system: {
        ...state.system,
        pendingActions: [...state.system.pendingActions, queuedAction]
      }
    }));
  },
  
  processQueue: async () => {
    const { system } = get();
    if (!system.isOnline || system.pendingActions.length === 0) return;
    
    for (const action of system.pendingActions) {
      try {
        await processAction(action);
        removeFromQueue(action.id);
      } catch (error) {
        if (action.retryCount < 3) {
          incrementRetryCount(action.id);
        } else {
          removeFromQueue(action.id);
        }
      }
    }
  }
};
```

This state management architecture ensures PocketTherapy maintains consistent, reliable state while supporting offline functionality and therapeutic user experience patterns.
