/**
 * OpenAI Service
 * 
 * Handles AI-powered features including personalized exercise recommendations,
 * mood pattern analysis, and therapeutic content generation with proper
 * error handling, rate limiting, and cost monitoring
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodLog, Exercise, ExerciseSession } from '../types';
import { aiSafetyService } from './aiSafetyService';
import { openAIWrapper } from './openAIWrapper';

interface AIUsageStats {
  totalTokensUsed: number;
  totalCost: number; // in USD
  requestCount: number;
  lastResetDate: string;
  monthlyLimit: number; // in USD
}

interface AIRequest {
  timestamp: string;
  type: 'exercise_recommendation' | 'mood_analysis' | 'content_generation';
  tokensUsed: number;
  cost: number;
  success: boolean;
  error?: string;
  retryCount?: number;
  fallbackUsed?: boolean;
}

interface AIResponse<T> {
  success: boolean;
  data?: T;
  fallbackUsed: boolean;
  userMessage: string;
  retryAvailable: boolean;
  error?: string;
  retryCount: number;
}

interface ErrorContext {
  operation: string;
  userMood?: number;
  timestamp: number;
  retryCount: number;
  errorType: 'network' | 'api_limit' | 'invalid_response' | 'timeout' | 'unknown';
}

interface ExerciseRecommendationRequest {
  currentMood: number;
  recentMoods: number[];
  triggers?: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  availableTime: number; // minutes
  preferredTypes?: string[];
  previousExercises?: string[];
  retryCount?: number;
}

interface MoodAnalysisRequest {
  moodLogs: MoodLog[];
  exerciseSessions: ExerciseSession[];
  timeframe: 'week' | 'month' | 'quarter';
}

const STORAGE_KEYS = {
  USAGE_STATS: 'ai_usage_stats',
  REQUEST_HISTORY: 'ai_request_history',
  API_KEY: 'openai_api_key',
} as const;

// Token pricing for GPT-3.5-turbo (as of 2024)
const TOKEN_PRICING = {
  input: 0.0015 / 1000, // $0.0015 per 1K input tokens
  output: 0.002 / 1000, // $0.002 per 1K output tokens
};

class OpenAIService {
  private isInitialized = false;
  private usageStats: AIUsageStats | null = null;
  private errorHistory: ErrorContext[] = [];
  private maxRetries = 3;
  private retryDelay = 1000; // Base delay in milliseconds

  /**
   * Initialize OpenAI service using the wrapper
   */
  async initialize(apiKey?: string): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Get API key from storage or parameter
      const storedKey = apiKey || await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);

      if (!storedKey) {
        console.warn('OpenAI API key not provided - AI features will be disabled');
        return;
      }

      // Initialize the OpenAI wrapper
      const success = await openAIWrapper.initialize({
        apiKey: storedKey,
      });

      if (!success) {
        const error = openAIWrapper.getError();
        console.warn('OpenAI wrapper initialization failed:', error);
        // Continue without AI features
        this.isInitialized = true;
        return;
      }

      // Load usage stats
      await this.loadUsageStats();

      this.isInitialized = true;
      console.log('OpenAI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenAI service:', error);
      // Don't throw error - allow app to continue without AI features
      this.isInitialized = true;
    }
  }

  /**
   * Generate personalized exercise recommendations with enhanced error handling
   */
  async generateExerciseRecommendations(
    request: ExerciseRecommendationRequest,
    availableExercises: Exercise[]
  ): Promise<AIResponse<Exercise[]>> {
    if (!openAIWrapper.isReady()) {
      console.warn('OpenAI not initialized - returning fallback recommendations');
      const fallbackData = this.getFallbackRecommendations(request, availableExercises);
      return {
        success: false,
        data: fallbackData,
        fallbackUsed: true,
        userMessage: 'Using your personalized recommendations while our AI starts up.',
        retryAvailable: true,
        retryCount: 0,
      };
    }

    try {
      // Check usage limits
      if (!await this.checkUsageLimits()) {
        console.warn('Usage limits exceeded - returning fallback recommendations');
        const fallbackData = this.getFallbackRecommendations(request, availableExercises);
        return {
          success: false,
          data: fallbackData,
          fallbackUsed: true,
          userMessage: 'Our AI is taking a quick break. We\'ve prepared some great recommendations for you.',
          retryAvailable: false,
          retryCount: 0,
        };
      }

      const prompt = this.buildExerciseRecommendationPrompt(request, availableExercises);

      // Use retry mechanism with timeout
      const aiOperation = async () => {
        const startTime = Date.now();
        const completion = await Promise.race([
          openAIWrapper.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a compassionate mental health assistant. Recommend exercises based on the user\'s current state. Respond only with exercise IDs from the provided list, separated by commas.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]) as any;

        const responseTime = Date.now() - startTime;
        const tokensUsed = completion.usage?.total_tokens || 0;
        const cost = openAIWrapper.calculateCost(completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0);

        // Log usage
        await this.logRequest({
          timestamp: new Date().toISOString(),
          type: 'exercise_recommendation',
          tokensUsed,
          cost,
          success: true,
        });

        // Parse response
        const recommendedIds = completion.choices[0]?.message?.content
          ?.split(',')
          .map(id => id.trim())
          .filter(id => id) || [];

        const recommendations = availableExercises.filter(exercise =>
          recommendedIds.includes(exercise.id)
        );

        console.log(`AI exercise recommendations generated in ${responseTime}ms, ${tokensUsed} tokens, $${cost.toFixed(4)}`);

        return recommendations.length > 0 ? recommendations : this.getFallbackRecommendations(request, availableExercises);
      };

      const recommendations = await this.retryWithBackoff(aiOperation);

      return {
        success: true,
        data: recommendations,
        fallbackUsed: false,
        userMessage: 'Here are your personalized AI recommendations.',
        retryAvailable: false,
        retryCount: 0,
      };

    } catch (error) {
      console.error('Failed to generate AI exercise recommendations:', error);

      // Log failed request
      await this.logRequest({
        timestamp: new Date().toISOString(),
        type: 'exercise_recommendation',
        tokensUsed: 0,
        cost: 0,
        success: false,
        error: error.message,
        retryCount: request.retryCount || 0,
        fallbackUsed: true,
      });

      // Use enhanced error handling
      return this.handleAIError(
        error,
        'exercise_recommendation',
        () => this.getFallbackRecommendations(request, availableExercises),
        { userMood: request.currentMood, retryCount: request.retryCount || 0 }
      );
    }
  }

  /**
   * Analyze mood patterns and provide comprehensive insights
   */
  async analyzeMoodPatterns(request: MoodAnalysisRequest): Promise<{
    insights: string[];
    trends: string[];
    recommendations: string[];
    patterns: {
      timePatterns: { [hour: string]: number };
      triggerPatterns: { [trigger: string]: number };
      moodStability: number;
      averageMood: number;
    };
    riskFactors: string[];
    strengths: string[];
  }> {
    if (!this.client) {
      return this.getFallbackMoodAnalysis(request);
    }

    try {
      if (!await this.checkUsageLimits()) {
        return this.getFallbackMoodAnalysis(request);
      }

      // First, calculate basic patterns locally
      const patterns = this.calculateMoodPatterns(request.moodLogs);

      const prompt = this.buildEnhancedMoodAnalysisPrompt(request, patterns);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a compassionate mental health assistant with expertise in mood pattern analysis.

            Analyze the provided mood data and patterns to generate:
            - Gentle, supportive insights about mood patterns
            - Trend observations that are helpful but not alarming
            - Practical, actionable recommendations
            - Risk factors to be aware of (if any)
            - Personal strengths and positive patterns

            Use therapeutic language that is:
            - Non-judgmental and supportive
            - Focused on growth and self-awareness
            - Practical and actionable
            - Hopeful and empowering

            Respond ONLY with valid JSON in this format:
            {
              "insights": ["insight1", "insight2"],
              "trends": ["trend1", "trend2"],
              "recommendations": ["rec1", "rec2"],
              "riskFactors": ["risk1", "risk2"],
              "strengths": ["strength1", "strength2"]
            }`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.6,
      });

      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = this.calculateCost(completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0);

      await this.logRequest({
        timestamp: new Date().toISOString(),
        type: 'mood_analysis',
        tokensUsed,
        cost,
        success: true,
      });

      try {
        const response = JSON.parse(completion.choices[0]?.message?.content || '{}');

        const insights = {
          insights: response.insights || [],
          trends: response.trends || [],
          recommendations: response.recommendations || [],
          riskFactors: response.riskFactors || [],
          strengths: response.strengths || [],
        };

        // Perform safety validation
        const safetyCheck = await aiSafetyService.validateInsights(insights);

        if (safetyCheck.passed) {
          console.log('Mood analysis passed safety validation');
          return {
            ...insights,
            patterns,
          };
        } else {
          console.warn('Mood analysis failed safety validation:', safetyCheck.issues);
          // Return fallback analysis instead of potentially unsafe content
          return this.getFallbackMoodAnalysis(request);
        }
      } catch (parseError) {
        console.error('Failed to parse AI mood analysis response:', parseError);
        return this.getFallbackMoodAnalysis(request);
      }
    } catch (error) {
      console.error('Failed to analyze mood patterns with AI:', error);

      await this.logRequest({
        timestamp: new Date().toISOString(),
        type: 'mood_analysis',
        tokensUsed: 0,
        cost: 0,
        success: false,
        error: error.message,
      });

      return this.getFallbackMoodAnalysis(request);
    }
  }

  /**
   * Generate custom exercise based on user context
   */
  async generateCustomExercise(
    context: {
      mood: number;
      triggers?: string[];
      timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      availableTime: number; // minutes
      preferredCategory?: 'breathing' | 'grounding' | 'cognitive' | 'mindfulness';
      recentMoods?: number[];
      stressLevel?: 'low' | 'medium' | 'high';
      environment?: 'home' | 'work' | 'public' | 'outdoors';
    }
  ): Promise<{
    title: string;
    category: string;
    duration: number;
    steps: string[];
    description: string;
    benefits: string[];
  } | null> {
    if (!this.client) {
      console.warn('OpenAI not initialized - returning fallback exercise');
      return this.getFallbackCustomExercise(context);
    }

    try {
      if (!await this.checkUsageLimits()) {
        console.warn('Usage limits exceeded - returning fallback exercise');
        return this.getFallbackCustomExercise(context);
      }

      const prompt = this.buildCustomExercisePrompt(context);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a compassionate mental health assistant specializing in creating personalized therapeutic exercises.

            Create exercises that are:
            - Gentle and non-judgmental
            - Appropriate for the user's current emotional state
            - Practical and easy to follow
            - Evidence-based (CBT, mindfulness, grounding techniques)
            - Respectful of the user's time and environment

            Respond ONLY with valid JSON in this exact format:
            {
              "title": "Exercise Name",
              "category": "breathing|grounding|cognitive|mindfulness",
              "duration": number_in_minutes,
              "steps": ["Step 1", "Step 2", "Step 3"],
              "description": "Brief description of what this exercise does",
              "benefits": ["Benefit 1", "Benefit 2"]
            }`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = this.calculateCost(completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0);

      await this.logRequest({
        timestamp: new Date().toISOString(),
        type: 'content_generation',
        tokensUsed,
        cost,
        success: true,
      });

      try {
        const response = JSON.parse(completion.choices[0]?.message?.content || '{}');

        // Validate response structure
        if (this.validateCustomExercise(response)) {
          // Perform safety validation
          const safetyCheck = await aiSafetyService.validateExercise(response);

          if (safetyCheck.passed) {
            console.log(`Generated and validated custom exercise: ${response.title}`);
            return response;
          } else {
            console.warn('Exercise failed safety validation:', safetyCheck.issues);
            // Try fallback instead of returning unsafe content
            return this.getFallbackCustomExercise(context);
          }
        } else {
          console.warn('Invalid exercise structure from AI');
          return this.getFallbackCustomExercise(context);
        }
      } catch (parseError) {
        console.error('Failed to parse AI exercise response:', parseError);
        return this.getFallbackCustomExercise(context);
      }
    } catch (error) {
      console.error('Failed to generate custom exercise:', error);

      await this.logRequest({
        timestamp: new Date().toISOString(),
        type: 'content_generation',
        tokensUsed: 0,
        cost: 0,
        success: false,
        error: error.message,
      });

      return this.getFallbackCustomExercise(context);
    }
  }

  /**
   * Generate therapeutic content
   */
  async generateTherapeuticContent(
    type: 'affirmation' | 'coping_strategy' | 'reflection_prompt',
    context: {
      mood?: number;
      triggers?: string[];
      timeOfDay?: string;
    }
  ): Promise<string> {
    if (!this.client) {
      return this.getFallbackContent(type, context);
    }

    try {
      if (!await this.checkUsageLimits()) {
        return this.getFallbackContent(type, context);
      }

      const prompt = this.buildContentGenerationPrompt(type, context);
      
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate mental health assistant. Generate supportive, therapeutic content using gentle, non-judgmental language.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = this.calculateCost(completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0);

      await this.logRequest({
        timestamp: new Date().toISOString(),
        type: 'content_generation',
        tokensUsed,
        cost,
        success: true,
      });

      const generatedContent = completion.choices[0]?.message?.content?.trim() || '';

      if (generatedContent) {
        // Perform safety validation
        const safetyCheck = await aiSafetyService.validateTherapeuticContent(
          generatedContent,
          type === 'affirmation' ? 'affirmation' : 'recommendation'
        );

        if (safetyCheck.passed) {
          console.log(`Generated and validated therapeutic content: ${type}`);
          return generatedContent;
        } else {
          console.warn('Therapeutic content failed safety validation:', safetyCheck.issues);
          return this.getFallbackContent(type, context);
        }
      }

      return this.getFallbackContent(type, context);
    } catch (error) {
      console.error('Failed to generate therapeutic content:', error);
      
      await this.logRequest({
        timestamp: new Date().toISOString(),
        type: 'content_generation',
        tokensUsed: 0,
        cost: 0,
        success: false,
        error: error.message,
      });

      return this.getFallbackContent(type, context);
    }
  }

  /**
   * Get current usage statistics
   */
  async getUsageStats(): Promise<AIUsageStats> {
    if (!this.usageStats) {
      await this.loadUsageStats();
    }
    return this.usageStats!;
  }

  /**
   * Reset monthly usage (called at the beginning of each month)
   */
  async resetMonthlyUsage(): Promise<void> {
    try {
      this.usageStats = {
        totalTokensUsed: 0,
        totalCost: 0,
        requestCount: 0,
        lastResetDate: new Date().toISOString(),
        monthlyLimit: 5.00, // $5 monthly limit
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(this.usageStats));
      console.log('Monthly AI usage reset');
    } catch (error) {
      console.error('Failed to reset monthly usage:', error);
    }
  }

  /**
   * Check if we're within usage limits
   */
  private async checkUsageLimits(): Promise<boolean> {
    const stats = await this.getUsageStats();
    
    // Check monthly cost limit
    if (stats.totalCost >= stats.monthlyLimit) {
      console.warn(`Monthly AI cost limit reached: $${stats.totalCost.toFixed(2)}`);
      return false;
    }

    // Check if we need to reset monthly usage
    const lastReset = new Date(stats.lastResetDate);
    const now = new Date();
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await this.resetMonthlyUsage();
    }

    return true;
  }

  /**
   * Load usage statistics from storage
   */
  private async loadUsageStats(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_STATS);
      if (stored) {
        this.usageStats = JSON.parse(stored);
      } else {
        // Initialize with default stats
        this.usageStats = {
          totalTokensUsed: 0,
          totalCost: 0,
          requestCount: 0,
          lastResetDate: new Date().toISOString(),
          monthlyLimit: 5.00,
        };
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      this.usageStats = {
        totalTokensUsed: 0,
        totalCost: 0,
        requestCount: 0,
        lastResetDate: new Date().toISOString(),
        monthlyLimit: 5.00,
      };
    }
  }

  /**
   * Log API request for monitoring
   */
  private async logRequest(request: AIRequest): Promise<void> {
    try {
      // Update usage stats
      if (this.usageStats && request.success) {
        this.usageStats.totalTokensUsed += request.tokensUsed;
        this.usageStats.totalCost += request.cost;
        this.usageStats.requestCount += 1;
        
        await AsyncStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(this.usageStats));
      }

      // Store request history (keep last 100 requests)
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.REQUEST_HISTORY);
      const history = existing ? JSON.parse(existing) : [];
      const newHistory = [...history, request].slice(-100);
      
      await AsyncStorage.setItem(STORAGE_KEYS.REQUEST_HISTORY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to log AI request:', error);
    }
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens * TOKEN_PRICING.input) + (outputTokens * TOKEN_PRICING.output);
  }

  /**
   * Build prompt for exercise recommendations
   */
  private buildExerciseRecommendationPrompt(
    request: ExerciseRecommendationRequest,
    exercises: Exercise[]
  ): string {
    const exerciseList = exercises.map(ex => `${ex.id}: ${ex.title} (${ex.category}, ${ex.duration}min)`).join('\n');
    
    return `
User Context:
- Current mood: ${request.currentMood}/5
- Recent mood trend: ${request.recentMoods.join(', ')}
- Time of day: ${request.timeOfDay}
- Available time: ${request.availableTime} minutes
- Triggers: ${request.triggers?.join(', ') || 'none'}
- Preferred types: ${request.preferredTypes?.join(', ') || 'any'}

Available exercises:
${exerciseList}

Please recommend 2-3 exercises that would be most helpful for this user's current state. Consider their mood, available time, and preferences. Respond only with exercise IDs separated by commas.
    `.trim();
  }

  /**
   * Calculate mood patterns from data
   */
  private calculateMoodPatterns(moodLogs: MoodLog[]): {
    timePatterns: { [hour: string]: number };
    triggerPatterns: { [trigger: string]: number };
    moodStability: number;
    averageMood: number;
  } {
    if (moodLogs.length === 0) {
      return {
        timePatterns: {},
        triggerPatterns: {},
        moodStability: 0,
        averageMood: 3,
      };
    }

    // Calculate time patterns
    const timePatterns: { [hour: string]: number } = {};
    const hourCounts: { [hour: string]: number } = {};

    moodLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours().toString();
      timePatterns[hour] = (timePatterns[hour] || 0) + log.value;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Average mood by hour
    Object.keys(timePatterns).forEach(hour => {
      timePatterns[hour] = timePatterns[hour] / hourCounts[hour];
    });

    // Calculate trigger patterns
    const triggerPatterns: { [trigger: string]: number } = {};
    moodLogs.forEach(log => {
      if (log.triggers) {
        log.triggers.forEach(trigger => {
          triggerPatterns[trigger] = (triggerPatterns[trigger] || 0) + 1;
        });
      }
    });

    // Calculate mood stability (lower variance = more stable)
    const moods = moodLogs.map(log => log.value);
    const averageMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - averageMood, 2), 0) / moods.length;
    const moodStability = Math.max(0, 1 - (variance / 4)); // Normalize to 0-1 scale

    return {
      timePatterns,
      triggerPatterns,
      moodStability,
      averageMood,
    };
  }

  /**
   * Build enhanced prompt for mood analysis
   */
  private buildEnhancedMoodAnalysisPrompt(
    request: MoodAnalysisRequest,
    patterns: any
  ): string {
    const recentMoods = request.moodLogs.slice(-14); // Last 2 weeks
    const moodData = recentMoods.map(log =>
      `${new Date(log.timestamp).toLocaleDateString()}: ${log.value}/5 ${log.triggers?.join(',') || ''} ${log.notes || ''}`
    ).join('\n');

    const exerciseData = request.exerciseSessions.slice(-10).map(session =>
      `${new Date(session.startedAt).toLocaleDateString()}: ${session.exerciseId} (${session.completedAt ? 'completed' : 'incomplete'})`
    ).join('\n');

    return `
Analyze this user's mental health data for the past ${request.timeframe}:

MOOD LOGS (recent 2 weeks):
${moodData}

EXERCISE SESSIONS (recent 10):
${exerciseData}

CALCULATED PATTERNS:
- Average mood: ${patterns.averageMood.toFixed(1)}/5
- Mood stability: ${(patterns.moodStability * 100).toFixed(0)}%
- Most common triggers: ${Object.entries(patterns.triggerPatterns)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 3)
  .map(([trigger]) => trigger)
  .join(', ') || 'none'}
- Time patterns: ${Object.entries(patterns.timePatterns)
  .sort(([,a], [,b]) => a - b)
  .slice(0, 2)
  .map(([hour, mood]) => `${hour}:00 (${mood.toFixed(1)})`)
  .join(', ')}

Please provide:
1. 2-3 gentle insights about their patterns
2. 2-3 trend observations (positive or areas for awareness)
3. 3-4 practical, actionable recommendations
4. 1-2 risk factors to be mindful of (if any)
5. 2-3 personal strengths or positive patterns

Focus on growth, self-awareness, and practical next steps.
    `.trim();
  }

  /**
   * Build prompt for mood analysis (legacy)
   */
  private buildMoodAnalysisPrompt(request: MoodAnalysisRequest): string {
    const moodData = request.moodLogs.slice(-30).map(log =>
      `${log.timestamp}: ${log.value}/5 ${log.triggers?.join(',') || ''}`
    ).join('\n');

    return `
Analyze the following mood data for the past ${request.timeframe}:

${moodData}

Provide insights about patterns, trends, and gentle recommendations in JSON format:
{
  "insights": ["insight1", "insight2"],
  "trends": ["trend1", "trend2"],
  "recommendations": ["rec1", "rec2"]
}

Use supportive, non-judgmental language. Focus on patterns and gentle suggestions.
    `.trim();
  }

  /**
   * Build prompt for custom exercise generation
   */
  private buildCustomExercisePrompt(context: any): string {
    const moodDescription = this.getMoodDescription(context.mood);
    const timeContext = this.getTimeContext(context.timeOfDay);
    const stressContext = context.stressLevel ? ` with ${context.stressLevel} stress levels` : '';
    const environmentContext = context.environment ? ` in a ${context.environment} environment` : '';

    return `
Create a personalized therapeutic exercise for someone who:
- Current mood: ${context.mood}/5 (${moodDescription})
- Time of day: ${context.timeOfDay} ${timeContext}
- Available time: ${context.availableTime} minutes
- Triggers: ${context.triggers?.join(', ') || 'none specified'}
- Preferred category: ${context.preferredCategory || 'any'}
- Recent mood trend: ${context.recentMoods?.join(', ') || 'not available'}${stressContext}${environmentContext}

Requirements:
- Duration must be ${context.availableTime} minutes or less
- Steps should be clear and easy to follow
- Language should be gentle and non-judgmental
- Exercise should be appropriate for current mood and context
- Include 3-6 specific steps
- Focus on evidence-based techniques (CBT, mindfulness, grounding)

Consider the user's current emotional state and create something that will be genuinely helpful right now.
    `.trim();
  }

  /**
   * Build prompt for content generation
   */
  private buildContentGenerationPrompt(
    type: string,
    context: any
  ): string {
    const basePrompts = {
      affirmation: `Generate a gentle, personalized affirmation for someone with mood ${context.mood}/5. Make it supportive and empowering.`,
      coping_strategy: `Suggest a practical coping strategy for someone dealing with ${context.triggers?.join(', ') || 'stress'}. Keep it simple and actionable.`,
      reflection_prompt: `Create a thoughtful reflection prompt for ${context.timeOfDay || 'today'}. Make it introspective but not overwhelming.`,
    };

    return basePrompts[type] || basePrompts.affirmation;
  }

  /**
   * Fallback methods when AI is unavailable
   */
  private getFallbackRecommendations(
    request: ExerciseRecommendationRequest,
    exercises: Exercise[]
  ): Exercise[] {
    // Simple rule-based fallback
    let filtered = exercises.filter(ex => ex.duration <= request.availableTime);
    
    if (request.currentMood <= 2) {
      filtered = filtered.filter(ex => ex.category === 'breathing' || ex.category === 'grounding');
    } else if (request.currentMood >= 4) {
      filtered = filtered.filter(ex => ex.category === 'cognitive' || ex.category === 'mindfulness');
    }

    return filtered.slice(0, 3);
  }

  private getFallbackMoodAnalysis(request: MoodAnalysisRequest): {
    insights: string[];
    trends: string[];
    recommendations: string[];
    patterns: any;
    riskFactors: string[];
    strengths: string[];
  } {
    const patterns = this.calculateMoodPatterns(request.moodLogs);

    const insights = [
      'Your mood data shows you\'re actively tracking your emotional well-being.',
      'Regular check-ins help build self-awareness and emotional intelligence.',
    ];

    const trends = [
      'Consider looking for patterns in your mood changes.',
      'Notice what activities or times of day affect your mood.',
    ];

    const recommendations = [
      'Continue your regular mood tracking practice.',
      'Try breathing exercises when you notice lower moods.',
      'Celebrate the positive moments in your data.',
    ];

    const riskFactors: string[] = [];
    const strengths = [
      'You\'re committed to understanding your emotional patterns.',
      'Regular self-check-ins show strong self-awareness.',
    ];

    // Add pattern-based insights if we have data
    if (request.moodLogs.length > 0) {
      if (patterns.averageMood < 2.5) {
        riskFactors.push('Recent mood levels have been consistently low - consider reaching out for support.');
        recommendations.push('Consider speaking with a mental health professional for additional support.');
      } else if (patterns.averageMood > 3.5) {
        strengths.push('Your overall mood trend shows positive emotional well-being.');
      }

      if (patterns.moodStability < 0.3) {
        insights.push('Your mood shows some variability - this is normal and shows you\'re in tune with your emotions.');
        recommendations.push('Try to identify what factors contribute to mood changes.');
      } else {
        strengths.push('Your mood shows good stability over time.');
      }

      // Add trigger insights
      const topTriggers = Object.entries(patterns.triggerPatterns)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2);

      if (topTriggers.length > 0) {
        insights.push(`You've identified ${topTriggers[0][0]} as a common trigger - awareness is the first step to managing it.`);
        recommendations.push(`Consider developing specific coping strategies for ${topTriggers[0][0]}.`);
      }
    }

    return {
      insights,
      trends,
      recommendations,
      patterns,
      riskFactors,
      strengths,
    };
  }

  /**
   * Validate custom exercise structure
   */
  private validateCustomExercise(exercise: any): boolean {
    return (
      exercise &&
      typeof exercise.title === 'string' &&
      typeof exercise.category === 'string' &&
      typeof exercise.duration === 'number' &&
      Array.isArray(exercise.steps) &&
      exercise.steps.length >= 3 &&
      exercise.steps.length <= 8 &&
      typeof exercise.description === 'string' &&
      Array.isArray(exercise.benefits) &&
      exercise.duration > 0 &&
      exercise.duration <= 30 // Max 30 minutes
    );
  }

  /**
   * Get fallback custom exercise
   */
  private getFallbackCustomExercise(context: any): {
    title: string;
    category: string;
    duration: number;
    steps: string[];
    description: string;
    benefits: string[];
  } {
    const duration = Math.min(context.availableTime, 5);

    if (context.mood <= 2) {
      // Low mood - grounding exercise
      return {
        title: 'Gentle Grounding',
        category: 'grounding',
        duration,
        steps: [
          'Find a comfortable position and take a deep breath',
          'Notice 5 things you can see around you',
          'Notice 4 things you can touch or feel',
          'Notice 3 things you can hear',
          'Notice 2 things you can smell',
          'Notice 1 thing you can taste',
          'Take three more deep breaths and gently return your attention to the present'
        ],
        description: 'A gentle grounding exercise to help you feel more present and centered',
        benefits: ['Reduces anxiety', 'Increases present-moment awareness', 'Provides emotional stability']
      };
    } else if (context.mood >= 4) {
      // Good mood - mindfulness exercise
      return {
        title: 'Gratitude Breathing',
        category: 'mindfulness',
        duration,
        steps: [
          'Sit comfortably and close your eyes if you feel safe doing so',
          'Take a slow, deep breath in for 4 counts',
          'As you breathe in, think of something you\'re grateful for',
          'Hold your breath gently for 2 counts',
          'Exhale slowly for 6 counts, sending appreciation to that thing',
          'Repeat this cycle 3-5 times with different things you\'re grateful for',
          'End with a gentle smile and open your eyes'
        ],
        description: 'Combine breathing with gratitude to enhance positive feelings',
        benefits: ['Amplifies positive emotions', 'Increases life satisfaction', 'Promotes calm focus']
      };
    } else {
      // Neutral mood - breathing exercise
      return {
        title: 'Calming Breath',
        category: 'breathing',
        duration,
        steps: [
          'Sit or lie down in a comfortable position',
          'Place one hand on your chest, one on your belly',
          'Breathe in slowly through your nose for 4 counts',
          'Feel your belly rise more than your chest',
          'Hold your breath gently for 2 counts',
          'Exhale slowly through your mouth for 6 counts',
          'Repeat this cycle 5-8 times at your own pace'
        ],
        description: 'A simple breathing exercise to promote relaxation and balance',
        benefits: ['Reduces stress', 'Calms the nervous system', 'Improves focus']
      };
    }
  }

  /**
   * Get mood description for prompts
   */
  private getMoodDescription(mood: number): string {
    if (mood <= 1) return 'very low, possibly distressed';
    if (mood <= 2) return 'low, feeling down';
    if (mood <= 3) return 'neutral, neither good nor bad';
    if (mood <= 4) return 'good, feeling positive';
    return 'very good, feeling great';
  }

  /**
   * Get time context for prompts
   */
  private getTimeContext(timeOfDay: string): string {
    const contexts = {
      morning: '(fresh start, may need energizing)',
      afternoon: '(midday, may need refocusing)',
      evening: '(winding down, may need calming)',
      night: '(late, may need relaxation for sleep)'
    };
    return contexts[timeOfDay] || '';
  }

  private getFallbackContent(type: string, context: any): string {
    const fallbacks = {
      affirmation: 'You are worthy of care and compassion, especially from yourself.',
      coping_strategy: 'Take three deep breaths and remind yourself that this feeling will pass.',
      reflection_prompt: 'What is one thing you can appreciate about yourself today?',
    };

    return fallbacks[type] || fallbacks.affirmation;
  }

  /**
   * Enhanced error handling with user-friendly messages and fallbacks
   */
  private async handleAIError<T>(
    error: any,
    operation: string,
    fallbackFunction: () => Promise<T> | T,
    context: any = {}
  ): Promise<AIResponse<T>> {
    const errorType = this.categorizeError(error);
    const retryCount = context.retryCount || 0;

    // Log error context
    this.errorHistory.push({
      operation,
      userMood: context.userMood,
      timestamp: Date.now(),
      retryCount,
      errorType,
    });

    // Keep only last 50 errors
    if (this.errorHistory.length > 50) {
      this.errorHistory = this.errorHistory.slice(-50);
    }

    // Generate user-friendly message
    const userMessage = this.getUserFriendlyErrorMessage(errorType, operation);

    try {
      // Execute fallback
      const fallbackData = await fallbackFunction();

      return {
        success: false,
        data: fallbackData,
        fallbackUsed: true,
        userMessage,
        retryAvailable: retryCount < this.maxRetries && errorType !== 'api_limit',
        error: error.message,
        retryCount,
      };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);

      return {
        success: false,
        fallbackUsed: false,
        userMessage: 'We\'re having trouble right now, but you can still use all the core features.',
        retryAvailable: false,
        error: error.message,
        retryCount,
      };
    }
  }

  /**
   * Categorize error types for appropriate handling
   */
  private categorizeError(error: any): ErrorContext['errorType'] {
    if (!error) return 'unknown';

    const message = error.message?.toLowerCase() || '';
    const status = error.status || error.response?.status;

    if (status === 429 || message.includes('rate limit')) {
      return 'api_limit';
    }

    if (status >= 500 || message.includes('timeout') || message.includes('network')) {
      return 'network';
    }

    if (status === 400 || message.includes('invalid') || message.includes('bad request')) {
      return 'invalid_response';
    }

    if (message.includes('timeout')) {
      return 'timeout';
    }

    return 'unknown';
  }

  /**
   * Generate user-friendly error messages
   */
  private getUserFriendlyErrorMessage(errorType: ErrorContext['errorType'], operation: string): string {
    const messages = {
      network: 'We\'re having trouble connecting right now. Using your personalized recommendations instead.',
      api_limit: 'Our AI is taking a quick break. We\'ve prepared some great recommendations for you.',
      invalid_response: 'We\'re fine-tuning our recommendations. Here are some proven exercises for you.',
      timeout: 'Taking a moment to find the perfect recommendations for you.',
      unknown: 'We\'re using your personalized recommendations while our AI catches up.',
    };

    return messages[errorType] || messages.unknown;
  }

  /**
   * Retry mechanism with exponential backoff
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    baseDelay: number = this.retryDelay
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        // Don't retry on certain error types
        const errorType = this.categorizeError(error);
        if (errorType === 'api_limit' || errorType === 'invalid_response') {
          throw error;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: ErrorContext[];
    errorRate: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentErrors = this.errorHistory.filter(e => e.timestamp > oneHourAgo);

    const errorsByType = this.errorHistory.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.errorHistory.length,
      errorsByType,
      recentErrors,
      errorRate: recentErrors.length / 60, // errors per minute in last hour
    };
  }
}

export const openAIService = new OpenAIService();
