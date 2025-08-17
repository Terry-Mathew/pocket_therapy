/**
 * Test Utilities
 * 
 * Common testing utilities and helpers for PocketTherapy
 * including mock data, render helpers, and test scenarios
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { MoodLog, ExerciseSession, UserProfile } from '../types';

// Mock Navigation Provider
const MockNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NavigationContainer>
    {children}
  </NavigationContainer>
);

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: MockNavigationProvider,
    ...options,
  });
};

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render };

// Mock Data Generators
export const createMockMoodLog = (overrides?: Partial<MoodLog>): MoodLog => ({
  id: 'mood-log-1',
  userId: 'user-1',
  value: 3,
  timestamp: '2024-01-01T12:00:00.000Z',
  notes: 'Feeling okay today',
  triggers: ['work', 'stress'],
  createdAt: '2024-01-01T12:00:00.000Z',
  updatedAt: '2024-01-01T12:00:00.000Z',
  ...overrides,
});

export const createMockExerciseSession = (overrides?: Partial<ExerciseSession>): ExerciseSession => ({
  id: 'session-1',
  userId: 'user-1',
  exerciseId: 'breathing-001',
  startedAt: '2024-01-01T12:00:00.000Z',
  completedAt: '2024-01-01T12:05:00.000Z',
  duration: 300,
  helpfulnessRating: 4,
  notes: 'Very calming exercise',
  context: {
    mood: 3,
    timeOfDay: 'afternoon',
    location: 'home',
  },
  createdAt: '2024-01-01T12:05:00.000Z',
  updatedAt: '2024-01-01T12:05:00.000Z',
  ...overrides,
});

export const createMockUserProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: 'user-1',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  profile: {
    timezone: 'America/New_York',
    onboardingCompleted: true,
    preferences: {
      notifications: true,
      haptics: true,
      audio: false,
    },
    goals: ['reduce-anxiety', 'improve-sleep'],
    triggers: ['work', 'social'],
  },
  ...overrides,
});

export const createMockGuestUser = () => ({
  id: 'guest-user',
  isGuest: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  profile: {
    timezone: 'America/New_York',
    onboardingCompleted: false,
    preferences: {
      notifications: false,
      haptics: true,
      audio: false,
    },
  },
});

// Mock Store State
export const createMockStoreState = (overrides?: any) => ({
  auth: {
    isAuthenticated: false,
    isLoading: false,
    session: null,
  },
  user: null,
  mood: {
    logs: [],
    currentMood: null,
    lastCheckIn: null,
  },
  exercises: {
    library: [],
    completions: [],
    currentSession: null,
    recommendations: [],
    offlineExercises: [],
  },
  settings: {
    notifications: {
      enabled: true,
      morningTime: '09:00',
      eveningTime: '20:00',
    },
    privacy: {
      localOnly: false,
      dataRetention: 90,
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
    },
  },
  sync: {
    queue: [],
    lastSync: null,
    isOnline: true,
  },
  system: {
    isLoading: false,
    error: null,
    lastActivity: null,
  },
  ...overrides,
});

// Test Scenarios
export const testScenarios = {
  // User scenarios
  newUser: {
    user: null,
    mood: { logs: [], currentMood: null, lastCheckIn: null },
    exercises: { library: [], completions: [], currentSession: null, recommendations: [], offlineExercises: [] },
  },
  
  activeUser: {
    user: createMockUserProfile(),
    mood: {
      logs: [
        createMockMoodLog({ value: 4, timestamp: '2024-01-01T09:00:00.000Z' }),
        createMockMoodLog({ value: 3, timestamp: '2024-01-01T18:00:00.000Z' }),
      ],
      currentMood: 3,
      lastCheckIn: '2024-01-01T18:00:00.000Z',
    },
    exercises: {
      library: [],
      completions: [
        createMockExerciseSession({ exerciseId: 'breathing-001', helpfulnessRating: 5 }),
        createMockExerciseSession({ exerciseId: 'grounding-001', helpfulnessRating: 4 }),
      ],
      currentSession: null,
      recommendations: [],
      offlineExercises: [],
    },
  },
  
  guestUser: {
    user: createMockGuestUser(),
    mood: { logs: [], currentMood: null, lastCheckIn: null },
    exercises: { library: [], completions: [], currentSession: null, recommendations: [], offlineExercises: [] },
  },
  
  // Crisis scenarios
  crisisUser: {
    user: createMockUserProfile(),
    mood: {
      logs: [
        createMockMoodLog({ value: 1, timestamp: '2024-01-01T12:00:00.000Z', notes: 'Feeling very low' }),
      ],
      currentMood: 1,
      lastCheckIn: '2024-01-01T12:00:00.000Z',
    },
    exercises: { library: [], completions: [], currentSession: null, recommendations: [], offlineExercises: [] },
  },
  
  // Offline scenarios
  offlineUser: {
    user: createMockUserProfile(),
    sync: {
      queue: [
        { type: 'mood_log', data: createMockMoodLog(), timestamp: '2024-01-01T12:00:00.000Z' },
      ],
      lastSync: '2024-01-01T10:00:00.000Z',
      isOnline: false,
    },
  },
};

// Helper functions
export const waitForLoadingToFinish = async () => {
  // Wait for any loading states to complete
  await new Promise(resolve => setTimeout(resolve, 100));
};

export const mockAsyncStorageData = async (data: Record<string, any>) => {
  const mockAsyncStorage = await import('@react-native-async-storage/async-storage');
  Object.keys(data).forEach(key => {
    mockAsyncStorage.default.getItem.mockImplementation((storageKey: string) => {
      if (storageKey === key) {
        return Promise.resolve(JSON.stringify(data[key]));
      }
      return Promise.resolve(null);
    });
  });
};

export const mockSupabaseResponse = async (data: any, error: any = null) => {
  const { supabase } = await import('../services/api/supabaseClient');
  supabase.from.mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: jest.fn(() => Promise.resolve({ data, error })),
  });
};

export const mockNotificationPermissions = async (status: 'granted' | 'denied' = 'granted') => {
  const notifications = await import('expo-notifications');
  notifications.default.getPermissionsAsync.mockResolvedValue({ status });
  notifications.default.requestPermissionsAsync.mockResolvedValue({ status });
};

export const mockLocationPermissions = async (status: 'granted' | 'denied' = 'granted') => {
  const location = await import('expo-location');
  location.default.requestForegroundPermissionsAsync.mockResolvedValue({ status });
};

// Assertion helpers
export const expectTherapeuticLanguage = (text: string) => {
  expect(text).toHaveTherapeuticLanguage();
};

export const expectValidMoodValue = (value: number) => {
  expect(value).toBeValidMoodValue();
};

export const expectValidExerciseDuration = (duration: number) => {
  expect(duration).toBeValidExerciseDuration();
};

// Component test helpers
export const findByTestId = (component: any, testId: string) => {
  return component.getByTestId(testId);
};

export const findByText = (component: any, text: string) => {
  return component.getByText(text);
};

export const findByRole = (component: any, role: string) => {
  return component.getByRole(role);
};

// Accessibility test helpers
export const expectAccessibleButton = (element: any) => {
  expect(element).toHaveProp('accessibilityRole', 'button');
  expect(element).toHaveProp('accessibilityLabel');
};

export const expectAccessibleText = (element: any) => {
  expect(element).toHaveProp('accessibilityRole', 'text');
};

// Performance test helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await waitForLoadingToFinish();
  const end = performance.now();
  return end - start;
};

// Mock timers helpers
export const advanceTimersByTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

export const runAllTimers = () => {
  jest.runAllTimers();
};

export const useFakeTimers = () => {
  jest.useFakeTimers();
};

export const useRealTimers = () => {
  jest.useRealTimers();
};
