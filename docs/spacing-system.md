# PocketTherapy Spacing & Layout System 📐

## 📏 Base Spacing Scale (4pt base)
| Token | Value (px) | Usage |
|-------|------------|-------|
| 0     | 0          | No space |
| 1x    | 4          | Icon padding, very tight |
| 2x    | 8          | Small gaps |
| 3x    | 12         | Minor separation |
| 4x    | 16         | Standard padding between related elements |
| 6x    | 24         | Between sections |
| 8x    | 32         | Major section separation |
| 12x   | 48         | Large breathing space |

## 🎯 Specialized Spacing (Mental Health Focused)
| Token | Value (px) | Usage |
|-------|------------|-------|
| breathingRoom | 40 | Around key emotional elements |
| panicSpacing | 56 | SOS button isolation space |
| celebrationSpace | 64 | Success animation areas |

## 👆 Touch Targets (Critical for Anxiety Users)
| Token | Value (px) | Usage |
|-------|------------|-------|
| touchMinimum | 44 | iOS minimum (accessibility) |
| touchComfortable | 56 | Anxiety-friendly size |
| touchPanic | 72 | SOS button (impossible to miss) |

## 🖼 Layout Principles
- Use **4x (16px)** as default internal padding
- Maintain **8x (32px)** top/bottom padding on major sections
- SOS button always has **panicSpacing (56px)** clear area
- All mood emojis use **touchComfortable (56px)** minimum

## Implementation

### React Native Spacing Constants

```typescript
export const spacing = {
  // Base scale (4pt system)
  '0': 0,
  '1x': 4,
  '2x': 8,
  '3x': 12,
  '4x': 16,
  '6x': 24,
  '8x': 32,
  '12x': 48,
  
  // Specialized spacing for mental health UX
  breathingRoom: 40,
  panicSpacing: 56,
  celebrationSpace: 64,
  
  // Touch targets
  touchMinimum: 44,
  touchComfortable: 56,
  touchPanic: 72
};
```

### Usage Guidelines

#### Standard Layout Patterns

```typescript
// Screen container
const screenContainer = {
  padding: spacing['4x'], // 16px all around
  paddingTop: spacing['8x'], // 32px top for major sections
  paddingBottom: spacing['8x'] // 32px bottom
};

// Card component
const cardStyle = {
  padding: spacing['4x'], // 16px internal padding
  marginBottom: spacing['6x'], // 24px between cards
  borderRadius: spacing['2x'] // 8px rounded corners
};

// Button spacing
const buttonStyle = {
  paddingVertical: spacing['3x'], // 12px vertical
  paddingHorizontal: spacing['4x'], // 16px horizontal
  marginVertical: spacing['2x'] // 8px between buttons
};
```

#### Mental Health Specific Patterns

```typescript
// SOS button (crisis-safe spacing)
const sosButtonStyle = {
  width: spacing.touchPanic, // 72px
  height: spacing.touchPanic, // 72px
  margin: spacing.panicSpacing, // 56px clear space around
  position: 'absolute',
  bottom: spacing.panicSpacing,
  right: spacing.panicSpacing
};

// Mood selector (anxiety-friendly)
const moodEmojiStyle = {
  width: spacing.touchComfortable, // 56px
  height: spacing.touchComfortable, // 56px
  margin: spacing['2x'], // 8px between emojis
  borderRadius: spacing.touchComfortable / 2 // Circular
};

// Breathing exercise area
const breathingAreaStyle = {
  padding: spacing.breathingRoom, // 40px breathing space
  margin: spacing.celebrationSpace, // 64px for focus
  alignItems: 'center',
  justifyContent: 'center'
};
```

### Responsive Spacing

```typescript
// Adjust spacing based on screen size
export const getResponsiveSpacing = (baseSpacing: number, screenWidth: number) => {
  if (screenWidth < 375) {
    return baseSpacing * 0.8; // Smaller screens get 80% spacing
  } else if (screenWidth > 414) {
    return baseSpacing * 1.2; // Larger screens get 120% spacing
  }
  return baseSpacing;
};
```

### Accessibility Considerations

#### Touch Target Guidelines
- **Minimum**: 44px (iOS accessibility standard)
- **Comfortable**: 56px (recommended for anxiety users)
- **Crisis**: 72px (SOS button - impossible to miss)

#### Safe Areas
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeContainer = ({ children }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      paddingTop: insets.top + spacing['4x'],
      paddingBottom: insets.bottom + spacing['4x'],
      paddingLeft: insets.left + spacing['4x'],
      paddingRight: insets.right + spacing['4x']
    }}>
      {children}
    </View>
  );
};
```

### Layout Patterns

#### Screen Layout
```typescript
const ScreenLayout = {
  container: {
    flex: 1,
    padding: spacing['4x'],
    paddingTop: spacing['8x']
  },
  header: {
    marginBottom: spacing['6x']
  },
  content: {
    flex: 1,
    paddingVertical: spacing['4x']
  },
  footer: {
    paddingTop: spacing['6x'],
    marginTop: spacing['8x']
  }
};
```

#### Component Spacing
```typescript
const ComponentSpacing = {
  // Between related elements
  related: spacing['2x'], // 8px
  
  // Between sections
  sections: spacing['6x'], // 24px
  
  // Between major areas
  major: spacing['8x'], // 32px
  
  // Around emotional content
  emotional: spacing.breathingRoom, // 40px
  
  // Crisis elements
  crisis: spacing.panicSpacing // 56px
};
```

This spacing system creates a calm, accessible, and anxiety-friendly interface that gives users the breathing room they need while maintaining clear visual hierarchy and touch accessibility.
