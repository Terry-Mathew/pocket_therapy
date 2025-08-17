# Mood Check-in Screen

## Overview
A multi-step form designed to capture users' emotional state with optional context. Features crisis detection and gentle, supportive interactions throughout the process.

## Layout Specifications

### Screen Configuration
- **Layout**: Multi-step form with keyboard avoidance
- **Steps**: 3 (Mood → Tags → Submit)
- **Navigation**: Back/forward with draft saving

## Header Section (80px)

```typescript
const headerStyle = {
  height: 80,
  backgroundColor: therapeuticColors.background,
  paddingHorizontal: spacing['4x'], // 16px
  paddingVertical: spacing['3x'],   // 12px
  borderBottomWidth: 1,
  borderBottomColor: therapeuticColors.textMuted + '20'
};
```

### Header Content
- **Left**: Back arrow (24px, `therapeuticColors.textSecondary`)
- **Center**: "Check-in" (`typography.h3`, `therapeuticColors.textPrimary`)
- **Right**: "Skip" (`typography.body`, `therapeuticColors.textSecondary`)

## Progress Indicator (50px height)

```typescript
const progressDots = {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  height: 50
};

const dot = {
  width: 12,
  height: 12,
  borderRadius: 6,
  marginHorizontal: 4
};
```

### Dot States
- **Current**: Filled (`therapeuticColors.primary`)
- **Completed**: Filled smaller (`therapeuticColors.success`)
- **Upcoming**: Outlined (`therapeuticColors.textMuted`)

## Step 1: Mood Selection

### Container (300px height)
```typescript
const moodSelectionContainer = {
  height: 300,
  alignItems: 'center',
  justifyContent: 'center'
};
```

### Header Section (100px)
- **Title**: "How are you feeling right now?" (`typography.h2`, center)
- **Subtitle**: "It's okay to not be okay 💙" 
  - Style: `typography.body`, center, opacity 0.8, 8px margin top

### Mood Grid (150px)
```typescript
const moodGrid = {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: spacing['4x'], // 16px
  height: 150
};
```

#### Mood Options
Emojis: 😢 😕 😐 🙂 😊

```typescript
const moodEmoji = {
  width: spacing.touchComfortable,  // 64px minimum
  height: spacing.touchComfortable,
  borderRadius: spacing.touchComfortable / 2,
  alignItems: 'center',
  justifyContent: 'center'
};
```

#### Interaction States
- **Default**: Transparent background
- **Selected**: Colored border + background tint
- **Animation**: Scale 1.0 → 1.1 → 1.0 on selection
- **Haptic**: Light feedback on each tap

### Footer (50px)
- **Auto-advance**: After selection (1 second delay)
- **Fallback**: "Continue" button if no selection after 10 seconds

## Step 2: Trigger Tags

### Header (80px)
- **Title**: "What's contributing to this feeling?" (`typography.h2`)
- **Subtitle**: "Select any that apply (optional)" (`typography.body`, opacity 0.8)

### Tags Grid (200px)
```typescript
const tagsGrid = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing['3x'], // 12px
  paddingHorizontal: spacing['4x']
};
```

#### Available Tags
[Exams] [Work] [Social] [Money] [Health] [Family] [Sleep] [Future] [Other]

```typescript
const tagStyle = {
  paddingVertical: spacing['4x'],   // 16px
  paddingHorizontal: spacing['5x'], // 20px
  borderRadius: 20,
  borderWidth: 1
};

// Default state
const defaultTag = {
  ...tagStyle,
  borderColor: therapeuticColors.textMuted,
  backgroundColor: 'transparent'
};

// Selected state
const selectedTag = {
  ...tagStyle,
  backgroundColor: therapeuticColors.accent,
  borderColor: therapeuticColors.accent
};
```

#### Interactions
- **Multiple selection**: Allowed
- **Animation**: Spring scale on tap
- **Custom input**: Appears if "Other" selected

### Custom Tag Input (60px)
```typescript
const customTagInput = {
  height: 60,
  borderWidth: 1,
  borderColor: therapeuticColors.textMuted,
  borderRadius: spacing['2x'],
  paddingHorizontal: spacing['4x'],
  fontSize: typography.body.fontSize
};
```

- **Placeholder**: "Add your own..."
- **Max length**: 20 characters
- **Auto-capitalize**: Words
- **Trigger**: Appears when "Other" is selected

## Step 3: Optional Note

### Header (60px)
- **Title**: "Add a thought (optional)" (`typography.h2`)
- **Subtitle**: "What's on your mind?" (`typography.body`, opacity 0.8)

