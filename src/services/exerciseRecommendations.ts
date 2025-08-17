/**
 * Exercise Recommendation Engine
 * 
 * Intelligent exercise recommendations based on mood, triggers,
 * user preferences, and historical data
 */

import { Exercise, MoodLog, MoodLevel, ExerciseSession } from '../types';
import { moodStorageService } from './moodStorage';

interface RecommendationContext {
  currentMood: MoodLevel;
  triggers?: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  availableTime: 'short' | 'medium' | 'long'; // <5min, 5-15min, >15min
  userPreferences?: {
    favoriteCategories: string[];
    completedExercises: string[];
    avoidedExercises: string[];
  };
  recentMoodHistory?: MoodLog[];
}

interface RecommendationScore {
  exercise: Exercise;
  score: number;
  reasons: string[];
}

class ExerciseRecommendationEngine {
  /**
   * Get personalized exercise recommendations
   */
  async getRecommendations(
    exercises: Exercise[],
    context: RecommendationContext,
    limit: number = 5
  ): Promise<Exercise[]> {
    try {
      // Score all exercises
      const scoredExercises = exercises.map(exercise => 
        this.scoreExercise(exercise, context)
      );

      // Sort by score (highest first)
      scoredExercises.sort((a, b) => b.score - a.score);

      // Apply diversity filter to avoid recommending too many similar exercises
      const diverseRecommendations = this.applyDiversityFilter(
        scoredExercises.slice(0, limit * 2), // Get more candidates for diversity
        limit
      );

      return diverseRecommendations.map(scored => scored.exercise);
    } catch (error) {
      console.error('Failed to get exercise recommendations:', error);
      return this.getFallbackRecommendations(exercises, context.currentMood, limit);
    }
  }

  /**
   * Get mood-specific recommendations for immediate relief
   */
  getMoodBasedRecommendations(
    exercises: Exercise[],
    mood: MoodLevel,
    limit: number = 3
  ): Exercise[] {
    const moodStrategies = {
      1: ['breathing', 'grounding'], // Very sad - calming exercises
      2: ['breathing', 'cognitive'], // Sad - breathing + gentle cognitive
      3: ['grounding', 'cognitive'], // Neutral - grounding + cognitive
      4: ['cognitive', 'breathing'], // Good - maintain with cognitive
      5: ['grounding', 'cognitive']  // Great - grounding + cognitive
    };

    const preferredCategories = moodStrategies[mood];
    
    const filtered = exercises
      .filter(exercise => preferredCategories.includes(exercise.category))
      .sort((a, b) => {
        // Prioritize by category preference and difficulty
        const aCategoryIndex = preferredCategories.indexOf(a.category);
        const bCategoryIndex = preferredCategories.indexOf(b.category);
        
        if (aCategoryIndex !== bCategoryIndex) {
          return aCategoryIndex - bCategoryIndex;
        }
        
        // For low moods, prefer easier exercises
        if (mood <= 2) {
          const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
          return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
        }
        
        return 0;
      });

    return filtered.slice(0, limit);
  }

  /**
   * Get crisis-appropriate exercises (immediate calming)
   */
  getCrisisRecommendations(exercises: Exercise[]): Exercise[] {
    return exercises
      .filter(exercise => 
        exercise.category === 'breathing' && 
        exercise.difficulty === 'beginner' &&
        exercise.duration_seconds <= 300 && // 5 minutes max
        exercise.tags.some(tag => 
          ['calming', 'anxiety', 'stress', 'emergency'].includes(tag.toLowerCase())
        )
      )
      .sort((a, b) => a.duration_seconds - b.duration_seconds) // Shortest first
      .slice(0, 3);
  }

  /**
   * Get time-appropriate recommendations
   */
  getTimeBasedRecommendations(
    exercises: Exercise[],
    timeOfDay: RecommendationContext['timeOfDay'],
    availableTime: RecommendationContext['availableTime']
  ): Exercise[] {
    const timeLimits = {
      short: 300,   // 5 minutes
      medium: 900,  // 15 minutes
      long: 1800    // 30 minutes
    };

    const timeOfDayPreferences = {
      morning: ['breathing', 'cognitive'],
      afternoon: ['grounding', 'cognitive'],
      evening: ['breathing', 'grounding'],
      night: ['breathing', 'grounding']
    };

    const maxDuration = timeLimits[availableTime];
    const preferredCategories = timeOfDayPreferences[timeOfDay];

    return exercises
      .filter(exercise => 
        exercise.duration_seconds <= maxDuration &&
        preferredCategories.includes(exercise.category)
      )
      .sort((a, b) => {
        // Prioritize by category preference
        const aCategoryIndex = preferredCategories.indexOf(a.category);
        const bCategoryIndex = preferredCategories.indexOf(b.category);
        return aCategoryIndex - bCategoryIndex;
      });
  }

