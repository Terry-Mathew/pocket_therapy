# App Launch Screen

## Overview
The initial loading screen that appears when PocketTherapy starts, providing a calm, welcoming experience while the app initializes.

## Layout Specifications

### Screen Configuration
- **Layout**: Full screen, centered content
- **Duration**: 2-3 seconds maximum
- **Background**: `therapeuticColors.background`

## Visual Elements

### Logo and Branding
```typescript
const logoContainer = {
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1
};

const logo = {
  width: 120,
  height: 120,
  marginBottom: spacing['6x'] // 24px
};
```

- **Logo**: PocketTherapy icon (120px)
- **Animation**: Gentle fade-in with breathing effect

### App Name
```typescript
const appName = {
  ...typography.display,
  color: therapeuticColors.primary,
  textAlign: 'center',
  marginBottom: spacing['2x'] // 8px
};
```

- **Text**: "PocketTherapy"
- **Style**: Display typography, primary color

### Tagline
```typescript
const tagline = {
  ...typography.body,
  color: therapeuticColors.textSecondary,
  textAlign: 'center',
  opacity: 0.8
};
```

- **Text**: "Your calm companion"
- **Animation**: Fade-in after logo (500ms delay)

## Loading Indicator

### Breathing Circle Animation
```typescript
const loadingIndicator = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: therapeuticColors.primary + '30',
  borderWidth: 2,
  borderColor: therapeuticColors.primary,
  marginTop: spacing['8x'] // 32px
};
```

- **Animation**: Gentle scale breathing effect (2-second cycle)
- **Purpose**: Indicates app is loading while maintaining calm aesthetic

## Initialization Process

### Loading States
```typescript
const initializationSteps = [
  {
    step: "loading_fonts",
    duration: 500,
    message: "Loading fonts..."
  },
  {
    step: "checking_auth",
    duration: 300,
    message: "Checking authentication..."
  },
  {
    step: "loading_data",
    duration: 800,
    message: "Loading your data..."
  },
  {
    step: "ready",
    duration: 200,
    message: "Ready!"
  }
];
```

### Error Handling
- **Network error**: Graceful fallback to offline mode
- **Data corruption**: Reset to clean state with user notification
- **Font loading failure**: Fallback to system fonts

## Accessibility

### Screen Reader Support
- **Announcement**: "PocketTherapy is loading. Your calm companion."
- **Progress**: "Loading complete" when ready

### Reduced Motion
- **Alternative**: Static logo without breathing animation
- **Loading**: Simple opacity change instead of scale animation

## Performance Considerations

### Optimization
- **Preload**: Critical assets loaded during splash
- **Caching**: Frequently used resources cached
- **Memory**: Efficient cleanup after initialization

This launch screen creates a welcoming first impression while efficiently preparing the app for use.
