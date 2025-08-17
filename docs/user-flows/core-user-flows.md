# Core User Flows

## Overview
Complete end-to-end user flows for PocketTherapy's core features, designed with anxiety-informed principles including gentle defaults, offline-first functionality, and SOS-first access patterns.

## 1. App Launch & Onboarding Flow

### Cold Start Flow
```mermaid
flowchart TD
  A[Cold Start] --> B{First Launch?}
  B -- Yes --> C[Onboarding Intro]
  B -- No --> D{Authenticated?}
  D -- Yes --> E[Home Dashboard]
  D -- No --> F[Welcome: Sign In / Continue as Guest]

  %% Permissions with gentle explainers
  C --> G[Explain Notifications]
  G --> H{User Accepts?}
  H -- Yes --> I[Native Prompt]
  H -- Later --> J[Mark 'Enable Later' in Settings]

  C --> K[Explain Haptics]
  K --> L{User Accepts?}
  L -- Yes --> M[Enable Haptics]
  L -- Later --> J

  %% Offline handling
  A --> Q{Network Available?}
  Q -- No --> R[Offline Mode Banner]
  R --> E
```

### Onboarding Steps
1. **Welcome Screen**: Introduction to PocketTherapy
2. **Purpose Selection**: What brings you here today?
3. **Baseline Mood**: Initial mood assessment
4. **Notification Preferences**: Gentle reminder settings
5. **Ready to Begin**: Personalized summary and first steps

### Guest vs Authenticated Flow
```typescript
const authenticationFlow = {
  guest: {
    features: ['mood_tracking', 'exercises', 'offline_mode'],
    limitations: ['no_sync', 'no_insights', 'local_data_only'],
    upgrade_prompts: ['after_7_days', 'before_data_loss']
  },
  authenticated: {
    features: ['full_access', 'cloud_sync', 'insights', 'cross_device'],
    providers: ['google', 'apple', 'email']
  }
};
```

## 2. Mood Check-in Flow

### Primary Check-in Flow
```mermaid
flowchart TD
  A[Open Check-in] --> B[Mood Picker - 5 emoji scale]
  B --> C[Optional Trigger Tags]
  C --> D[Optional Note - single line]
  D --> E[Submit]
  E --> F[Save Local First]
  F --> G{Network Available?}
  G -- Yes --> H[Sync to Supabase]
  G -- No --> I[Queue for Sync]
  H --> J[Show Recommendation Card]
  I --> J
  J --> K{Start Now or Remind Later?}
  K -- Start Now --> L[Begin Suggested Exercise]
  K -- Remind 20m --> M[Schedule Local Notification]
```

### Crisis Detection Flow
```mermaid
flowchart TD
  A[User Types Note] --> B[Real-time Keyword Scan]
  B --> C{Crisis Keywords Detected?}
  C -- Yes --> D[Show Crisis Support Overlay]
  C -- No --> E[Continue Normal Flow]
  D --> F{User Chooses Action}
  F -- Get Help --> G[Crisis Resources Screen]
  F -- I'm Safe --> H[Continue Check-in]
  F -- Call Support --> I[Direct Phone Call]
```

### Mood Check-in States
```typescript
const moodCheckStates = {
  entry_points: [
    'home_dashboard_card',
    'notification_reminder',
    'sos_post_exercise',
    'manual_navigation'
  ],
  completion_actions: [
    'show_exercise_recommendation',
    'schedule_reminder',
    'return_to_home',
    'start_exercise_immediately'
  ],
  crisis_triggers: [
    'keyword_detection',
    'mood_1_selected',
    'multiple_low_moods',
    'user_request_help'
  ]
};
```

## 3. Exercise Flow

### Exercise Discovery Flow
```mermaid
flowchart TD
  A[Exercise Library] --> B[Browse Categories]
  A --> C[Search Exercises]
  A --> D[View Recommendations]
  
  B --> E[Select Category]
  C --> F[Filter Results]
  D --> G[Personalized List]
  
  E --> H[Exercise List]
  F --> H
  G --> H
  
  H --> I[Select Exercise]
  I --> J[Exercise Detail View]
  J --> K{Start Exercise?}
  K -- Yes --> L[Exercise Player]
  K -- Save for Later --> M[Add to Favorites]
```

