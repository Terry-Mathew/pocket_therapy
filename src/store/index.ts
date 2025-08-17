/**
 * Zustand State Management Store
 * 
 * Implements offline-first state management for PocketTherapy
 * with automatic persistence and sync capabilities.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineExerciseManager } from '../services/offlineExerciseManager';
import { exerciseStorageService } from '../services/exerciseStorage';
import { exerciseRecommendationEngine } from '../services/exerciseRecommendationEngine';
import { sosSessionManager } from '../services/sosSessionManager';
import { dataMigrationService, MigrationResult } from '../services/dataMigrationService';
import { notificationService } from '../services/notificationService';
import { smartNudgeService } from '../services/smartNudgeService';
import { openAIService } from '../services/openAIService';
import { aiSafetyService } from '../services/aiSafetyService';
import { databaseSeedService } from '../services/databaseSeedService';
import { 
  AppState, 
  User, 
  GuestUser, 
  MoodLog, 
  Exercise, 
  ExerciseSession,
  SyncQueueItem,
  NotificationSettings,
  AudioSettings,
  PrivacySettings,
  AccessibilitySettings,
  MoodLevel
} from '../types';

interface AppStore extends AppState {
  // Actions
  actions: {
    // Authentication actions
    setUser: (user: User | GuestUser | null) => void;
    setAuthState: (state: 'loading' | 'authenticated' | 'guest' | 'unauthenticated') => void;
    logout: () => void;
    
    // Mood actions
    addMoodLog: (moodLog: Omit<MoodLog, 'id' | 'synced' | 'createdAt'>) => void;
    updateMoodLog: (id: string, updates: Partial<MoodLog>) => void;
    getMoodLogs: (days?: number) => MoodLog[];
    
    // Exercise actions
    setExercises: (exercises: Exercise[]) => void;
    loadExercises: () => Promise<void>;
    addFavoriteExercise: (exerciseId: string) => void;
    removeFavoriteExercise: (exerciseId: string) => void;
    startExercise: (exerciseId: string) => void;
    completeExercise: (rating?: number, notes?: string) => Promise<void>;

    // Offline exercise actions
    getOfflineExercises: () => Promise<Exercise[]>;
    getExerciseForOfflineUse: (exerciseId: string) => Promise<Exercise | null>;
    checkOfflineReadiness: () => Promise<{
      isReady: boolean;
      coreExercisesCount: number;
      totalOfflineExercises: number;
      lastUpdated?: string;
    }>;
    addToFavorites: (exerciseId: string) => Promise<void>;
    removeFromFavorites: (exerciseId: string) => Promise<void>;

    // Exercise recommendation actions
    getExerciseRecommendations: (limit?: number) => Promise<{
      exercise: Exercise;
      score: number;
      reasons: string[];
      confidence: 'high' | 'medium' | 'low';
    }[]>;
    getQuickRecommendations: (mood: number) => string[];
    getCrisisRecommendations: () => Promise<Exercise[]>;

    // SOS session management actions
    startSOSSession: (exerciseId?: string) => Promise<any>;
    endSOSSession: (outcome?: 'completed' | 'interrupted' | 'escalated', notes?: string) => Promise<void>;
    getCurrentSOSSession: () => any | null;
    addSOSCheckIn: (response: 'better' | 'same' | 'worse' | 'need_help') => Promise<void>;

    // Data migration actions
    checkForGuestData: () => Promise<boolean>;
    migrateGuestData: (userId: string) => Promise<MigrationResult>;
    getMigrationStatus: () => Promise<{ completed: boolean; userId?: string; completedAt?: string }>;

    // Notification actions
    initializeNotifications: () => Promise<void>;
    updateNotificationPreferences: (preferences: any) => Promise<void>;
    getNotificationPreferences: () => Promise<any>;
    sendTestNotification: () => Promise<void>;

    // Smart nudge actions
    analyzeUserPatterns: () => Promise<void>;
    generateAndScheduleSmartNudges: () => Promise<void>;

    // AI actions
    initializeAI: (apiKey?: string) => Promise<void>;
    getAIExerciseRecommendations: (mood: number, timeOfDay: string, availableTime: number) => Promise<Exercise[]>;
    getAIMoodAnalysis: (timeframe: 'week' | 'month' | 'quarter') => Promise<any>;
    generateTherapeuticContent: (type: string, context: any) => Promise<string>;
    getAIUsageStats: () => Promise<any>;
    generateCustomExercise: (context: any) => Promise<any>;

    // AI Safety actions
    getAISafetyStats: () => Promise<any>;
    updateAISafetySettings: (settings: any) => Promise<void>;
    clearAISafetyLogs: () => Promise<void>;

    // Privacy control actions
    deleteAllUserData: () => Promise<void>;
    deleteUserAccount: () => Promise<void>;
    exportUserData: () => Promise<any>;

    // Database seeding actions
    seedDatabase: (forceReseed?: boolean) => Promise<any>;
    getSeedingStats: () => Promise<any>;
    reseedDatabase: () => Promise<any>;

    // App initialization
    initializeApp: () => Promise<void>;
    
    // Settings actions
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
    updateAudioSettings: (settings: Partial<AudioSettings>) => void;
    updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
    updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
    
    // System actions
    setOnlineStatus: (isOnline: boolean) => void;
    setLoading: (isLoading: boolean) => void;
    addToSyncQueue: (item: Omit<SyncQueueItem, 'id'>) => void;
    syncPendingData: () => Promise<void>;
    loadInitialData: () => Promise<void>;

    // Enhanced system testing and optimization actions
    runSystemDiagnostics: () => Promise<any>;
    optimizeForDevice: () => Promise<void>;
    checkSystemHealth: () => Promise<any>;
    getPerformanceMetrics: () => Promise<any>;
    enableLowMemoryMode: () => void;
    testNotificationSystem: () => Promise<any>;
    getErrorStatistics: () => Promise<any>;

    // Utility actions
    generateId: () => string;
    calculateStreak: (logs: MoodLog[]) => number;
  };
}

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const calculateStreak = (logs: MoodLog[]): number => {
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
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: 'loading',
      user: null,
      
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
          daily_reminders: true,
          reminder_time: '19:00',
          exercise_suggestions: true,
          streak_celebrations: false,
          crisis_alerts: true
        },
        audio: {
          enabled: false,
          background_sounds: 'none',
          volume: 0.5,
          haptic_feedback: true
        },
        privacy: {
          analytics_enabled: true,
          crisis_detection_enabled: true,
          cloud_backup_enabled: false,
          data_sharing_enabled: false
        },
        accessibility: {
          high_contrast: false,
          reduced_motion: false,
          large_text: true,
          voice_guidance: false,
          screen_reader_optimized: false
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
        // Authentication actions
        setUser: (user) => {
          set((state) => ({ ...state, user }));
        },
        
        setAuthState: (authState) => {
          set((state) => ({ ...state, auth: authState }));
        },
        
        logout: () => {
          set((state) => ({
            ...state,
            auth: 'unauthenticated',
            user: null,
            mood: {
              ...state.mood,
              pendingSync: [] // Clear pending sync on logout
            }
          }));
        },
        
        // Mood actions
        addMoodLog: (moodLogData) => {
          const newLog: MoodLog = {
            ...moodLogData,
            id: generateId(),
            synced: false,
            createdAt: new Date().toISOString()
          };
          
          set((state) => {
            const updatedLogs = [...state.mood.logs, newLog];
            return {
              ...state,
              mood: {
                ...state.mood,
                logs: updatedLogs,
                pendingSync: [...state.mood.pendingSync, newLog],
                lastCheckIn: new Date(newLog.timestamp),
                currentStreak: calculateStreak(updatedLogs)
              }
            };
          });
          
          // Add to sync queue if user is authenticated
          const { user } = get();
          if (user && !('isGuest' in user && user.isGuest)) {
            get().actions.addToSyncQueue({
              type: 'mood',
              action: 'create',
              data: newLog,
              timestamp: new Date().toISOString(),
              retryCount: 0
            });
          }
        },
        
        updateMoodLog: (id, updates) => {
          set((state) => ({
            ...state,
            mood: {
              ...state.mood,
              logs: state.mood.logs.map(log => 
                log.id === id ? { ...log, ...updates } : log
              )
            }
          }));
        },
        
        getMoodLogs: (days = 30) => {
          const { mood } = get();
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          
          return mood.logs.filter(log => 
            new Date(log.timestamp) > cutoffDate
          );
        },
        
        // Exercise actions
        setExercises: (exercises) => {
          set((state) => ({
            ...state,
            exercises: {
              ...state.exercises,
              library: exercises
            }
          }));
        },

        loadExercises: async () => {
          try {
            // Initialize offline exercise support
            await offlineExerciseManager.initializeOfflineSupport();

            // Try to load exercises from local storage first
            const localExercises = await exerciseStorageService.getExercises();

            if (localExercises.length > 0) {
              get().actions.setExercises(localExercises);
              console.log(`Loaded ${localExercises.length} exercises from local storage`);
              return;
            }

            // Fallback: Load pre-bundled exercises for offline support
            const exercises: Exercise[] = [
              {
                id: 'breathing-478',
                title: '4-7-8 Breathing',
                description: 'A calming breathing technique to reduce anxiety',
                category: 'breathing',
                difficulty: 'beginner',
                duration: 300, // 5 minutes
                instructions: [
                  'Sit comfortably with your back straight',
                  'Exhale completely through your mouth',
                  'Inhale through your nose for 4 counts',
                  'Hold your breath for 7 counts',
                  'Exhale through your mouth for 8 counts',
                  'Repeat this cycle 3-4 times'
                ],
                audioUrl: null, // Text-only for offline support
                tags: ['anxiety', 'sleep', 'stress'],
                isOfflineAvailable: true
              },
              {
                id: 'grounding-54321',
                title: '5-4-3-2-1 Grounding',
                description: 'A sensory grounding technique for anxiety and panic',
                category: 'grounding',
                difficulty: 'beginner',
                duration: 180, // 3 minutes
                instructions: [
                  'Look around and name 5 things you can see',
                  'Notice 4 things you can touch',
                  'Listen for 3 things you can hear',
                  'Identify 2 things you can smell',
                  'Think of 1 thing you can taste',
                  'Take slow, deep breaths throughout'
                ],
                audioUrl: null,
                tags: ['anxiety', 'panic', 'grounding'],
                isOfflineAvailable: true
              },
              {
                id: 'breathing-box',
                title: 'Box Breathing',
                description: 'A structured breathing pattern for focus and calm',
                category: 'breathing',
                difficulty: 'beginner',
                duration: 240, // 4 minutes
                instructions: [
                  'Sit in a comfortable position',
                  'Inhale for 4 counts',
                  'Hold your breath for 4 counts',
                  'Exhale for 4 counts',
                  'Hold empty for 4 counts',
                  'Repeat for several cycles'
                ],
                audioUrl: null,
                tags: ['focus', 'stress', 'breathing'],
                isOfflineAvailable: true
              }
            ];

            // Store exercises locally for offline access
            await exerciseStorageService.storeExercises(exercises);

            get().actions.setExercises(exercises);
            console.log('Exercises loaded and stored for offline access');
          } catch (error) {
            console.error('Failed to load exercises:', error);
          }
        },
        
        addFavoriteExercise: (exerciseId) => {
          set((state) => ({
            ...state,
            exercises: {
              ...state.exercises,
              favorites: [...state.exercises.favorites, exerciseId]
            }
          }));
        },
        
        removeFavoriteExercise: (exerciseId) => {
          set((state) => ({
            ...state,
            exercises: {
              ...state.exercises,
              favorites: state.exercises.favorites.filter(id => id !== exerciseId)
            }
          }));
        },
        
        startExercise: (exerciseId) => {
          const exercise = get().exercises.library.find(e => e.id === exerciseId);
          if (!exercise) return;
          
          const session: ExerciseSession = {
            id: generateId(),
            userId: get().user?.id || 'guest',
            exerciseId,
            startedAt: new Date().toISOString(),
            synced: false
          };
          
          set((state) => ({
            ...state,
            exercises: {
              ...state.exercises,
              currentSession: session
            }
          }));
        },
        
        completeExercise: async (rating, notes) => {
          const { currentSession } = get().exercises;
          if (!currentSession) return;

          const completedSession: ExerciseSession = {
            ...currentSession,
            completedAt: new Date().toISOString(),
            rating,
            notes
          };

          try {
            // Store session locally for offline support
            await exerciseStorageService.storeSession(completedSession);

            set((state) => ({
              ...state,
              exercises: {
                ...state.exercises,
                completions: [...state.exercises.completions, completedSession],
                currentSession: null
              }
            }));

            // Add to sync queue if user is authenticated
            const { user } = get();
            if (user && !('isGuest' in user && user.isGuest)) {
              get().actions.addToSyncQueue({
                type: 'exercise',
                action: 'create',
                data: completedSession,
                timestamp: new Date().toISOString(),
                retryCount: 0
              });
            }

            console.log('Exercise completed and stored locally');
          } catch (error) {
            console.error('Failed to store exercise completion:', error);
            // Still update state even if storage fails
            set((state) => ({
              ...state,
              exercises: {
                ...state.exercises,
                completions: [...state.exercises.completions, completedSession],
                currentSession: null
              }
            }));
          }
        },
        
        // Settings actions
        updateNotificationSettings: (settings) => {
          set((state) => ({
            ...state,
            settings: {
              ...state.settings,
              notifications: {
                ...state.settings.notifications,
                ...settings
              }
            }
          }));
        },
        
        updateAudioSettings: (settings) => {
          set((state) => ({
            ...state,
            settings: {
              ...state.settings,
              audio: {
                ...state.settings.audio,
                ...settings
              }
            }
          }));
        },
        
        updatePrivacySettings: (settings) => {
          set((state) => ({
            ...state,
            settings: {
              ...state.settings,
              privacy: {
                ...state.settings.privacy,
                ...settings
              }
            }
          }));
        },
        
        updateAccessibilitySettings: (settings) => {
          set((state) => ({
            ...state,
            settings: {
              ...state.settings,
              accessibility: {
                ...state.settings.accessibility,
                ...settings
              }
            }
          }));
        },
        
        // System actions
        setOnlineStatus: (isOnline) => {
          set((state) => ({
            ...state,
            system: {
              ...state.system,
              isOnline
            }
          }));
          
          // Trigger sync if coming online
          if (isOnline && get().system.pendingActions.length > 0) {
            get().actions.syncPendingData();
          }
        },
        
        setLoading: (isLoading) => {
          set((state) => ({
            ...state,
            system: {
              ...state.system,
              isLoading
            }
          }));
        },
        
        addToSyncQueue: (item) => {
          const queueItem: SyncQueueItem = {
            ...item,
            id: generateId()
          };
          
          set((state) => ({
            ...state,
            system: {
              ...state.system,
              pendingActions: [...state.system.pendingActions, queueItem]
            }
          }));
        },
        
        syncPendingData: async () => {
          const { system, user } = get();
          if (!system.isOnline || system.pendingActions.length === 0 || !user) return;
          
          try {
            // This would integrate with Supabase sync service
            console.log('Syncing pending data:', system.pendingActions);
            
            // For now, just clear the queue (actual sync implementation would go here)
            set((state) => ({
              ...state,
              system: {
                ...state.system,
                pendingActions: [],
                lastSync: new Date()
              }
            }));
          } catch (error) {
            console.error('Sync failed:', error);
          }
        },

        loadInitialData: async () => {
          try {
            // Set loading state
            get().actions.setLoading(true);

            // Load exercises
            await get().actions.loadExercises();

            // Load any persisted data from storage
            // This would include mood logs, settings, etc.
            console.log('Initial data loaded successfully');

          } catch (error) {
            console.error('Failed to load initial data:', error);
            set((state) => ({
              ...state,
              system: {
                ...state.system,
                errorState: 'Failed to load initial data'
              }
            }));
          } finally {
            // Clear loading state
            get().actions.setLoading(false);
          }
        },

        // Offline exercise actions
        getOfflineExercises: async () => {
          try {
            const exercises = await offlineExerciseManager.getAvailableOfflineExercises();
            return exercises;
          } catch (error) {
            console.error('Failed to get offline exercises:', error);
            return [];
          }
        },

        getExerciseForOfflineUse: async (exerciseId: string) => {
          try {
            const exercise = await offlineExerciseManager.getExerciseForOfflineUse(exerciseId);
            return exercise;
          } catch (error) {
            console.error('Failed to get exercise for offline use:', error);
            return null;
          }
        },

        checkOfflineReadiness: async () => {
          try {
            const status = await offlineExerciseManager.getOfflineReadinessStatus();
            set((state) => ({
              ...state,
              system: {
                ...state.system,
                offlineReady: status.isReady
              }
            }));
            return status;
          } catch (error) {
            console.error('Failed to check offline readiness:', error);
            return {
              isReady: false,
              coreExercisesCount: 0,
              totalOfflineExercises: 0,
            };
          }
        },

        addToFavorites: async (exerciseId: string) => {
          try {
            await exerciseStorageService.addToFavorites(exerciseId);
            get().actions.addFavoriteExercise(exerciseId);
          } catch (error) {
            console.error('Failed to add to favorites:', error);
          }
        },

        removeFromFavorites: async (exerciseId: string) => {
          try {
            await exerciseStorageService.removeFromFavorites(exerciseId);
            get().actions.removeFavoriteExercise(exerciseId);
          } catch (error) {
            console.error('Failed to remove from favorites:', error);
          }
        },

        // Exercise recommendation actions
        getExerciseRecommendations: async (limit = 3) => {
          try {
            const state = get();
            const currentMood = state.mood.logs.length > 0 ? state.mood.logs[state.mood.logs.length - 1].value : undefined;
            const timeOfDay = exerciseRecommendationEngine.getTimeOfDay();
            const recentMoods = state.mood.logs.slice(-7);
            const exerciseHistory = state.exercises.completions;

            const recommendations = exerciseRecommendationEngine.getRecommendations(
              state.exercises.library,
              {
                currentMood,
                timeOfDay,
                recentMoods,
                exerciseHistory,
                userPreferences: {
                  preferredDuration: 180, // 3 minutes default
                },
              },
              limit
            );

            return recommendations;
          } catch (error) {
            console.error('Failed to get exercise recommendations:', error);
            return [];
          }
        },

        getQuickRecommendations: (mood: number) => {
          return exerciseRecommendationEngine.getQuickRecommendations(mood);
        },

        getCrisisRecommendations: async () => {
          try {
            const state = get();
            return exerciseRecommendationEngine.getCrisisRecommendations(state.exercises.library);
          } catch (error) {
            console.error('Failed to get crisis recommendations:', error);
            return [];
          }
        },

        // SOS session management actions
        startSOSSession: async (exerciseId?: string) => {
          try {
            const session = await sosSessionManager.startSession({
              exerciseId,
              autoCheckInInterval: 60,
            });
            console.log('SOS session started from store');
            return session;
          } catch (error) {
            console.error('Failed to start SOS session:', error);
            throw error;
          }
        },

        endSOSSession: async (outcome = 'completed', notes?: string) => {
          try {
            await sosSessionManager.endSession(outcome, notes);
            console.log('SOS session ended from store');
          } catch (error) {
            console.error('Failed to end SOS session:', error);
          }
        },

        getCurrentSOSSession: () => {
          return sosSessionManager.getCurrentSession();
        },

        addSOSCheckIn: async (response: 'better' | 'same' | 'worse' | 'need_help') => {
          try {
            await sosSessionManager.addCheckIn({
              type: 'manual',
              response,
            });
            console.log('SOS check-in added from store');
          } catch (error) {
            console.error('Failed to add SOS check-in:', error);
          }
        },

        // Data migration actions
        checkForGuestData: async () => {
          try {
            return await dataMigrationService.hasGuestDataToMigrate();
          } catch (error) {
            console.error('Failed to check for guest data:', error);
            return false;
          }
        },

        migrateGuestData: async (userId: string) => {
          try {
            const result = await dataMigrationService.migrateGuestData(userId, {
              conflictResolution: 'merge_all',
              preserveTimestamps: true,
              backupBeforeMigration: true,
            });

            // If migration was successful, reload the app data
            if (result.success) {
              await get().actions.loadInitialData();
            }

            return result;
          } catch (error) {
            console.error('Failed to migrate guest data:', error);
            return {
              success: false,
              migratedItems: { moodLogs: 0, exerciseSessions: 0, preferences: false, favorites: 0 },
              conflicts: [],
              errors: [error.message],
            };
          }
        },

        getMigrationStatus: async () => {
          try {
            return await dataMigrationService.getMigrationStatus();
          } catch (error) {
            console.error('Failed to get migration status:', error);
            return { completed: false };
          }
        },

        // Notification actions
        initializeNotifications: async () => {
          try {
            await notificationService.initialize();
            console.log('Notifications initialized from store');
          } catch (error) {
            console.error('Failed to initialize notifications:', error);
          }
        },

        updateNotificationPreferences: async (preferences: any) => {
          try {
            await notificationService.updatePreferences(preferences);
            console.log('Notification preferences updated from store');
          } catch (error) {
            console.error('Failed to update notification preferences:', error);
          }
        },

        getNotificationPreferences: async () => {
          try {
            return await notificationService.getPreferences();
          } catch (error) {
            console.error('Failed to get notification preferences:', error);
            return {
              enabled: false,
              morningTime: '09:00',
              eveningTime: '20:00',
              weekdaysOnly: false,
              gentleNudges: true,
              crisisReminders: false,
            };
          }
        },

        sendTestNotification: async () => {
          try {
            await notificationService.sendTestNotification();
            console.log('Test notification sent from store');
          } catch (error) {
            console.error('Failed to send test notification:', error);
          }
        },

        // Smart nudge actions
        analyzeUserPatterns: async () => {
          try {
            const state = get();
            const { user, mood, exercises } = state;

            if (user && !('isGuest' in user && user.isGuest)) {
              await smartNudgeService.analyzeUserPatterns(
                user.id,
                mood.logs,
                exercises.completions
              );
              console.log('User patterns analyzed for smart nudges');
            }
          } catch (error) {
            console.error('Failed to analyze user patterns:', error);
          }
        },

        generateAndScheduleSmartNudges: async () => {
          try {
            const state = get();
            const { user, mood, exercises } = state;

            if (user && !('isGuest' in user && user.isGuest)) {
              const nudges = await smartNudgeService.generateSmartNudges(
                user.id,
                mood.logs,
                exercises.completions
              );

              if (nudges.length > 0) {
                await smartNudgeService.scheduleSmartNudges(nudges);
                console.log(`Generated and scheduled ${nudges.length} smart nudges`);
              }
            }
          } catch (error) {
            console.error('Failed to generate smart nudges:', error);
          }
        },

        // AI actions
        initializeAI: async (apiKey?: string) => {
          try {
            await openAIService.initialize(apiKey);
            console.log('AI service initialized from store');
          } catch (error) {
            console.error('Failed to initialize AI service:', error);
          }
        },

        getAIExerciseRecommendations: async (mood: number, timeOfDay: string, availableTime: number) => {
          try {
            const state = get();
            const { exercises, mood: moodState } = state;

            const recentMoods = moodState.logs.slice(-5).map(log => log.value);
            const triggers = moodState.logs[moodState.logs.length - 1]?.triggers || [];

            const recommendations = await openAIService.generateExerciseRecommendations(
              {
                currentMood: mood,
                recentMoods,
                triggers,
                timeOfDay: timeOfDay as any,
                availableTime,
              },
              exercises.library
            );

            console.log(`AI generated ${recommendations.length} exercise recommendations`);
            return recommendations;
          } catch (error) {
            console.error('Failed to get AI exercise recommendations:', error);
            return [];
          }
        },

        getAIMoodAnalysis: async (timeframe: 'week' | 'month' | 'quarter') => {
          try {
            const state = get();
            const { mood, exercises } = state;

            const analysis = await openAIService.analyzeMoodPatterns({
              moodLogs: mood.logs,
              exerciseSessions: exercises.completions,
              timeframe,
            });

            console.log('AI mood analysis completed');
            return analysis;
          } catch (error) {
            console.error('Failed to get AI mood analysis:', error);
            return {
              insights: ['Unable to generate AI insights at this time.'],
              trends: ['Please try again later.'],
              recommendations: ['Continue tracking your mood regularly.'],
            };
          }
        },

        generateTherapeuticContent: async (type: string, context: any) => {
          try {
            const content = await openAIService.generateTherapeuticContent(type as any, context);
            console.log(`Generated therapeutic content: ${type}`);
            return content;
          } catch (error) {
            console.error('Failed to generate therapeutic content:', error);
            return 'You are worthy of care and compassion.';
          }
        },

        getAIUsageStats: async () => {
          try {
            return await openAIService.getUsageStats();
          } catch (error) {
            console.error('Failed to get AI usage stats:', error);
            return {
              totalTokensUsed: 0,
              totalCost: 0,
              requestCount: 0,
              lastResetDate: new Date().toISOString(),
              monthlyLimit: 5.00,
            };
          }
        },

        generateCustomExercise: async (context: {
          mood: number;
          triggers?: string[];
          timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
          availableTime: number;
          preferredCategory?: string;
          stressLevel?: string;
          environment?: string;
        }) => {
          try {
            const state = get();
            const { mood: moodState } = state;

            // Enhance context with recent mood data
            const enhancedContext = {
              ...context,
              recentMoods: moodState.logs.slice(-5).map(log => log.value),
            };

            const customExercise = await openAIService.generateCustomExercise(enhancedContext);

            if (customExercise) {
              console.log(`Generated custom exercise: ${customExercise.title}`);

              // Convert to Exercise format and add to library temporarily
              const exercise = {
                id: `custom_${Date.now()}`,
                title: customExercise.title,
                category: customExercise.category,
                duration: customExercise.duration,
                description: customExercise.description,
                instructions: customExercise.steps,
                benefits: customExercise.benefits,
                isCustom: true,
                createdAt: new Date().toISOString(),
              };

              return exercise;
            }

            return null;
          } catch (error) {
            console.error('Failed to generate custom exercise:', error);
            return null;
          }
        },

        // AI Safety actions
        getAISafetyStats: async () => {
          try {
            return await aiSafetyService.getSafetyStats();
          } catch (error) {
            console.error('Failed to get AI safety stats:', error);
            return {
              totalReports: 0,
              approvedCount: 0,
              rejectedCount: 0,
              criticalIssues: 0,
              recentBlocked: [],
            };
          }
        },

        updateAISafetySettings: async (settings: any) => {
          try {
            await aiSafetyService.updateSafetySettings(settings);
            console.log('AI safety settings updated');
          } catch (error) {
            console.error('Failed to update AI safety settings:', error);
          }
        },

        clearAISafetyLogs: async () => {
          try {
            await aiSafetyService.clearSafetyLogs();
            console.log('AI safety logs cleared');
          } catch (error) {
            console.error('Failed to clear AI safety logs:', error);
          }
        },

        // Privacy control actions
        deleteAllUserData: async () => {
          try {
            const state = get();

            // Clear all local data
            await Promise.all([
              AsyncStorage.removeItem('mood_logs'),
              AsyncStorage.removeItem('exercise_completions'),
              AsyncStorage.removeItem('user_profile'),
              AsyncStorage.removeItem('app_settings'),
              AsyncStorage.removeItem('sync_queue'),
              AsyncStorage.removeItem('offline_exercises'),
              AsyncStorage.removeItem('ai_usage_stats'),
              AsyncStorage.removeItem('ai_safety_reports'),
              AsyncStorage.removeItem('notification_preferences'),
            ]);

            // Reset store state
            set({
              mood: { logs: [], currentMood: null, lastCheckIn: null },
              exercises: {
                library: [],
                completions: [],
                currentSession: null,
                recommendations: [],
                offlineExercises: [],
              },
              user: null,
              settings: {
                notifications: { enabled: false, morningTime: '09:00', eveningTime: '20:00' },
                privacy: { localOnly: true, dataRetention: 90 },
                accessibility: { fontSize: 'medium', highContrast: false },
              },
              sync: { queue: [], lastSync: null, isOnline: true },
            });

            console.log('All user data deleted');
          } catch (error) {
            console.error('Failed to delete all user data:', error);
            throw error;
          }
        },

        deleteUserAccount: async () => {
          try {
            const state = get();
            const { user } = state;

            if (user && !('isGuest' in user && user.isGuest)) {
              // Delete from Supabase if authenticated user
              const { error } = await supabase.auth.admin.deleteUser(user.id);
              if (error) throw error;
            }

            // Clear all local data
            await get().deleteAllUserData();

            // Sign out
            await supabase.auth.signOut();

            console.log('User account deleted');
          } catch (error) {
            console.error('Failed to delete user account:', error);
            throw error;
          }
        },

        exportUserData: async () => {
          try {
            const state = get();
            const { mood, exercises, user, settings } = state;

            const exportData = {
              exportDate: new Date().toISOString(),
              user: user ? {
                id: user.id,
                email: 'email' in user ? user.email : null,
                createdAt: user.createdAt,
                profile: user.profile,
              } : null,
              moodLogs: mood.logs,
              exerciseCompletions: exercises.completions,
              settings,
              summary: {
                totalMoodLogs: mood.logs.length,
                totalExercises: exercises.completions.length,
                averageMood: mood.logs.length > 0
                  ? mood.logs.reduce((sum, log) => sum + log.value, 0) / mood.logs.length
                  : null,
                mostUsedExercises: exercises.completions
                  .reduce((acc, completion) => {
                    acc[completion.exerciseId] = (acc[completion.exerciseId] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>),
              },
            };

            console.log('User data exported');
            return exportData;
          } catch (error) {
            console.error('Failed to export user data:', error);
            throw error;
          }
        },

        // Database seeding actions
        seedDatabase: async (forceReseed: boolean = false) => {
          try {
            const result = await databaseSeedService.seedDatabase(forceReseed);
            console.log('Database seeding completed:', result);
            return result;
          } catch (error) {
            console.error('Failed to seed database:', error);
            throw error;
          }
        },

        getSeedingStats: async () => {
          try {
            return await databaseSeedService.getSeedingStats();
          } catch (error) {
            console.error('Failed to get seeding stats:', error);
            return {
              lastSeeded: null,
              version: null,
              totalItems: 0,
              breakdown: { exercises: 0, notifications: 0, crisisResources: 0 },
            };
          }
        },

        reseedDatabase: async () => {
          try {
            const result = await databaseSeedService.reseedDatabase();
            console.log('Database reseeding completed:', result);
            return result;
          } catch (error) {
            console.error('Failed to reseed database:', error);
            throw error;
          }
        },

        // App initialization
        initializeApp: async () => {
          try {
            console.log('Initializing PocketTherapy app...');

            // Initialize auth state
            await get().initializeAuth();

            // Load user data
            await get().loadUserData();

            // Initialize notifications
            await get().initializeNotifications();

            // Seed database if needed
            const needsSeeding = await databaseSeedService.needsSeeding();
            if (needsSeeding) {
              console.log('Seeding database with initial content...');
              await get().seedDatabase();
            }

            console.log('App initialization completed');
          } catch (error) {
            console.error('App initialization failed:', error);
          }
        },

        // Enhanced system testing and optimization actions
        runSystemDiagnostics: async () => {
          try {
            const { applyDeviceOptimizations, MemoryManager } = await import('../utils/performanceOptimization');

            // Get AI service statistics
            const aiStats = openAIService.getErrorStatistics();

            // Get notification system status
            const notificationTest = await notificationService.runComprehensiveTest();

            // Get performance information
            const performanceInfo = applyDeviceOptimizations();
            const memoryManager = MemoryManager.getInstance();
            const memoryStats = memoryManager.getDetailedStats();

            return {
              ai: {
                available: true,
                errorRate: aiStats.errorRate,
                totalErrors: aiStats.totalErrors,
                recommendations: aiStats.recentErrors.length > 0
                  ? ['Consider implementing more robust fallback mechanisms']
                  : ['AI service is functioning well'],
              },
              notifications: {
                functional: notificationTest.success,
                permissionsGranted: notificationTest.permissionGranted,
                issues: notificationTest.errors,
                recommendations: notificationTest.recommendations,
              },
              performance: {
                deviceCategory: performanceInfo.isVeryLowEnd ? 'Very Low-End' : 'Standard',
                isVeryLowEnd: performanceInfo.isVeryLowEnd,
                memoryPressure: memoryStats.memoryPressure,
                optimizations: performanceInfo.recommendations,
                memoryUsage: memoryStats.usagePercentage,
              },
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            console.error('System diagnostics failed:', error);
            throw error;
          }
        },

        optimizeForDevice: async () => {
          try {
            const { applyDeviceOptimizations, MemoryManager } = await import('../utils/performanceOptimization');

            // Apply device-specific optimizations
            const optimizations = applyDeviceOptimizations();

            // Configure memory manager
            const memoryManager = MemoryManager.getInstance();
            if (optimizations.isVeryLowEnd) {
              memoryManager.enableLowMemoryMode();
            }

            // Update app state with optimization settings
            set((state) => ({
              system: {
                ...state.system,
                performanceMode: optimizations.isVeryLowEnd ? 'low-end' : 'standard',
                optimizationsApplied: optimizations.recommendations,
              }
            }));

            console.log('Device optimizations applied:', optimizations.recommendations);
          } catch (error) {
            console.error('Device optimization failed:', error);
            throw error;
          }
        },

        checkSystemHealth: async () => {
          try {
            // Quick health check without full diagnostics
            const { MemoryManager } = await import('../utils/performanceOptimization');

            const memoryManager = MemoryManager.getInstance();
            const memoryCheck = memoryManager.checkMemoryPressure();
            const notificationCheck = await notificationService.performPeriodicCheck();

            return {
              memory: {
                pressure: memoryCheck.isEmergency ? 'critical' :
                         memoryCheck.isWarning ? 'high' : 'normal',
                recommendation: memoryCheck.recommendation,
              },
              notifications: {
                functional: notificationCheck.functionalityOk,
                permissionsGranted: notificationCheck.permissionsOk,
                issues: notificationCheck.issues,
              },
              overall: {
                status: memoryCheck.isEmergency || !notificationCheck.functionalityOk ? 'warning' : 'healthy',
              },
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            console.error('System health check failed:', error);
            return {
              overall: { status: 'error' },
              error: error.message,
              timestamp: new Date().toISOString(),
            };
          }
        },

        getPerformanceMetrics: async () => {
          try {
            const { MemoryManager } = await import('../utils/performanceOptimization');

            const memoryManager = MemoryManager.getInstance();
            const memoryStats = memoryManager.getDetailedStats();
            const aiStats = openAIService.getErrorStatistics();
            const notificationStats = notificationService.getErrorStatistics();

            return {
              memory: memoryStats,
              ai: aiStats,
              notifications: notificationStats,
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            console.error('Failed to get performance metrics:', error);
            throw error;
          }
        },

        enableLowMemoryMode: async () => {
          try {
            const { MemoryManager } = await import('../utils/performanceOptimization');
            const memoryManager = MemoryManager.getInstance();
            memoryManager.enableLowMemoryMode();

            set((state) => ({
              system: {
                ...state.system,
                performanceMode: 'low-memory',
              }
            }));

            console.log('Low memory mode enabled');
          } catch (error) {
            console.error('Failed to enable low memory mode:', error);
          }
        },

        testNotificationSystem: async () => {
          try {
            return await notificationService.runComprehensiveTest();
          } catch (error) {
            console.error('Notification system test failed:', error);
            throw error;
          }
        },

        getErrorStatistics: async () => {
          try {
            const aiStats = openAIService.getErrorStatistics();
            const notificationStats = notificationService.getErrorStatistics();

            return {
              ai: aiStats,
              notifications: notificationStats,
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            console.error('Failed to get error statistics:', error);
            throw error;
          }
        },

        // Utility actions
        generateId,
        calculateStreak
      }
    }),
    {
      name: 'pockettherapy-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist certain parts of state
        auth: state.auth,
        user: state.user,
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

// Export individual selectors for performance
export const useAuth = () => useAppStore((state) => ({
  auth: state.auth,
  user: state.user
}));
export const useMood = () => useAppStore((state) => state.mood);
export const useExercises = () => useAppStore((state) => state.exercises);
export const useSettings = () => useAppStore((state) => state.settings);
export const useSystem = () => useAppStore((state) => state.system);
export const useActions = () => useAppStore((state) => state.actions);
