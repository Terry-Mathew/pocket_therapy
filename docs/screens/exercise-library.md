# Exercise Library Screen

## Overview
A comprehensive library of mental health exercises with search, filtering, and personalized recommendations. Designed to help users find the right therapeutic technique for their current needs.

## Layout Specifications

### Screen Configuration
- **Layout**: Scrollable with search and filters
- **Navigation**: Bottom tabs active on "Library"
- **Pull-to-refresh**: Enabled with breathing circle animation

## Header Section (120px)

```typescript
const headerStyle = {
  height: 120,
  backgroundColor: therapeuticColors.background,
  padding: spacing['4x'] // 16px
};
```

### Title Section
- **Title**: "Exercise Library" (`typography.h2`, `therapeuticColors.textPrimary`)
- **Subtitle**: "Find what works for you" (`typography.body`, opacity 0.8)

### Search Bar (60px)
```typescript
const searchBar = {
  height: 60,
  backgroundColor: therapeuticColors.surface,
  borderRadius: 16,
  paddingHorizontal: spacing['4x'],
  flexDirection: 'row',
  alignItems: 'center'
};
```

- **Placeholder**: "Search exercises..."
- **Icon**: 🔍 (left, 20px)
- **Clear button**: "×" (right, appears when text exists)

## Filter Tabs (60px)

```typescript
const filterTabs = {
  height: 60,
  paddingHorizontal: spacing['4x']
};

const filterTab = {
  paddingVertical: spacing['3x'], // 12px
  paddingHorizontal: spacing['5x'], // 20px
  borderRadius: 20,
  marginRight: spacing['2x']
};
```

### Available Filters
[All] [Breathing] [Grounding] [Thoughts] [Quick] [Favorites]

#### Tab States
- **Active**: `therapeuticColors.primary` background, white text
- **Inactive**: `therapeuticColors.surface` background, `textPrimary`
- **Animation**: Fade transition on switch

## Exercise Grid

### Layout
```typescript
const exerciseGrid = {
  paddingHorizontal: spacing['4x'], // 16px
  gap: spacing['4x'] // 16px between cards
};
```

### Exercise Card (120px height)
```typescript
const exerciseCard = {
  height: 120,
  backgroundColor: therapeuticColors.surface,
  borderRadius: 16,
  padding: spacing['4x'],
  flexDirection: 'row',
  alignItems: 'center'
};
```

#### Left Content (64px width)
- **Icon**: Exercise type icon (32px)
  - 🫁 Breathing exercises
  - 🌱 Grounding techniques
  - 🧠 Cognitive tools
  - 😴 Sleep & wind-down
- **Duration badge**: "2 min" (`typography.caption`, `therapeuticColors.accent` background)

#### Center Content (flex 1)
- **Title**: "4-7-8 Breathing" (`typography.h3`, `therapeuticColors.textPrimary`)
- **Description**: "Classic calm breathing pattern" (`typography.body`, opacity 0.8, 2 lines max)
- **Tags**: [Anxiety] [Quick] [SOS-Safe] (small pills, 8px spacing)

#### Right Content (80px width)
- **Heart icon**: Favorites toggle (24px, `therapeuticColors.crisis` when favorited)
- **Start button**: Secondary variant, small size
- **User rating**: "4.8 ⭐" (`typography.caption`, if rated)

#### Card States
```typescript
const cardStates = {
  default: {
    transform: [{ scale: 1 }],
    opacity: 1
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8
  },
  favorited: {
    // Heart filled, slight tint on card
    backgroundColor: therapeuticColors.surface + '10'
  },
  completed: {
    // Small checkmark badge overlay
  }
};
```

## Categories Section

### Display Condition
Shown when no search or filter is active.

### Layout
```typescript
const categoriesSection = {
  marginTop: spacing['6x'], // 24px
  paddingHorizontal: spacing['4x']
};
```

- **Title**: "Start Here" (`typography.h3`)

### Category Cards (160x120px)
```typescript
const categoryCard = {
  width: 160,
  height: 120,
  borderRadius: 16,
  marginRight: spacing['4x'],
  overflow: 'hidden'
};
```

