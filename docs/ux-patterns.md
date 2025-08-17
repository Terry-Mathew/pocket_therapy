# PocketTherapy UX Patterns & Interaction Principles 🌀

Designed for **calm, clarity, and emotional safety** — every interaction supports the user's mental well-being.

---

## 🎯 Core Principles

1. **Zero-friction entry** — users can start a calming exercise within **2 taps**.
2. **Micro-interactions** — gentle haptics, soft animations under 200ms.
3. **Predictable navigation** — no hidden menus for core features.
4. **Positive reinforcement** — celebrate small wins without overwhelming the user.
5. **Crisis-first logic** — SOS flow is always one tap away from anywhere.

---

## 🧩 Key Patterns

### Mood Check-in
- Emoji-based selection (5-point scale).
- Optional trigger tagging.
- Immediate exercise recommendation after logging.

### Exercise Flow
- Progress indicator shows remaining steps.
- Background animations are **slow, fluid** (avoid fast transitions).
- Voice guidance optional.

### SOS Flow
- One large central button.
- Preloads 3 fastest relief exercises.
- Crisis helpline visible but unobtrusive.

---

## 📱 Navigation

- **Tab bar**: Home, Exercises, Insights, Profile.
- **Floating Action Button (FAB)**: SOS quick access.
- Consistent back navigation using OS defaults.

---

## 💡 Microcopy Style

- Short, friendly, lowercase where possible.
- Avoid clinical language.
- Example: Instead of "Proceed to next intervention", use "let's try the next step".

---

## Implementation Guidelines

### Interaction Patterns

#### Gentle Haptics
```typescript
import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

const hapticPatterns = {
  moodSelect: 'impactLight',     // Mood emoji selection
  buttonPress: 'impactMedium',   // Standard button press
  sosActivate: 'impactHeavy',    // SOS button activation
  success: 'notificationSuccess', // Exercise completion
  warning: 'notificationWarning'  // Gentle alerts
};

// Usage example
const handleMoodSelect = (mood) => {
  trigger(hapticPatterns.moodSelect);
  onMoodSelect(mood);
};
```

#### Animation Timing
```typescript
const animationConfig = {
  // Gentle, calming animations
  gentle: {
    duration: 300,
    easing: 'ease-out',
    useNativeDriver: true
  },
  
  // Breathing circle animation
  breathing: {
    duration: 4000, // 4 seconds inhale
    easing: 'linear',
    useNativeDriver: true
  },
  
  // Page transitions
  pageTransition: {
    duration: 200,
    easing: 'ease-in-out',
    useNativeDriver: true
  }
};
```

### Navigation Patterns

#### Tab Navigation Structure
```typescript
const TabNavigator = {
  Home: {
    icon: 'home',
    label: 'home',
    component: HomeScreen
  },
  Exercises: {
    icon: 'heart',
    label: 'exercises',
    component: ExercisesScreen
  },
  Insights: {
    icon: 'trending-up',
    label: 'insights',
    component: InsightsScreen
  },
  Profile: {
    icon: 'user',
    label: 'profile',
    component: ProfileScreen
  }
};
```

#### SOS Floating Action Button
```typescript
const SOSButton = () => (
  <TouchableOpacity
    style={styles.sosButton}
    onPress={handleSOSPress}
    accessibilityLabel="Emergency support"
    accessibilityRole="button"
  >
    <Text style={styles.sosText}>SOS</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  sosButton: {
    position: 'absolute',
    bottom: spacing.panicSpacing,
    right: spacing.panicSpacing,
    width: spacing.touchPanic,
    height: spacing.touchPanic,
    borderRadius: spacing.touchPanic / 2,
    backgroundColor: therapeuticColors.crisis,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  }
});
```

### User Flow Patterns

#### Two-Tap Exercise Access
```typescript
// From home screen to exercise in 2 taps
const QuickExerciseFlow = {
  step1: 'Tap exercise card on home screen',
  step2: 'Tap "Start" button',
  result: 'Exercise begins immediately'
};
```

#### Mood Check-in Flow
```typescript
const MoodCheckinFlow = {
  step1: 'Select mood emoji (1-5 scale)',
  step2: 'Optional: Add trigger tags',
  step3: 'Automatic exercise recommendation',
  step4: 'One-tap to start recommended exercise'
};
```

### Microcopy Guidelines

#### Voice and Tone
```typescript
const microcopy = {
  // Friendly, supportive tone
  moodPrompt: "how are you feeling right now?",
  exerciseComplete: "well done! you've got this 💙",
  encouragement: "taking care of yourself is brave",
  
  // Avoid clinical language
  avoid: [
    "Proceed to next intervention",
    "Complete therapeutic session",
    "Assess your mental state"
  ],
  
  // Use instead
  prefer: [
    "let's try the next step",
    "finish your calming session",
    "check in with yourself"
  ]
};
```

#### Error Messages
```typescript
const errorMessages = {
  // Gentle, non-alarming errors
  networkError: "having trouble connecting - your progress is saved",
  exerciseInterrupted: "no worries, you can pick up where you left off",
  dataSync: "we'll sync your mood logs when you're back online"
};
```

### Accessibility Patterns

#### Screen Reader Navigation
```typescript
const accessibilityPatterns = {
  screenAnnouncement: "Home screen. Your calm companion dashboard.",
  buttonDescription: "Start breathing exercise. 4 minutes duration.",
  stateChange: "Mood logged successfully. Recommendations available.",
  progressUpdate: "Exercise 50% complete. 2 minutes remaining."
};
```

#### Focus Management
```typescript
// Ensure logical focus order for screen readers
const focusOrder = [
  'screenTitle',
  'primaryAction',
  'secondaryActions',
  'navigation',
  'sosButton'
];
```

This UX pattern system ensures every interaction supports mental well-being through calm, predictable, and emotionally safe design patterns.
