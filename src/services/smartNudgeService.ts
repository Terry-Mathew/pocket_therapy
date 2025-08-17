/**
 * Smart Nudge Service
 * 
 * Analyzes user patterns and mood data to send contextually
 * appropriate and helpful notifications at optimal times
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodLog, ExerciseSession } from '../types';
import { notificationService } from './notificationService';
import { notificationContentService } from './notificationContentService';

interface UserPattern {
  userId: string;
  moodTrends: {
    averageMood: number;
    moodVariability: number;
    commonLowTimes: string[]; // Hours when mood tends to be low
    commonHighTimes: string[]; // Hours when mood tends to be high
  };
  usagePatterns: {
    mostActiveHours: string[];
    preferredExerciseTypes: string[];
    averageSessionLength: number;
    lastActiveDate: string;
  };
  triggers: {
    commonTriggers: string[];
    triggerTimes: { [trigger: string]: string[] };
  };
  lastAnalyzed: string;
}

interface NudgeContext {
  currentTime: Date;
  dayOfWeek: number;
  timeSinceLastCheckIn: number; // hours
  timeSinceLastExercise: number; // hours
  recentMoodTrend: 'improving' | 'declining' | 'stable';
  isLikelyStressTime: boolean;
}

interface SmartNudge {
  id: string;
  type: 'check_in' | 'exercise' | 'support' | 'celebration';
  priority: 'low' | 'medium' | 'high';
  title: string;
  body: string;
  scheduledFor: Date;
  context: NudgeContext;
  data?: any;
}

const STORAGE_KEYS = {
  USER_PATTERNS: 'user_patterns',
  NUDGE_HISTORY: 'nudge_history',
  NUDGE_PREFERENCES: 'nudge_preferences',
} as const;

class SmartNudgeService {
  private patterns: UserPattern | null = null;
  private isAnalyzing = false;

  /**
   * Analyze user data and update patterns
   */
  async analyzeUserPatterns(
    userId: string,
    moodLogs: MoodLog[],
    exerciseSessions: ExerciseSession[]
  ): Promise<UserPattern> {
    try {
      this.isAnalyzing = true;

      const patterns: UserPattern = {
        userId,
        moodTrends: this.analyzeMoodTrends(moodLogs),
        usagePatterns: this.analyzeUsagePatterns(exerciseSessions),
        triggers: this.analyzeTriggers(moodLogs),
        lastAnalyzed: new Date().toISOString(),
      };

      // Store patterns
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PATTERNS,
        JSON.stringify(patterns)
      );

      this.patterns = patterns;
      console.log('User patterns analyzed and stored');
      return patterns;
    } catch (error) {
      console.error('Failed to analyze user patterns:', error);
      throw error;
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Generate smart nudges based on current context
   */
  async generateSmartNudges(
    userId: string,
    currentMoodLogs: MoodLog[],
    currentSessions: ExerciseSession[]
  ): Promise<SmartNudge[]> {
    try {
      // Load or analyze patterns
      let patterns = await this.getUserPatterns(userId);
      if (!patterns || this.shouldReanalyze(patterns)) {
        patterns = await this.analyzeUserPatterns(userId, currentMoodLogs, currentSessions);
      }

      const context = this.getCurrentContext(currentMoodLogs, currentSessions);
      const nudges: SmartNudge[] = [];

      // Generate different types of nudges based on context
      const checkInNudge = this.generateCheckInNudge(patterns, context);
      if (checkInNudge) nudges.push(checkInNudge);

      const exerciseNudge = this.generateExerciseNudge(patterns, context);
      if (exerciseNudge) nudges.push(exerciseNudge);

      const supportNudge = this.generateSupportNudge(patterns, context);
      if (supportNudge) nudges.push(supportNudge);

      const celebrationNudge = this.generateCelebrationNudge(patterns, context);
      if (celebrationNudge) nudges.push(celebrationNudge);

      // Sort by priority and schedule
      const prioritizedNudges = nudges
        .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority))
        .slice(0, 2); // Limit to 2 nudges to avoid overwhelming

      return prioritizedNudges;
    } catch (error) {
      console.error('Failed to generate smart nudges:', error);
      return [];
    }
  }

  /**
   * Schedule smart nudges
   */
  async scheduleSmartNudges(nudges: SmartNudge[]): Promise<void> {
    try {
      for (const nudge of nudges) {
        const delayMinutes = Math.max(
          0,
          Math.floor((nudge.scheduledFor.getTime() - Date.now()) / (1000 * 60))
        );

        if (delayMinutes > 0 && delayMinutes < 1440) { // Within 24 hours
          // Use contextual notification service for better messaging
          await notificationService.sendContextualNotification(
            nudge.type as any,
            {
              timeOfDay: this.getTimeOfDay(nudge.scheduledFor),
              moodTrend: nudge.context.recentMoodTrend,
            },
            delayMinutes
          );
          console.log(`Scheduled smart nudge: ${nudge.type} in ${delayMinutes} minutes`);
        }
      }

      // Store nudge history
      await this.storeNudgeHistory(nudges);
    } catch (error) {
      console.error('Failed to schedule smart nudges:', error);
    }
  }

  /**
   * Analyze mood trends from historical data
   */
  private analyzeMoodTrends(moodLogs: MoodLog[]): UserPattern['moodTrends'] {
    if (moodLogs.length === 0) {
      return {
        averageMood: 3,
        moodVariability: 0,
        commonLowTimes: [],
        commonHighTimes: [],
      };
    }

    const moods = moodLogs.map(log => log.value);
    const averageMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    
    // Calculate mood variability (standard deviation)
    const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - averageMood, 2), 0) / moods.length;
    const moodVariability = Math.sqrt(variance);

    // Analyze time patterns
    const hourlyMoods: { [hour: string]: number[] } = {};
    moodLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours().toString();
      if (!hourlyMoods[hour]) hourlyMoods[hour] = [];
      hourlyMoods[hour].push(log.value);
    });

    const hourlyAverages = Object.entries(hourlyMoods).map(([hour, moods]) => ({
      hour,
      average: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
    }));

    const sortedByMood = [...hourlyAverages].sort((a, b) => a.average - b.average);
    const commonLowTimes = sortedByMood.slice(0, 3).map(item => item.hour);
    const commonHighTimes = sortedByMood.slice(-3).map(item => item.hour);

    return {
      averageMood,
      moodVariability,
      commonLowTimes,
      commonHighTimes,
    };
  }

  /**
   * Analyze usage patterns from exercise sessions
   */
  private analyzeUsagePatterns(sessions: ExerciseSession[]): UserPattern['usagePatterns'] {
    if (sessions.length === 0) {
      return {
        mostActiveHours: [],
        preferredExerciseTypes: [],
        averageSessionLength: 0,
        lastActiveDate: new Date().toISOString(),
      };
    }

    // Analyze active hours
    const hourCounts: { [hour: string]: number } = {};
    sessions.forEach(session => {
      const hour = new Date(session.startedAt).getHours().toString();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostActiveHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => hour);

    // Analyze preferred exercise types
    const typeCounts: { [type: string]: number } = {};
    sessions.forEach(session => {
      // This would need to be enhanced based on actual exercise data structure
      const type = session.exerciseId.split('-')[0]; // Simple extraction
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const preferredExerciseTypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // Calculate average session length
    const completedSessions = sessions.filter(s => s.completedAt);
    const averageSessionLength = completedSessions.length > 0
      ? completedSessions.reduce((sum, session) => {
          const duration = new Date(session.completedAt!).getTime() - new Date(session.startedAt).getTime();
          return sum + duration;
        }, 0) / completedSessions.length / 1000 // Convert to seconds
      : 0;

    const lastActiveDate = sessions.length > 0
      ? sessions[sessions.length - 1].startedAt
      : new Date().toISOString();

    return {
      mostActiveHours,
      preferredExerciseTypes,
      averageSessionLength,
      lastActiveDate,
    };
  }

  /**
   * Analyze trigger patterns from mood logs
   */
  private analyzeTriggers(moodLogs: MoodLog[]): UserPattern['triggers'] {
    const triggerCounts: { [trigger: string]: number } = {};
    const triggerTimes: { [trigger: string]: string[] } = {};

    moodLogs.forEach(log => {
      if (log.triggers && log.triggers.length > 0) {
        const hour = new Date(log.timestamp).getHours().toString();
        
        log.triggers.forEach(trigger => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
          if (!triggerTimes[trigger]) triggerTimes[trigger] = [];
          triggerTimes[trigger].push(hour);
        });
      }
    });

    const commonTriggers = Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trigger]) => trigger);

    return {
      commonTriggers,
      triggerTimes,
    };
  }

  /**
   * Get current context for nudge generation
   */
  private getCurrentContext(moodLogs: MoodLog[], sessions: ExerciseSession[]): NudgeContext {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Calculate time since last check-in
    const lastMoodLog = moodLogs[moodLogs.length - 1];
    const timeSinceLastCheckIn = lastMoodLog
      ? (now.getTime() - new Date(lastMoodLog.timestamp).getTime()) / (1000 * 60 * 60)
      : 24;

    // Calculate time since last exercise
    const lastSession = sessions[sessions.length - 1];
    const timeSinceLastExercise = lastSession
      ? (now.getTime() - new Date(lastSession.startedAt).getTime()) / (1000 * 60 * 60)
      : 24;

    // Analyze recent mood trend
    const recentMoods = moodLogs.slice(-3).map(log => log.value);
    let recentMoodTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (recentMoods.length >= 2) {
      const trend = recentMoods[recentMoods.length - 1] - recentMoods[0];
      if (trend > 0.5) recentMoodTrend = 'improving';
      else if (trend < -0.5) recentMoodTrend = 'declining';
    }

    // Determine if it's likely a stress time (common stress hours)
    const stressHours = [9, 10, 11, 14, 15, 16, 17, 18]; // Common work stress hours
    const isLikelyStressTime = stressHours.includes(currentHour);

    return {
      currentTime: now,
      dayOfWeek: now.getDay(),
      timeSinceLastCheckIn,
      timeSinceLastExercise,
      recentMoodTrend,
      isLikelyStressTime,
    };
  }

  /**
   * Generate check-in nudge
   */
  private generateCheckInNudge(patterns: UserPattern, context: NudgeContext): SmartNudge | null {
    // Don't nudge if they checked in recently
    if (context.timeSinceLastCheckIn < 6) return null;

    const messages = [
      {
        title: 'Gentle check-in 🌱',
        body: 'How are you feeling right now? A quick check-in can help you stay connected to yourself.',
      },
      {
        title: 'Mindful moment 🧘',
        body: 'Take a moment to notice how you\'re doing. Your awareness is a gift to yourself.',
      },
      {
        title: 'Self-care reminder 💙',
        body: 'It\'s been a while since your last check-in. How are you feeling today?',
      },
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Schedule for optimal time based on patterns
    const scheduledFor = new Date();
    scheduledFor.setMinutes(scheduledFor.getMinutes() + 30); // 30 minutes from now

    return {
      id: `checkin_${Date.now()}`,
      type: 'check_in',
      priority: context.timeSinceLastCheckIn > 12 ? 'medium' : 'low',
      title: message.title,
      body: message.body,
      scheduledFor,
      context,
      data: { screen: 'MoodCheckIn' },
    };
  }

  /**
   * Generate exercise nudge
   */
  private generateExerciseNudge(patterns: UserPattern, context: NudgeContext): SmartNudge | null {
    // Don't nudge if they exercised recently or mood is improving
    if (context.timeSinceLastExercise < 4 || context.recentMoodTrend === 'improving') return null;

    const messages = [
      {
        title: 'Gentle movement 🌸',
        body: 'A short breathing exercise might help you feel more centered right now.',
      },
      {
        title: 'Self-care moment ✨',
        body: 'Consider taking a few minutes for a grounding exercise. You deserve this care.',
      },
      {
        title: 'Mindful pause 🍃',
        body: 'A quick exercise could help you reset and feel more balanced.',
      },
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const scheduledFor = new Date();
    scheduledFor.setMinutes(scheduledFor.getMinutes() + 15);

    return {
      id: `exercise_${Date.now()}`,
      type: 'exercise',
      priority: context.isLikelyStressTime ? 'medium' : 'low',
      title: message.title,
      body: message.body,
      scheduledFor,
      context,
      data: { screen: 'Exercises' },
    };
  }

  /**
   * Generate support nudge for declining mood
   */
  private generateSupportNudge(patterns: UserPattern, context: NudgeContext): SmartNudge | null {
    // Only for declining mood trends
    if (context.recentMoodTrend !== 'declining') return null;

    const messages = [
      {
        title: 'You\'re not alone 💙',
        body: 'It seems like things might be challenging right now. Remember, support is always available.',
      },
      {
        title: 'Gentle reminder 🤗',
        body: 'Difficult feelings are temporary. Consider reaching out or trying a calming exercise.',
      },
      {
        title: 'Self-compassion 🌱',
        body: 'Be gentle with yourself today. You\'re doing the best you can.',
      },
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const scheduledFor = new Date();
    scheduledFor.setMinutes(scheduledFor.getMinutes() + 10); // Sooner for support

    return {
      id: `support_${Date.now()}`,
      type: 'support',
      priority: 'high',
      title: message.title,
      body: message.body,
      scheduledFor,
      context,
      data: { screen: 'Home' },
    };
  }

  /**
   * Generate celebration nudge for improving mood
   */
  private generateCelebrationNudge(patterns: UserPattern, context: NudgeContext): SmartNudge | null {
    // Only for improving mood trends
    if (context.recentMoodTrend !== 'improving') return null;

    const messages = [
      {
        title: 'Beautiful progress 🌟',
        body: 'It looks like you\'re feeling better! That\'s wonderful to see.',
      },
      {
        title: 'Celebrating you ✨',
        body: 'Your mood seems to be improving. That\'s something to acknowledge and appreciate.',
      },
      {
        title: 'Positive momentum 🌈',
        body: 'You\'re taking great care of yourself. Keep up the beautiful work!',
      },
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const scheduledFor = new Date();
    scheduledFor.setMinutes(scheduledFor.getMinutes() + 60); // Later for celebration

    return {
      id: `celebration_${Date.now()}`,
      type: 'celebration',
      priority: 'low',
      title: message.title,
      body: message.body,
      scheduledFor,
      context,
      data: { screen: 'Home' },
    };
  }

  /**
   * Helper methods
   */
  private async getUserPatterns(userId: string): Promise<UserPattern | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PATTERNS);
      if (stored) {
        const patterns = JSON.parse(stored) as UserPattern;
        return patterns.userId === userId ? patterns : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user patterns:', error);
      return null;
    }
  }

  private shouldReanalyze(patterns: UserPattern): boolean {
    const lastAnalyzed = new Date(patterns.lastAnalyzed);
    const daysSince = (Date.now() - lastAnalyzed.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7; // Reanalyze weekly
  }

  private getPriorityScore(priority: SmartNudge['priority']): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private async storeNudgeHistory(nudges: SmartNudge[]): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.NUDGE_HISTORY);
      const history = existing ? JSON.parse(existing) : [];

      const newHistory = [...history, ...nudges].slice(-50); // Keep last 50

      await AsyncStorage.setItem(STORAGE_KEYS.NUDGE_HISTORY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to store nudge history:', error);
    }
  }

  private getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }
}

export const smartNudgeService = new SmartNudgeService();
