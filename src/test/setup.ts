/**
 * Test Setup Configuration
 * 
 * Global test setup for PocketTherapy including mocks,
 * utilities, and configuration for mental health app testing
 */

import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      },
    },
  },
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  setNotificationHandler: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://test-documents/',
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('test-content')),
  deleteAsync: jest.fn(() => Promise.resolve()),
  EncodingType: {
    UTF8: 'utf8',
  },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({
    type: 'success',
    uri: 'file://test-document.json',
    name: 'test-document.json',
  })),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  })),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([{
    country: 'United States',
    region: 'California',
  }])),
  Accuracy: {
    Low: 1,
    Balanced: 2,
    High: 3,
  },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock Supabase
jest.mock('../services/api/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signUp: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithOtp: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      verifyOtp: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      then: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(() => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                insights: ['Test insight'],
                recommendations: ['Test recommendation'],
                trends: ['Test trend'],
              }),
            },
          }],
          usage: {
            total_tokens: 100,
          },
        })),
      },
    },
  })),
}));

// Mock React Native Haptic Feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  HapticFeedbackTypes: {
    impactLight: 'impactLight',
    impactMedium: 'impactMedium',
    impactHeavy: 'impactHeavy',
    notificationSuccess: 'notificationSuccess',
    notificationWarning: 'notificationWarning',
    notificationError: 'notificationError',
  },
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
}));

// Mock Share
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve()),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

// Mock Date for consistent testing
const mockDate = new Date('2024-01-01T12:00:00.000Z');
global.Date = jest.fn(() => mockDate) as any;
global.Date.UTC = Date.UTC;
global.Date.parse = Date.parse;
global.Date.now = jest.fn(() => mockDate.getTime());

// Mock Math.random for consistent testing
global.Math.random = jest.fn(() => 0.5);

// Increase timeout for async operations
jest.setTimeout(10000);

// Custom matchers for mental health app testing
expect.extend({
  toBeValidMoodValue(received) {
    const pass = typeof received === 'number' && received >= 1 && received <= 5;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid mood value (1-5)`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid mood value (1-5)`,
        pass: false,
      };
    }
  },
  
  toBeValidExerciseDuration(received) {
    const pass = typeof received === 'number' && received > 0 && received <= 1800; // Max 30 minutes
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid exercise duration`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid exercise duration (1-1800 seconds)`,
        pass: false,
      };
    }
  },
  
  toHaveTherapeuticLanguage(received) {
    const therapeuticWords = ['gentle', 'kind', 'support', 'care', 'safe', 'comfort', 'peace'];
    const harmfulWords = ['should', 'must', 'wrong', 'bad', 'failure', 'broken'];
    
    const hasTherapeutic = therapeuticWords.some(word => 
      received.toLowerCase().includes(word)
    );
    const hasHarmful = harmfulWords.some(word => 
      received.toLowerCase().includes(word)
    );
    
    const pass = hasTherapeutic && !hasHarmful;
    
    if (pass) {
      return {
        message: () => `expected "${received}" not to have therapeutic language`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${received}" to have therapeutic language (gentle, supportive) and avoid harmful language`,
        pass: false,
      };
    }
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidMoodValue(): R;
      toBeValidExerciseDuration(): R;
      toHaveTherapeuticLanguage(): R;
    }
  }
}
