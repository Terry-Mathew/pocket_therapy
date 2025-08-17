/**
 * Mood Analysis Service Tests
 * 
 * Unit tests for mood analysis logic including pattern detection,
 * trend analysis, and therapeutic insights generation
 */

import { moodAnalysisService } from '../moodAnalysisService';
import { createMockMoodLog, expectTherapeuticLanguage } from '../../test/utils';
import { MoodLog } from '../../types';

describe('MoodAnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeMoodPatterns', () => {
    it('should identify positive mood trends', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 2, timestamp: '2024-01-01T09:00:00.000Z' }),
        createMockMoodLog({ value: 3, timestamp: '2024-01-02T09:00:00.000Z' }),
        createMockMoodLog({ value: 4, timestamp: '2024-01-03T09:00:00.000Z' }),
        createMockMoodLog({ value: 4, timestamp: '2024-01-04T09:00:00.000Z' }),
      ];

      const analysis = await moodAnalysisService.analyzeMoodPatterns(moodLogs);

      expect(analysis.trend).toBe('improving');
      expect(analysis.averageMood).toBeCloseTo(3.25);
      expect(analysis.insights).toContain('Your mood has been improving over time');
    });

    it('should identify declining mood trends', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 4, timestamp: '2024-01-01T09:00:00.000Z' }),
        createMockMoodLog({ value: 3, timestamp: '2024-01-02T09:00:00.000Z' }),
        createMockMoodLog({ value: 2, timestamp: '2024-01-03T09:00:00.000Z' }),
        createMockMoodLog({ value: 2, timestamp: '2024-01-04T09:00:00.000Z' }),
      ];

      const analysis = await moodAnalysisService.analyzeMoodPatterns(moodLogs);

      expect(analysis.trend).toBe('declining');
      expect(analysis.averageMood).toBeCloseTo(2.75);
      expect(analysis.insights).toContain('gentle support');
    });

    it('should identify stable mood patterns', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 3, timestamp: '2024-01-01T09:00:00.000Z' }),
        createMockMoodLog({ value: 3, timestamp: '2024-01-02T09:00:00.000Z' }),
        createMockMoodLog({ value: 3, timestamp: '2024-01-03T09:00:00.000Z' }),
        createMockMoodLog({ value: 3, timestamp: '2024-01-04T09:00:00.000Z' }),
      ];

      const analysis = await moodAnalysisService.analyzeMoodPatterns(moodLogs);

      expect(analysis.trend).toBe('stable');
      expect(analysis.averageMood).toBe(3);
      expect(analysis.insights).toContain('consistent');
    });

    it('should handle empty mood logs gracefully', async () => {
      const analysis = await moodAnalysisService.analyzeMoodPatterns([]);

      expect(analysis.trend).toBe('insufficient_data');
      expect(analysis.averageMood).toBe(0);
      expect(analysis.insights).toContain('Start tracking');
    });

    it('should use therapeutic language in insights', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 1, timestamp: '2024-01-01T09:00:00.000Z' }),
        createMockMoodLog({ value: 1, timestamp: '2024-01-02T09:00:00.000Z' }),
      ];

      const analysis = await moodAnalysisService.analyzeMoodPatterns(moodLogs);

      analysis.insights.forEach(insight => {
        expectTherapeuticLanguage(insight);
      });
    });
  });

  describe('identifyTriggers', () => {
    it('should identify common triggers', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 2, triggers: ['work', 'stress'] }),
        createMockMoodLog({ value: 1, triggers: ['work', 'deadlines'] }),
        createMockMoodLog({ value: 3, triggers: ['social', 'family'] }),
        createMockMoodLog({ value: 2, triggers: ['work', 'meetings'] }),
      ];

      const triggers = await moodAnalysisService.identifyTriggers(moodLogs);

      expect(triggers).toContain('work');
      expect(triggers.filter(t => t === 'work')).toHaveLength(3);
    });

    it('should handle logs without triggers', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 3, triggers: undefined }),
        createMockMoodLog({ value: 4, triggers: [] }),
      ];

      const triggers = await moodAnalysisService.identifyTriggers(moodLogs);

      expect(triggers).toEqual([]);
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend breathing exercises for low mood', async () => {
      const analysis = {
        trend: 'declining' as const,
        averageMood: 2,
        insights: ['Mood has been low'],
        patterns: [],
      };

      const recommendations = await moodAnalysisService.generateRecommendations(analysis);

      expect(recommendations).toContain('breathing exercise');
      expect(recommendations.some(rec => rec.includes('gentle'))).toBe(true);
    });

    it('should recommend celebration for high mood', async () => {
      const analysis = {
        trend: 'improving' as const,
        averageMood: 4.5,
        insights: ['Mood is improving'],
        patterns: [],
      };

      const recommendations = await moodAnalysisService.generateRecommendations(analysis);

      expect(recommendations.some(rec => rec.includes('celebrate') || rec.includes('acknowledge'))).toBe(true);
    });

    it('should use therapeutic language in recommendations', async () => {
      const analysis = {
        trend: 'stable' as const,
        averageMood: 3,
        insights: ['Mood is stable'],
        patterns: [],
      };

      const recommendations = await moodAnalysisService.generateRecommendations(analysis);

      recommendations.forEach(recommendation => {
        expectTherapeuticLanguage(recommendation);
      });
    });
  });

  describe('detectTimePatterns', () => {
    it('should identify morning mood patterns', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 2, timestamp: '2024-01-01T08:00:00.000Z' }),
        createMockMoodLog({ value: 2, timestamp: '2024-01-02T08:30:00.000Z' }),
        createMockMoodLog({ value: 3, timestamp: '2024-01-01T14:00:00.000Z' }),
        createMockMoodLog({ value: 4, timestamp: '2024-01-02T14:30:00.000Z' }),
      ];

      const patterns = await moodAnalysisService.detectTimePatterns(moodLogs);

      expect(patterns.morningAverage).toBeCloseTo(2);
      expect(patterns.afternoonAverage).toBeCloseTo(3.5);
      expect(patterns.insights).toContain('morning');
    });

    it('should handle insufficient data for time patterns', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 3, timestamp: '2024-01-01T12:00:00.000Z' }),
      ];

      const patterns = await moodAnalysisService.detectTimePatterns(moodLogs);

      expect(patterns.insights).toContain('more data');
    });
  });

  describe('calculateMoodScore', () => {
    it('should calculate correct mood score', () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 1 }),
        createMockMoodLog({ value: 2 }),
        createMockMoodLog({ value: 3 }),
        createMockMoodLog({ value: 4 }),
        createMockMoodLog({ value: 5 }),
      ];

      const score = moodAnalysisService.calculateMoodScore(moodLogs);

      expect(score).toBe(3); // Average of 1,2,3,4,5
    });

    it('should return 0 for empty logs', () => {
      const score = moodAnalysisService.calculateMoodScore([]);
      expect(score).toBe(0);
    });

    it('should handle recent logs with higher weight', () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 1, timestamp: '2024-01-01T09:00:00.000Z' }),
        createMockMoodLog({ value: 5, timestamp: '2024-01-04T09:00:00.000Z' }),
      ];

      const score = moodAnalysisService.calculateMoodScore(moodLogs, true);

      expect(score).toBeGreaterThan(3); // Recent high mood should have more weight
    });
  });

  describe('getMoodInsights', () => {
    it('should provide crisis-appropriate insights for very low mood', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 1 }),
        createMockMoodLog({ value: 1 }),
      ];

      const insights = await moodAnalysisService.getMoodInsights(moodLogs);

      expect(insights.severity).toBe('high');
      expect(insights.recommendations).toContain('support');
      expect(insights.crisisResources).toBe(true);
    });

    it('should provide encouraging insights for improving mood', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 2, timestamp: '2024-01-01T09:00:00.000Z' }),
        createMockMoodLog({ value: 4, timestamp: '2024-01-02T09:00:00.000Z' }),
      ];

      const insights = await moodAnalysisService.getMoodInsights(moodLogs);

      expect(insights.severity).toBe('low');
      expect(insights.recommendations.some(rec => rec.includes('progress'))).toBe(true);
      expect(insights.crisisResources).toBe(false);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle invalid mood values gracefully', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 0 }), // Invalid
        createMockMoodLog({ value: 6 }), // Invalid
        createMockMoodLog({ value: 3 }), // Valid
      ];

      const analysis = await moodAnalysisService.analyzeMoodPatterns(moodLogs);

      expect(analysis.averageMood).toBe(3); // Should only use valid values
    });

    it('should handle malformed timestamps', async () => {
      const moodLogs: MoodLog[] = [
        createMockMoodLog({ value: 3, timestamp: 'invalid-date' }),
        createMockMoodLog({ value: 4, timestamp: '2024-01-01T09:00:00.000Z' }),
      ];

      const analysis = await moodAnalysisService.analyzeMoodPatterns(moodLogs);

      expect(analysis.averageMood).toBeGreaterThan(0); // Should handle gracefully
    });

    it('should handle very large datasets efficiently', async () => {
      const largeMoodLogs: MoodLog[] = Array.from({ length: 1000 }, (_, i) =>
        createMockMoodLog({
          value: (i % 5) + 1,
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        })
      );

      const startTime = performance.now();
      const analysis = await moodAnalysisService.analyzeMoodPatterns(largeMoodLogs);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(analysis.averageMood).toBeGreaterThan(0);
    });
  });
});
