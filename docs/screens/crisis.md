# SOS Emergency Support Screen

## Overview
The SOS Emergency Support screen provides immediate access to crisis intervention tools and breathing exercises. Designed for users experiencing acute anxiety or panic, prioritizing immediate relief and safety.

## Design Principles
- **Crisis-optimized**: No navigation chrome, immediate focus
- **Auto-features**: Haptics enabled, sounds off by default
- **Immediate response**: All interactions respond in <200ms
- **No barriers**: No confirmation dialogs in crisis mode

## Layout Specifications

### Screen Configuration
- **Layout**: Full screen takeover
- **Header**: None (immediate focus required)
- **Background**: Subtle gradient (`therapeuticColors.gradients.crisisFlow`)

## Hero Section (250px from top)

### Primary Message
```typescript
const heroContent = {
  paddingTop: 250,
  alignItems: 'center',
  textAlign: 'center'
};
```

- **Primary text**: "You're going to be okay"
  - Style: `typography.h1`, center aligned, `therapeuticColors.textPrimary`
- **Subtext**: "Let's find calm together"
  - Style: `typography.bodyLarge`, center aligned, opacity 0.8

### Primary CTA (120px height)
```typescript
const primaryCTA = {
  height: 72,
  marginHorizontal: spacing['12x'], // 48px
  borderRadius: spacing['4x'],
  backgroundColor: therapeuticColors.crisis
};
```

- **Button text**: "Start Calm Now" (Inter SemiBold 20px)
- **Action**: Immediately launch 4-7-8 breathing exercise
- **Haptic**: Strong impact on press
- **Response time**: Immediate (<100ms)

## Quick Options Section (200px height)

### Title
- **Text**: "Or choose what feels right:" (`typography.body`, center, margin bottom 24px)

### Option Grid (2x2 layout)
```typescript
const optionGrid = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing['4x'], // 16px
  marginHorizontal: spacing['12x'] // 48px
};

const optionButton = {
  height: 80,
  flex: 1,
  backgroundColor: therapeuticColors.surface,
  borderRadius: spacing['3x'],
  alignItems: 'center',
  justifyContent: 'center'
};
```

#### Options
1. **60s Breathing** (🫁 icon, 32px)
2. **5-4-3-2-1 Ground** (🌱 icon, 32px)
3. **Feel Your Hands** (✋ icon, 32px)
4. **Get Support** (💙 icon, 32px)

#### Button Styling
- **Height**: 80px each
- **Background**: `therapeuticColors.surface`
- **Text**: `typography.h3`, `therapeuticColors.textPrimary`
- **Icons**: 32px, positioned above text
- **Touch targets**: Large, forgiving (minimum 72px)

## Bottom Toolbar (100px height)

```typescript
const bottomToolbar = {
  height: 100,
  backgroundColor: therapeuticColors.background + '95', // Semi-transparent
  padding: spacing['4x'],
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
};
```

### Left: Safety Confirmation
- **Button**: "Feeling better" (secondary variant, medium)
- **Action**: Gentle confirmation → navigate to home
- **Purpose**: Allow users to exit crisis mode safely

### Center: Sound Toggle
- **Button**: "Add gentle sounds" (ghost button)
- **Default**: Off (respects crisis state)
- **Action**: Enable rain ambience at low volume
- **Purpose**: Optional calming audio support

### Right: Additional Help
- **Button**: "More Help" (crisis variant, medium)
- **Action**: Open crisis resources overlay
- **Purpose**: Access to professional support resources

## Breathing Session Player

### Trigger
Activated when any breathing option is selected.

### Layout
```typescript
const breathingPlayer = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: therapeuticColors.background,
  alignItems: 'center',
  justifyContent: 'center'
};
```

### Breathing Circle Animation
```typescript
const breathingCircle = {
  width: 120, // Expands to 200px
  height: 120,
  borderRadius: 60,
  backgroundColor: therapeuticColors.primary + '30', // 30% opacity
  borderWidth: 4,
  borderColor: therapeuticColors.primary
};
```

### Timing Display (Top)
- **Phase text**: "Breathe in" / "Hold" / "Breathe out" (`typography.h2`, center)
- **Cycle counter**: "3 of 5 cycles" (`typography.body`, center)
- **Timer**: Optional circular progress indicator

