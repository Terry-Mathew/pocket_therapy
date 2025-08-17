/**
 * Exercise Recommendation Engine
 * 
 * Intelligent recommendation system that suggests exercises based on:
 * - Current mood state
 * - Time of day
 * - Previous exercise effectiveness
 * - User preferences and history
 */

import { Exercise, MoodLog, ExerciseSession } from '../types';

interface RecommendationContext {
  currentMood?: number; // 1-5 scale
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  recentMoods: MoodLog[];
  exerciseHistory: ExerciseSession[];
  userPreferences?: {
    preferredCategories?: string[];
    preferredDuration?: number;
    avoidCategories?: string[];
  };
}

interface RecommendationScore {
  exerciseId: string;
  score: number;
  reasons: string[];
}

interface ExerciseRecommendation {
  exercise: Exercise;
  score: number;
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
}

class ExerciseRecommendationEngine {
  /**
   * Get personalized exercise recommendations
   */
  getRecommendations(
    exercises: Exercise[],
    context: RecommendationContext,
    limit: number = 3
  ): ExerciseRecommendation[] {
    const scores = exercises.map(exercise => 
      this.calculateExerciseScore(exercise, context)
    );

    // Sort by score and take top recommendations
    const topScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return topScores.map(scoreData => {
      const exercise = exercises.find(ex => ex.id === scoreData.exerciseId)!;
      return {
        exercise,
        score: scoreData.score,
        reasons: scoreData.reasons,
        confidence: this.getConfidenceLevel(scoreData.score),
      };
    });
  }

  /**
   * Calculate recommendation score for a specific exercise
   */
  private calculateExerciseScore(
    exercise: Exercise,
    context: RecommendationContext
  ): RecommendationScore {
    let score = 0;
    const reasons: string[] = [];

    // Base score for all exercises
    score += 10;

    // Mood-based scoring
    const moodScore = this.getMoodBasedScore(exercise, context.currentMood);
    score += moodScore.score;
    reasons.push(...moodScore.reasons);

    // Time-based scoring
    const timeScore = this.getTimeBasedScore(exercise, context.timeOfDay);
    score += timeScore.score;
    reasons.push(...timeScore.reasons);

    // Effectiveness history scoring
    const historyScore = this.getHistoryBasedScore(exercise, context.exerciseHistory);
    score += historyScore.score;
    reasons.push(...historyScore.reasons);

    // User preference scoring
    const preferenceScore = this.getPreferenceBasedScore(exercise, context.userPreferences);
    score += preferenceScore.score;
    reasons.push(...preferenceScore.reasons);

    // Recent usage penalty (avoid recommending same exercise too often)
    const recencyPenalty = this.getRecencyPenalty(exercise, context.exerciseHistory);
    score -= recencyPenalty;
    if (recencyPenalty > 0) {
      reasons.push('Trying something different');
    }

    return {
      exerciseId: exercise.id,
      score: Math.max(0, score),
      reasons: reasons.filter(Boolean),
    };
  }

  /**
   * Score based on current mood
   */
  private getMoodBasedScore(exercise: Exercise, currentMood?: number): { score: number; reasons: string[] } {
    if (!currentMood) return { score: 0, reasons: [] };

    const reasons: string[] = [];
    let score = 0;

    // Mood-specific exercise recommendations
    if (currentMood <= 2) { // Low mood (😢😕)
      if (exercise.category === 'breathing') {
        score += 15;
        reasons.push('Breathing exercises help when feeling low');
      }
      if (exercise.category === 'grounding') {
        score += 12;
        reasons.push('Grounding can help stabilize difficult emotions');
      }
      if (exercise.tags?.includes('anxiety')) {
        score += 10;
        reasons.push('Helpful for managing difficult feelings');
      }
    } else if (currentMood === 3) { // Neutral mood (😐)
      if (exercise.category === 'mindfulness') {
        score += 10;
        reasons.push('Mindfulness helps maintain emotional balance');
      }
      if (exercise.category === 'breathing') {
        score += 8;
        reasons.push('Good for maintaining calm');
      }
    } else { // Good mood (🙂😊)
      if (exercise.category === 'gratitude') {
        score += 12;
        reasons.push('Perfect time to practice gratitude');
      }
      if (exercise.category === 'mindfulness') {
        score += 8;
        reasons.push('Enhance your positive state');
      }
    }

    return { score, reasons };
  }

