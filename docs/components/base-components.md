# Base Components Documentation

## Overview
Core reusable components for PocketTherapy, designed with therapeutic principles, accessibility standards, and consistent design system implementation.

## TherapeuticButton Component

### Component Interface
```typescript
interface TherapeuticButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'ghost' | 'crisis';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
}
```

### Styling Specifications
```typescript
const therapeuticButtonStyles = {
  base: {
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    flexDirection: 'row'
  },
  
  variants: {
    primary: {
      backgroundColor: therapeuticColors.primary,
      color: therapeuticColors.buttonText,
      paddingVertical: 16,
      paddingHorizontal: 24,
      shadowColor: therapeuticColors.primary
    },
    
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: therapeuticColors.primary,
      color: therapeuticColors.primary,
      paddingVertical: 14, // Adjusted for border
      paddingHorizontal: 22,
      shadowOpacity: 0
    },
    
    ghost: {
      backgroundColor: 'transparent',
      color: therapeuticColors.textSecondary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      shadowOpacity: 0
    },
    
    crisis: {
      backgroundColor: therapeuticColors.crisis,
      color: '#FFFFFF',
      paddingVertical: 18, // Larger for crisis actions
      paddingHorizontal: 28,
      shadowColor: therapeuticColors.crisis,
      shadowOpacity: 0.25
    }
  },
  
  sizes: {
    small: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: typography.bodySmall.fontSize
    },
    medium: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      fontSize: typography.body.fontSize
    },
    large: {
      paddingVertical: 20,
      paddingHorizontal: 32,
      fontSize: typography.h3.fontSize
    }
  },
  
  states: {
    disabled: {
      opacity: 0.5,
      shadowOpacity: 0
    },
    loading: {
      opacity: 0.8
    },
    pressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.8
    }
  }
};
```

### Implementation Example
```typescript
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { therapeuticColors, typography, spacing } from '@constants';

export const TherapeuticButton: React.FC<TherapeuticButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  icon,
  iconPosition = 'left'
}) => {
  const buttonStyle = [
    therapeuticButtonStyles.base,
    therapeuticButtonStyles.variants[variant],
    therapeuticButtonStyles.sizes[size],
    disabled && therapeuticButtonStyles.states.disabled,
    loading && therapeuticButtonStyles.states.loading,
    fullWidth && { width: '100%' }
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'secondary' || variant === 'ghost' 
            ? therapeuticColors.primary 
            : '#FFFFFF'
          } 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Text style={[buttonTextStyle, { marginRight: spacing['2x'] }]}>
              {icon}
            </Text>
          )}
          <Text style={buttonTextStyle}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Text style={[buttonTextStyle, { marginLeft: spacing['2x'] }]}>
              {icon}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
```

## MoodEmoji Component

### Component Interface
```typescript
interface MoodEmojiProps {
  value: 1 | 2 | 3 | 4 | 5;
  selected?: boolean;
  onPress: (value: number) => void;
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  showLabel?: boolean;
}
```

### Mood Mapping
```typescript
const moodEmojiData = {
  1: { 
    emoji: '😢', 
    label: 'Very sad', 
    color: therapeuticColors.moodColors[1],
    description: 'Feeling very down or distressed'
  },
  2: { 
    emoji: '😕', 
    label: 'Sad', 
    color: therapeuticColors.moodColors[2],
    description: 'Feeling low or unhappy'
  },
  3: { 
    emoji: '😐', 
    label: 'Neutral', 
    color: therapeuticColors.moodColors[3],
    description: 'Feeling okay, neither good nor bad'
  },
  4: { 
    emoji: '🙂', 
    label: 'Good', 
    color: therapeuticColors.moodColors[4],
    description: 'Feeling positive and content'
  },
  5: { 
    emoji: '😊', 
    label: 'Great', 
    color: therapeuticColors.moodColors[5],
    description: 'Feeling very happy and energetic'
  }
};
```

### Styling Specifications
```typescript
const moodEmojiStyles = {
  sizes: {
    small: {
      width: 40,
      height: 40,
      fontSize: 24,
      borderRadius: 20
    },
    medium: {
      width: 56,
      height: 56,
      fontSize: 32,
      borderRadius: 28
    },
    large: {
      width: 72,
      height: 72,
      fontSize: 48,
      borderRadius: 36
    }
  },
  
  states: {
    default: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: 'transparent'
    },
    selected: {
      backgroundColor: (color: string) => color + '20', // 20% opacity
      borderColor: (color: string) => color,
      borderWidth: 3
    },
    pressed: {
      transform: [{ scale: 1.1 }],
      opacity: 0.8
    }
  }
};
```

## TherapeuticCard Component

