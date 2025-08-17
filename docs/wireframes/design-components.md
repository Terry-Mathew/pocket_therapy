# Design Components & Wireframes

## Overview
Component specifications and wireframe documentation for PocketTherapy's design system implementation.

## Core Components

### TherapeuticButton Component

#### Variants and Props
```typescript
interface TherapeuticButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'crisis' | 'ghost';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
```

#### Styling Specifications
```typescript
const buttonStyles = {
  primary: {
    backgroundColor: therapeuticColors.primary,
    color: therapeuticColors.buttonText,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  secondary: {
    backgroundColor: 'transparent',
    color: therapeuticColors.primary,
    borderWidth: 2,
    borderColor: therapeuticColors.primary,
    borderRadius: 28,
    paddingVertical: 14, // Adjusted for border
    paddingHorizontal: 22
  },
  crisis: {
    backgroundColor: therapeuticColors.crisis,
    color: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  ghost: {
    backgroundColor: 'transparent',
    color: therapeuticColors.textSecondary,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24
  }
};
```

#### Interactive States
```typescript
const buttonStates = {
  default: {
    opacity: 1,
    transform: [{ scale: 1 }]
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.5,
    // No interaction allowed
  },
  loading: {
    // Spinner replaces text content
    opacity: 0.8
  }
};
```

### MoodEmoji Component

#### Component Specification
```typescript
interface MoodEmojiProps {
  value: 1 | 2 | 3 | 4 | 5;
  selected?: boolean;
  onPress: (value: number) => void;
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
}
```

#### Size Variants
```typescript
const moodEmojiSizes = {
  small: {
    width: 40,
    height: 40,
    fontSize: 24
  },
  medium: {
    width: 56,
    height: 56,
    fontSize: 32
  },
  large: {
    width: 72,
    height: 72,
    fontSize: 48
  }
};
```

#### Mood Mappings
```typescript
const moodEmojis = {
  1: { emoji: '😢', label: 'Very sad', color: therapeuticColors.moodColors[1] },
  2: { emoji: '😕', label: 'Sad', color: therapeuticColors.moodColors[2] },
  3: { emoji: '😐', label: 'Neutral', color: therapeuticColors.moodColors[3] },
  4: { emoji: '🙂', label: 'Good', color: therapeuticColors.moodColors[4] },
  5: { emoji: '😊', label: 'Great', color: therapeuticColors.moodColors[5] }
};
```

### TherapeuticCard Component

#### Component Props
```typescript
interface TherapeuticCardProps {
  title: string;
  description?: string;
  icon?: string;
  onPress?: () => void;
  variant: 'default' | 'highlighted' | 'exercise' | 'insight';
  children?: React.ReactNode;
}
```

#### Card Variants
```typescript
const cardStyles = {
  default: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['4x'],
    shadowOpacity: 0.05,
    shadowRadius: 8
  },
  highlighted: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['4x'],
    borderLeftWidth: 4,
    borderLeftColor: therapeuticColors.accent
  },
  exercise: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['4x'],
    borderWidth: 1,
    borderColor: therapeuticColors.primary + '20'
  },
  insight: {
    backgroundColor: therapeuticColors.primary + '10',
    borderRadius: 16,
    padding: spacing['4x']
  }
};
```

## Screen Wireframes

### Home Dashboard Wireframe

#### Layout Structure (Vertical Scroll)
```typescript
const homeLayout = {
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
    paddingHorizontal: spacing['6x'] // 24px safe area
  }
};
```

#### Header Section (80px height)
- **Greeting**: "Hi there 👋" (left aligned, Inter Medium 18px)
- **Current mood**: Last logged mood emoji (right aligned, 32px)
- **Streak counter**: "5 day streak 🔥" (below greeting, caption style)

#### Content Cards
1. **Quick Check-in Card** (120px height, 16px margin bottom)
   - Background: `therapeuticColors.surface`, border-radius 20px
   - Icon: 💭 (left, 24px)
   - Text: "How are you feeling right now?" (Inter Medium 16px)
   - CTA: "2-min check-in" button (right, primary color)
   - Action: Navigate to MoodCheckIn

