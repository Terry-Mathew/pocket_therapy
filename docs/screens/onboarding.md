# Onboarding Screen Flow

## Overview
A 5-step onboarding process designed to welcome users, understand their needs, and personalize their PocketTherapy experience. Emphasizes gentle introduction to mental health support.

## Layout Specifications

### Screen Configuration
- **Layout**: Full screen with progress indicator
- **Navigation**: Swipeable with skip option
- **Steps**: 5 total steps

## Progress Indicator (Top, 60px)

```typescript
const progressIndicator = {
  height: 60,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: spacing['6x'] // 24px
};

const progressDot = {
  width: 12,
  height: 12,
  borderRadius: 6,
  marginHorizontal: 4
};
```

### Dot States
- **Current**: Filled circle (`therapeuticColors.primary`)
- **Completed**: Filled smaller circles
- **Upcoming**: Outlined circles
- **Connection**: Subtle line connecting dots

## Step 1: Welcome

### Layout
```typescript
const welcomeStep = {
  alignItems: 'center',
  paddingHorizontal: spacing['6x'],
  paddingVertical: spacing['12x']
};
```

### Content
- **Header**: "Welcome to PocketTherapy" (`typography.h2`, center)
- **Illustration**: Breathing animation (120px)
- **Body**: "Quick anxiety relief designed for your life" (`typography.bodyLarge`, center)
- **Subtext**: "2-3 minute exercises, private & gentle" (`typography.body`, center, opacity 0.8)

### Actions
- **Primary CTA**: "Let's start" (primary button, full width)
- **Skip option**: "Maybe later" (ghost button, top right)

## Step 2: What Brings You Here

### Layout
```typescript
const reasonStep = {
  paddingHorizontal: spacing['6x'],
  paddingVertical: spacing['8x']
};
```

### Content
- **Header**: "What brings you here today?" (`typography.h2`, left aligned)

### Options Grid
```typescript
const optionCard = {
  backgroundColor: therapeuticColors.surface,
  padding: spacing['4x'], // 16px
  borderRadius: 12,
  alignItems: 'center',
  marginBottom: spacing['3x']
};
```

#### Available Options
- "Exam & study stress" (📚 icon)
- "Social anxiety" (👥 icon)
- "Work pressure" (💼 icon)
- "General overwhelm" (🌊 icon)
- "Sleep & rest issues" (😴 icon)
- "Just curious" (💭 icon)

#### Interaction
- **Selection**: Tap to select (primary border appears)
- **Navigation**: Auto-advance after selection or "Next" button

## Step 3: Baseline Mood

### Layout
```typescript
const moodStep = {
  paddingHorizontal: spacing['6x'],
  paddingVertical: spacing['8x']
};
```

### Content
- **Header**: "How have you been feeling lately?" (`typography.h2`)
- **Subtitle**: "This helps us personalize your experience" (`typography.body`, opacity 0.8)

### Mood Selector
```typescript
const moodGrid = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: spacing['8x']
};
```

- **Emojis**: 😢 😕 😐 🙂 😊 (large size, 64px touch targets)

### Optional Tags
- **Question**: "What's been on your mind?"
- **Tags**: [Exams] [Money] [Relationships] [Future] [Health] [Family]
- **Selection**: Multiple selection allowed

### Navigation
- **Continue**: Available after mood selection

## Step 4: Notification Preferences

### Layout
```typescript
const notificationStep = {
  paddingHorizontal: spacing['6x'],
  paddingVertical: spacing['8x']
};
```

### Content
- **Header**: "Stay connected to your wellbeing" (`typography.h2`)
- **Subtitle**: "Gentle reminders to check in with yourself" (`typography.body`)

### Options
```typescript
const notificationOptions = [
  {
    title: "Daily check-in reminders",
    description: "A gentle nudge to log your mood",
    default: true
  },
  {
    title: "Exercise suggestions",
    description: "Personalized recommendations based on your patterns",
    default: true
  },
  {
    title: "Streak celebrations",
    description: "Celebrate your consistency milestones",
    default: false
  }
];
```

### Controls
- **Toggle switches**: For each notification type
- **Time picker**: "Best time for reminders" (default: 7 PM)

## Step 5: Ready to Begin

### Layout
```typescript
const readyStep = {
  alignItems: 'center',
  paddingHorizontal: spacing['6x'],
  paddingVertical: spacing['12x']
};
```

### Content
- **Header**: "You're all set!" (`typography.h2`, center)
- **Illustration**: Celebration animation
- **Body**: "Your personalized mental health companion is ready" (`typography.bodyLarge`, center)

### Summary Card
```typescript
const summaryCard = {
  backgroundColor: therapeuticColors.surface,
  padding: spacing['6x'],
  borderRadius: 16,
  marginVertical: spacing['8x']
};
```

#### Summary Content
- **Your focus**: Based on step 2 selection
- **Starting mood**: Based on step 3 selection
- **Recommended exercises**: 2-3 personalized suggestions

### Actions
- **Primary CTA**: "Start my journey" (primary button, full width)
- **Secondary**: "Explore exercises first" (secondary button)

## Navigation Patterns

### Swipe Gestures
```typescript
const swipeConfig = {
  threshold: 50, // Minimum swipe distance
  velocityThreshold: 0.3,
  directionalOffsetThreshold: 80
};
```

- **Swipe right**: Previous step (if available)
- **Swipe left**: Next step (if current step completed)

### Button Navigation
- **Back**: Available from step 2 onwards
- **Next/Continue**: Enabled after step completion
- **Skip**: Available on all steps except final

### Progress Saving
- **Auto-save**: Progress saved after each step
- **Resume**: Users can resume from last completed step
- **Reset**: Option to restart onboarding in settings

## Accessibility

### Screen Reader Support
- **Step announcements**: "Welcome step, 1 of 5"
- **Progress updates**: "Step 2 completed, moving to step 3"
- **Option descriptions**: Detailed descriptions for all selectable options

### Visual Accessibility
- **High contrast**: Alternative color schemes for cards and buttons
- **Large text**: Support for dynamic type scaling
- **Focus indicators**: Clear visual focus for keyboard navigation

### Motor Accessibility
- **Large touch targets**: Minimum 44px for all interactive elements
- **Voice control**: Support for voice navigation commands
- **Gesture alternatives**: Button alternatives for all swipe gestures

## Personalization Logic

### Data Collection
```typescript
const onboardingData = {
  reason: string, // From step 2
  baselineMood: number, // 1-5 from step 3
  concerns: string[], // Tags from step 3
  notifications: {
    dailyReminders: boolean,
    exerciseSuggestions: boolean,
    streakCelebrations: boolean,
    preferredTime: string
  }
};
```

### Personalization Outcomes
- **Exercise recommendations**: Based on reason and mood
- **Home screen content**: Customized based on concerns
- **Notification timing**: Respects user preferences
- **Progress tracking**: Baseline established for insights

This onboarding flow creates a welcoming, personalized introduction to PocketTherapy while collecting essential data for customizing the user's mental health journey.