### Exercise Player Flow
```mermaid
flowchart TD
  A[Start Exercise] --> B[Pre-exercise Setup]
  B --> C[Audio/Haptic Preferences]
  C --> D[Begin Exercise Session]
  
  D --> E{Exercise Type}
  E -- Breathing --> F[Breathing Circle Animation]
  E -- Grounding --> G[Step-by-step Instructions]
  E -- Cognitive --> H[Guided Questions]
  
  F --> I[Session Progress]
  G --> I
  H --> I
  
  I --> J{Session Complete?}
  J -- No --> K[Continue Session]
  J -- Yes --> L[Completion Celebration]
  
  K --> I
  L --> M[Post-exercise Check-in]
  M --> N[Recommendations]
```

### Exercise Interruption Handling
```typescript
const interruptionHandling = {
  phone_call: {
    action: 'pause_automatically',
    resume: 'show_resume_option',
    timeout: '5_minutes'
  },
  app_background: {
    action: 'pause_with_notification',
    resume: 'automatic_on_foreground',
    state_preservation: 'full'
  },
  low_battery: {
    action: 'offer_audio_only_mode',
    fallback: 'graceful_completion'
  }
};
```

## 4. SOS Crisis Flow

### Immediate Crisis Response
```mermaid
flowchart TD
  A[SOS Button Pressed] --> B[Crisis Screen - No Delays]
  B --> C[Primary CTA: Start Calm Now]
  B --> D[Quick Options Grid]
  
  C --> E[Immediate 4-7-8 Breathing]
  D --> F{Option Selected}
  F -- 60s Breathing --> G[Quick Breathing Session]
  F -- 5-4-3-2-1 --> H[Grounding Exercise]
  F -- Feel Hands --> I[Tactile Grounding]
  F -- Get Support --> J[Crisis Resources]
  
  E --> K[Post-session Check]
  G --> K
  H --> K
  I --> K
  
  K --> L{How do you feel?}
  L -- Better --> M[Gentle Return to App]
  L -- Same/Worse --> N[Additional Support Options]
```

### Crisis Resource Access
```mermaid
flowchart TD
  A[Crisis Resources] --> B[Emergency Contacts]
  A --> C[Text Support Lines]
  A --> D[Professional Help]
  
  B --> E[One-tap Calling]
  C --> F[Pre-filled Text Messages]
  D --> G[Therapist Directory]
  
  E --> H[Call in Progress]
  F --> I[Text Sent Confirmation]
  G --> J[Local Resources List]
```

## 5. Insights & Progress Flow

### Data Visualization Flow
```mermaid
flowchart TD
  A[Insights Tab] --> B{Sufficient Data?}
  B -- No --> C[Encourage More Check-ins]
  B -- Yes --> D[Mood Trends Chart]
  
  D --> E[Pattern Recognition]
  E --> F[Personalized Insights]
  F --> G[Recommendations]
  
  C --> H[Quick Check-in CTA]
  G --> I[Exercise Suggestions]
  I --> J[Schedule Reminders]
```

### Progress Tracking Elements
```typescript
const progressMetrics = {
  mood_trends: {
    timeframes: ['7_days', '30_days', '3_months'],
    visualizations: ['line_chart', 'mood_calendar', 'weekly_summary']
  },
  exercise_completion: {
    metrics: ['total_sessions', 'streak_count', 'favorite_exercises'],
    achievements: ['consistency_badges', 'milestone_celebrations']
  },
  pattern_insights: {
    detected_patterns: ['time_of_day', 'trigger_correlations', 'improvement_trends'],
    recommendations: ['optimal_exercise_times', 'trigger_management', 'habit_suggestions']
  }
};
```

## 6. Settings & Preferences Flow

