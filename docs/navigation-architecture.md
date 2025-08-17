# Navigation Architecture

## Overview
Complete navigation structure for PocketTherapy, designed with crisis-first accessibility, therapeutic user flows, and mental health-informed navigation patterns.

## Navigation Structure

### Main Tab Navigation (Bottom)
```typescript
const TabNavigator = {
  Home: {
    component: HomeStack,
    icon: 'home',
    label: 'Home',
    accessibilityLabel: 'Home tab. Your mental health dashboard.'
  },
  Library: {
    component: LibraryStack,
    icon: 'book-open',
    label: 'Library',
    accessibilityLabel: 'Exercise library tab. Browse therapeutic exercises.'
  },
  Insights: {
    component: InsightsStack,
    icon: 'trending-up',
    label: 'Insights',
    accessibilityLabel: 'Insights tab. View your mood patterns and progress.'
  },
  Settings: {
    component: SettingsStack,
    icon: 'settings',
    label: 'Settings',
    accessibilityLabel: 'Settings tab. Manage your preferences and privacy.'
  }
};
```

### Modal Screens (Overlay Main Tabs)
```typescript
const ModalScreens = {
  MoodCheckIn: {
    presentation: 'modal',
    transition: 'slide-up',
    gestureEnabled: true,
    headerShown: false
  },
  ExercisePlayer: {
    presentation: 'fullScreenModal',
    transition: 'slide-up',
    gestureEnabled: false, // Prevent accidental dismissal during exercise
    headerShown: false
  },
  ExerciseDetail: {
    presentation: 'modal',
    transition: 'slide-up',
    gestureEnabled: true,
    headerShown: true
  },
  SOS: {
    presentation: 'fullScreenModal',
    transition: 'immediate', // No animation delay for crisis
    gestureEnabled: false, // Prevent accidental dismissal
    headerShown: false
  },
  CrisisResources: {
    presentation: 'modal',
    transition: 'slide-up',
    gestureEnabled: true,
    headerShown: true
  }
};
```

### Onboarding Flow (First Launch)
```typescript
const OnboardingStack = {
  Welcome: {
    transition: 'fade',
    gestureEnabled: false,
    headerShown: false
  },
  Personalization: {
    transition: 'slide',
    gestureEnabled: true,
    headerShown: false
  },
  Notifications: {
    transition: 'slide',
    gestureEnabled: true,
    headerShown: false
  },
  FirstSession: {
    transition: 'slide',
    gestureEnabled: false, // Complete onboarding
    headerShown: false
  }
};
```

## Navigation Transitions

### Tab Switches
```typescript
const tabSwitchTransition = {
  animation: 'fade',
  duration: 150,
  easing: 'ease-in-out',
  gestureEnabled: true
};
```

### Stack Navigation
```typescript
const stackTransitions = {
  push: {
    animation: 'slide_from_right',
    duration: 250,
    easing: 'ease-out'
  },
  pop: {
    animation: 'slide_to_right',
    duration: 250,
    easing: 'ease-in'
  }
};
```

### Modal Presentations
```typescript
const modalTransitions = {
  slideUp: {
    animation: 'slide_from_bottom',
    duration: 300,
    easing: 'ease-out',
    backdrop: {
      opacity: 0.5,
      color: '#000000'
    }
  },
  immediate: {
    animation: 'none',
    duration: 0 // For crisis situations
  }
};
```

## Stack Configurations

### Home Stack
```typescript
const HomeStack = createNativeStackNavigator({
  screens: {
    HomeScreen: {
      options: {
        headerShown: false,
        title: 'Home'
      }
    },
    MoodHistory: {
      options: {
        headerShown: true,
        title: 'Mood History',
        headerBackTitle: 'Home'
      }
    },
    ExerciseRecommendations: {
      options: {
        headerShown: true,
        title: 'Recommended for You',
        headerBackTitle: 'Home'
      }
    }
  }
});
```

### Library Stack
```typescript
const LibraryStack = createNativeStackNavigator({
  screens: {
    ExerciseLibrary: {
      options: {
        headerShown: false,
        title: 'Exercise Library'
      }
    },
    ExerciseCategory: {
      options: {
        headerShown: true,
        title: 'Category',
        headerBackTitle: 'Library'
      }
    },
    ExerciseSearch: {
      options: {
        headerShown: true,
        title: 'Search Exercises',
        headerBackTitle: 'Library'
      }
    }
  }
});
```

### Insights Stack
```typescript
const InsightsStack = createNativeStackNavigator({
  screens: {
    InsightsOverview: {
      options: {
        headerShown: false,
        title: 'Your Insights'
      }
    },
    MoodTrends: {
      options: {
        headerShown: true,
        title: 'Mood Trends',
        headerBackTitle: 'Insights'
      }
    },
    ExerciseStats: {
      options: {
        headerShown: true,
        title: 'Exercise Statistics',
        headerBackTitle: 'Insights'
      }
    }
  }
});
```

