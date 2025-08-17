# Animation & Interaction Specifications

## Overview
Comprehensive specifications for animations and interactions in PocketTherapy, designed to support therapeutic experiences with calm, gentle, and accessible motion patterns.

## Core Animation Principles

### Therapeutic Animation Guidelines
1. **Gentle Motion**: Slow, calming animations that reduce anxiety
2. **Purposeful Movement**: Every animation serves a therapeutic or functional purpose
3. **Reduced Motion Support**: Static alternatives for users with motion sensitivity
4. **Haptic Synchronization**: Coordinated haptic feedback with visual animations
5. **Accessibility First**: Screen reader compatible and keyboard navigable

## Breathing Circle Animation

### Core Breathing Pattern (4-7-8 Technique)
```typescript
const breathingCircleAnimation = {
  phases: {
    inhale: {
      duration: 4000, // 4 seconds
      easing: 'ease-in-out',
      scale: { from: 0.8, to: 1.2 },
      opacity: { from: 0.6, to: 1.0 }
    },
    hold: {
      duration: 7000, // 7 seconds
      easing: 'linear',
      scale: 1.2, // Maintain size
      opacity: 1.0
    },
    exhale: {
      duration: 8000, // 8 seconds
      easing: 'ease-in-out',
      scale: { from: 1.2, to: 0.8 },
      opacity: { from: 1.0, to: 0.6 }
    }
  },
  
  // Synchronized haptic feedback
  hapticSync: {
    inhaleStart: 'impactLight',
    exhaleStart: 'impactMedium', // Longer duration
    cycleComplete: 'notificationSuccess'
  },
  
  // Visual styling
  styling: {
    baseColor: therapeuticColors.primary,
    backgroundColor: therapeuticColors.primary + '30', // 30% opacity
    borderWidth: 4,
    borderColor: therapeuticColors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12
  }
};
```

### Alternative Breathing Patterns
```typescript
const breathingPatterns = {
  box_breathing: {
    inhale: 4000,
    hold1: 4000,
    exhale: 4000,
    hold2: 4000
  },
  triangle_breathing: {
    inhale: 4000,
    hold: 4000,
    exhale: 4000
  },
  quick_calm: {
    inhale: 3000,
    exhale: 6000
  }
};
```

## Button Interactions

### Standard Button Press Animation
```typescript
const buttonPressAnimation = {
  scale: {
    from: 1.0,
    to: 0.98,
    duration: 100,
    easing: 'spring',
    springConfig: {
      tension: 300,
      friction: 10
    }
  },
  opacity: {
    from: 1.0,
    to: 0.8,
    duration: 100
  },
  haptic: 'impactLight'
};
```

### Crisis Button (SOS) Animation
```typescript
const sosButtonAnimation = {
  // Immediate response - no delay
  scale: {
    from: 1.0,
    to: 0.95,
    duration: 50 // Faster response for crisis
  },
  haptic: 'impactHeavy',
  
  // Subtle pulse when idle
  idlePulse: {
    scale: { sequence: [1.0, 1.02, 1.0] },
    duration: 2000,
    repeat: true,
    opacity: { sequence: [1.0, 0.9, 1.0] }
  }
};
```

### Therapeutic Button Variants
```typescript
const therapeuticButtonAnimations = {
  primary: {
    pressScale: 0.98,
    shadowElevation: { from: 4, to: 2 },
    haptic: 'impactMedium'
  },
  secondary: {
    pressScale: 0.99,
    borderWidth: { from: 2, to: 3 },
    haptic: 'impactLight'
  },
  ghost: {
    pressScale: 0.99,
    backgroundColor: { from: 'transparent', to: therapeuticColors.primary + '10' },
    haptic: 'selectionChanged'
  }
};
```

## Screen Transitions

### Modal Presentation
```typescript
const modalTransitions = {
  slideUp: {
    type: 'slide',
    direction: 'up',
    duration: 300,
    easing: 'ease-out',
    backdropFade: {
      from: 0,
      to: 0.5,
      duration: 300
    }
  },
  
  fadeIn: {
    type: 'fade',
    duration: 200,
    easing: 'ease-in-out'
  },
  
  // Crisis mode - immediate presentation
  immediate: {
    duration: 0, // No animation delay in crisis
    type: 'instant'
  }
};
```

### Page Navigation
```typescript
const pageTransitions = {
  stack: {
    push: {
      type: 'slide',
      direction: 'left',
      duration: 250,
      easing: 'ease-out'
    },
    pop: {
      type: 'slide',
      direction: 'right',
      duration: 250,
      easing: 'ease-in'
    }
  },
  
  tab: {
    type: 'fade',
    duration: 150,
    easing: 'ease-in-out'
  }
};
```

## Mood Selection Animation

