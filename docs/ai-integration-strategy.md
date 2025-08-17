# AI Integration Strategy

## Overview
PocketTherapy integrates OpenAI's GPT-3.5-turbo for personalized exercise recommendations while maintaining cost efficiency, privacy, and robust fallback systems.

## OpenAI Integration Scope

### Model Selection: GPT-3.5-turbo
```javascript
const AI_CONFIG = {
  model: 'gpt-3.5-turbo',
  maxTokens: 150, // Keep responses short for mobile
  temperature: 0.3, // Conservative for mental health content
  endpoint: 'https://api.openai.com/v1/chat/completions'
};
```

**Rationale for GPT-3.5-turbo:**
- **Cost Effective**: $0.002/1K tokens vs $0.02/1K for GPT-4
- **Sufficient Quality**: Adequate for exercise recommendations
- **Faster Response**: Better user experience on mobile
- **Proven Safety**: Established content filtering

### Primary Use Case: Exercise Personalization
```typescript
const generatePersonalizedExercise = async (userContext: UserContext) => {
  const prompt = `
    User mood: ${userContext.mood}/5
    Recent triggers: ${userContext.triggers.join(', ')}
    Time of day: ${userContext.timeOfDay}
    Preferred exercise types: ${userContext.preferences.join(', ')}
    
    Suggest ONE 2-minute anxiety relief exercise specific to this situation.
    Format: Title, 3-4 simple steps, encouraging closing.
    Keep language gentle and non-clinical.
  `;
  
  return await openai.chat.completions.create({
    model: AI_CONFIG.model,
    messages: [
      { 
        role: 'system', 
        content: 'You are a gentle mental health coach specializing in brief anxiety relief techniques.' 
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature
  });
};
```

## Cost Analysis & Budget

### Cost Projections
```
MVP Usage Patterns (100K users):
- 100K users × 20% AI feature usage = 20K active AI users
- 20K users × 3 AI requests/week = 60K requests/week
- ~150 tokens per request = 9M tokens/week
- Weekly cost: $18 ($72/month)

Scale Projections (1M users):
- 1M users × 20% AI usage = 200K active AI users  
- 200K users × 3 requests/week = 600K requests/week
- Monthly cost: ~$720

Cost per user per month: $0.07 (very manageable)
```

### Cost Control Measures
```typescript
// Rate limiting per user
const AI_LIMITS = {
  free_tier: { 
    requests_per_day: 3, 
    requests_per_hour: 1 
  },
  premium_tier: { 
    requests_per_day: 15, 
    requests_per_hour: 3 
  }
};

// Response caching to reduce repeat calls
const getCachedResponse = async (userContext: UserContext) => {
  const cacheKey = `${userContext.mood}_${userContext.triggers.sort().join('')}_${userContext.timeOfDay}`;
  const cachedResponse = await AsyncStorage.getItem(`ai_cache_${cacheKey}`);
  
  if (cachedResponse) {
    const parsed = JSON.parse(cachedResponse);
    const ageHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
    
    if (ageHours < 24) { // Cache for 24 hours
      return parsed.content;
    }
  }
  
  return null;
};
```

### Premium Feature Strategy
**Recommended Approach: AI Features as Premium**
- **Free Tier**: Rule-based recommendations + 3 AI requests/day
- **Premium Tier**: Unlimited AI personalization + advanced features
- **Cost Justification**: Premium revenue covers AI costs
- **User Value**: Clear differentiation between free and paid experience

## Fallback Strategy System

### Three-Tier Fallback Architecture
```typescript
const getExerciseRecommendation = async (userContext: UserContext) => {
  try {
    // 1st: Try AI recommendation (with 5s timeout)
    const aiResponse = await Promise.race([
      generatePersonalizedExercise(userContext),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ]);
    return { type: 'AI', content: aiResponse };
    
  } catch (error) {
    // 2nd: Rule-based recommendation engine
    const ruleBasedExercise = getRuleBasedRecommendation(userContext);
    if (ruleBasedExercise) {
      return { type: 'RULE_BASED', content: ruleBasedExercise };
    }
    
    // 3rd: Default exercise based on mood
    const defaultExercise = getDefaultExercise(userContext.mood);
    return { type: 'DEFAULT', content: defaultExercise };
  }
};
```