### Settings Stack
```typescript
const SettingsStack = createNativeStackNavigator({
  screens: {
    SettingsMain: {
      options: {
        headerShown: false,
        title: 'Settings'
      }
    },
    PrivacySettings: {
      options: {
        headerShown: true,
        title: 'Privacy & Data',
        headerBackTitle: 'Settings'
      }
    },
    NotificationSettings: {
      options: {
        headerShown: true,
        title: 'Notifications',
        headerBackTitle: 'Settings'
      }
    },
    AccessibilitySettings: {
      options: {
        headerShown: true,
        title: 'Accessibility',
        headerBackTitle: 'Settings'
      }
    }
  }
});
```

## Crisis-Safe Navigation

### SOS Button (Floating Action Button)
```typescript
const SOSButton = {
  position: 'fixed',
  bottom: spacing['6x'], // 24px
  right: spacing['6x'],  // 24px
  zIndex: 9999, // Always on top
  size: spacing.touchPanic, // 72px
  
  // Always accessible from any screen
  globalAccess: true,
  
  // Immediate navigation - no delays
  onPress: () => {
    navigation.navigate('SOS', { immediate: true });
  },
  
  // Enhanced accessibility
  accessibilityRole: 'button',
  accessibilityLabel: 'Emergency support. Double tap for immediate help.',
  accessibilityHint: 'Opens crisis support with breathing exercises'
};
```

### Crisis Navigation Rules
```typescript
const crisisNavigationRules = {
  // Disable back gestures in crisis mode
  sosScreen: {
    gestureEnabled: false,
    headerShown: false,
    backButtonEnabled: false
  },
  
  // Require explicit confirmation to exit
  exitConfirmation: {
    required: true,
    message: 'Are you feeling safer now?',
    options: ['Yes, I\'m better', 'No, keep helping']
  },
  
  // Prevent accidental navigation
  preventAccidentalExit: true
};
```

## Deep Linking Configuration

### URL Scheme
```typescript
const deepLinkConfig = {
  scheme: 'pockettherapy',
  prefixes: ['pockettherapy://', 'https://pockettherapy.app'],
  
  config: {
    screens: {
      // Main app entry
      Home: '',
      
      // Quick actions
      MoodCheckIn: 'checkin',
      SOS: 'sos',
      
      // Exercise system
      ExerciseLibrary: 'library',
      ExerciseDetail: 'exercise/:id',
      ExercisePlayer: 'exercise/:id/play',
      
      // User data
      Insights: 'insights',
      Settings: 'settings',
      
      // Specific actions
      BreathingExercise: 'breathe',
      CrisisResources: 'crisis-help'
    }
  }
};
```

### Deep Link Handlers
```typescript
const deepLinkHandlers = {
  // Emergency deep links
  'pockettherapy://sos': () => {
    navigation.navigate('SOS', { source: 'deeplink' });
  },
  
  'pockettherapy://breathe': () => {
    navigation.navigate('SOS', { 
      exercise: 'breathing',
      source: 'deeplink' 
    });
  },
  
  // Quick actions
  'pockettherapy://checkin': () => {
    navigation.navigate('MoodCheckIn', { source: 'deeplink' });
  },
  
  // Exercise access
  'pockettherapy://exercise/:id': (params) => {
    navigation.navigate('ExerciseDetail', { 
      exerciseId: params.id,
      source: 'deeplink' 
    });
  }
};
```

## Accessibility Navigation

### Screen Reader Support
```typescript
const screenReaderNavigation = {
  // Announce screen changes
  screenAnnouncements: {
    Home: 'Home screen. Your mental health dashboard.',
    Library: 'Exercise library. Browse therapeutic exercises.',
    Insights: 'Insights screen. View your mood patterns.',
    Settings: 'Settings screen. Manage preferences.'
  },
  
  // Focus management
  focusManagement: {
    onScreenChange: 'focus_first_element',
    onModalPresent: 'focus_modal_content',
    onModalDismiss: 'restore_previous_focus'
  },
  
  // Navigation hints
  navigationHints: {
    tabBar: 'Swipe left or right to switch between tabs',
    backButton: 'Double tap to go back',
    sosButton: 'Emergency support always available'
  }
};
```

### Keyboard Navigation
```typescript
const keyboardNavigation = {
  // Tab order
  tabOrder: [
    'main_content',
    'primary_actions',
    'secondary_actions',
    'navigation_tabs',
    'sos_button'
  ],
  
  // Keyboard shortcuts
  shortcuts: {
    'cmd+1': 'navigate_to_home',
    'cmd+2': 'navigate_to_library',
    'cmd+3': 'navigate_to_insights',
    'cmd+4': 'navigate_to_settings',
    'cmd+s': 'open_sos',
    'cmd+m': 'open_mood_checkin'
  }
};
```

## Performance Optimization

### Navigation Performance
```typescript
const navigationOptimization = {
  // Lazy loading
  lazyScreens: [
    'Insights',
    'ExerciseLibrary',
    'Settings'
  ],
  
  // Preloading
  preloadScreens: [
    'SOS', // Always preloaded for crisis access
    'MoodCheckIn' // Frequently accessed
  ],
  
  // Memory management
  memoryManagement: {
    unmountInactiveScreens: true,
    maxScreensInMemory: 5,
    clearCacheOnLowMemory: true
  }
};
```

This navigation architecture ensures PocketTherapy provides intuitive, crisis-safe, and accessible navigation that supports users' mental health journey while maintaining excellent performance and usability.