  /**
   * Score individual exercise based on context
   */
  private scoreExercise(exercise: Exercise, context: RecommendationContext): RecommendationScore {
    let score = 0;
    const reasons: string[] = [];

    // Base score
    score += 50;

    // Mood-based scoring
    const moodScore = this.getMoodScore(exercise, context.currentMood);
    score += moodScore.score;
    reasons.push(...moodScore.reasons);

    // Trigger-based scoring
    if (context.triggers && context.triggers.length > 0) {
      const triggerScore = this.getTriggerScore(exercise, context.triggers);
      score += triggerScore.score;
      reasons.push(...triggerScore.reasons);
    }

    // Time-based scoring
    const timeScore = this.getTimeScore(exercise, context.timeOfDay, context.availableTime);
    score += timeScore.score;
    reasons.push(...timeScore.reasons);

    // User preference scoring
    if (context.userPreferences) {
      const prefScore = this.getPreferenceScore(exercise, context.userPreferences);
      score += prefScore.score;
      reasons.push(...prefScore.reasons);
    }

    // Historical pattern scoring
    if (context.recentMoodHistory) {
      const historyScore = this.getHistoryScore(exercise, context.recentMoodHistory);
      score += historyScore.score;
      reasons.push(...historyScore.reasons);
    }

    return { exercise, score, reasons };
  }

  private getMoodScore(exercise: Exercise, mood: MoodLevel): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Mood-category matching
    const moodCategoryMap = {
      1: { breathing: 30, grounding: 25, cognitive: 10 }, // Very sad
      2: { breathing: 25, grounding: 20, cognitive: 15 }, // Sad
      3: { breathing: 15, grounding: 20, cognitive: 20 }, // Neutral
      4: { breathing: 10, grounding: 15, cognitive: 25 }, // Good
      5: { breathing: 5, grounding: 10, cognitive: 20 }   // Great
    };

    const categoryScore = moodCategoryMap[mood][exercise.category] || 0;
    score += categoryScore;
    
    if (categoryScore > 15) {
      reasons.push(`${exercise.category} exercises help with your current mood`);
    }

    // Difficulty matching for mood
    if (mood <= 2 && exercise.difficulty === 'beginner') {
      score += 15;
      reasons.push('Gentle exercise for when you\'re feeling low');
    } else if (mood >= 4 && exercise.difficulty === 'intermediate') {
      score += 10;
      reasons.push('Good challenge for your positive mood');
    }

    // Duration matching for mood
    if (mood <= 2 && exercise.duration_seconds <= 300) {
      score += 10;
      reasons.push('Short exercise when you need quick relief');
    }

