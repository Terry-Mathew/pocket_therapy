# Home Dashboard Screen

## Overview
The Home Dashboard serves as the central hub for users' mental health journey, providing quick access to mood check-ins, instant relief, and personalized recommendations.

## Layout Specifications

### Screen Configuration
- **Layout**: ScrollView with safe area padding
- **Pull-to-refresh**: Enabled with breathing circle spinner
- **Scroll behavior**: Hide/show header based on scroll direction

### Header Section (100px)
```typescript
const headerStyle = {
  paddingHorizontal: spacing['6x'], // 24px
  paddingTop: spacing['4x'],        // 16px
  height: 100
};
```

#### Left Side Content
- **Greeting**: "Good evening, friend 👋" 
  - Style: `typography.h3`, `therapeuticColors.textPrimary`
- **Streak**: "5 day streak 🔥"
  - Style: `typography.caption`, `therapeuticColors.textSecondary`

#### Right Side Content
- **Current mood badge**: Last logged emoji (32px) + time "2h ago"
- **Settings icon**: ⚙️ (24px, `therapeuticColors.textSecondary`)

## Main Content Components

### 1. Quick Check-in Card (130px height)
```typescript
const quickCheckinCard = {
  height: 130,
  backgroundColor: therapeuticColors.surface,
  borderRadius: 20,
  padding: spacing['5x'], // 20px
  flexDirection: 'row',
  justifyContent: 'space-between'
};
```

#### Left Content
- **Icon**: 💭 (28px)
- **Title**: "How are you feeling?" (`typography.h3`)
- **Subtitle**: "Quick 30-second check-in" (`typography.body`, opacity 0.8)

#### Right Content
- **CTA Button**: "Check in" (secondary variant, medium size)
- **Last check-in**: "2 hours ago" (`typography.caption`)

#### Interactions
- **Tap action**: Navigate to MoodCheckIn screen
- **Empty state**: "Your first check-in takes 30 seconds"

### 2. Instant Relief Card (110px height)
```typescript
const instantReliefCard = {
  height: 110,
  background: therapeuticColors.gradients.breathing,
  borderRadius: 20,
  padding: spacing['5x'],
  alignItems: 'center',
  justifyContent: 'center'
};
```

#### Content (Centered)
- **Icon**: 🫁 (28px)
- **Title**: "Need calm right now?" (`typography.h3`, white text)
- **CTA**: "Start breathing" (ghost button with white text)

#### Interactions
- **Tap action**: Navigate to SOS breathing
- **Animation**: Subtle breathing animation on background

### 3. Recommended Exercise Card (160px height)
```typescript
const recommendedCard = {
  height: 160,
  backgroundColor: therapeuticColors.surface,
  borderLeftWidth: 4,
  borderLeftColor: therapeuticColors.accent,
  borderRadius: 20,
  padding: spacing['5x']
};
```

#### Header
- **Badge**: "Suggested for you" (small, `therapeuticColors.accent` background)
- **Exercise icon**: Based on type (🫁 breathing, 🌱 grounding, 🧠 cognitive)

#### Content
- **Title**: "4-7-8 Breathing" (`typography.h3`)
- **Duration**: "2 minutes" (`typography.caption`)
- **Description**: "Based on your Tuesday afternoon patterns" (`typography.body`, opacity 0.8)
- **Tags**: [Anxiety] [Quick] (small chips)

#### Footer Actions
- **Primary**: "Start now" (primary button, medium)
- **Secondary**: "Save for later" (ghost button, small)

#### States
- **Has recommendation**: Show specific exercise
- **No history**: Show "Start with breathing" default
- **Loading**: Skeleton animation

### 4. Insights Preview Card (80px height)
```typescript
const insightsCard = {
  height: 80,
  backgroundColor: therapeuticColors.surface,
  borderRadius: 20,
  padding: spacing['4x'],
  flexDirection: 'row',
  alignItems: 'center'
};
```

#### Content
- **Icon**: 📊 (24px, `therapeuticColors.primary`)
- **Text**: "This week: mood improving ↗️" (`typography.body`)
- **CTA**: "View insights" (text link, `therapeuticColors.textSecondary`)

#### Interactions
- **Tap action**: Navigate to Insights screen
- **Empty state**: "Check in for a few days to see patterns"

### 5. Recent Exercises (Optional)
Displayed only if user has exercise history.

#### Layout
- **Title**: "Recent practices" (`typography.h3`, margin bottom 16px)
- **Scroll**: Horizontal scroll list
- **Cards**: 120x100px each with title, duration, last completed time
- **Interaction**: Tap to restart exercise

## Floating Action Button (SOS)

```typescript
const sosButton = {
  position: 'fixed',
  bottom: spacing['6x'],  // 24px
  right: spacing['6x'],   // 24px
  width: spacing.touchPanic,  // 72px
  height: spacing.touchPanic, // 72px
  borderRadius: spacing.touchPanic / 2,
  backgroundColor: therapeuticColors.crisis,
  shadowOpacity: 0.2,
  shadowRadius: 20
};
```

### Content
- **Text**: "SOS" (Inter Bold 16px, white)

### Interactions
- **Tap**: Navigate to SOS with strong haptic feedback
- **Long press**: Immediate breathing start

## Bottom Navigation (88px height)

```typescript
const bottomNav = {
  height: 88,
  backgroundColor: therapeuticColors.surface,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: spacing['3x'], // 12px
  shadowDirection: 'up'
};
```

### Tabs (Equal width)
1. **Home**: 🏠 (active: `therapeuticColors.primary`, inactive: textMuted)
2. **Library**: 📚
3. **Insights**: 📊
4. **Settings**: ⚙️

### States
- **Active**: Icon tint + small dot indicator below
- **Interaction**: Navigate with fade transition
- **Badge**: Red dot for unread insights

## Screen States

### Loading State
- **Cards**: Skeleton cards with shimmer animation
- **Behavior**: Progressive loading of content

### Error State
- **Message**: "Something went wrong"
- **Action**: Retry button
- **Fallback**: Show cached content if available

### Offline State
- **Banner**: "Working offline" notification
- **Functionality**: Full offline capability for core features

### Empty State (New User)
- **Content**: Customized welcome content
- **Onboarding**: Gentle introduction to features

## Pull-to-Refresh

### Animation
- **Spinner**: Breathing circle animation
- **Success**: Brief "Updated" message
- **Error**: "Couldn't refresh" with manual retry option

## Interactions and Animations

### Haptic Feedback
- **Card taps**: Light haptic + scale animation
- **Button taps**: Medium haptic + press animation
- **SOS tap**: Strong haptic + immediate response

### Animations
- **Card interactions**: Gentle scale and opacity changes
- **Scroll behavior**: Smooth header hide/show
- **Transitions**: Fade between screens (200ms duration)

## Accessibility

### Screen Reader Support
- **Screen label**: "Home dashboard. Your mental health companion."
- **Card descriptions**: Detailed descriptions for each interactive element
- **Navigation**: Clear focus order and navigation hints

### Touch Targets
- **Minimum**: 44px for all interactive elements
- **Comfortable**: 56px for primary actions
- **Crisis**: 72px for SOS button

### Dynamic Type
- **Support**: All text scales with system preferences
- **Maximum**: 200% scale factor
- **Minimum**: 85% scale factor

This home dashboard design prioritizes immediate access to mental health support while providing a calm, organized interface that reduces cognitive load for users experiencing anxiety.