  /**
   * Score based on time of day
   */
  private getTimeBasedScore(exercise: Exercise, timeOfDay: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    switch (timeOfDay) {
      case 'morning':
        if (exercise.category === 'breathing' && exercise.duration <= 180) {
          score += 10;
          reasons.push('Great way to start your day');
        }
        if (exercise.tags?.includes('energy')) {
          score += 8;
          reasons.push('Energizing for the morning');
        }
        break;

      case 'afternoon':
        if (exercise.category === 'grounding') {
          score += 8;
          reasons.push('Perfect midday reset');
        }
        if (exercise.duration <= 300) {
          score += 5;
          reasons.push('Quick break from your day');
        }
        break;

      case 'evening':
        if (exercise.category === 'relaxation') {
          score += 12;
          reasons.push('Ideal for winding down');
        }
        if (exercise.tags?.includes('sleep')) {
          score += 10;
          reasons.push('Helps prepare for rest');
        }
        break;

      case 'night':
        if (exercise.category === 'breathing' && exercise.tags?.includes('sleep')) {
          score += 15;
          reasons.push('Perfect for bedtime');
        }
        if (exercise.duration <= 240) {
          score += 8;
          reasons.push('Gentle and calming');
        }
        break;
    }

    return { score, reasons };
  }

  /**
   * Score based on exercise effectiveness history
   */
  private getHistoryBasedScore(exercise: Exercise, history: ExerciseSession[]): { score: number; reasons: string[] } {
    const exerciseHistory = history.filter(session => session.exerciseId === exercise.id);
    
    if (exerciseHistory.length === 0) {
      return { score: 2, reasons: ['New exercise to try'] };
    }

    const reasons: string[] = [];
    let score = 0;

    // Calculate average rating
    const ratingsWithValues = exerciseHistory.filter(session => session.rating && session.rating > 0);
    if (ratingsWithValues.length > 0) {
      const avgRating = ratingsWithValues.reduce((sum, session) => sum + (session.rating || 0), 0) / ratingsWithValues.length;
      
      if (avgRating >= 4) {
        score += 15;
        reasons.push('You found this very helpful before');
      } else if (avgRating >= 3) {
        score += 8;
        reasons.push('Previously helpful for you');
      } else if (avgRating < 2) {
        score -= 10;
        reasons.push('Trying a different approach');
      }
    }

    // Completion rate bonus
    const completionRate = exerciseHistory.filter(session => session.completedAt).length / exerciseHistory.length;
    if (completionRate >= 0.8) {
      score += 5;
      reasons.push('You usually complete this exercise');
    }

    return { score, reasons };
  }

  /**
   * Score based on user preferences
   */
  private getPreferenceBasedScore(exercise: Exercise, preferences?: RecommendationContext['userPreferences']): { score: number; reasons: string[] } {
    if (!preferences) return { score: 0, reasons: [] };

    const reasons: string[] = [];
    let score = 0;

    // Preferred categories
    if (preferences.preferredCategories?.includes(exercise.category)) {
      score += 10;
      reasons.push('Matches your preferences');
    }

    // Avoided categories
    if (preferences.avoidCategories?.includes(exercise.category)) {
      score -= 15;
    }

    // Preferred duration
    if (preferences.preferredDuration) {
      const durationDiff = Math.abs(exercise.duration - preferences.preferredDuration);
      if (durationDiff <= 30) {
        score += 5;
        reasons.push('Good duration for you');
      }
    }

    return { score, reasons };
  }

  /**
   * Penalty for recently used exercises
   */
  private getRecencyPenalty(exercise: Exercise, history: ExerciseSession[]): number {
    const recentSessions = history
      .filter(session => session.exerciseId === exercise.id)
      .filter(session => {
        const sessionDate = new Date(session.startedAt);
        const daysSince = (Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 2; // Within last 2 days
      });

    return recentSessions.length * 3; // 3 point penalty per recent use
  }

  /**
   * Get confidence level based on score
   */
  private getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 30) return 'high';
    if (score >= 20) return 'medium';
    return 'low';
  }

  /**
   * Get time of day from current time
   */
  getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Get mood-specific quick recommendations
   */
  getQuickRecommendations(mood: number): string[] {
    const recommendations = {
      1: ['Take slow, deep breaths', 'Try the 5-4-3-2-1 grounding technique', 'Remember: this feeling will pass'],
      2: ['Focus on your breathing', 'Practice self-compassion', 'Consider a gentle grounding exercise'],
      3: ['Take a mindful moment', 'Check in with your body', 'Practice gratitude'],
      4: ['Enjoy this positive moment', 'Share your good mood', 'Practice mindfulness'],
      5: ['Celebrate this feeling', 'Practice gratitude', 'Share your joy with others'],
    };

    return recommendations[mood as keyof typeof recommendations] || recommendations[3];
  }

  /**
   * Get crisis-appropriate exercise recommendations
   */
  getCrisisRecommendations(exercises: Exercise[]): Exercise[] {
    return exercises.filter(exercise => 
      exercise.category === 'breathing' || 
      exercise.category === 'grounding' ||
      exercise.tags?.includes('crisis') ||
      exercise.duration <= 300 // 5 minutes or less
    ).slice(0, 3);
  }
}

export const exerciseRecommendationEngine = new ExerciseRecommendationEngine();