### Mood Emoji Interaction
```typescript
const moodSelectionAnimation = {
  selection: {
    scale: {
      sequence: [1.0, 1.1, 1.0],
      duration: 400,
      easing: 'spring'
    },
    borderExpand: {
      from: 1,
      to: 3,
      duration: 200,
      color: therapeuticColors.primary
    },
    haptic: 'selectionChanged'
  },
  
  deselection: {
    scale: {
      from: 1.0,
      to: 0.95,
      duration: 150
    },
    borderCollapse: {
      from: 3,
      to: 1,
      duration: 150
    }
  }
};
```

## Success & Celebration Animations

### Exercise Completion
```typescript
const completionCelebration = {
  confetti: {
    particleCount: 30,
    duration: 1500,
    colors: [
      therapeuticColors.primary,
      therapeuticColors.accent,
      therapeuticColors.success
    ],
    spread: 60,
    origin: { y: 0.6 }
  },
  
  scaleBounce: {
    sequence: [1.0, 1.15, 1.0],
    duration: 600,
    easing: 'spring'
  },
  
  haptic: 'notificationSuccess'
};
```

### Streak Milestone
```typescript
const streakCelebration = {
  // Gentle celebration - not overwhelming
  shimmer: {
    duration: 1000,
    colors: [therapeuticColors.accent, therapeuticColors.primary],
    direction: 'horizontal'
  },
  
  textGlow: {
    shadowOpacity: { from: 0, to: 0.3, to: 0 },
    duration: 800
  }
};
```

## Loading Animations

### Breathing Circle Loader
```typescript
const breathingLoader = {
  scale: {
    sequence: [0.8, 1.0, 0.8],
    duration: 2000,
    repeat: true,
    easing: 'ease-in-out'
  },
  opacity: {
    sequence: [0.6, 1.0, 0.6],
    duration: 2000,
    repeat: true
  }
};
```

### Skeleton Loading
```typescript
const skeletonAnimation = {
  shimmer: {
    translateX: { from: -100, to: 100 },
    duration: 1500,
    repeat: true,
    easing: 'ease-in-out'
  },
  opacity: {
    sequence: [0.3, 0.7, 0.3],
    duration: 1500,
    repeat: true
  }
};
```

## Gesture Handling

### Swipe Gestures
```typescript
const swipeGestures = {
  threshold: 50, // Minimum distance for swipe recognition
  velocityThreshold: 0.3,
  directionalOffsetThreshold: 80,
  
  onboarding: {
    swipeLeft: 'nextStep',
    swipeRight: 'previousStep',
    feedback: 'hapticLight'
  },
  
  exercisePlayer: {
    swipeDown: 'minimizePlayer',
    swipeUp: 'showControls',
    feedback: 'hapticMedium'
  }
};
```

### Long Press Interactions
```typescript
const longPressGestures = {
  sosButton: {
    duration: 500, // 0.5 seconds
    action: 'immediateBreathing',
    feedback: 'hapticHeavy',
    visualFeedback: {
      scale: { from: 1.0, to: 1.05 },
      opacity: { from: 1.0, to: 0.8 }
    }
  },
  
  exerciseCard: {
    duration: 800,
    action: 'showQuickActions',
    feedback: 'hapticMedium'
  }
};
```

## Accessibility Considerations

### Reduced Motion Support
```typescript
const reducedMotionAlternatives = {
  breathingCircle: {
    // Static alternative with text cues
    textIndicator: 'Breathe in... Hold... Breathe out...',
    colorChange: { from: therapeuticColors.primary, to: therapeuticColors.accent },
    duration: 'same_as_animation'
  },
  
  buttonPress: {
    // Simple opacity change instead of scale
    opacity: { from: 1.0, to: 0.8 },
    duration: 100
  },
  
  pageTransitions: {
    // Instant transitions or simple fade
    type: 'fade',
    duration: 100
  }
};
```

### Screen Reader Integration
```typescript
const screenReaderAnimations = {
  announcements: {
    breathingPhase: 'Breathe in for 4 seconds',
    exerciseComplete: 'Exercise completed successfully',
    moodSelected: 'Mood selected: feeling good'
  },
  
  focusManagement: {
    modalPresent: 'focus_first_element',
    pageTransition: 'maintain_focus_context',
    completion: 'announce_and_focus_next_action'
  }
};
```

## Performance Optimization

### Animation Performance
```typescript
const performanceConfig = {
  useNativeDriver: true, // Use native driver when possible
  shouldRasterizeIOS: true, // Rasterize complex animations on iOS
  renderToHardwareTextureAndroid: true, // Hardware acceleration on Android
  
  // Limit concurrent animations
  maxConcurrentAnimations: 3,
  
  // Cleanup animations on unmount
  cleanupOnUnmount: true
};
```

### Memory Management
```typescript
const memoryManagement = {
  // Dispose of animation resources
  disposeOnComplete: true,
  
  // Limit animation complexity based on device performance
  adaptiveQuality: {
    lowEnd: 'reduced_particles',
    midRange: 'standard',
    highEnd: 'enhanced_effects'
  }
};
```

This animation specification ensures PocketTherapy provides smooth, therapeutic, and accessible motion design that supports users' mental health journey while maintaining excellent performance across all devices.