2. **Instant Relief Card** (100px height, 16px margin bottom)
   - Background: gradient (`therapeutic.gradients.breathing`)
   - Icon: 🫁 (left, 24px)
   - Text: "Need calm now?" (Inter Medium 16px)
   - CTA: "Start breathing" button (right, secondary color)
   - Action: Launch SOS breathing

3. **Recommended Exercise Card** (140px height, 16px margin bottom)
   - Background: `therapeuticColors.surface`
   - Left border: 4px `therapeuticColors.accent`
   - Title: "Suggested for you" (Inter SemiBold 14px)
   - Exercise title: "4-7-8 Breathing" (Inter Medium 16px)
   - Duration: "2 min" (caption style)
   - Preview: "Based on your Tuesday patterns"

### Mood Check-in Wireframe

#### Step 1: Mood Selection
```typescript
const moodSelectionLayout = {
  header: {
    title: "How are you feeling right now?",
    subtitle: "It's okay to not be okay 💙"
  },
  moodGrid: {
    layout: 'row',
    justifyContent: 'space-between',
    emojis: ['😢', '😕', '😐', '🙂', '😊'],
    touchTargets: 64 // Minimum touch target size
  }
};
```

#### Step 2: Context Tags
```typescript
const contextTagsLayout = {
  header: {
    title: "What's contributing to this feeling?",
    subtitle: "Select any that apply (optional)"
  },
  tagsGrid: {
    layout: 'flex-wrap',
    gap: 12,
    tags: ['Exams', 'Work', 'Social', 'Money', 'Health', 'Family', 'Sleep', 'Future', 'Other']
  }
};
```

### SOS Screen Wireframe

#### Crisis-Optimized Layout
```typescript
const sosLayout = {
  hero: {
    height: 250,
    content: {
      title: "You're going to be okay",
      subtitle: "Let's find calm together"
    }
  },
  primaryCTA: {
    height: 72,
    text: "Start Calm Now",
    action: "immediate_breathing"
  },
  quickOptions: {
    grid: '2x2',
    options: [
      '60s Breathing',
      '5-4-3-2-1 Ground',
      'Feel Your Hands',
      'Get Support'
    ]
  }
};
```

## Layout Patterns

### Card Grid System
```typescript
const gridSystem = {
  container: {
    paddingHorizontal: spacing['4x'], // 16px
    gap: spacing['4x'] // 16px between cards
  },
  card: {
    minHeight: 80,
    borderRadius: 16,
    padding: spacing['4x']
  }
};
```

### Navigation Patterns
```typescript
const navigationPatterns = {
  tabBar: {
    height: 88,
    backgroundColor: therapeuticColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    tabs: ['Home', 'Library', 'Insights', 'Settings']
  },
  floatingAction: {
    position: 'absolute',
    bottom: spacing['6x'],
    right: spacing['6x'],
    size: spacing.touchPanic, // 72px for SOS
    backgroundColor: therapeuticColors.crisis
  }
};
```

## Responsive Considerations

### Screen Size Adaptations
```typescript
const responsiveBreakpoints = {
  small: 320, // iPhone SE
  medium: 375, // iPhone standard
  large: 414, // iPhone Plus
  tablet: 768 // iPad
};

const adaptiveSpacing = {
  small: spacing['3x'], // 12px
  medium: spacing['4x'], // 16px
  large: spacing['5x']  // 20px
};
```

### Touch Target Guidelines
- **Minimum**: 44px (iOS accessibility standard)
- **Comfortable**: 56px (anxiety-friendly)
- **Crisis**: 72px (SOS button - impossible to miss)

## Animation Specifications

### Micro-interactions
```typescript
const animations = {
  buttonPress: {
    scale: 0.98,
    duration: 150,
    easing: 'ease-out'
  },
  cardTap: {
    scale: 0.99,
    opacity: 0.8,
    duration: 100
  },
  moodSelection: {
    scale: [1, 1.1, 1],
    duration: 300,
    easing: 'spring'
  }
};
```

### Page Transitions
```typescript
const pageTransitions = {
  slide: {
    duration: 300,
    easing: 'ease-in-out'
  },
  fade: {
    duration: 200,
    easing: 'ease-out'
  },
  modal: {
    duration: 400,
    easing: 'spring'
  }
};
```

This wireframe documentation provides the foundation for implementing PocketTherapy's therapeutic design system with consistent, accessible, and calming user interfaces.
