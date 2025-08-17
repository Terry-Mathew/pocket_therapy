# Crisis Detection System

## Overview
PocketTherapy implements a privacy-first, local-only crisis detection system to identify users who may need immediate mental health support and provide appropriate resources and interventions.

## Detection Strategy

### Privacy-First Approach
- **100% Local Detection**: All text analysis happens on-device
- **Zero Server Transmission**: User text never leaves the device
- **Complete Privacy**: No cloud-based text analysis or storage
- **Offline Capable**: Works without internet connection

### Detection Algorithm

#### Tier 1: Immediate Crisis Keywords
```javascript
const immediateCrisisKeywords = [
  // Direct self-harm indicators
  'kill myself', 'end my life', 'suicide', 'want to die',
  'hurt myself', 'cut myself', 'harm myself', 'end it all',
  
  // Planning indicators
  'have a plan', 'pills to', 'bridge to jump', 'rope to',
  'gun to', 'razor to', 'ways to die', 'how to kill',
  
  // Immediate danger
  'tonight is the night', 'can\'t go on', 'no point living',
  'better off dead', 'everyone would be better without me'
];
```

#### Tier 2: Moderate Risk Keywords
```javascript
const moderateRiskKeywords = [
  'hopeless', 'worthless', 'burden to everyone', 'can\'t take it',
  'give up', 'no way out', 'trapped', 'nothing matters',
  'hate myself', 'wish I was dead', 'disappear forever'
];
```

#### Detection Implementation
```typescript
interface CrisisDetection {
  level: 'IMMEDIATE' | 'MODERATE' | 'NONE';
  keywords: string[];
  confidence: number;
}

const detectCrisisLevel = (text: string): CrisisDetection => {
  const cleanText = text.toLowerCase().trim();
  
  // Tier 1: Immediate intervention needed
  const tier1Matches = immediateCrisisKeywords.filter(keyword => 
    cleanText.includes(keyword)
  );
  
  if (tier1Matches.length > 0) {
    return { 
      level: 'IMMEDIATE', 
      keywords: tier1Matches,
      confidence: 0.9 
    };
  }
  
  // Tier 2: Supportive resources offered
  const tier2Matches = moderateRiskKeywords.filter(keyword => 
    cleanText.includes(keyword)
  );
  
  if (tier2Matches.length >= 2) {
    return { 
      level: 'MODERATE', 
      keywords: tier2Matches,
      confidence: 0.7 
    };
  }
  
  return { level: 'NONE', keywords: [], confidence: 0 };
};
```

## Escalation Protocols

### Immediate Crisis (Tier 1) Response
1. **Instant Overlay**: Crisis support resources with 0-second delay
2. **Emergency Contacts**: 
   - India: Emergency Services 112 (large red button)
   - Vandrevala Foundation: 1860 2662 345
   - Aasra Helpline: 91-9820466726
3. **Immediate SOS Access**: "Start calm breathing now" option
4. **Safety Planning**: "Remove harmful objects" checklist
5. **Trusted Contacts**: Quick-dial previously saved emergency contacts

### Moderate Risk (Tier 2) Response
1. **Gentle Resources**: "You're not alone" supportive messaging
2. **Coping Tools**: Immediate access to grounding exercises
3. **Professional Help**: "Talk to someone trained" with helpline info
4. **Follow-up**: Optional check-in reminder in 2 hours

## False Positive Handling

### Minimally Intrusive Approach
```typescript
const handleCrisisDetection = (level: CrisisLevel, onDismiss: () => void) => {
  if (level === 'IMMEDIATE') {
    // Full overlay for immediate crisis
    showCrisisOverlay({
      canDismiss: true,
      dismissText: "I'm safe, continue with check-in",
      primaryAction: "Get help now"
    });
  } else if (level === 'MODERATE') {
    // Bottom sheet for moderate risk
    showSupportSheet({
      dismissible: true,
      message: "Having a tough time? Support is available",
      actions: ["View resources", "Continue check-in"]
    });
  }
};
```

### False Positive Reduction Strategies
- **Context Awareness**: Avoid triggering on book/movie titles
- **Phrase Matching**: Use complete phrases vs. single words
- **User Feedback**: "Was this helpful?" to improve detection
- **Pattern Recognition**: Consider frequency and context

## Implementation Details

### Service Architecture
```typescript
class LocalCrisisDetection {
  private keywords = {
    immediate: immediateCrisisKeywords,
    moderate: moderateRiskKeywords
  };
  
  detectInText(text: string): CrisisDetection {
    const result = this.analyzeText(text);
    
    // Log detection event (no text content) for safety monitoring
    if (result.level !== 'NONE') {
      Analytics.track('crisis_pattern_detected', {
        level: result.level,
        timestamp: Date.now(),
        // Never log actual text content
      });
    }
    
    return result;
  }
  
  private analyzeText(text: string): CrisisDetection {
    // Implementation of detection algorithm
    return detectCrisisLevel(text);
  }
}
```

### Integration Points
- **Mood Check-in Notes**: Real-time analysis as user types
- **Exercise Reflections**: Post-exercise note analysis
- **Journal Entries**: Optional analysis for premium users
- **Chat/Support**: If future chat features are added

## Privacy & Data Handling

### Data Protection
- **No Text Storage**: Crisis keywords never stored with user text
- **Anonymous Logging**: Only detection events logged, not content
- **Local Processing**: All analysis happens on user's device
- **User Control**: Users can disable crisis detection in settings

### Analytics (Privacy-Safe)
```typescript
const logCrisisEvent = (level: CrisisLevel, userActions: string[]) => {
  const safeLog = {
    event_id: generateUUID(),
    timestamp: Date.now(),
    crisis_level: level,
    user_actions: userActions, // ['viewed_resources', 'started_breathing']
    session_id: getAnonymousSessionId(),
    // Explicitly NOT logging: user_text, mood_content, personal_data
  };
  
  // Store locally for safety monitoring
  AsyncStorage.setItem('crisis_events', JSON.stringify(safeLog));
  
  // Send anonymized aggregate to improve crisis support
  Analytics.track('crisis_support_usage', {
    level: level,
    effective_resources: userActions.length > 0,
    // No personal information transmitted
  });
};
```

## Testing & Validation

### Testing Strategy
- **Keyword Coverage**: Test all crisis keywords and phrases
- **False Positive Testing**: Test with common non-crisis text
- **Performance Testing**: Ensure minimal impact on app performance
- **Accessibility Testing**: Screen reader compatibility

### Safety Validation
- **Mental Health Professional Review**: Crisis response protocols
- **Regional Resource Verification**: Emergency contact accuracy
- **User Testing**: Feedback from target demographic
- **Continuous Monitoring**: Track effectiveness and user feedback

This crisis detection system prioritizes user safety while maintaining complete privacy and providing appropriate, culturally-sensitive support resources.
