/**
 * Demo Mode Service
 * 
 * Provides demo data and functionality when running without real backend services.
 * Useful for development, testing, and demonstrations.
 */

import { MoodLog, Exercise, User } from '../types';

export const isDemoMode = () => {
  return process.env.EXPO_PUBLIC_APP_ENV === 'development' && 
         (!process.env.EXPO_PUBLIC_SUPABASE_URL || 
          process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co');
};

export const demoUser: User = {
  id: 'demo-user-123',
  email: 'demo@pockettherapy.app',
  name: 'Demo User',
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferences: {
    notifications: true,
    reminderTime: '09:00',
    theme: 'light',
    language: 'en'
  }
};

export const demoMoodLogs: MoodLog[] = [
  {
    id: 'mood-1',
    userId: 'demo-user-123',
    mood: 4,
    energy: 3,
    anxiety: 2,
    notes: 'Feeling pretty good today after morning meditation',
    triggers: ['work', 'exercise'],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    synced: true
  },
  {
    id: 'mood-2',
    userId: 'demo-user-123',
    mood: 3,
    energy: 2,
    anxiety: 4,
    notes: 'Bit stressed about upcoming presentation',
    triggers: ['work', 'social'],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    synced: true
  }
];

export const demoExercises: Exercise[] = [
  {
    id: 'exercise-1',
    title: '4-7-8 Breathing',
    description: 'A calming breathing technique to reduce anxiety',
    category: 'breathing',
    duration: 300, // 5 minutes
    difficulty: 'beginner',
    instructions: [
      'Sit comfortably with your back straight',
      'Exhale completely through your mouth',
      'Inhale through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale through your mouth for 8 counts',
      'Repeat 3-4 times'
    ],
    tags: ['anxiety', 'sleep', 'stress'],
    audioUrl: null,
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'exercise-2',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and relax muscle groups',
    category: 'relaxation',
    duration: 900, // 15 minutes
    difficulty: 'intermediate',
    instructions: [
      'Lie down in a comfortable position',
      'Start with your toes, tense for 5 seconds',
      'Release and notice the relaxation',
      'Move up to your calves, repeat',
      'Continue through each muscle group',
      'End with your face and scalp'
    ],
    tags: ['stress', 'sleep', 'tension'],
    audioUrl: null,
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const demoModeService = {
  isEnabled: isDemoMode,
  getUser: () => demoUser,
  getMoodLogs: () => demoMoodLogs,
  getExercises: () => demoExercises,
  
  // Mock API responses
  mockApiCall: <T>(data: T, delay: number = 500): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }
};