    return { score, reasons };
  }

  private getTriggerScore(exercise: Exercise, triggers: string[]): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Map triggers to exercise categories and tags
    const triggerMap: Record<string, { categories: string[]; tags: string[] }> = {
      'work': { categories: ['breathing', 'cognitive'], tags: ['stress', 'focus'] },
      'school': { categories: ['breathing', 'cognitive'], tags: ['stress', 'focus'] },
      'relationships': { categories: ['grounding', 'cognitive'], tags: ['emotional', 'communication'] },
      'anxiety': { categories: ['breathing', 'grounding'], tags: ['anxiety', 'calming'] },
      'sleep': { categories: ['breathing', 'grounding'], tags: ['relaxation', 'bedtime'] },
      'social': { categories: ['grounding', 'cognitive'], tags: ['confidence', 'social'] }
    };

    triggers.forEach(trigger => {
      const triggerLower = trigger.toLowerCase();
      const mapping = triggerMap[triggerLower];
      
      if (mapping) {
        // Category match
        if (mapping.categories.includes(exercise.category)) {
          score += 15;
          reasons.push(`Helps with ${trigger.toLowerCase()}-related stress`);
        }
        
        // Tag match
        const tagMatch = exercise.tags.some(tag => 
          mapping.tags.some(mappedTag => 
            tag.toLowerCase().includes(mappedTag) || mappedTag.includes(tag.toLowerCase())
          )
        );
        
        if (tagMatch) {
          score += 10;
          reasons.push(`Specifically designed for ${trigger.toLowerCase()} situations`);
        }
      }
    });

    return { score, reasons };
  }

  private getTimeScore(
    exercise: Exercise, 
    timeOfDay: RecommendationContext['timeOfDay'], 
    availableTime: RecommendationContext['availableTime']
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Time of day preferences
    const timePreferences = {
      morning: { breathing: 10, cognitive: 15, grounding: 5 },
      afternoon: { breathing: 5, cognitive: 15, grounding: 10 },
      evening: { breathing: 15, cognitive: 5, grounding: 15 },
      night: { breathing: 20, cognitive: 0, grounding: 10 }
    };

    const timeScore = timePreferences[timeOfDay][exercise.category] || 0;
    score += timeScore;
    
    if (timeScore > 10) {
      reasons.push(`Perfect for ${timeOfDay} practice`);
    }

    // Available time matching
    const timeLimits = { short: 300, medium: 900, long: 1800 };
    const maxDuration = timeLimits[availableTime];
    
    if (exercise.duration_seconds <= maxDuration) {
      score += 20;
      reasons.push(`Fits your available time (${availableTime})`);
      
      // Bonus for optimal duration usage
      if (exercise.duration_seconds > maxDuration * 0.7) {
        score += 5;
        reasons.push('Makes good use of your time');
      }
    } else {
      score -= 30; // Penalty for being too long
    }

    return { score, reasons };
  }

  private getPreferenceScore(
    exercise: Exercise, 
    preferences: RecommendationContext['userPreferences']
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Favorite categories
    if (preferences.favoriteCategories.includes(exercise.category)) {
      score += 20;
      reasons.push('From your favorite category');
    }

    // Previously completed exercises (slight bonus for familiarity)
    if (preferences.completedExercises.includes(exercise.id)) {
      score += 5;
      reasons.push('You\'ve done this before');
    }

    // Avoided exercises (penalty)
    if (preferences.avoidedExercises.includes(exercise.id)) {
      score -= 25;
    }

    return { score, reasons };
  }

  private getHistoryScore(exercise: Exercise, history: MoodLog[]): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Analyze mood patterns
    const recentMoods = history.slice(0, 7); // Last 7 entries
    const averageMood = recentMoods.reduce((sum, log) => sum + log.mood, 0) / recentMoods.length;
    
    // If mood has been consistently low, prefer calming exercises
    if (averageMood < 2.5 && exercise.category === 'breathing') {
      score += 15;
      reasons.push('Recommended based on recent mood patterns');
    }
    
    // If mood is improving, suggest cognitive exercises
    if (recentMoods.length >= 3) {
      const trend = recentMoods[0].mood - recentMoods[2].mood;
      if (trend > 0 && exercise.category === 'cognitive') {
        score += 10;
        reasons.push('Build on your recent progress');
      }
    }

    return { score, reasons };
  }

  private applyDiversityFilter(
    scoredExercises: RecommendationScore[], 
    limit: number
  ): RecommendationScore[] {
    const selected: RecommendationScore[] = [];
    const categoryCount: Record<string, number> = {};

    for (const scored of scoredExercises) {
      if (selected.length >= limit) break;

      const category = scored.exercise.category;
      const currentCount = categoryCount[category] || 0;

      // Limit exercises per category to ensure diversity
      if (currentCount < Math.ceil(limit / 2)) {
        selected.push(scored);
        categoryCount[category] = currentCount + 1;
      }
    }

    // Fill remaining slots if needed
    for (const scored of scoredExercises) {
      if (selected.length >= limit) break;
      if (!selected.includes(scored)) {
        selected.push(scored);
      }
    }

    return selected;
  }

  private getFallbackRecommendations(
    exercises: Exercise[], 
    mood: MoodLevel, 
    limit: number
  ): Exercise[] {
    // Simple fallback based on mood and difficulty
    return exercises
      .filter(exercise => 
        exercise.difficulty === 'beginner' && 
        exercise.duration_seconds <= 600
      )
      .sort((a, b) => {
        // Prefer breathing for low moods, cognitive for higher moods
        if (mood <= 2) {
          return a.category === 'breathing' ? -1 : 1;
        } else {
          return a.category === 'cognitive' ? -1 : 1;
        }
      })
      .slice(0, limit);
  }
}

// Export singleton instance
export const exerciseRecommendationEngine = new ExerciseRecommendationEngine();

// Export class for testing
export { ExerciseRecommendationEngine };
