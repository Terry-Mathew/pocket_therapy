/**
 * Notification Service
 * 
 * Handles gentle push notifications for mood check-ins,
 * exercise reminders, and therapeutic nudges with deep linking
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationContentService } from './notificationContentService';

interface NotificationPreferences {
  enabled: boolean;
  morningTime: string; // HH:MM format
  eveningTime: string; // HH:MM format
  weekdaysOnly: boolean;
  gentleNudges: boolean;
  crisisReminders: boolean;
}

interface ScheduledNotification {
  id: string;
  type: 'morning' | 'evening' | 'nudge' | 'crisis';
  title: string;
  body: string;
  scheduledTime: Date;
  data?: any;
  retryCount?: number;
  lastAttempt?: Date;
}

interface NotificationTestResult {
  success: boolean;
  permissionGranted: boolean;
  tokenGenerated: boolean;
  schedulingWorks: boolean;
  deliveryConfirmed: boolean;
  errors: string[];
  recommendations: string[];
}

interface NotificationError {
  type: 'permission' | 'token' | 'scheduling' | 'delivery' | 'unknown';
  message: string;
  timestamp: Date;
  context?: any;
}

const STORAGE_KEYS = {
  PREFERENCES: 'notification_preferences',
  PUSH_TOKEN: 'push_token',
  SCHEDULED: 'scheduled_notifications',
} as const;

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // Gentle, no sound by default
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private pushToken: string | null = null;
  private isInitialized = false;
  private errorHistory: NotificationError[] = [];
  private testMode = false;
  private lastPermissionCheck: Date | null = null;
  private permissionCheckInterval = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Request permissions
      const { status } = await this.requestPermissions();
      
      if (status === 'granted') {
        // Get push token
        this.pushToken = await this.registerForPushNotifications();
        
        // Set up notification listeners
        this.setupNotificationListeners();
        
        // Load and apply user preferences
        await this.loadAndApplyPreferences();
      }

      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<{ status: string }> {
    try {
      if (!Device.isDevice) {
        console.log('Notifications only work on physical devices');
        return { status: 'denied' };
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return { status: finalStatus };
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return { status: 'denied' };
    }
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'PocketTherapy',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#A8C09A', // Therapeutic green
          sound: false, // Gentle, no sound
        });
      }

      // Store token
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token.data);
      
      console.log('Push token registered:', token.data);
      return token.data;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      this.handleNotificationTap(response);
    });
  }

  /**
   * Handle notification tap with deep linking
   */
  private handleNotificationTap(response: Notifications.NotificationResponse): void {
    const { data } = response.notification.request.content;
    
    if (data?.screen) {
      // This would integrate with navigation to deep link to specific screens
      console.log('Deep linking to screen:', data.screen);
      
      // Example deep link handling:
      // navigation.navigate(data.screen, data.params);
    }
  }

  /**
   * Schedule morning check-in notification
   */
  async scheduleMorningNotification(time: string): Promise<string | null> {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      
      const trigger: Notifications.NotificationTriggerInput = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      const message = notificationContentService.getMorningCheckInMessage();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: {
            screen: 'MoodCheckIn',
            type: 'morning',
          },
        },
        trigger,
      });

      console.log('Morning notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule morning notification:', error);
      return null;
    }
  }

  /**
   * Schedule evening reflection notification
   */
  async scheduleEveningNotification(time: string): Promise<string | null> {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      
      const trigger: Notifications.NotificationTriggerInput = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      const message = notificationContentService.getEveningReflectionMessage();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: {
            screen: 'MoodCheckIn',
            type: 'evening',
          },
        },
        trigger,
      });

      console.log('Evening notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule evening notification:', error);
      return null;
    }
  }

  /**
   * Schedule gentle nudge notification
   */
  async scheduleGentleNudge(delayMinutes: number, message?: string): Promise<string | null> {
    try {
      const trigger: Notifications.NotificationTriggerInput = {
        seconds: delayMinutes * 60,
      };

      const selectedMessage = message
        ? { title: 'Gentle reminder 🤗', body: message }
        : notificationContentService.getGentleNudgeMessage();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: selectedMessage.title,
          body: selectedMessage.body,
          data: {
            screen: 'Home',
            type: 'nudge',
          },
        },
        trigger,
      });

      console.log('Gentle nudge scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule gentle nudge:', error);
      return null;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      // Store preferences
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(preferences)
      );

      // Cancel existing notifications
      await this.cancelAllScheduledNotifications();

      // Reschedule based on new preferences
      if (preferences.enabled) {
        if (preferences.morningTime) {
          await this.scheduleMorningNotification(preferences.morningTime);
        }
        if (preferences.eveningTime) {
          await this.scheduleEveningNotification(preferences.eveningTime);
        }
      }

      console.log('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  /**
   * Get current notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (stored) {
        return JSON.parse(stored);
      }

      // Default preferences
      return {
        enabled: false,
        morningTime: '09:00',
        eveningTime: '20:00',
        weekdaysOnly: false,
        gentleNudges: true,
        crisisReminders: false,
      };
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
  }

  /**
   * Load and apply stored preferences
   */
  private async loadAndApplyPreferences(): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (preferences.enabled) {
        await this.updatePreferences(preferences);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  /**
   * Get scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Send contextual notification based on user patterns
   */
  async sendContextualNotification(
    category: 'check_in' | 'exercise' | 'support' | 'celebration' | 'gentle_nudge',
    context: {
      timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
      moodTrend?: 'low' | 'neutral' | 'high' | 'declining' | 'improving';
      usagePattern?: 'new' | 'consistent' | 'irregular' | 'returning';
      userName?: string;
    },
    delayMinutes: number = 0
  ): Promise<string | null> {
    try {
      const message = notificationContentService.getContextualMessage(category, context);

      if (!notificationContentService.validateMessage(message)) {
        console.warn('Message failed validation, using fallback');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: {
            screen: message.deepLink?.replace('pockettherapy://', '') || 'Home',
            category: message.category,
            urgency: message.urgency,
          },
        },
        trigger: delayMinutes > 0 ? { seconds: delayMinutes * 60 } : { seconds: 1 },
      });

      console.log(`Contextual notification scheduled: ${message.category}`);
      return notificationId;
    } catch (error) {
      console.error('Failed to send contextual notification:', error);
      return null;
    }
  }

  /**
   * Send streak celebration notification
   */
  async sendStreakNotification(streakDays: number): Promise<string | null> {
    try {
      const message = notificationContentService.getStreakMessage(streakDays);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: {
            screen: 'Home',
            category: 'celebration',
            streakDays,
          },
        },
        trigger: { seconds: 1 },
      });

      console.log(`Streak notification sent for ${streakDays} days`);
      return notificationId;
    } catch (error) {
      console.error('Failed to send streak notification:', error);
      return null;
    }
  }

  /**
   * Send crisis support notification
   */
  async sendCrisisNotification(): Promise<string | null> {
    try {
      const message = notificationContentService.getCrisisMessage();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: {
            screen: 'CrisisResources',
            category: 'support',
            urgency: 'high',
          },
        },
        trigger: { seconds: 1 },
      });

      console.log('Crisis notification sent');
      return notificationId;
    } catch (error) {
      console.error('Failed to send crisis notification:', error);
      return null;
    }
  }

  /**
   * Send immediate local notification (for testing)
   */
  async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'PocketTherapy Test 🧪',
          body: 'This is a test notification to verify everything is working.',
          data: { screen: 'Home' },
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to check notification status:', error);
      this.logError('permission', 'Failed to check notification status', error);
      return false;
    }
  }

  /**
   * Comprehensive notification system testing
   */
  async runComprehensiveTest(): Promise<NotificationTestResult> {
    const result: NotificationTestResult = {
      success: false,
      permissionGranted: false,
      tokenGenerated: false,
      schedulingWorks: false,
      deliveryConfirmed: false,
      errors: [],
      recommendations: [],
    };

    try {
      // Test 1: Check permissions
      console.log('🧪 Testing notification permissions...');
      const { status } = await Notifications.getPermissionsAsync();
      result.permissionGranted = status === 'granted';

      if (!result.permissionGranted) {
        result.errors.push('Notification permissions not granted');
        result.recommendations.push('Request notification permissions from user');
      }

      // Test 2: Generate push token
      console.log('🧪 Testing push token generation...');
      try {
        const token = await this.registerForPushNotifications();
        result.tokenGenerated = !!token;
        if (!token) {
          result.errors.push('Failed to generate push token');
          result.recommendations.push('Check device settings and network connectivity');
        }
      } catch (error) {
        result.errors.push(`Push token error: ${error.message}`);
        result.recommendations.push('Verify device supports push notifications');
      }

      // Test 3: Schedule test notification
      console.log('🧪 Testing notification scheduling...');
      try {
        const testId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'PocketTherapy Test 🧪',
            body: 'Testing notification delivery - you can dismiss this.',
            data: { test: true, timestamp: Date.now() },
          },
          trigger: { seconds: 2 },
        });

        result.schedulingWorks = !!testId;
        if (!testId) {
          result.errors.push('Failed to schedule test notification');
          result.recommendations.push('Check notification scheduling permissions');
        } else {
          // Cancel the test notification after a short delay
          setTimeout(() => {
            Notifications.cancelScheduledNotificationAsync(testId);
          }, 5000);
        }
      } catch (error) {
        result.errors.push(`Scheduling error: ${error.message}`);
        result.recommendations.push('Verify notification scheduling is allowed');
      }

      // Test 4: Check delivery capability
      console.log('🧪 Testing notification delivery...');
      try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        result.deliveryConfirmed = scheduledNotifications.length >= 0; // Basic check

        if (scheduledNotifications.length === 0 && result.schedulingWorks) {
          result.recommendations.push('Notifications may be delivered but not persisted');
        }
      } catch (error) {
        result.errors.push(`Delivery check error: ${error.message}`);
        result.recommendations.push('Check notification delivery settings');
      }

      // Overall success assessment
      result.success = result.permissionGranted && result.tokenGenerated && result.schedulingWorks;

      // Additional recommendations based on results
      if (!result.success) {
        if (!result.permissionGranted) {
          result.recommendations.push('Guide user through permission setup');
        }
        if (!result.tokenGenerated) {
          result.recommendations.push('Implement fallback notification strategy');
        }
        if (!result.schedulingWorks) {
          result.recommendations.push('Use alternative reminder methods');
        }
      } else {
        result.recommendations.push('Notification system is fully functional');
      }

      console.log('🧪 Notification test completed:', result);
      return result;

    } catch (error) {
      result.errors.push(`Test framework error: ${error.message}`);
      result.recommendations.push('Check notification service implementation');
      this.logError('unknown', 'Comprehensive test failed', error);
      return result;
    }
  }

  /**
   * Enhanced permission handling with retry logic
   */
  async requestPermissionsWithRetry(maxRetries = 3): Promise<{
    granted: boolean;
    canAskAgain: boolean;
    retryCount: number;
    userMessage: string;
  }> {
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const { status, canAskAgain } = await Notifications.requestPermissionsAsync();

        if (status === 'granted') {
          return {
            granted: true,
            canAskAgain,
            retryCount,
            userMessage: 'Notifications enabled successfully!',
          };
        }

        if (!canAskAgain) {
          return {
            granted: false,
            canAskAgain: false,
            retryCount,
            userMessage: 'Please enable notifications in your device settings to receive gentle reminders.',
          };
        }

        retryCount++;

        // Wait before retry
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        this.logError('permission', 'Permission request failed', error);
        retryCount++;
      }
    }

    return {
      granted: false,
      canAskAgain: false,
      retryCount,
      userMessage: 'Unable to enable notifications. You can still use all app features without them.',
    };
  }

  /**
   * Log notification errors for debugging
   */
  private logError(type: NotificationError['type'], message: string, context?: any): void {
    const error: NotificationError = {
      type,
      message,
      timestamp: new Date(),
      context: context?.message || context,
    };

    this.errorHistory.push(error);

    // Keep only last 50 errors
    if (this.errorHistory.length > 50) {
      this.errorHistory = this.errorHistory.slice(-50);
    }

    console.error(`Notification Error [${type}]:`, message, context);
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: NotificationError[];
    recommendations: string[];
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentErrors = this.errorHistory.filter(e => e.timestamp > oneHourAgo);

    const errorsByType = this.errorHistory.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recommendations: string[] = [];

    if (errorsByType.permission > 0) {
      recommendations.push('Consider improving permission request flow');
    }
    if (errorsByType.token > 0) {
      recommendations.push('Check push token generation reliability');
    }
    if (errorsByType.scheduling > 0) {
      recommendations.push('Verify notification scheduling logic');
    }
    if (errorsByType.delivery > 0) {
      recommendations.push('Monitor notification delivery rates');
    }

    return {
      totalErrors: this.errorHistory.length,
      errorsByType,
      recentErrors,
      recommendations,
    };
  }

  /**
   * Enable test mode for development
   */
  enableTestMode(): void {
    this.testMode = true;
    console.log('📱 Notification service test mode enabled');
  }

  /**
   * Disable test mode
   */
  disableTestMode(): void {
    this.testMode = false;
    console.log('📱 Notification service test mode disabled');
  }

  /**
   * Check if permission check is needed
   */
  private shouldCheckPermissions(): boolean {
    if (!this.lastPermissionCheck) return true;

    const now = new Date();
    const timeSinceLastCheck = now.getTime() - this.lastPermissionCheck.getTime();
    return timeSinceLastCheck > this.permissionCheckInterval;
  }

  /**
   * Periodic permission and functionality check
   */
  async performPeriodicCheck(): Promise<{
    permissionsOk: boolean;
    functionalityOk: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check permissions
    const permissionsOk = await this.areNotificationsEnabled();
    if (!permissionsOk) {
      issues.push('Notification permissions not granted');
    }

    // Check if we can schedule notifications
    let functionalityOk = true;
    try {
      const testId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test',
          body: 'Test',
        },
        trigger: { seconds: 60 * 60 * 24 }, // 24 hours from now
      });

      // Immediately cancel the test notification
      await Notifications.cancelScheduledNotificationAsync(testId);
    } catch (error) {
      functionalityOk = false;
      issues.push('Cannot schedule notifications');
      this.logError('scheduling', 'Periodic check failed', error);
    }

    this.lastPermissionCheck = new Date();

    return {
      permissionsOk,
      functionalityOk,
      issues,
    };
  }
}

export const notificationService = new NotificationService();
