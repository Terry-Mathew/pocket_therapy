# Exercise Player Screen

## Overview
An immersive, full-screen experience for guided therapeutic exercises including breathing techniques, grounding exercises, and cognitive tools. Designed to minimize distractions and maximize therapeutic benefit.

## Layout Specifications

### Screen Configuration
- **Layout**: Full screen, immersive experience
- **Navigation**: Modal presentation
- **Orientation**: Portrait locked for consistency

## Minimal Header (60px)

```typescript
const headerStyle = {
  height: 60,
  backgroundColor: 'transparent', // Blurs on scroll
  paddingHorizontal: spacing['4x'], // 16px
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between'
};
```

### Header Content
- **Left**: Close button "×" (32px touch target)
- **Right**: Settings gear "⚙️" (audio/haptic toggles)
- **Center**: Exercise title (truncated, `typography.body`, opacity 0.8)

## Exercise Types

### Breathing Exercises

#### Center Stage (400px height)
```typescript
const breathingStage = {
  height: 400,
  alignItems: 'center',
  justifyContent: 'center'
};

const breathingCircle = {
  width: 120, // Animates to 200px
  height: 120,
  borderRadius: 60,
  backgroundColor: therapeuticColors.primary + '30', // 30% opacity
  borderWidth: 4,
  borderColor: therapeuticColors.primary,
  alignItems: 'center',
  justifyContent: 'center'
};
```

#### Animation Phases
- **Inhale**: Circle expands from 120px to 200px
- **Hold**: Circle maintains 200px size
- **Exhale**: Circle contracts from 200px to 120px

#### Timer Section
```typescript
const timerSection = {
  alignItems: 'center',
  marginTop: spacing['6x'] // 24px
};
```

- **Current phase**: "Inhale" (`typography.h2`, center)
- **Count indicator**: "4... 3... 2... 1..." (`typography.h3`, center, opacity 0.6)
- **Cycle progress**: "Cycle 2 of 4" (`typography.body`, center)

### Grounding Exercises

#### Content Area (500px height)
```typescript
const groundingContent = {
  height: 500,
  paddingHorizontal: spacing['6x'], // 24px
  alignItems: 'center',
  justifyContent: 'center'
};
```

#### Step Display
- **Current step**: "Name 5 things you can see" (`typography.h2`, center)
- **Progress**: "Step 1 of 5" (`typography.caption`, center)
- **Navigation**: "Next" button (primary, large) or auto-advance timer

#### Example Content
```typescript
const groundingSteps = [
  {
    instruction: "Look around and name 5 blue things",
    type: "observation",
    inputType: "optional"
  },
  {
    instruction: "Name 4 things you can touch",
    type: "tactile",
    inputType: "text"
  },
  {
    instruction: "Listen for 3 different sounds",
    type: "auditory",
    inputType: "list"
  }
];
```

- **Text input**: Optional note field for user responses
- **Visual aids**: Simple illustrations when helpful

### Cognitive Exercises

#### Content Area (600px height)
```typescript
const cognitiveContent = {
  height: 600,
  paddingHorizontal: spacing['6x'],
  justifyContent: 'space-between'
};
```

#### Question/Prompt Section
- **Question**: "What evidence supports this thought?" (`typography.h2`)
- **Context**: Additional guidance text when needed

#### Input Section
```typescript
const cognitiveInput = {
  height: 200,
  borderWidth: 1,
  borderColor: therapeuticColors.textMuted,
  borderRadius: spacing['2x'],
  padding: spacing['4x'],
  textAlignVertical: 'top'
};
```

- **Text area**: Large, multi-line input
- **Character count**: "47/200" (if limited)
- **Auto-save**: Saves draft as user types

#### Navigation
- **Buttons**: "Previous" / "Next" (secondary/primary variants)
- **Progress**: Step indicator at bottom

## Audio Controls (Optional)

