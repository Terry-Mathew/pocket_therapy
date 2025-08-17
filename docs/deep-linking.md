# Deep Linking Configuration

## Overview
Comprehensive deep linking system for PocketTherapy, enabling quick access to therapeutic features, crisis support, and seamless user experience across platforms.

## URL Scheme Configuration

### Primary Scheme
```typescript
const linkingConfig = {
  prefixes: [
    'pockettherapy://',
    'https://pockettherapy.app',
    'https://app.pockettherapy.com'
  ],
  
  config: {
    screens: {
      // Root navigation
      MainTabs: {
        path: '/',
        screens: {
          Home: '',
          Library: 'library',
          Insights: 'insights',
          Settings: 'settings'
        }
      },
      
      // Modal screens
      MoodCheckIn: 'checkin',
      SOS: 'sos',
      ExercisePlayer: 'exercise/:id/play',
      ExerciseDetail: 'exercise/:id',
      CrisisResources: 'crisis-help'
    }
  }
};
```

## Deep Link Routes

### App Entry Points
```typescript
const appEntryRoutes = {
  // Main app launch
  'pockettherapy://': 'Home',
  'pockettherapy://home': 'Home',
  
  // Direct tab access
  'pockettherapy://library': 'Library',
  'pockettherapy://insights': 'Insights',
  'pockettherapy://settings': 'Settings'
};
```

### Quick Action Routes
```typescript
const quickActionRoutes = {
  // Mood tracking
  'pockettherapy://checkin': 'MoodCheckIn',
  'pockettherapy://mood': 'MoodCheckIn',
  
  // Crisis support
  'pockettherapy://sos': 'SOS',
  'pockettherapy://emergency': 'SOS',
  'pockettherapy://crisis': 'CrisisResources',
  
  // Quick exercises
  'pockettherapy://breathe': 'SOS?exercise=breathing',
  'pockettherapy://ground': 'SOS?exercise=grounding',
  'pockettherapy://calm': 'SOS?exercise=quick-calm'
};
```

### Exercise System Routes
```typescript
const exerciseRoutes = {
  // Exercise library
  'pockettherapy://library': 'Library',
  'pockettherapy://library/:category': 'Library?category=:category',
  'pockettherapy://exercises': 'Library',
  
  // Specific exercises
  'pockettherapy://exercise/:id': 'ExerciseDetail',
  'pockettherapy://exercise/:id/play': 'ExercisePlayer',
  'pockettherapy://exercise/:id/info': 'ExerciseDetail',
  
  // Exercise categories
  'pockettherapy://breathing': 'Library?category=breathing',
  'pockettherapy://grounding': 'Library?category=grounding',
  'pockettherapy://cognitive': 'Library?category=cognitive'
};
```

### User Data Routes
```typescript
const userDataRoutes = {
  // Insights and analytics
  'pockettherapy://insights': 'Insights',
  'pockettherapy://trends': 'Insights?view=trends',
  'pockettherapy://patterns': 'Insights?view=patterns',
  
  // Settings and preferences
  'pockettherapy://settings': 'Settings',
  'pockettherapy://privacy': 'Settings?section=privacy',
  'pockettherapy://notifications': 'Settings?section=notifications',
  'pockettherapy://accessibility': 'Settings?section=accessibility',
  
  // Data management
  'pockettherapy://export': 'Settings?section=export',
  'pockettherapy://backup': 'Settings?section=backup'
};
```

## Deep Link Handlers

### Crisis Priority Handlers
```typescript
const crisisHandlers = {
  // Immediate crisis support
  handleSOSLink: (params) => {
    // Log crisis access for analytics
    analytics.track('crisis_deeplink_accessed', {
      source: 'deeplink',
      timestamp: new Date().toISOString()
    });
    
    // Navigate immediately - no delays
    navigation.navigate('SOS', {
      source: 'deeplink',
      immediate: true,
      ...params
    });
  },
  
  // Specific crisis exercises
  handleCrisisExercise: (exerciseType) => {
    navigation.navigate('SOS', {
      exercise: exerciseType,
      source: 'deeplink',
      autoStart: true
    });
  },
  
  // Crisis resources
  handleCrisisResources: () => {
    navigation.navigate('CrisisResources', {
      source: 'deeplink',
      priority: 'high'
    });
  }
};
```

### Exercise Access Handlers
```typescript
const exerciseHandlers = {
  // Exercise detail view
  handleExerciseDetail: (exerciseId, params = {}) => {
    // Validate exercise exists
    const exercise = getExerciseById(exerciseId);
    if (!exercise) {
      // Fallback to library
      navigation.navigate('Library', {
        error: 'exercise_not_found',
        searchQuery: exerciseId
      });
      return;
    }
    
    navigation.navigate('ExerciseDetail', {
      exerciseId,
      source: 'deeplink',
      ...params
    });
  },
  
  // Direct exercise player
  handleExercisePlayer: (exerciseId, params = {}) => {
    const exercise = getExerciseById(exerciseId);
    if (!exercise) {
      handleExerciseDetail(exerciseId, params);
      return;
    }
    
    navigation.navigate('ExercisePlayer', {
      exerciseId,
      source: 'deeplink',
      autoStart: params.autoStart || false,
      ...params
    });
  },
  
  // Category filtering
  handleCategoryFilter: (category) => {
    navigation.navigate('Library', {
      initialCategory: category,
      source: 'deeplink'
    });
  }
};
```