### Rule-Based Recommendation Engine
```typescript
const getRuleBasedRecommendation = (context: UserContext) => {
  const rules = {
    high_anxiety: ['breathing', 'grounding'],
    exam_stress: ['breathing', 'cognitive'],
    social_anxiety: ['grounding', 'self_compassion'],
    work_stress: ['breathing', 'progressive_relaxation'],
    morning: ['energizing_breath', 'intention_setting'],
    evening: ['relaxation', 'gratitude'],
    low_mood: ['gentle_movement', 'self_compassion'],
    overwhelmed: ['grounding', 'breathing']
  };
  
  // Match user context to appropriate exercise categories
  const matchedCategories = [];
  
  // Mood-based matching
  if (context.mood <= 2) matchedCategories.push(...rules.low_mood);
  if (context.triggers.includes('exam')) matchedCategories.push(...rules.exam_stress);
  if (context.triggers.includes('social')) matchedCategories.push(...rules.social_anxiety);
  if (context.triggers.includes('work')) matchedCategories.push(...rules.work_stress);
  
  // Time-based matching
  const hour = new Date().getHours();
  if (hour < 12) matchedCategories.push(...rules.morning);
  if (hour > 18) matchedCategories.push(...rules.evening);
  
  // Select best exercise from matched categories
  return selectBestExercise(matchedCategories, context);
};
```

## Rate Limiting & Error Handling

### User-Friendly Rate Limiting
```typescript
const checkRateLimit = async (userId: string, tier: 'free' | 'premium') => {
  const limits = AI_LIMITS[tier];
  const today = new Date().toDateString();
  const hour = new Date().getHours();
  
  const dailyUsage = await getDailyUsage(userId, today);
  const hourlyUsage = await getHourlyUsage(userId, hour);
  
  if (dailyUsage >= limits.requests_per_day) {
    throw new RateLimitError('daily', limits.requests_per_day);
  }
  
  if (hourlyUsage >= limits.requests_per_hour) {
    throw new RateLimitError('hourly', limits.requests_per_hour);
  }
  
  return true;
};

// User-friendly error messages
const handleRateLimitError = (error: RateLimitError) => {
  if (error.type === 'daily') {
    showMessage({
      title: "Daily AI limit reached",
      message: "You've used your daily personalized recommendations. Try our curated exercises or upgrade for unlimited AI suggestions.",
      actions: [
        { text: "Browse exercises", action: () => navigateToLibrary() },
        { text: "Upgrade to premium", action: () => showPremiumUpgrade() }
      ]
    });
  } else {
    showMessage({
      title: "Taking a quick break",
      message: "Our AI is taking a short break. Here's a great exercise we think you'll like!",
      action: () => showRuleBasedRecommendation()
    });
  }
};
```

## Privacy & Safety

### Data Minimization
```typescript
const sanitizeUserContext = (context: UserContext) => {
  return {
    mood: context.mood, // 1-5 scale only
    triggers: context.triggers.slice(0, 3), // Max 3 triggers
    timeOfDay: getTimeCategory(context.timestamp), // morning/afternoon/evening
    preferences: context.exercisePreferences.slice(0, 2), // Max 2 preferences
    // Explicitly exclude: personal info, location, detailed notes
  };
};
```

### Content Safety
```typescript
const validateAIResponse = (response: string) => {
  const safetyChecks = [
    // No medical advice
    !response.toLowerCase().includes('diagnose'),
    !response.toLowerCase().includes('medication'),
    !response.toLowerCase().includes('therapy'),
    
    // Appropriate length
    response.length > 50 && response.length < 500,
    
    // Contains exercise structure
    response.includes('Step') || response.includes('1.'),
    
    // Positive tone
    !response.toLowerCase().includes('can\'t') || 
    !response.toLowerCase().includes('impossible')
  ];
  
  return safetyChecks.every(check => check);
};
```

## Implementation Timeline

### Phase 1: Basic AI Integration (Week 3)
- OpenAI API client setup
- Basic exercise generation
- Simple rate limiting
- Fallback to rule-based system

### Phase 2: Enhanced Features (Week 5)
- Response caching
- Advanced rate limiting
- Premium tier differentiation
- Content safety validation

### Phase 3: Optimization (Week 7)
- Performance monitoring
- Cost optimization
- A/B testing of AI vs rule-based
- User feedback integration

This AI integration strategy ensures PocketTherapy provides valuable personalized recommendations while maintaining cost control, privacy, and reliability through robust fallback systems.
