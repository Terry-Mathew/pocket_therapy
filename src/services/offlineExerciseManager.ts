/**
 * Offline Exercise Manager
 * 
 * Manages exercise downloads, offline availability,
 * and text-only fallbacks for complete offline support
 */

import NetInfo from '@react-native-community/netinfo';
import { exerciseStorageService } from './exerciseStorage';
import { Exercise } from '../types';

interface OfflineExerciseData {
  id: string;
  title: string;
  category: string;
  duration: number;
  instructions: string[];
  textOnlyInstructions: string[];
  audioTranscript?: string;
  isOfflineReady: boolean;
  downloadedAt?: string;
}

class OfflineExerciseManager {
  private isOnline: boolean = true;
  private downloadQueue: string[] = [];

  constructor() {
    this.initializeNetworkMonitoring();
  }

  /**
   * Initialize network monitoring
   */
  private initializeNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      console.log('Network state changed:', this.isOnline ? 'online' : 'offline');
      
      if (this.isOnline && this.downloadQueue.length > 0) {
        this.processDownloadQueue();
      }
    });
  }

  /**
   * Prepare core exercises for offline use
   */
  async prepareCoreExercisesOffline(): Promise<void> {
    try {
      const coreExercises = this.getCoreOfflineExercises();
      
      // Store offline content for core exercises
      const offlineContent = coreExercises.map(exercise => ({
        exerciseId: exercise.id,
        textInstructions: exercise.textOnlyInstructions,
        audioTranscript: exercise.audioTranscript,
        estimatedDuration: exercise.duration,
        lastUpdated: new Date().toISOString(),
      }));

      await exerciseStorageService.storeOfflineContent(offlineContent);
      
      // Store the exercises themselves
      const exercises: Exercise[] = coreExercises.map(ex => ({
        id: ex.id,
        title: ex.title,
        category: ex.category as any,
        duration: ex.duration,
        instructions: ex.instructions,
        audioUrl: null, // No audio for offline
        isOfflineAvailable: true,
        difficulty: 'beginner',
        tags: ['offline', 'core'],
        description: `${ex.title} - Available offline`,
      }));

      await exerciseStorageService.storeExercises(exercises);
      
      console.log(`Prepared ${coreExercises.length} core exercises for offline use`);
    } catch (error) {
      console.error('Failed to prepare core exercises offline:', error);
      throw new Error('Failed to prepare offline exercises');
    }
  }

  /**
   * Get core exercises that should always be available offline
   */
  private getCoreOfflineExercises(): OfflineExerciseData[] {
    return [
      {
        id: 'breathing-4-7-8',
        title: '4-7-8 Breathing',
        category: 'breathing',
        duration: 120,
        instructions: [
          'Find a comfortable position',
          'Place one hand on your chest, one on your belly',
          'Breathe in through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale through your mouth for 8 counts',
          'Repeat this cycle 4 times'
        ],
        textOnlyInstructions: [
          '🫁 Find a comfortable position sitting or lying down',
          '✋ Place one hand on your chest, one on your belly',
          '👃 Breathe in slowly through your nose for 4 counts',
          '⏸️ Hold your breath gently for 7 counts',
          '👄 Exhale slowly through your mouth for 8 counts',
          '🔄 Repeat this cycle 3-4 times',
          '✨ Notice how your body feels more relaxed'
        ],
        audioTranscript: 'Let\'s begin the 4-7-8 breathing technique. This will help calm your nervous system...',
        isOfflineReady: true,
      },
      {
        id: 'grounding-5-4-3-2-1',
        title: '5-4-3-2-1 Grounding',
        category: 'grounding',
        duration: 180,
        instructions: [
          'Look around and name 5 things you can see',
          'Notice 4 things you can touch',
          'Listen for 3 things you can hear',
          'Find 2 things you can smell',
          'Notice 1 thing you can taste'
        ],
        textOnlyInstructions: [
          '👀 Look around and slowly name 5 things you can see',
          '✋ Notice 4 different things you can touch around you',
          '👂 Listen carefully for 3 different sounds you can hear',
          '👃 Find 2 different things you can smell',
          '👅 Notice 1 thing you can taste in your mouth',
          '🌟 Take a deep breath and notice how you feel now'
        ],
        audioTranscript: 'This grounding technique uses your five senses to bring you back to the present moment...',
        isOfflineReady: true,
      },
      {
        id: 'progressive-muscle-relaxation',
        title: 'Quick Muscle Relaxation',
        category: 'relaxation',
        duration: 300,
        instructions: [
          'Start with your toes - tense for 5 seconds, then relax',
          'Move to your calves - tense and relax',
          'Tense your thighs, then let go',
          'Clench your fists, then release',
          'Tense your shoulders, then drop them',
          'Scrunch your face, then relax completely'
        ],
        textOnlyInstructions: [
          '🦶 Start with your toes - curl them tight for 5 seconds, then relax',
          '🦵 Tense your calf muscles, hold for 5 seconds, then let go',
          '🦵 Tighten your thigh muscles, hold, then release completely',
          '✊ Make tight fists with your hands, hold, then open and relax',
          '🤷 Lift your shoulders to your ears, hold, then drop them down',
          '😤 Scrunch up your whole face, hold, then relax everything',
          '😌 Take a moment to notice the relaxation throughout your body'
        ],
        audioTranscript: 'Progressive muscle relaxation helps release physical tension...',
        isOfflineReady: true,
      },
      {
        id: 'mindful-observation',
        title: 'Mindful Observation',
        category: 'mindfulness',
        duration: 240,
        instructions: [
          'Choose one object near you',
          'Look at it as if seeing it for the first time',
          'Notice its color, shape, and texture',
          'Observe how light hits it',
          'Notice any thoughts that arise, then return to observing'
        ],
        textOnlyInstructions: [
          '🎯 Choose one small object near you to focus on',
          '👁️ Look at it as if you\'ve never seen it before',
          '🌈 Notice its colors - are there different shades?',
          '📐 Observe its shape and any interesting details',
          '✨ See how light and shadows play on its surface',
          '🧠 If your mind wanders, gently return to observing',
          '🙏 Thank yourself for taking this mindful moment'
        ],
        audioTranscript: 'Mindful observation helps anchor your attention in the present...',
        isOfflineReady: true,
      },
      {
        id: 'loving-kindness-self',
        title: 'Self-Compassion Practice',
        category: 'compassion',
        duration: 180,
        instructions: [
          'Place your hand on your heart',
          'Take three deep breaths',
          'Say to yourself: "May I be kind to myself"',
          'Say: "May I give myself the compassion I need"',
          'Say: "May I be strong and patient"',
          'Feel the warmth of your own care'
        ],
        textOnlyInstructions: [
          '❤️ Place your hand gently on your heart',
          '🫁 Take three slow, deep breaths',
          '💝 Say to yourself: "May I be kind to myself"',
          '🤗 Say: "May I give myself the compassion I need"',
          '💪 Say: "May I be strong and patient with myself"',
          '☀️ Feel the warmth of your own caring presence',
          '🌟 Remember: you deserve kindness, especially from yourself'
        ],
        audioTranscript: 'Self-compassion is a powerful practice for emotional healing...',
        isOfflineReady: true,
      }
    ];
  }

  /**
   * Check if device is online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get exercise with offline fallback
   */
  async getExerciseForOfflineUse(exerciseId: string): Promise<Exercise | null> {
    try {
      // First try to get from local storage
      const exercise = await exerciseStorageService.getExerciseWithFallback(exerciseId);
      
      if (exercise) {
        return exercise;
      }

      // If not available locally and we're offline, return null
      if (!this.isOnline) {
        console.log(`Exercise ${exerciseId} not available offline`);
        return null;
      }

      // If online, we could fetch from server here
      // For now, return null as we don't have server integration yet
      return null;
    } catch (error) {
      console.error('Failed to get exercise for offline use:', error);
      return null;
    }
  }

  /**
   * Get all available offline exercises
   */
  async getAvailableOfflineExercises(): Promise<Exercise[]> {
    try {
      const exercises = await exerciseStorageService.getExercises();
      return exercises.filter(ex => ex.isOfflineAvailable);
    } catch (error) {
      console.error('Failed to get offline exercises:', error);
      return [];
    }
  }

  /**
   * Add exercise to download queue
   */
  async queueExerciseForDownload(exerciseId: string): Promise<void> {
    if (!this.downloadQueue.includes(exerciseId)) {
      this.downloadQueue.push(exerciseId);
      
      if (this.isOnline) {
        await this.processDownloadQueue();
      }
    }
  }

  /**
   * Process download queue when online
   */
  private async processDownloadQueue(): Promise<void> {
    if (!this.isOnline || this.downloadQueue.length === 0) {
      return;
    }

    console.log(`Processing download queue: ${this.downloadQueue.length} exercises`);
    
    // For now, just clear the queue as we don't have server integration
    // In a real implementation, this would download exercises from the server
    this.downloadQueue = [];
  }

  /**
   * Get offline readiness status
   */
  async getOfflineReadinessStatus(): Promise<{
    isReady: boolean;
    coreExercisesCount: number;
    totalOfflineExercises: number;
    lastUpdated?: string;
  }> {
    try {
      const stats = await exerciseStorageService.getStorageStats();
      const offlineContent = await exerciseStorageService.getOfflineContent();
      
      const coreExercisesCount = this.getCoreOfflineExercises().length;
      const isReady = stats.offlineContentCount >= coreExercisesCount;
      
      return {
        isReady,
        coreExercisesCount,
        totalOfflineExercises: stats.exerciseCount,
        lastUpdated: offlineContent[0]?.lastUpdated,
      };
    } catch (error) {
      console.error('Failed to get offline readiness status:', error);
      return {
        isReady: false,
        coreExercisesCount: 0,
        totalOfflineExercises: 0,
      };
    }
  }

  /**
   * Initialize offline support (call this on app startup)
   */
  async initializeOfflineSupport(): Promise<void> {
    try {
      console.log('Initializing offline exercise support...');
      
      // Check if we already have core exercises
      const status = await this.getOfflineReadinessStatus();
      
      if (!status.isReady) {
        console.log('Preparing core exercises for offline use...');
        await this.prepareCoreExercisesOffline();
      } else {
        console.log('Offline exercises already prepared');
      }
      
      console.log('Offline exercise support initialized');
    } catch (error) {
      console.error('Failed to initialize offline support:', error);
      // Don't throw - app should still work without offline support
    }
  }
}

export const offlineExerciseManager = new OfflineExerciseManager();
