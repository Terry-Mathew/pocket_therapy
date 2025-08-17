/**
 * Notification Content Service
 *
 * Provides therapeutic notification messages with gentle language,
 * contextual awareness, and actionable prompts for mental wellness
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  notificationTemplates,
  NotificationTemplate,
  getRandomTemplate,
  getAppropriateNotification
} from '../data/notificationTemplates';

interface NotificationMessage {
  title: string;
  body: string;
  category: 'check_in' | 'exercise' | 'support' | 'celebration' | 'gentle_nudge';
  timeContext?: 'morning' | 'afternoon' | 'evening' | 'night';
  moodContext?: 'low' | 'neutral' | 'high' | 'declining' | 'improving';
  urgency: 'low' | 'medium' | 'high';
  actionable: boolean;
  deepLink?: string;
}

interface MessageTemplate {
  id: string;
  template: string;
  variables: string[];
  category: NotificationMessage['category'];
  contexts: {
    time?: string[];
    mood?: string[];
    usage?: string[];
  };
}

class NotificationContentService {
  private readonly LAST_NOTIFICATION_KEY = 'last_notification_sent';
  private readonly NOTIFICATION_HISTORY_KEY = 'notification_history';

  /**
   * Get contextually appropriate notification message using templates
   */
  async getContextualMessage(context: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    userMood?: number; // 1-5 scale
    lastActivity?: Date;
    streakDays?: number;
    isFirstTime?: boolean;
    hoursInactive?: number;
  }): Promise<NotificationMessage> {
    try {
      const { timeOfDay, userMood, lastActivity, streakDays, isFirstTime, hoursInactive } = context;

      // Avoid duplicate messages
      const recentMessages = await this.getRecentNotifications();

      // Convert timeOfDay to template format
      const templateTimeOfDay = timeOfDay === 'night' ? 'evening' : timeOfDay;

      // Get appropriate template
      const template = getAppropriateNotification({
        currentMood: userMood,
        timeOfDay: templateTimeOfDay,
        lastActivity: lastActivity ? 'none' : undefined,
        streakDays,
        hoursInactive,
      });

      if (template) {
        // Check if we've sent this template recently
        const wasRecentlySent = recentMessages.some(msg =>
          msg.title === template.title && msg.body === template.body
        );

        if (!wasRecentlySent) {
          const message = this.templateToMessage(template, timeOfDay);
          await this.logNotification(message);
          return message;
        }
      }

      // Fallback to random template if recent duplicate
      const fallbackTemplate = getRandomTemplate(undefined, {
        timeOfDay: templateTimeOfDay,
        mood: userMood && userMood <= 2 ? 'low' : userMood && userMood >= 4 ? 'high' : 'neutral'
      });

      if (fallbackTemplate) {
        const message = this.templateToMessage(fallbackTemplate, timeOfDay);
        await this.logNotification(message);
        return message;
      }

      // Final fallback
      return this.getFallbackMessage();
    } catch (error) {
      console.error('Failed to get contextual message:', error);
      return this.getFallbackMessage();
    }
  }

  /**
   * Convert template to notification message format
   */
  private templateToMessage(template: NotificationTemplate, timeOfDay: string): NotificationMessage {
    // Map template types to message categories
    const categoryMap: Record<NotificationTemplate['type'], NotificationMessage['category']> = {
      'morning': 'check_in',
      'evening': 'check_in',
      'check-in': 'check_in',
      'encouragement': 'support',
      'streak': 'celebration',
      'exercise': 'exercise',
      'crisis-support': 'support'
    };

    // Map template priority to urgency
    const urgencyMap: Record<NotificationTemplate['priority'], NotificationMessage['urgency']> = {
      'low': 'low',
      'normal': 'medium',
      'high': 'high'
    };

    return {
      title: template.title,
      body: template.body,
      category: categoryMap[template.type] || 'gentle_nudge',
      timeContext: timeOfDay as any,
      urgency: urgencyMap[template.priority],
      actionable: template.actionable,
      deepLink: template.deepLink
    };
  }

  private messageTemplates: MessageTemplate[] = [
    // Morning Check-in Messages
    {
      id: 'morning_checkin_1',
      template: 'Good morning ☀️ How are you feeling today? A quick check-in can help set a positive tone.',
      variables: [],
      category: 'check_in',
      contexts: { time: ['morning'] },
    },
    {
      id: 'morning_checkin_2',
      template: 'Morning check-in 🌱 Take a moment to notice how you\'re feeling. Your awareness matters.',
      variables: [],
      category: 'check_in',
      contexts: { time: ['morning'] },
    },
    {
      id: 'morning_checkin_3',
      template: 'Start your day mindfully 🧘 A gentle mood check-in can help you understand your emotional landscape.',
      variables: [],
      category: 'check_in',
      contexts: { time: ['morning'] },
    },

    // Evening Reflection Messages
    {
      id: 'evening_checkin_1',
      template: 'Evening reflection 🌙 How did your day go? A gentle check-in can help you unwind.',
      variables: [],
      category: 'check_in',
      contexts: { time: ['evening'] },
    },
    {
      id: 'evening_checkin_2',
      template: 'Time to pause 🕯️ Take a moment to reflect on your day and how you\'re feeling.',
      variables: [],
      category: 'check_in',
      contexts: { time: ['evening'] },
    },
    {
      id: 'evening_checkin_3',
      template: 'Gentle evening check-in ✨ Your feelings throughout the day matter. How are you doing?',
      variables: [],
      category: 'check_in',
      contexts: { time: ['evening'] },
    },

    // Exercise Suggestions
    {
      id: 'exercise_breathing_1',
      template: 'Gentle movement 🌸 A short breathing exercise might help you feel more centered right now.',
      variables: [],
      category: 'exercise',
      contexts: { mood: ['low', 'declining'] },
    },
    {
      id: 'exercise_grounding_1',
      template: 'Mindful pause 🍃 Consider trying a grounding exercise to help you feel more present.',
      variables: [],
      category: 'exercise',
      contexts: { mood: ['low', 'neutral'] },
    },
    {
      id: 'exercise_general_1',
      template: 'Self-care moment ✨ A quick exercise could help you reset and feel more balanced.',
      variables: [],
      category: 'exercise',
      contexts: { time: ['afternoon'], mood: ['neutral'] },
    },

    // Support Messages
    {
      id: 'support_declining_1',
      template: 'You\'re not alone 💙 It seems like things might be challenging right now. Support is always available.',
      variables: [],
      category: 'support',
      contexts: { mood: ['low', 'declining'] },
    },
    {
      id: 'support_gentle_1',
      template: 'Gentle reminder 🤗 Difficult feelings are temporary. Consider reaching out or trying a calming exercise.',
      variables: [],
      category: 'support',
      contexts: { mood: ['low'] },
    },
    {
      id: 'support_compassion_1',
      template: 'Self-compassion 🌱 Be gentle with yourself today. You\'re doing the best you can.',
      variables: [],
      category: 'support',
      contexts: { mood: ['low', 'declining'] },
    },

    // Celebration Messages
    {
      id: 'celebration_progress_1',
      template: 'Beautiful progress 🌟 It looks like you\'re feeling better! That\'s wonderful to see.',
      variables: [],
      category: 'celebration',
      contexts: { mood: ['high', 'improving'] },
    },
    {
      id: 'celebration_momentum_1',
      template: 'Positive momentum 🌈 You\'re taking great care of yourself. Keep up the beautiful work!',
      variables: [],
      category: 'celebration',
      contexts: { mood: ['improving'] },
    },
    {
      id: 'celebration_streak_1',
      template: 'Amazing consistency! 🎉 You\'ve been checking in regularly. Your self-awareness is growing.',
      variables: [],
      category: 'celebration',
      contexts: { usage: ['consistent'] },
    },

    // Gentle Nudges
    {
      id: 'nudge_reminder_1',
      template: 'Gentle reminder 🤗 Remember to be kind to yourself today.',
      variables: [],
      category: 'gentle_nudge',
      contexts: {},
    },
    {
      id: 'nudge_care_1',
      template: 'You matter 💙 Taking care of your mental health is important.',
      variables: [],
      category: 'gentle_nudge',
      contexts: {},
    },
    {
      id: 'nudge_breath_1',
      template: 'Mindful moment 🌸 Consider taking a few deep breaths when you can.',
      variables: [],
      category: 'gentle_nudge',
      contexts: {},
    },
  ];

  /**
   * Get contextual notification message
   */
  getContextualMessage(
    category: NotificationMessage['category'],
    context: {
      timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
      moodTrend?: 'low' | 'neutral' | 'high' | 'declining' | 'improving';
      usagePattern?: 'new' | 'consistent' | 'irregular' | 'returning';
      userName?: string;
    }
  ): NotificationMessage {
    // Filter templates by category and context
    const relevantTemplates = this.messageTemplates.filter(template => {
      if (template.category !== category) return false;

      // Check time context
      if (context.timeOfDay && template.contexts.time) {
        if (!template.contexts.time.includes(context.timeOfDay)) return false;
      }

      // Check mood context
      if (context.moodTrend && template.contexts.mood) {
        if (!template.contexts.mood.includes(context.moodTrend)) return false;
      }

      // Check usage context
      if (context.usagePattern && template.contexts.usage) {
        if (!template.contexts.usage.includes(context.usagePattern)) return false;
      }

      return true;
    });

    // Fallback to category-only templates if no contextual match
    const templates = relevantTemplates.length > 0 
      ? relevantTemplates 
      : this.messageTemplates.filter(t => t.category === category);

    // Select random template
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    if (!selectedTemplate) {
      return this.getFallbackMessage(category);
    }

    // Process template with variables
    let processedMessage = selectedTemplate.template;
    if (context.userName && selectedTemplate.variables.includes('userName')) {
      processedMessage = processedMessage.replace('{userName}', context.userName);
    }

    // Split into title and body
    const parts = processedMessage.split(' ', 3);
    const title = parts.slice(0, 2).join(' ');
    const body = processedMessage;

    return {
      title,
      body,
      category,
      timeContext: context.timeOfDay,
      moodContext: context.moodTrend,
      urgency: this.getUrgencyLevel(category, context.moodTrend),
      actionable: this.isActionable(category),
      deepLink: this.getDeepLink(category),
    };
  }

  /**
   * Get morning check-in message
   */
  getMorningCheckInMessage(userName?: string): NotificationMessage {
    return this.getContextualMessage('check_in', {
      timeOfDay: 'morning',
      userName,
    });
  }

  /**
   * Get evening reflection message
   */
  getEveningReflectionMessage(userName?: string): NotificationMessage {
    return this.getContextualMessage('check_in', {
      timeOfDay: 'evening',
      userName,
    });
  }

  /**
   * Get exercise suggestion message
   */
  getExerciseSuggestionMessage(
    moodTrend?: 'low' | 'neutral' | 'high' | 'declining' | 'improving',
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
  ): NotificationMessage {
    return this.getContextualMessage('exercise', {
      moodTrend,
      timeOfDay,
    });
  }

  /**
   * Get support message for difficult times
   */
  getSupportMessage(moodTrend: 'low' | 'declining'): NotificationMessage {
    return this.getContextualMessage('support', {
      moodTrend,
    });
  }

  /**
   * Get celebration message for positive progress
   */
  getCelebrationMessage(
    moodTrend: 'high' | 'improving',
    usagePattern?: 'consistent'
  ): NotificationMessage {
    return this.getContextualMessage('celebration', {
      moodTrend,
      usagePattern,
    });
  }

  /**
   * Get gentle nudge message
   */
  getGentleNudgeMessage(): NotificationMessage {
    return this.getContextualMessage('gentle_nudge', {});
  }

  /**
   * Get crisis-appropriate message
   */
  getCrisisMessage(): NotificationMessage {
    return {
      title: 'You\'re not alone 💙',
      body: 'If you\'re in crisis, help is available. Tap for immediate support resources.',
      category: 'support',
      urgency: 'high',
      actionable: true,
      deepLink: 'pockettherapy://crisis-resources',
    };
  }

  /**
   * Get streak celebration message
   */
  getStreakMessage(streakDays: number): NotificationMessage {
    const messages = [
      {
        title: `${streakDays} days strong! 🌟`,
        body: `You\'ve checked in for ${streakDays} days in a row. Your consistency is beautiful.`,
      },
      {
        title: `Amazing dedication! ✨`,
        body: `${streakDays} days of self-care. You\'re building wonderful habits.`,
      },
      {
        title: `Celebrating you! 🎉`,
        body: `${streakDays} consecutive check-ins. Your commitment to yourself is inspiring.`,
      },
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      ...message,
      category: 'celebration',
      urgency: 'low',
      actionable: true,
      deepLink: 'pockettherapy://home',
    };
  }

  /**
   * Get personalized message based on user patterns
   */
  getPersonalizedMessage(
    userPatterns: {
      averageMood: number;
      commonLowTimes: string[];
      preferredExercises: string[];
      lastCheckIn: string;
    }
  ): NotificationMessage {
    const hoursSinceLastCheckIn = Math.floor(
      (Date.now() - new Date(userPatterns.lastCheckIn).getTime()) / (1000 * 60 * 60)
    );

    // If it's been a while, gentle check-in
    if (hoursSinceLastCheckIn > 24) {
      return {
        title: 'We miss you 🌱',
        body: 'It\'s been a while since your last check-in. How are you doing?',
        category: 'check_in',
        urgency: 'medium',
        actionable: true,
        deepLink: 'pockettherapy://mood-checkin',
      };
    }

    // If mood is generally low, supportive message
    if (userPatterns.averageMood < 2.5) {
      return this.getSupportMessage('low');
    }

    // If mood is generally high, celebration
    if (userPatterns.averageMood > 3.5) {
      return this.getCelebrationMessage('high');
    }

    // Default to gentle nudge
    return this.getGentleNudgeMessage();
  }

  /**
   * Helper methods
   */
  private getFallbackMessage(category: NotificationMessage['category']): NotificationMessage {
    const fallbacks = {
      check_in: {
        title: 'Gentle check-in 🌱',
        body: 'How are you feeling right now? Your awareness matters.',
      },
      exercise: {
        title: 'Self-care moment ✨',
        body: 'Consider taking a few minutes for yourself.',
      },
      support: {
        title: 'You matter 💙',
        body: 'Remember, you\'re not alone in this journey.',
      },
      celebration: {
        title: 'Beautiful work 🌟',
        body: 'You\'re taking great care of yourself.',
      },
      gentle_nudge: {
        title: 'Gentle reminder 🤗',
        body: 'Be kind to yourself today.',
      },
    };

    const fallback = fallbacks[category];
    return {
      ...fallback,
      category,
      urgency: 'low',
      actionable: true,
      deepLink: 'pockettherapy://home',
    };
  }

  private getUrgencyLevel(
    category: NotificationMessage['category'],
    moodTrend?: string
  ): 'low' | 'medium' | 'high' {
    if (category === 'support' && (moodTrend === 'low' || moodTrend === 'declining')) {
      return 'high';
    }
    if (category === 'check_in' || category === 'exercise') {
      return 'medium';
    }
    return 'low';
  }

  private isActionable(category: NotificationMessage['category']): boolean {
    return category !== 'gentle_nudge';
  }

  private getDeepLink(category: NotificationMessage['category']): string {
    const deepLinks = {
      check_in: 'pockettherapy://mood-checkin',
      exercise: 'pockettherapy://exercises',
      support: 'pockettherapy://crisis-resources',
      celebration: 'pockettherapy://home',
      gentle_nudge: 'pockettherapy://home',
    };

    return deepLinks[category];
  }

  /**
   * Validate message content for therapeutic appropriateness
   */
  validateMessage(message: NotificationMessage): boolean {
    const inappropriateWords = ['should', 'must', 'wrong', 'bad', 'failure', 'broken'];
    const messageText = `${message.title} ${message.body}`.toLowerCase();
    
    return !inappropriateWords.some(word => messageText.includes(word));
  }

  /**
   * Get message statistics for analytics
   */
  getMessageStats(): {
    totalTemplates: number;
    categoryCounts: Record<string, number>;
    contextCounts: Record<string, number>;
  } {
    const categoryCounts: Record<string, number> = {};
    const contextCounts: Record<string, number> = {};

    this.messageTemplates.forEach(template => {
      categoryCounts[template.category] = (categoryCounts[template.category] || 0) + 1;
      
      Object.keys(template.contexts).forEach(context => {
        contextCounts[context] = (contextCounts[context] || 0) + 1;
      });
    });

    return {
      totalTemplates: this.messageTemplates.length,
      categoryCounts,
      contextCounts,
    };
  }
}

export const notificationContentService = new NotificationContentService();
