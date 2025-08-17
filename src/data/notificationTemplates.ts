/**
 * Notification Message Templates
 * 
 * Therapeutic notification messages for different times, moods, and user states
 * All messages use gentle, supportive language and avoid pressure
 */

export interface NotificationTemplate {
  id: string;
  type: 'morning' | 'evening' | 'check-in' | 'encouragement' | 'streak' | 'exercise' | 'crisis-support';
  title: string;
  body: string;
  context?: {
    mood?: 'low' | 'neutral' | 'high';
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    streakDays?: number;
    lastActivity?: 'mood-log' | 'exercise' | 'none';
  };
  priority: 'low' | 'normal' | 'high';
  actionable: boolean;
  deepLink?: string;
}

export const notificationTemplates: NotificationTemplate[] = [
  // MORNING NOTIFICATIONS
  {
    id: 'morning-001',
    type: 'morning',
    title: 'Good morning 🌅',
    body: 'How are you feeling today? A quick check-in can help set a positive tone.',
    context: { timeOfDay: 'morning' },
    priority: 'normal',
    actionable: true,
    deepLink: 'pockettherapy://mood-check-in'
  },
  {
    id: 'morning-002',
    type: 'morning',
    title: 'Start your day mindfully ☀️',
    body: 'Take a moment to breathe and set an intention for today.',
    context: { timeOfDay: 'morning' },
    priority: 'low',
    actionable: true,
    deepLink: 'pockettherapy://exercises/breathing'
  },
  {
    id: 'morning-003',
    type: 'morning',
    title: 'You\'ve got this 💪',
    body: 'Remember: you\'ve handled difficult days before, and you can handle today too.',
    context: { timeOfDay: 'morning', mood: 'low' },
    priority: 'normal',
    actionable: false
  },
  {
    id: 'morning-004',
    type: 'morning',
    title: 'New day, fresh start 🌱',
    body: 'Yesterday is behind you. Today is full of possibilities.',
    context: { timeOfDay: 'morning' },
    priority: 'low',
    actionable: false
  },
  {
    id: 'morning-005',
    type: 'morning',
    title: 'Gentle reminder 🤗',
    body: 'You don\'t have to be perfect today. Just be kind to yourself.',
    context: { timeOfDay: 'morning' },
    priority: 'low',
    actionable: false
  },

  // EVENING NOTIFICATIONS
  {
    id: 'evening-001',
    type: 'evening',
    title: 'How was your day? 🌙',
    body: 'Take a moment to reflect and check in with yourself.',
    context: { timeOfDay: 'evening' },
    priority: 'normal',
    actionable: true,
    deepLink: 'pockettherapy://mood-check-in'
  },
  {
    id: 'evening-002',
    type: 'evening',
    title: 'Wind down time 🌆',
    body: 'Try a gentle breathing exercise to help you relax before bed.',
    context: { timeOfDay: 'evening' },
    priority: 'low',
    actionable: true,
    deepLink: 'pockettherapy://exercises/breathing'
  },
  {
    id: 'evening-003',
    type: 'evening',
    title: 'You made it through today ✨',
    body: 'That\'s something to be proud of. Rest well tonight.',
    context: { timeOfDay: 'evening', mood: 'low' },
    priority: 'normal',
    actionable: false
  },
  {
    id: 'evening-004',
    type: 'evening',
    title: 'Gratitude moment 🙏',
    body: 'What\'s one small thing you\'re grateful for today?',
    context: { timeOfDay: 'evening' },
    priority: 'low',
    actionable: true,
    deepLink: 'pockettherapy://exercises/cognitive'
  },
  {
    id: 'evening-005',
    type: 'evening',
    title: 'Tomorrow is a new day 🌟',
    body: 'Rest tonight knowing you did your best today.',
    context: { timeOfDay: 'evening' },
    priority: 'low',
    actionable: false
  },

  // CHECK-IN REMINDERS
  {
    id: 'checkin-001',
    type: 'check-in',
    title: 'Gentle check-in 💙',
    body: 'It\'s been a while since your last mood check-in. How are you feeling?',
    priority: 'normal',
    actionable: true,
    deepLink: 'pockettherapy://mood-check-in'
  },
  {
    id: 'checkin-002',
    type: 'check-in',
    title: 'How are you doing? 🤔',
    body: 'A quick mood check can help you understand your patterns.',
    priority: 'low',
    actionable: true,
    deepLink: 'pockettherapy://mood-check-in'
  },
  {
    id: 'checkin-003',
    type: 'check-in',
    title: 'Pause for a moment ⏸️',
    body: 'Take 30 seconds to notice how you\'re feeling right now.',
    priority: 'low',
    actionable: true,
    deepLink: 'pockettherapy://mood-check-in'
  },
  {
    id: 'checkin-004',
    type: 'check-in',
    title: 'Your feelings matter 💭',
    body: 'Checking in with yourself is an act of self-care.',
    priority: 'normal',
    actionable: true,
    deepLink: 'pockettherapy://mood-check-in'
  },
  {
    id: 'checkin-005',
    type: 'check-in',
    title: 'No pressure, just curiosity 🧐',
    body: 'How would you describe your mood right now?',
    priority: 'low',
    actionable: true,
    deepLink: 'pockettherapy://mood-check-in'
  },

  // ENCOURAGEMENT MESSAGES
  {
    id: 'encourage-001',
    type: 'encouragement',
    title: 'You\'re doing great 🌟',
    body: 'Taking care of your mental health shows real strength.',
    priority: 'low',
    actionable: false
  },
  {
    id: 'encourage-002',
    type: 'encouragement',
    title: 'Progress, not perfection 📈',
    body: 'Every small step you take matters, even when it doesn\'t feel like it.',
    priority: 'low',
    actionable: false
  },
  {
    id: 'encourage-003',
    type: 'encouragement',
    title: 'You\'re not alone 🤝',
    body: 'Many people are on similar journeys. You\'re part of a caring community.',
    priority: 'normal',
    actionable: false
  },
  {
    id: 'encourage-004',
    type: 'encouragement',
    title: 'Healing isn\'t linear 🌊',
    body: 'It\'s okay to have ups and downs. That\'s part of the process.',
    context: { mood: 'low' },
    priority: 'normal',
    actionable: false
  },
  {
    id: 'encourage-005',
    type: 'encouragement',
    title: 'Your feelings are valid 💯',
    body: 'Whatever you\'re experiencing right now is okay. You\'re okay.',
    context: { mood: 'low' },
    priority: 'normal',
    actionable: false
  },

  // STREAK CELEBRATIONS
  {
    id: 'streak-001',
    type: 'streak',
    title: '3 days in a row! 🔥',
    body: 'You\'re building a healthy habit. Keep up the great work!',
    context: { streakDays: 3 },
    priority: 'normal',
    actionable: false
  },
  {
    id: 'streak-002',
    type: 'streak',
    title: 'One week strong! 💪',
    body: 'Seven days of self-care. You should be proud of this commitment.',
    context: { streakDays: 7 },
    priority: 'normal',
    actionable: false
  },
  {
    id: 'streak-003',
    type: 'streak',
    title: 'Two weeks! Amazing! 🎉',
    body: 'Your consistency is paying off. Notice how this routine feels.',
    context: { streakDays: 14 },
    priority: 'normal',
    actionable: false
  },
  {
    id: 'streak-004',
    type: 'streak',
    title: 'One month milestone! 🏆',
    body: 'Thirty days of prioritizing your wellbeing. That\'s incredible!',
    context: { streakDays: 30 },
    priority: 'high',
    actionable: false
  },
  {
    id: 'streak-005',
    type: 'streak',
    title: 'Consistency champion! ⭐',
    body: 'Your dedication to self-care is inspiring. Keep going!',
    context: { streakDays: 60 },
    priority: 'high',
    actionable: false
  },

  // EXERCISE SUGGESTIONS
  {
    id: 'exercise-001',
    type: 'exercise',
    title: 'Need a quick reset? 🔄',
    body: 'Try a 2-minute breathing exercise to center yourself.',
    priority: 'low',
    actionable: true,
    deepLink: 'pockettherapy://exercises/breathing'
  },
  {
    id: 'exercise-002',
    type: 'exercise',
    title: 'Feeling overwhelmed? 🌪️',
    body: 'A grounding exercise might help you feel more stable.',
    context: { mood: 'low' },
    priority: 'normal',
    actionable: true,
    deepLink: 'pockettherapy://exercises/grounding'
  },
  {
    id: 'exercise-003',
    type: 'exercise',
    title: 'Mind racing? 🏃‍♂️💭',
    body: 'Try the 5-4-3-2-1 technique to slow down your thoughts.',
    context: { mood: 'low' },
    priority: 'normal',
    actionable: true,
    deepLink: 'pockettherapy://exercises/grounding-001'
  },
  {
    id: 'exercise-004',
    type: 'exercise',
    title: 'Boost your mood 📈',
    body: 'A gratitude practice can help shift your perspective.',
    context: { mood: 'neutral' },
    priority: 'low',
    actionable: true,
    deepLink: 'pockettherapy://exercises/cognitive-002'
  },
  {
    id: 'exercise-005',
    type: 'exercise',
    title: 'Self-care moment 🛁',
    body: 'You deserve kindness, especially from yourself.',
    priority: 'low',
    actionable: true,
    deepLink: 'pockettherapy://exercises/cognitive-007'
  },

  // CRISIS SUPPORT
  {
    id: 'crisis-001',
    type: 'crisis-support',
    title: 'You\'re not alone 🤗',
    body: 'If you\'re in crisis, help is available. Tap for immediate support.',
    priority: 'high',
    actionable: true,
    deepLink: 'pockettherapy://sos'
  },
  {
    id: 'crisis-002',
    type: 'crisis-support',
    title: 'Immediate support available 🆘',
    body: 'Crisis resources and breathing exercises are ready when you need them.',
    priority: 'high',
    actionable: true,
    deepLink: 'pockettherapy://sos'
  },
  {
    id: 'crisis-003',
    type: 'crisis-support',
    title: 'This feeling will pass 🌈',
    body: 'You\'ve survived difficult moments before. You can get through this too.',
    context: { mood: 'low' },
    priority: 'high',
    actionable: true,
    deepLink: 'pockettherapy://sos'
  },
  {
    id: 'crisis-004',
    type: 'crisis-support',
    title: 'Breathe with me 🫁',
    body: 'When everything feels overwhelming, start with one breath.',
    context: { mood: 'low' },
    priority: 'high',
    actionable: true,
    deepLink: 'pockettherapy://exercises/breathing-001'
  },
  {
    id: 'crisis-005',
    type: 'crisis-support',
    title: 'You matter 💙',
    body: 'Your life has value. Reach out for support when you need it.',
    priority: 'high',
    actionable: true,
    deepLink: 'pockettherapy://crisis-resources'
  }
];