#### Available Categories
- Beginner
- Anxiety Relief
- Study Stress
- Sleep
- Quick Relief

#### Card Content
- **Background**: Subtle gradient image
- **Title**: Category name (`typography.h3`, white text)
- **Count**: "12 exercises" (`typography.caption`, white)
- **Overlay**: `therapeuticColors.primary` + '80' (semi-transparent)

## Recommended Section

### Layout
```typescript
const recommendedSection = {
  marginTop: spacing['8x'], // 32px
  paddingHorizontal: spacing['4x']
};
```

- **Title**: "Suggested for You" (`typography.h3`)
- **Subtitle**: "Based on your recent check-ins" (`typography.body`, opacity 0.8)
- **Layout**: Same as main grid, limited to 3 items

## Empty States

### No Search Results
```typescript
const noResultsState = {
  alignItems: 'center',
  paddingVertical: spacing['12x'], // 48px
};
```

- **Illustration**: Magnifying glass (80px)
- **Title**: "No exercises found" (`typography.h3`, center)
- **Body**: "Try different keywords or browse categories" (`typography.body`, center)
- **CTA**: "Clear search" (ghost button)

### No Favorites
```typescript
const noFavoritesState = {
  alignItems: 'center',
  paddingVertical: spacing['12x']
};
```

- **Illustration**: Heart outline (80px)
- **Title**: "No favorites yet" (`typography.h3`, center)
- **Body**: "Tap ♡ on exercises you love" (`typography.body`, center)

## Loading States

### Search Loading
- **Behavior**: Skeleton cards while loading results
- **Duration**: Maximum 2 seconds

### Category Switch
- **Animation**: Fade transition between categories
- **Duration**: 300ms

### Exercise Load
- **Effect**: Shimmer effect on cards
- **Progressive**: Load cards as they become available

## Interactions

### Search Functionality
- **Real-time results**: 300ms debounce
- **Behavior**: Updates grid as user types
- **Clear**: "×" button clears search and shows all exercises

### Filter Tabs
- **Response**: Immediate switch on tap
- **Animation**: Fade transition between filtered results
- **State**: Maintains scroll position when possible

### Card Interactions
```typescript
const cardInteractions = {
  cardTap: {
    action: 'navigateToExerciseDetail',
    haptic: 'impactLight'
  },
  heartTap: {
    action: 'toggleFavorite',
    haptic: 'impactLight',
    animation: 'scale'
  },
  startTap: {
    action: 'navigateToExercisePlayer',
    haptic: 'impactMedium'
  }
};
```

## Pull-to-Refresh

### Animation
- **Spinner**: Breathing circle animation
- **Action**: Refresh exercise library from server
- **Success**: Brief confirmation message
- **Error**: Graceful fallback to cached content

## Optional Features

### Floating Action Button
```typescript
const floatingAction = {
  position: 'absolute',
  bottom: spacing['20x'], // Above tab bar
  right: spacing['4x'],
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: therapeuticColors.primary
};
```

- **Icon**: "+" (24px)
- **Action**: "Request exercise" form
- **Purpose**: Allow users to suggest new exercises

## Accessibility

### Screen Reader Support
- **Screen announcement**: "Exercise library. Find therapeutic exercises."
- **Card descriptions**: Detailed descriptions including duration, type, and rating
- **Filter announcements**: "Showing breathing exercises" when filter changes

### Keyboard Navigation
- **Tab order**: Search → filters → exercise cards
- **Focus indicators**: Clear visual focus states
- **Actions**: Enter key activates buttons and cards

### Visual Accessibility
- **Dynamic Type**: All text scales appropriately
- **High contrast**: Alternative color schemes for cards and filters
- **Touch targets**: Minimum 44px for all interactive elements

## Performance Considerations

### Lazy Loading
- **Implementation**: Load exercises as user scrolls
- **Batch size**: 20 exercises per load
- **Caching**: Cache frequently accessed exercises

### Search Optimization
- **Debouncing**: 300ms delay to prevent excessive API calls
- **Local search**: Search cached results first
- **Fuzzy matching**: Support for partial and misspelled queries

This exercise library design provides comprehensive access to therapeutic content while maintaining performance and accessibility standards for users seeking mental health support.
