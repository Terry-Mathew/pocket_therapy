/**
 * Exercise Seed Service Tests
 * 
 * Unit tests for exercise seeding, filtering, and recommendation logic
 */

import { exerciseSeedService } from '../exerciseSeedService';
import { exercises } from '../../data/exercises';
import { mockAsyncStorageData, mockSupabaseResponse } from '../../test/utils';

describe('ExerciseSeedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('seedExercises', () => {
    it('should seed exercises to local storage', async () => {
      const result = await exerciseSeedService.seedExercises();

      expect(result.success).toBe(true);
      expect(result.seeded).toBe(exercises.length);
      expect(result.errors).toHaveLength(0);
    });

    it('should skip seeding if already up to date', async () => {
      mockAsyncStorageData({
        exercise_seed_version: '1.0.0',
      });

      const result = await exerciseSeedService.seedExercises();

      expect(result.seeded).toBe(0); // Should skip
    });

    it('should force reseed when requested', async () => {
      mockAsyncStorageData({
        exercise_seed_version: '1.0.0',
      });

      const result = await exerciseSeedService.seedExercises(true);

      expect(result.success).toBe(true);
      expect(result.seeded).toBe(exercises.length);
    });
  });

  describe('getLocalExercises', () => {
    it('should return seeded exercises', async () => {
      mockAsyncStorageData({
        local_exercises: {
          exercises: exercises.slice(0, 5),
        },
      });

      const localExercises = await exerciseSeedService.getLocalExercises();

      expect(localExercises).toHaveLength(5);
      expect(localExercises[0]).toHaveProperty('id');
      expect(localExercises[0]).toHaveProperty('title');
    });

    it('should return default exercises if none cached', async () => {
      const localExercises = await exerciseSeedService.getLocalExercises();

      expect(localExercises).toHaveLength(exercises.length);
    });
  });

  describe('getExercisesByCategory', () => {
    it('should filter breathing exercises', async () => {
      const breathingExercises = await exerciseSeedService.getExercisesByCategory('breathing');

      expect(breathingExercises.every(ex => ex.category === 'breathing')).toBe(true);
      expect(breathingExercises.length).toBeGreaterThan(0);
    });

    it('should filter grounding exercises', async () => {
      const groundingExercises = await exerciseSeedService.getExercisesByCategory('grounding');

      expect(groundingExercises.every(ex => ex.category === 'grounding')).toBe(true);
      expect(groundingExercises.length).toBeGreaterThan(0);
    });

    it('should filter cognitive exercises', async () => {
      const cognitiveExercises = await exerciseSeedService.getExercisesByCategory('cognitive');

      expect(cognitiveExercises.every(ex => ex.category === 'cognitive')).toBe(true);
      expect(cognitiveExercises.length).toBeGreaterThan(0);
    });
  });

  describe('getCrisisExercises', () => {
    it('should return only crisis-appropriate exercises', async () => {
      const crisisExercises = await exerciseSeedService.getCrisisExercises();

      expect(crisisExercises.every(ex => ex.crisisAppropriate)).toBe(true);
      expect(crisisExercises.length).toBeGreaterThan(0);
    });

    it('should include breathing and grounding exercises for crisis', async () => {
      const crisisExercises = await exerciseSeedService.getCrisisExercises();

      const hasBreathing = crisisExercises.some(ex => ex.category === 'breathing');
      const hasGrounding = crisisExercises.some(ex => ex.category === 'grounding');

      expect(hasBreathing).toBe(true);
      expect(hasGrounding).toBe(true);
    });
  });

  describe('getExercisesByDifficulty', () => {
    it('should filter beginner exercises', async () => {
      const beginnerExercises = await exerciseSeedService.getExercisesByDifficulty('beginner');

      expect(beginnerExercises.every(ex => ex.difficulty === 'beginner')).toBe(true);
      expect(beginnerExercises.length).toBeGreaterThan(0);
    });

    it('should filter intermediate exercises', async () => {
      const intermediateExercises = await exerciseSeedService.getExercisesByDifficulty('intermediate');

      expect(intermediateExercises.every(ex => ex.difficulty === 'intermediate')).toBe(true);
    });

    it('should filter advanced exercises', async () => {
      const advancedExercises = await exerciseSeedService.getExercisesByDifficulty('advanced');

      expect(advancedExercises.every(ex => ex.difficulty === 'advanced')).toBe(true);
    });
  });

  describe('searchExercises', () => {
    it('should search by title', async () => {
      const results = await exerciseSeedService.searchExercises('breathing');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(ex => ex.title.toLowerCase().includes('breathing'))).toBe(true);
    });

    it('should search by description', async () => {
      const results = await exerciseSeedService.searchExercises('anxiety');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(ex => ex.description.toLowerCase().includes('anxiety'))).toBe(true);
    });

    it('should search by tags', async () => {
      const results = await exerciseSeedService.searchExercises('stress');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(ex => ex.tags.some(tag => tag.includes('stress')))).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const results = await exerciseSeedService.searchExercises('nonexistent');

      expect(results).toHaveLength(0);
    });
  });

  describe('getExerciseById', () => {
    it('should return exercise by ID', async () => {
      const exercise = await exerciseSeedService.getExerciseById('breathing-001');

      expect(exercise).toBeTruthy();
      expect(exercise?.id).toBe('breathing-001');
    });

    it('should return null for non-existent ID', async () => {
      const exercise = await exerciseSeedService.getExerciseById('non-existent');

      expect(exercise).toBeNull();
    });
  });

  describe('getRecommendedExercises', () => {
    it('should recommend crisis exercises for crisis context', async () => {
      const recommendations = await exerciseSeedService.getRecommendedExercises({
        isInCrisis: true,
      });

      expect(recommendations.every(ex => ex.crisisAppropriate)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should filter by available time', async () => {
      const recommendations = await exerciseSeedService.getRecommendedExercises({
        availableTime: 120, // 2 minutes
      });

      expect(recommendations.every(ex => ex.duration <= 120)).toBe(true);
    });

    it('should recommend grounding for low mood', async () => {
      const recommendations = await exerciseSeedService.getRecommendedExercises({
        mood: 1,
      });

      const hasGrounding = recommendations.some(ex => ex.category === 'grounding');
      const hasBreathing = recommendations.some(ex => ex.category === 'breathing' && ex.crisisAppropriate);

      expect(hasGrounding || hasBreathing).toBe(true);
    });

    it('should recommend cognitive exercises for good mood', async () => {
      const recommendations = await exerciseSeedService.getRecommendedExercises({
        mood: 5,
      });

      const hasCognitive = recommendations.some(ex => ex.category === 'cognitive');
      const hasBreathing = recommendations.some(ex => ex.category === 'breathing');

      expect(hasCognitive || hasBreathing).toBe(true);
    });

    it('should recommend energizing exercises for morning', async () => {
      const recommendations = await exerciseSeedService.getRecommendedExercises({
        timeOfDay: 'morning',
      });

      const hasEnergyTags = recommendations.some(ex => 
        ex.tags.includes('focus') || ex.tags.includes('energy') || ex.category === 'breathing'
      );

      expect(hasEnergyTags).toBe(true);
    });

    it('should recommend calming exercises for evening', async () => {
      const recommendations = await exerciseSeedService.getRecommendedExercises({
        timeOfDay: 'evening',
      });

      const hasCalmingTags = recommendations.some(ex => 
        ex.tags.includes('relaxation') || ex.tags.includes('sleep') || ex.category === 'grounding'
      );

      expect(hasCalmingTags).toBe(true);
    });

    it('should prioritize beginner exercises', async () => {
      const recommendations = await exerciseSeedService.getRecommendedExercises({});

      const beginnerCount = recommendations.filter(ex => ex.difficulty === 'beginner').length;
      const totalCount = recommendations.length;

      // Should have more beginner exercises than others
      expect(beginnerCount).toBeGreaterThanOrEqual(totalCount / 2);
    });

    it('should limit recommendations to 5', async () => {
      const recommendations = await exerciseSeedService.getRecommendedExercises({});

      expect(recommendations.length).toBeLessThanOrEqual(5);
    });
  });

  describe('needsUpdate', () => {
    it('should return true if no version stored', async () => {
      const needsUpdate = await exerciseSeedService.needsUpdate();

      expect(needsUpdate).toBe(true);
    });

    it('should return false if current version', async () => {
      mockAsyncStorageData({
        exercise_seed_version: '1.0.0',
      });

      const needsUpdate = await exerciseSeedService.needsUpdate();

      expect(needsUpdate).toBe(false);
    });

    it('should return true if old version', async () => {
      mockAsyncStorageData({
        exercise_seed_version: '0.9.0',
      });

      const needsUpdate = await exerciseSeedService.needsUpdate();

      expect(needsUpdate).toBe(true);
    });
  });

  describe('refreshExercises', () => {
    it('should force refresh exercises', async () => {
      const result = await exerciseSeedService.refreshExercises();

      expect(result.success).toBe(true);
      expect(result.seeded).toBe(exercises.length);
    });
  });

  describe('exercise data validation', () => {
    it('should have valid exercise structure', async () => {
      const allExercises = await exerciseSeedService.getLocalExercises();

      allExercises.forEach(exercise => {
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('title');
        expect(exercise).toHaveProperty('category');
        expect(exercise).toHaveProperty('duration');
        expect(exercise).toHaveProperty('difficulty');
        expect(exercise).toHaveProperty('description');
        expect(exercise).toHaveProperty('instructions');
        expect(exercise).toHaveProperty('benefits');
        expect(exercise).toHaveProperty('tags');
        expect(exercise).toHaveProperty('crisisAppropriate');

        expect(['breathing', 'grounding', 'cognitive']).toContain(exercise.category);
        expect(['beginner', 'intermediate', 'advanced']).toContain(exercise.difficulty);
        expect(exercise.duration).toBeValidExerciseDuration();
        expect(Array.isArray(exercise.instructions)).toBe(true);
        expect(Array.isArray(exercise.benefits)).toBe(true);
        expect(Array.isArray(exercise.tags)).toBe(true);
        expect(typeof exercise.crisisAppropriate).toBe('boolean');
      });
    });

    it('should have therapeutic language in descriptions', async () => {
      const allExercises = await exerciseSeedService.getLocalExercises();

      allExercises.forEach(exercise => {
        expect(exercise.description).toHaveTherapeuticLanguage();
      });
    });

    it('should have clear instructions', async () => {
      const allExercises = await exerciseSeedService.getLocalExercises();

      allExercises.forEach(exercise => {
        expect(exercise.instructions.length).toBeGreaterThan(0);
        exercise.instructions.forEach(instruction => {
          expect(instruction.length).toBeGreaterThan(10); // Meaningful instructions
          expect(instruction).toHaveTherapeuticLanguage();
        });
      });
    });

    it('should have meaningful benefits', async () => {
      const allExercises = await exerciseSeedService.getLocalExercises();

      allExercises.forEach(exercise => {
        expect(exercise.benefits.length).toBeGreaterThan(0);
        exercise.benefits.forEach(benefit => {
          expect(benefit.length).toBeGreaterThan(5); // Meaningful benefits
        });
      });
    });
  });
});