### Instructions (Bottom 150px)
- **Primary**: "Follow the circle as it grows and shrinks" (`typography.bodyLarge`, center)
- **Secondary**: "Inhale 4 • Hold 7 • Exhale 8" (`typography.body`, center, opacity 0.8)

### Exit Options (Always Visible)
- **Top right**: "×" close button (32px touch target)
- **Bottom center**: "I'm feeling better" (secondary button)

### Haptic Patterns
```typescript
const hapticPatterns = {
  inhaleStart: 'impactLight',
  holdPhase: null, // No haptic during hold
  exhaleStart: 'impactMedium', // Longer duration
  cycleComplete: 'notificationSuccess'
};
```

## Crisis Resources Overlay

### Trigger
- "More Help" button press
- Crisis keyword detection in user input

### Layout
```typescript
const resourcesOverlay = {
  height: '80%',
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  shadowOpacity: 0.3
};
```

### Header (80px)
- **Title**: "You're not alone 💙" (`typography.h2`, `therapeuticColors.primary`)
- **Close button**: "×" (top right, 44px touch target)

### Content (Scrollable)
#### Introduction
- **Text**: "If you're thinking of hurting yourself, please reach out" (`typography.bodyLarge`)

#### Emergency Contacts (India)
```typescript
const emergencyContacts = [
  {
    name: "Emergency Services",
    number: "112",
    style: "emergency", // Red background
    priority: "highest"
  },
  {
    name: "Vandrevala Foundation",
    number: "1860 2662 345",
    style: "primary"
  },
  {
    name: "Aasra Helpline",
    number: "91-9820466726",
    style: "primary"
  }
];
```

#### International Support
- **Crisis Text Line**: "Text HOME to 741741"
- **Suicide & Crisis Lifeline**: "988" (US)

### Footer Actions
- **Primary**: "I'm safe, return to app" (ghost button, full width)
- **Secondary**: "Save these numbers" (secondary button)

## Post-Session Check

### Trigger
After any session completion (minimum 60 seconds).

### Layout
```typescript
const postSessionModal = {
  height: '60%',
  backgroundColor: therapeuticColors.background,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24
};
```

### Content
- **Question**: "How do you feel now?" (`typography.h2`, center)
- **Mood selector**: 3 options (😟 Worse, 😐 Same, 🙂 Better)
- **Optional feedback**: "What helped most?" (quick feedback)

### Follow-up Options
```typescript
const followUpOptions = [
  {
    text: "Try another technique",
    style: "secondary",
    action: "showTechniques"
  },
  {
    text: "Set a reminder for later",
    style: "ghost",
    options: ["30 min", "1 hour", "3 hours"]
  },
  {
    text: "I'm ready to continue my day",
    style: "primary",
    action: "exitCrisisMode"
  }
];
```

## Screen States

### Loading State
- **Behavior**: Minimal spinner, never blocks access to help
- **Priority**: Core crisis features always available

### Offline State
- **Functionality**: Full offline capability
- **Resources**: Cached crisis resources available

### Error State
- **Behavior**: Graceful degradation
- **Guarantee**: Core breathing features always work

## Interactions and Animations

### Response Times
- **All taps**: Immediate response (no loading states)
- **Screen enter**: Immediate (no transition delay)
- **Button presses**: Quick scale animation (no delay)

### Navigation
- **No confirmations**: Direct action in crisis mode
- **Swipe down**: Exit confirmation only
- **Volume buttons**: Control haptic intensity
- **Silent switch**: Always respected

### Animations
- **Breathing circle**: Smooth, constant rhythm (4-7-8 timing)
- **Exit transition**: Gentle transition back to home
- **Button feedback**: Immediate visual response

## Accessibility

### Screen Reader Support
- **Screen announcement**: "Emergency breathing support screen"
- **Voice commands**: "Start breathing", "Get help", "I'm better"
- **Navigation**: Clear, logical focus order

### Visual Accessibility
- **Dynamic Type**: Critical text scales larger than normal
- **High contrast**: Alternative high-contrast mode available
- **Reduced motion**: Static alternatives to all animations

### Crisis-Specific Accessibility
- **Large touch targets**: Minimum 72px for all crisis actions
- **Clear visual hierarchy**: High contrast for critical elements
- **Simplified navigation**: No complex interactions during crisis

This crisis screen design prioritizes immediate safety and relief while providing clear pathways to professional support when needed.