### User Flow Handlers
```typescript
const userFlowHandlers = {
  // Mood check-in
  handleMoodCheckIn: (params = {}) => {
    // Check if user has recent check-in
    const lastCheckIn = getLastMoodCheckIn();
    const hoursSinceLastCheckIn = lastCheckIn 
      ? (Date.now() - lastCheckIn.timestamp) / (1000 * 60 * 60)
      : 24;
    
    if (hoursSinceLastCheckIn < 2 && !params.force) {
      // Show recent check-in, offer to view insights instead
      showRecentCheckInDialog();
      return;
    }
    
    navigation.navigate('MoodCheckIn', {
      source: 'deeplink',
      ...params
    });
  },
  
  // Settings navigation
  handleSettingsSection: (section) => {
    navigation.navigate('Settings', {
      initialSection: section,
      source: 'deeplink'
    });
  }
};
```

## URL Parameter Handling

### Parameter Parsing
```typescript
const parseDeepLinkParams = (url) => {
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  const queryParams = Object.fromEntries(urlObj.searchParams);
  
  return {
    path: pathSegments,
    query: queryParams,
    hash: urlObj.hash
  };
};
```

### Parameter Validation
```typescript
const validateDeepLinkParams = (route, params) => {
  const validationRules = {
    exerciseId: {
      required: true,
      type: 'string',
      pattern: /^[a-zA-Z0-9-_]+$/
    },
    category: {
      required: false,
      type: 'string',
      enum: ['breathing', 'grounding', 'cognitive', 'sleep']
    },
    autoStart: {
      required: false,
      type: 'boolean'
    }
  };
  
  // Validate parameters against rules
  for (const [key, value] of Object.entries(params)) {
    const rule = validationRules[key];
    if (rule && !validateParam(value, rule)) {
      throw new Error(`Invalid parameter: ${key}`);
    }
  }
  
  return true;
};
```

## Notification Deep Links

### Push Notification Links
```typescript
const notificationDeepLinks = {
  // Daily reminder
  dailyReminder: 'pockettherapy://checkin?source=notification&type=daily',
  
  // Exercise suggestion
  exerciseSuggestion: 'pockettherapy://exercise/:id?source=notification&type=suggestion',
  
  // Streak celebration
  streakCelebration: 'pockettherapy://insights?source=notification&type=streak',
  
  // Crisis follow-up
  crisisFollowUp: 'pockettherapy://sos?source=notification&type=followup'
};
```

### Notification Handling
```typescript
const handleNotificationDeepLink = (notification) => {
  const { data } = notification;
  
  // Extract deep link from notification data
  const deepLink = data.deepLink || data.url;
  if (!deepLink) return;
  
  // Track notification interaction
  analytics.track('notification_deeplink_opened', {
    notificationType: data.type,
    deepLink,
    timestamp: new Date().toISOString()
  });
  
  // Handle the deep link
  handleDeepLink(deepLink);
};
```

## Security & Validation

### URL Validation
```typescript
const validateDeepLink = (url) => {
  // Check if URL matches expected patterns
  const allowedPatterns = [
    /^pockettherapy:\/\/[a-zA-Z0-9\-_\/\?&=]*$/,
    /^https:\/\/(app\.)?pockettherapy\.(app|com)\/[a-zA-Z0-9\-_\/\?&=]*$/
  ];
  
  return allowedPatterns.some(pattern => pattern.test(url));
};
```

### Parameter Sanitization
```typescript
const sanitizeDeepLinkParams = (params) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(params)) {
    // Remove potentially dangerous characters
    const cleanValue = String(value)
      .replace(/[<>\"']/g, '')
      .trim();
    
    // Limit parameter length
    sanitized[key] = cleanValue.substring(0, 100);
  }
  
  return sanitized;
};
```

## Analytics & Tracking

### Deep Link Analytics
```typescript
const trackDeepLinkUsage = (route, params, source) => {
  analytics.track('deeplink_accessed', {
    route,
    source,
    hasParams: Object.keys(params).length > 0,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
};
```

### Performance Monitoring
```typescript
const monitorDeepLinkPerformance = (startTime, route) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  analytics.track('deeplink_performance', {
    route,
    duration,
    timestamp: new Date().toISOString()
  });
  
  // Alert if deep link handling is slow
  if (duration > 1000) {
    console.warn(`Slow deep link handling: ${route} took ${duration}ms`);
  }
};
```

This deep linking system ensures PocketTherapy provides seamless access to therapeutic features while maintaining security and performance standards for mental health support.