// Helper functions for filtering templates
export const getTemplatesByType = (type: NotificationTemplate['type']) => 
  notificationTemplates.filter(template => template.type === type);

export const getTemplatesByMood = (mood: 'low' | 'neutral' | 'high') =>
  notificationTemplates.filter(template => 
    !template.context?.mood || template.context.mood === mood
  );

export const getTemplatesByTimeOfDay = (timeOfDay: 'morning' | 'afternoon' | 'evening') =>
  notificationTemplates.filter(template => 
    !template.context?.timeOfDay || template.context.timeOfDay === timeOfDay
  );

export const getRandomTemplate = (
  type?: NotificationTemplate['type'],
  context?: Partial<NotificationTemplate['context']>
): NotificationTemplate | null => {
  let filtered = notificationTemplates;

  if (type) {
    filtered = filtered.filter(template => template.type === type);
  }

  if (context) {
    filtered = filtered.filter(template => {
      if (context.mood && template.context?.mood && template.context.mood !== context.mood) {
        return false;
      }
      if (context.timeOfDay && template.context?.timeOfDay && template.context.timeOfDay !== context.timeOfDay) {
        return false;
      }
      return true;
    });
  }

  if (filtered.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};

// Notification scheduling helpers
export const getAppropriateNotification = (userContext: {
  currentMood?: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  lastActivity?: 'mood-log' | 'exercise' | 'none';
  streakDays?: number;
  hoursInactive?: number;
}): NotificationTemplate | null => {
  const { currentMood, timeOfDay, lastActivity, streakDays, hoursInactive } = userContext;

  // Crisis support if mood is very low
  if (currentMood !== undefined && currentMood <= 1) {
    return getRandomTemplate('crisis-support', { mood: 'low' });
  }

  // Streak celebration
  if (streakDays && [3, 7, 14, 30, 60].includes(streakDays)) {
    return getRandomTemplate('streak', { streakDays });
  }

  // Check-in reminder if inactive
  if (hoursInactive && hoursInactive >= 24) {
    return getRandomTemplate('check-in');
  }

  // Time-based notifications
  if (timeOfDay === 'morning') {
    const moodContext = currentMood !== undefined && currentMood <= 2 ? 'low' : undefined;
    return getRandomTemplate('morning', { timeOfDay, mood: moodContext });
  }

  if (timeOfDay === 'evening') {
    const moodContext = currentMood !== undefined && currentMood <= 2 ? 'low' : undefined;
    return getRandomTemplate('evening', { timeOfDay, mood: moodContext });
  }

  // Default encouragement
  return getRandomTemplate('encouragement');
};