### Layout
```typescript
const audioControls = {
  position: 'absolute',
  bottom: spacing['20x'], // Above bottom safe area
  left: spacing['4x'],
  right: spacing['4x'],
  height: 80,
  backgroundColor: therapeuticColors.surface + '90', // Semi-transparent
  borderRadius: 16,
  padding: spacing['4x'],
  flexDirection: 'row',
  alignItems: 'center'
};
```

### Controls
- **Play/Pause**: Primary control (48px touch target)
- **Volume**: Slider control
- **Audio type**: Background sounds toggle (rain, forest, etc.)

## Progress Tracking

### Progress Bar
```typescript
const progressBar = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  backgroundColor: therapeuticColors.textMuted + '20'
};

const progressFill = {
  height: 4,
  backgroundColor: therapeuticColors.primary,
  // Width animated based on completion percentage
};
```

### Time Display
- **Remaining time**: "2:30 remaining" (`typography.caption`)
- **Total duration**: "4 minutes" (shown at start)

## Completion Flow

### Success State
```typescript
const completionState = {
  alignItems: 'center',
  paddingVertical: spacing['12x'] // 48px
};
```

#### Content
- **Celebration**: Gentle animation or confetti
- **Message**: "Well done! You completed the exercise" (`typography.h2`)
- **Encouragement**: "Taking care of yourself is brave" (`typography.body`)

#### Actions
```typescript
const completionActions = [
  {
    text: "How do you feel?",
    type: "mood_check",
    style: "primary"
  },
  {
    text: "Try another exercise",
    type: "navigation",
    style: "secondary"
  },
  {
    text: "Return to home",
    type: "navigation",
    style: "ghost"
  }
];
```

## Settings Overlay

### Trigger
Activated by settings gear icon in header.

### Layout
```typescript
const settingsOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center'
};

const settingsPanel = {
  width: '80%',
  backgroundColor: therapeuticColors.background,
  borderRadius: 20,
  padding: spacing['6x']
};
```

### Settings Options
```typescript
const settingsOptions = [
  {
    title: "Background Sounds",
    type: "toggle",
    options: ["Off", "Rain", "Forest", "Ocean"]
  },
  {
    title: "Haptic Feedback",
    type: "toggle",
    default: true
  },
  {
    title: "Voice Guidance",
    type: "toggle",
    default: false
  },
  {
    title: "Auto-advance Steps",
    type: "toggle",
    default: true
  }
];
```

## Interruption Handling

### App Backgrounding
- **Behavior**: Pause exercise automatically
- **Resume**: Show resume option when returning
- **State**: Maintain progress and settings

### Phone Calls
- **Behavior**: Graceful pause with notification
- **Resume**: Automatic resume after call ends
- **Audio**: Respect system audio priorities

### Notifications
- **Behavior**: Minimize interruptions during exercise
- **Critical only**: Allow emergency notifications
- **Do Not Disturb**: Suggest enabling for sessions

## Accessibility

### Screen Reader Support
- **Exercise announcement**: "4-7-8 breathing exercise. Step 1 of 4."
- **Phase announcements**: "Breathe in for 4 seconds"
- **Progress updates**: "Exercise 50% complete"

### Visual Accessibility
- **High contrast**: Alternative color schemes for breathing circle
- **Reduced motion**: Static alternatives to animations
- **Large text**: Support for dynamic type scaling

### Motor Accessibility
- **Voice control**: "Next step", "Pause exercise", "Close"
- **Switch control**: Support for external switches
- **Large targets**: Minimum 44px for all interactive elements

## Performance Considerations

### Animation Optimization
- **Native driver**: Use for all animations when possible
- **60 FPS**: Maintain smooth breathing circle animation
- **Memory**: Efficient cleanup of animation resources

### Audio Management
- **Preloading**: Load audio files before exercise starts
- **Compression**: Optimize audio file sizes
- **Caching**: Cache frequently used audio content

This exercise player design creates an immersive, distraction-free environment that maximizes the therapeutic benefit of mental health exercises while maintaining accessibility and performance standards.
