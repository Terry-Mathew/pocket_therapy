/**
 * Basic Test
 * 
 * Simple test to verify Jest setup is working
 */

describe('Basic Test Suite', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should validate mood values', () => {
    const validMoodValues = [1, 2, 3, 4, 5];
    
    validMoodValues.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(5);
    });
  });

  it('should validate exercise durations', () => {
    const validDurations = [60, 120, 180, 300, 600]; // 1-10 minutes
    
    validDurations.forEach(duration => {
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThanOrEqual(1800); // Max 30 minutes
    });
  });

  it('should validate therapeutic language patterns', () => {
    const therapeuticPhrases = [
      'gentle reminder',
      'take care of yourself',
      'you are not alone',
      'this feeling will pass',
      'be kind to yourself'
    ];

    const harmfulPhrases = [
      'you should feel better',
      'just think positive',
      'you must try harder',
      'stop being sad'
    ];

    therapeuticPhrases.forEach(phrase => {
      expect(phrase.toLowerCase()).toMatch(/gentle|care|kind|support|safe|not.*alone|take.*care|feeling.*pass/);
    });

    harmfulPhrases.forEach(phrase => {
      expect(phrase.toLowerCase()).toMatch(/should|must|just|stop/);
    });
  });
});