### Text Input (120px)
```typescript
const noteInput = {
  height: 120,
  borderWidth: 1,
  borderColor: therapeuticColors.textMuted,
  borderRadius: spacing['2x'],
  padding: spacing['4x'],
  textAlignVertical: 'top',
  fontSize: typography.body.fontSize
};
```

#### Input Features
- **Multiline**: Enabled
- **Placeholder**: "I'm feeling anxious because..."
- **Max length**: 200 characters
- **Character counter**: "147/200" (bottom right, `typography.caption`)
- **Focus state**: Border color changes to `therapeuticColors.primary`

#### Crisis Detection
- **Real-time scanning**: On-device keyword detection
- **Keywords**: "hurt myself", "suicide", "end it all", etc.
- **Response**: Triggers crisis support overlay

### Submit Section (100px)
```typescript
const submitSection = {
  height: 100,
  paddingHorizontal: spacing['4x'],
  justifyContent: 'center'
};
```

- **Button**: "Complete check-in" (primary, full width, large size)
- **Loading state**: Spinner + "Saving..." text
- **Success state**: Checkmark + "Saved!" → auto navigate (1s delay)

## Crisis Detection Overlay

### Trigger Conditions
Keywords detected in text input: "hurt myself", "suicide", "end it all"

### Layout
```typescript
const crisisOverlay = {
  height: '70%',
  backgroundColor: therapeuticColors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: spacing['5x']
};
```

### Content Structure
#### Header
- **Title**: "You're not alone 💙" (`typography.h2`, `therapeuticColors.primary`)
- **Body**: "It's brave to reach out when things are hard" (`typography.bodyLarge`)

#### Crisis Resources
```typescript
const crisisResources = [
  {
    text: "Call for support: Vandrevala Foundation",
    icon: "phone",
    action: "call",
    style: "primary"
  },
  {
    text: "Text support: Text HOME to 741741",
    action: "text",
    style: "secondary"
  },
  {
    text: "Emergency services: 112",
    style: "emergency", // Red background
    priority: "highest"
  }
];
```

#### Footer
- **Button**: "I'm safe, continue check-in" (ghost button)
- **Action**: Dismisses overlay, allows continued check-in

## Navigation Flow

### Back Navigation
- **Behavior**: Saves draft automatically
- **Confirmation**: "Save for later?" if significant progress made

### Skip Option
- **Behavior**: Skips to home screen
- **Data**: No data saved

### Step Transitions
- **Animation**: Slide + fade (300ms duration)
- **Direction**: Forward/backward based on navigation

### Submit Process
1. **Validation**: Client-side validation
2. **Local save**: Saves to local storage first
3. **Sync**: Attempts server sync
4. **Feedback**: Shows appropriate success/error state

## Error States

### Network Error
- **Message**: "Saved locally, will sync when online"
- **Behavior**: Graceful degradation, local storage used

### Validation Errors
- **Style**: Gentle highlight, no harsh colors
- **Feedback**: Supportive messaging

### Crisis Keywords
- **Behavior**: Shows overlay but doesn't block submission
- **Priority**: User safety over data collection

## Success Flow

### Completion Sequence
1. **Submit**: User taps "Complete check-in"
2. **Loading**: Maximum 2 seconds with spinner
3. **Success feedback**: "Thanks for checking in!"
4. **Recommendations**: Show recommended exercises card
5. **Auto-navigation**: To recommendations (3s delay) or manual "View now"

### Success Animations
- **Submit success**: Gentle confetti burst
- **Transition**: Smooth fade to recommendations

## Animations and Interactions

### Step Transitions
- **Type**: Slide + fade
- **Duration**: 300ms
- **Easing**: Ease-in-out

### Mood Selection
- **Type**: Scale bounce
- **Trigger**: Emoji tap
- **Haptic**: Light feedback

### Crisis Overlay
- **Type**: Slide up with backdrop blur
- **Duration**: 400ms
- **Backdrop**: Semi-transparent overlay

## Accessibility

### Screen Reader Support
- **Screen announcement**: "Mood selection, step 1 of 3"
- **Progress**: Clear step indicators
- **Instructions**: Detailed descriptions for each step

### Visual Accessibility
- **Dynamic Type**: All text scales appropriately
- **High contrast**: Alternative color schemes available
- **Focus indicators**: Clear keyboard navigation

### Keyboard Navigation
- **Tab order**: Logical progression through form
- **Focus management**: Proper focus handling between steps
- **Submit**: Enter key support where appropriate

This mood check-in design balances comprehensive emotional tracking with user safety, ensuring that crisis situations are handled appropriately while maintaining a supportive, non-clinical interface.