### Component Interface
```typescript
interface TherapeuticCardProps {
  title: string;
  description?: string;
  icon?: string;
  onPress?: () => void;
  variant: 'default' | 'highlighted' | 'exercise' | 'insight' | 'crisis';
  children?: React.ReactNode;
  badge?: string;
  rightAction?: React.ReactNode;
  disabled?: boolean;
}
```

### Card Variants
```typescript
const therapeuticCardStyles = {
  base: {
    borderRadius: 16,
    padding: spacing['4x'], // 16px
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000'
  },
  
  variants: {
    default: {
      backgroundColor: therapeuticColors.surface,
      borderWidth: 0
    },
    
    highlighted: {
      backgroundColor: therapeuticColors.surface,
      borderLeftWidth: 4,
      borderLeftColor: therapeuticColors.accent,
      paddingLeft: spacing['5x'] // 20px to account for border
    },
    
    exercise: {
      backgroundColor: therapeuticColors.surface,
      borderWidth: 1,
      borderColor: therapeuticColors.primary + '20' // 20% opacity
    },
    
    insight: {
      backgroundColor: therapeuticColors.primary + '10', // 10% opacity
      borderWidth: 1,
      borderColor: therapeuticColors.primary + '30'
    },
    
    crisis: {
      backgroundColor: therapeuticColors.crisis + '10',
      borderWidth: 2,
      borderColor: therapeuticColors.crisis,
      shadowColor: therapeuticColors.crisis,
      shadowOpacity: 0.15
    }
  },
  
  states: {
    pressed: {
      transform: [{ scale: 0.99 }],
      opacity: 0.8
    },
    disabled: {
      opacity: 0.5
    }
  }
};
```

### Card Layout Structure
```typescript
const cardLayoutStructure = {
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2x'] // 8px
  },
  
  content: {
    flex: 1
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['3x'] // 12px
  }
};
```

## Component Usage Guidelines

### Accessibility Requirements
```typescript
const accessibilityRequirements = {
  // All interactive components must have
  required: [
    'accessibilityRole',
    'accessibilityLabel',
    'accessibilityState'
  ],
  
  // Recommended for better UX
  recommended: [
    'accessibilityHint',
    'accessibilityActions'
  ],
  
  // Touch target minimums
  touchTargets: {
    minimum: 44, // iOS accessibility standard
    comfortable: 56, // Anxiety-friendly
    crisis: 72 // SOS actions
  }
};
```

### Haptic Feedback Integration
```typescript
const hapticFeedbackPatterns = {
  therapeuticButton: {
    primary: 'impactMedium',
    secondary: 'impactLight',
    crisis: 'impactHeavy',
    ghost: 'selectionChanged'
  },
  
  moodEmoji: {
    selection: 'impactLight',
    deselection: 'selectionChanged'
  },
  
  therapeuticCard: {
    tap: 'impactLight',
    longPress: 'impactMedium'
  }
};
```

### Performance Considerations
```typescript
const performanceOptimizations = {
  // Use React.memo for pure components
  memoization: true,
  
  // Optimize re-renders
  useCallback: ['onPress', 'onLongPress'],
  useMemo: ['computedStyles', 'accessibilityProps'],
  
  // Native driver for animations
  useNativeDriver: true,
  
  // Lazy loading for complex components
  lazyLoading: ['exerciseCards', 'insightCards']
};
```

### Testing Requirements
```typescript
const componentTests = {
  // Unit tests
  unit: [
    'renders_correctly',
    'handles_press_events',
    'applies_correct_styles',
    'respects_disabled_state'
  ],
  
  // Accessibility tests
  accessibility: [
    'has_accessibility_label',
    'supports_screen_reader',
    'meets_touch_target_size',
    'keyboard_navigable'
  ],
  
  // Integration tests
  integration: [
    'works_with_theme_changes',
    'responds_to_haptic_settings',
    'handles_loading_states'
  ]
};
```

## Component Composition Patterns

### Compound Components
```typescript
// Example: MoodSelector compound component
const MoodSelector = {
  Container: MoodSelectorContainer,
  Emoji: MoodEmoji,
  Label: MoodLabel,
  Description: MoodDescription
};

// Usage
<MoodSelector.Container>
  <MoodSelector.Emoji value={3} selected onPress={handleMoodSelect} />
  <MoodSelector.Label>Neutral</MoodSelector.Label>
  <MoodSelector.Description>Feeling okay today</MoodSelector.Description>
</MoodSelector.Container>
```

### Higher-Order Components
```typescript
// withTherapeuticStyling HOC
const withTherapeuticStyling = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <Component
      {...props}
      ref={ref}
      style={[therapeuticBaseStyles, props.style]}
    />
  ));
};
```

This base components documentation provides the foundation for building consistent, accessible, and therapeutic user interfaces throughout PocketTherapy.
