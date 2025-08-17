/**
 * Services Barrel Export
 *
 * This file exports all services for easy importing throughout the app.
 * Usage: import { supabaseClient, storageService, notificationService } from '@services';
 */

// API Services
export { default as supabaseClient, supabase } from './api/supabaseClient';
export { default as authService } from './api/authService';
// export { default as moodService } from './api/moodService';
// export { default as exerciseService } from './api/exerciseService';
// export { default as userService } from './api/userService';

// Storage Services
// export { default as storageService } from './storage/storageService';
// export { default as moodStorage } from './storage/moodStorage';
// export { default as exerciseStorage } from './storage/exerciseStorage';
// export { default as userStorage } from './storage/userStorage';
// export { default as syncQueue } from './storage/syncQueue';

// Notification Services
// export { default as notificationService } from './notifications/notificationService';
// export { default as reminderService } from './notifications/reminderService';
// export { default as pushNotificationService } from './notifications/pushNotificationService';

// AI Services
// export { default as openAIService } from './ai/openAIService';
// export { default as recommendationService } from './ai/recommendationService';
// export { default as patternAnalysisService } from './ai/patternAnalysisService';

// Analytics Services
// export { default as analyticsService } from './analytics/analyticsService';
// export { default as moodAnalytics } from './analytics/moodAnalytics';
// export { default as usageAnalytics } from './analytics/usageAnalytics';

// Demo Mode Service
export { demoModeService } from './demoMode';

// App Initialization
export const initializeApp = async () => {
  try {
    // Initialize core services
    console.log('🚀 Initializing PocketTherapy...');

    // Check if we're in demo mode
    const { demoModeService } = await import('./demoMode');
    if (demoModeService.isEnabled()) {
      console.log('🎭 Running in demo mode - using mock data');
    }

    // TODO: Initialize notification service
    // await notificationService.initialize();

    // TODO: Initialize storage services
    // await storageService.initialize();

    // TODO: Initialize analytics
    // await analyticsService.initialize();

    console.log('✅ PocketTherapy initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize PocketTherapy:', error);
    // Don't throw in demo mode to allow app to continue
    if (process.env.EXPO_PUBLIC_APP_ENV !== 'development') {
      throw error;
    }
  }
};

// Note: Services are commented out until they are created
// Uncomment each export as you implement the corresponding service