### Settings Navigation
```mermaid
flowchart TD
  A[Settings Screen] --> B[Profile Management]
  A --> C[Notification Preferences]
  A --> D[Privacy & Data]
  A --> E[Accessibility Options]
  A --> F[Support Resources]
  
  B --> G[Edit Profile Info]
  C --> H[Reminder Settings]
  D --> I[Data Export/Delete]
  E --> J[Visual/Audio Adjustments]
  F --> K[Help & Crisis Resources]
```

## 7. Offline-First Flow Patterns

### Offline Capability Matrix
```typescript
const offlineCapabilities = {
  fully_offline: [
    'mood_check_ins',
    'breathing_exercises',
    'grounding_exercises',
    'crisis_support_resources',
    'local_data_viewing'
  ],
  requires_sync: [
    'insights_generation',
    'exercise_library_updates',
    'cloud_backup',
    'cross_device_sync'
  ],
  graceful_degradation: [
    'show_cached_content',
    'queue_actions_for_sync',
    'offline_mode_indicators',
    'sync_when_online'
  ]
};
```

### Sync Conflict Resolution
```mermaid
flowchart TD
  A[App Comes Online] --> B[Check for Conflicts]
  B --> C{Conflicts Found?}
  C -- No --> D[Simple Sync]
  C -- Yes --> E[Conflict Resolution]
  
  E --> F{Conflict Type}
  F -- Mood Data --> G[Use Latest Timestamp]
  F -- Settings --> H[Merge Non-conflicting]
  F -- Exercise Progress --> I[Combine Totals]
  
  G --> J[Update Local Data]
  H --> J
  I --> J
  J --> K[Sync Complete]
```

## Flow Design Principles

### Anxiety-Informed Design
1. **Immediate Access**: SOS features available from any screen
2. **Gentle Defaults**: Non-alarming colors and language
3. **Predictable Navigation**: Consistent patterns reduce cognitive load
4. **Offline Resilience**: Core features work without internet
5. **Crisis Safety**: No barriers to emergency support

### User Experience Priorities
1. **Speed to Relief**: Minimize taps to therapeutic content
2. **Data Privacy**: Local-first with optional cloud sync
3. **Accessibility**: Full screen reader and motor accessibility
4. **Personalization**: Adaptive recommendations based on usage
5. **Gentle Guidance**: Supportive language throughout flows

## 8. Notification Flow Patterns

### Daily Reminder Flow
```mermaid
flowchart TD
  A[Scheduled Time] --> B{User Preferences?}
  B -- Enabled --> C[Check Last Activity]
  B -- Disabled --> D[Skip Notification]

  C --> E{Recent Check-in?}
  E -- No --> F[Send Gentle Reminder]
  E -- Yes --> G[Send Encouragement]

  F --> H[Deep Link to Mood Check]
  G --> I[Deep Link to Insights]
```

### Crisis Follow-up Flow
```mermaid
flowchart TD
  A[SOS Session Complete] --> B[Schedule Follow-up]
  B --> C[Wait 2 Hours]
  C --> D[Send Check-in Notification]
  D --> E{User Response?}
  E -- Better --> F[Positive Reinforcement]
  E -- Same/Worse --> G[Additional Resources]
  E -- No Response --> H[Gentle Follow-up in 4 Hours]
```

## 9. Micro-Interaction Flows

### Quick Session Flow (30 seconds)
```mermaid
flowchart TD
  A[User Stressed] --> B[Open App]
  B --> C[Tap Quick Calm]
  C --> D[30s Breathing]
  D --> E[Immediate Relief]
  E --> F[Optional Mood Log]
```

### Habit Building Flow
```mermaid
flowchart TD
  A[Daily Check-in] --> B[Streak Counter]
  B --> C{Milestone Reached?}
  C -- Yes --> D[Celebration Animation]
  C -- No --> E[Progress Encouragement]

  D --> F[Share Achievement Option]
  E --> G[Next Goal Visualization]
```

These comprehensive user flows ensure that PocketTherapy provides immediate, accessible mental health support while maintaining user privacy and safety in all interaction patterns.
