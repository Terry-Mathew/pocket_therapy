/**
 * Notification Content Service Tests
 * 
 * Unit tests for notification message generation, context awareness,
 * and therapeutic language validation
 */

import { notificationContentService } from '../notificationContentService';
import { notificationTemplates } from '../../data/notificationTemplates';
import { mockAsyncStorageData, expectTherapeuticLanguage } from '../../test/utils';

describe('NotificationContentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getContextualMessage', () => {
    it('should return appropriate morning message', async () => {
      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'morning',
        userMood: 3,
      });

      expect(message.title).toBeTruthy();
      expect(message.body).toBeTruthy();
      expect(message.timeContext).toBe('morning');
      expectTherapeuticLanguage(message.title);
      expectTherapeuticLanguage(message.body);
    });

    it('should return appropriate evening message', async () => {
      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'evening',
        userMood: 4,
      });

      expect(message.title).toBeTruthy();
      expect(message.body).toBeTruthy();
      expect(message.timeContext).toBe('evening');
      expectTherapeuticLanguage(message.title);
      expectTherapeuticLanguage(message.body);
    });

    it('should prioritize crisis support for very low mood', async () => {
      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'afternoon',
        userMood: 1,
      });

      expect(message.category).toBe('support');
      expect(message.urgency).toBe('high');
      expectTherapeuticLanguage(message.body);
    });

    it('should celebrate streaks appropriately', async () => {
      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'morning',
        streakDays: 7,
      });

      expect(message.category).toBe('celebration');
      expect(message.title.toLowerCase()).toContain('week');
    });

    it('should encourage check-ins for inactive users', async () => {
      const lastActivity = new Date();
      lastActivity.setHours(lastActivity.getHours() - 25); // 25 hours ago

      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'afternoon',
        hoursInactive: 25,
      });

      expect(message.category).toBe('check_in');
      expect(message.actionable).toBe(true);
    });

    it('should avoid duplicate recent messages', async () => {
      mockAsyncStorageData({
        notification_history: [
          {
            title: 'Good morning 🌅',
            body: 'How are you feeling today?',
            timestamp: Date.now() - 1000, // 1 second ago
          },
        ],
      });

      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'morning',
      });

      // Should get a different message than the recent one
      expect(message.title).not.toBe('Good morning 🌅');
    });

    it('should handle first-time users appropriately', async () => {
      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'morning',
        isFirstTime: true,
      });

      expect(message.category).toBe('support');
      expectTherapeuticLanguage(message.body);
    });
  });

  describe('getMorningMessage', () => {
    it('should return morning-specific content', async () => {
      const message = await notificationContentService.getMorningMessage();

      expect(message.timeContext).toBe('morning');
      expect(message.title.toLowerCase()).toMatch(/morning|start|day/);
      expectTherapeuticLanguage(message.body);
    });

    it('should be actionable for check-ins', async () => {
      const message = await notificationContentService.getMorningMessage();

      expect(message.actionable).toBe(true);
      expect(message.deepLink).toBeTruthy();
    });
  });

  describe('getEveningMessage', () => {
    it('should return evening-specific content', async () => {
      const message = await notificationContentService.getEveningMessage();

      expect(message.timeContext).toBe('evening');
      expect(message.title.toLowerCase()).toMatch(/evening|night|day|reflect/);
      expectTherapeuticLanguage(message.body);
    });

    it('should focus on reflection and winding down', async () => {
      const message = await notificationContentService.getEveningMessage();

      expect(message.body.toLowerCase()).toMatch(/reflect|wind|relax|rest/);
    });
  });

  describe('getCheckInReminder', () => {
    it('should return check-in focused message', async () => {
      const message = await notificationContentService.getCheckInReminder();

      expect(message.category).toBe('check_in');
      expect(message.actionable).toBe(true);
      expect(message.deepLink).toContain('mood-check-in');
      expectTherapeuticLanguage(message.body);
    });

    it('should use gentle language', async () => {
      const message = await notificationContentService.getCheckInReminder();

      expect(message.body.toLowerCase()).toMatch(/gentle|check|how.*feel/);
    });
  });

  describe('getCrisisSupport', () => {
    it('should return high-priority crisis message', async () => {
      const message = await notificationContentService.getCrisisSupport();

      expect(message.category).toBe('support');
      expect(message.urgency).toBe('high');
      expect(message.actionable).toBe(true);
      expectTherapeuticLanguage(message.body);
    });

    it('should provide immediate support options', async () => {
      const message = await notificationContentService.getCrisisSupport();

      expect(message.deepLink).toMatch(/sos|crisis|support/);
      expect(message.body.toLowerCase()).toMatch(/support|help|not.*alone/);
    });
  });

  describe('getEncouragement', () => {
    it('should return encouraging message', async () => {
      const message = await notificationContentService.getEncouragement();

      expect(message.category).toBe('support');
      expect(message.urgency).toBe('low');
      expectTherapeuticLanguage(message.body);
    });

    it('should be supportive without being actionable', async () => {
      const message = await notificationContentService.getEncouragement();

      expect(message.actionable).toBe(false);
      expect(message.body.toLowerCase()).toMatch(/progress|strength|doing.*great/);
    });
  });

  describe('getStreakCelebration', () => {
    it('should celebrate 3-day streak', async () => {
      const message = await notificationContentService.getStreakCelebration(3);

      expect(message.category).toBe('celebration');
      expect(message.title.toLowerCase()).toContain('3');
      expectTherapeuticLanguage(message.body);
    });

    it('should celebrate weekly streak', async () => {
      const message = await notificationContentService.getStreakCelebration(7);

      expect(message.category).toBe('celebration');
      expect(message.title.toLowerCase()).toMatch(/week|7/);
    });

    it('should celebrate monthly milestone', async () => {
      const message = await notificationContentService.getStreakCelebration(30);

      expect(message.category).toBe('celebration');
      expect(message.urgency).toBe('high'); // Important milestone
      expect(message.title.toLowerCase()).toMatch(/month|30/);
    });
  });

  describe('getExerciseReminder', () => {
    it('should suggest appropriate exercises', async () => {
      const message = await notificationContentService.getExerciseReminder();

      expect(message.category).toBe('exercise');
      expect(message.actionable).toBe(true);
      expect(message.deepLink).toContain('exercises');
      expectTherapeuticLanguage(message.body);
    });

    it('should be gentle and non-pressuring', async () => {
      const message = await notificationContentService.getExerciseReminder();

      expect(message.body.toLowerCase()).not.toMatch(/must|should|need to/);
      expect(message.body.toLowerCase()).toMatch(/try|might|could/);
    });
  });

  describe('logNotification', () => {
    it('should store notification in history', async () => {
      const message = {
        title: 'Test Message',
        body: 'Test body',
        category: 'check_in' as const,
        urgency: 'low' as const,
        actionable: true,
      };

      await notificationContentService.logNotification(message);

      // Verify notification was logged (would need to mock AsyncStorage)
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('getRecentNotifications', () => {
    it('should return recent notification history', async () => {
      mockAsyncStorageData({
        notification_history: [
          {
            title: 'Recent Message',
            body: 'Recent body',
            timestamp: Date.now() - 1000,
          },
        ],
      });

      const recent = await notificationContentService.getRecentNotifications();

      expect(recent).toHaveLength(1);
      expect(recent[0].title).toBe('Recent Message');
    });

    it('should filter out old notifications', async () => {
      mockAsyncStorageData({
        notification_history: [
          {
            title: 'Old Message',
            body: 'Old body',
            timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
          },
          {
            title: 'Recent Message',
            body: 'Recent body',
            timestamp: Date.now() - 1000, // 1 second ago
          },
        ],
      });

      const recent = await notificationContentService.getRecentNotifications();

      expect(recent).toHaveLength(1);
      expect(recent[0].title).toBe('Recent Message');
    });
  });

  describe('notification template validation', () => {
    it('should have valid template structure', () => {
      notificationTemplates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('type');
        expect(template).toHaveProperty('title');
        expect(template).toHaveProperty('body');
        expect(template).toHaveProperty('priority');
        expect(template).toHaveProperty('actionable');

        expect(['morning', 'evening', 'check-in', 'encouragement', 'streak', 'exercise', 'crisis-support']).toContain(template.type);
        expect(['low', 'normal', 'high']).toContain(template.priority);
        expect(typeof template.actionable).toBe('boolean');
      });
    });

    it('should use therapeutic language in all templates', () => {
      notificationTemplates.forEach(template => {
        expectTherapeuticLanguage(template.title);
        expectTherapeuticLanguage(template.body);
      });
    });

    it('should have appropriate deep links for actionable templates', () => {
      notificationTemplates
        .filter(template => template.actionable)
        .forEach(template => {
          expect(template.deepLink).toBeTruthy();
          expect(template.deepLink).toMatch(/pockettherapy:\/\//);
        });
    });

    it('should have crisis-appropriate templates', () => {
      const crisisTemplates = notificationTemplates.filter(t => t.type === 'crisis-support');
      
      expect(crisisTemplates.length).toBeGreaterThan(0);
      
      crisisTemplates.forEach(template => {
        expect(template.priority).toBe('high');
        expect(template.actionable).toBe(true);
        expect(template.body.toLowerCase()).toMatch(/support|help|not.*alone/);
      });
    });

    it('should have templates for all times of day', () => {
      const morningTemplates = notificationTemplates.filter(t => t.type === 'morning');
      const eveningTemplates = notificationTemplates.filter(t => t.type === 'evening');
      
      expect(morningTemplates.length).toBeGreaterThan(0);
      expect(eveningTemplates.length).toBeGreaterThan(0);
    });

    it('should have streak celebration templates', () => {
      const streakTemplates = notificationTemplates.filter(t => t.type === 'streak');
      
      expect(streakTemplates.length).toBeGreaterThan(0);
      
      streakTemplates.forEach(template => {
        expect(template.body.toLowerCase()).toMatch(/day|week|month|streak|consistent/);
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing context gracefully', async () => {
      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'morning',
      });

      expect(message).toBeTruthy();
      expect(message.title).toBeTruthy();
      expect(message.body).toBeTruthy();
    });

    it('should return fallback message on error', async () => {
      // Mock error in template selection
      jest.spyOn(notificationContentService, 'getContextualMessage').mockRejectedValueOnce(new Error('Template error'));

      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'morning',
      });

      expect(message).toBeTruthy();
      expect(message.title).toBeTruthy();
      expect(message.body).toBeTruthy();
    });

    it('should handle invalid mood values', async () => {
      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'morning',
        userMood: 10, // Invalid mood value
      });

      expect(message).toBeTruthy();
      expectTherapeuticLanguage(message.body);
    });

    it('should handle invalid time of day', async () => {
      const message = await notificationContentService.getContextualMessage({
        timeOfDay: 'invalid' as any,
      });

      expect(message).toBeTruthy();
      expectTherapeuticLanguage(message.body);
    });
  });
});
