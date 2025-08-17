# Accessibility Guidelines

## Table of Contents
- [Visual Accessibility](#visual-accessibility)
- [Screen Reader Support](#screen-reader-support)
- [Implementation Guidelines](#implementation-guidelines)
- [Testing Requirements](#testing-requirements)

## Visual Accessibility

### Dynamic Type Support
Support for iOS and Android system text scaling preferences to ensure readability for users with visual impairments.

```javascript
const dynamicType = {
  baseSize: typography,
  scaleFactor: 'iOS/Android system preference',
  maxScale: '200%', // Readable limit
  minScale: '85%'   // Functional limit
};
```

### High Contrast Mode
Enhanced color scheme for users requiring higher contrast ratios for better visibility.

```javascript
const highContrast = {
  background: '#FFFFFF',
  surface: '#F0F0F0', 
  textPrimary: '#000000',
  textSecondary: '#333333',
  accent: '#0066CC', // High contrast blue
  crisis: '#CC0000'  // High contrast red
};
```

### Color Blindness Support
Pattern-based differentiation for mood colors to ensure accessibility for colorblind users.

```javascript
const colorblindSafe = {
  moodColors: {
    1: { color: therapeuticColors.moodColors[1], pattern: 'diagonal_lines' },
    2: { color: therapeuticColors.moodColors[1], pattern: 'dots' },
    3: { color: therapeuticColors.moodColors[2], pattern: 'solid' },
    4: { color: therapeuticColors.moodColors[3], pattern: 'vertical_lines' },
    5: { color: therapeuticColors.moodColors[4], pattern: 'crosshatch' }
  }
};
```

### Reduced Motion Support
Alternative animations for users with vestibular disorders or motion sensitivity.

```javascript
const reducedMotion = {
  breathingCircle: 'static_with_text_cues',
  pageTransitions: 'fade_only',
  buttonFeedback: 'color_change_only',
  loadingStates: 'text_indicators'
};
```

## Screen Reader Support

### Screen Labels
Descriptive labels for major app sections to provide context for screen reader users.

```javascript
const screenLabels = {
  home: "Home screen. Your calm companion dashboard.",
  moodCheckin: "Mood check-in. Step 1 of 3. How are you feeling?",
  sos: "Emergency support screen. Immediate anxiety relief available.",
  exercisePlayer: "Exercise session. 4-7-8 breathing. 2 minutes remaining."
};
```

### Button Descriptions
Clear, actionable descriptions for interactive elements.

```javascript
const buttonLabels = {
  moodEmoji: "Mood selector. Currently feeling sad. Tap to change.",
  sosButton: "SOS emergency support. Double tap for immediate help.",
  startExercise: "Start 4-7-8 breathing exercise. 2 minutes duration.",
  completeCheckin: "Complete mood check-in and get recommendations."
};
```

### Dynamic Announcements
Real-time feedback for user actions and state changes.

```javascript
const announcements = {
  moodSaved: "Mood check-in saved. Recommendations available.",
  exerciseComplete: "Exercise completed. Well done.",
  breathingPhase: "Breathe in for 4 seconds. Hold for 7 seconds. Exhale for 8 seconds.",
  crisisDetected: "Crisis support resources available. You're not alone."
};
```

### Alternative Formats
Non-visual alternatives for visual content.

```javascript
const alternatives = {
  breathingCircle: "Breathing timer with audio cues and haptic feedback",
  moodChart: "Data table showing mood trends over past 30 days",
  exerciseAnimation: "Step-by-step text instructions with audio guidance"
};
```

## Implementation Guidelines

### React Native Accessibility Props

#### Required Props for All Interactive Elements
```jsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Select very sad mood"
  accessibilityHint="Double tap to log your current mood as very sad"
  accessibilityState={{ selected: isSelected }}
>
  <Text>😢</Text>
</TouchableOpacity>
```

#### Live Regions for Dynamic Content
```jsx
<View accessibilityLiveRegion="assertive">
  <Text>Mood check-in completed successfully</Text>
</View>
```

#### Grouping Related Elements
```jsx
<View 
  accessible={true}
  accessibilityRole="group"
  accessibilityLabel="Mood selection options"
>
  {moodOptions.map(option => (
    <MoodButton key={option.id} {...option} />
  ))}
</View>
```

### Testing Requirements

#### Manual Testing Checklist
- [ ] VoiceOver (iOS) navigation works smoothly
- [ ] TalkBack (Android) provides clear feedback
- [ ] All interactive elements are focusable
- [ ] Focus order follows logical reading sequence
- [ ] Dynamic content announces changes
- [ ] Alternative text describes visual content

#### Automated Testing
```javascript
// Example accessibility test
test('mood selector has proper accessibility labels', () => {
  const { getByLabelText } = render(<MoodSelector />);
  
  expect(getByLabelText('Select very sad mood')).toBeTruthy();
  expect(getByLabelText('Select sad mood')).toBeTruthy();
  expect(getByLabelText('Select neutral mood')).toBeTruthy();
});
```

#### Device Testing
- Test with actual screen readers enabled
- Verify with high contrast mode
- Test with large text sizes (200% scale)
- Validate with reduced motion settings

## Compliance Standards

### WCAG 2.1 AA Requirements
- **Perceivable**: Content must be presentable in ways users can perceive
- **Operable**: Interface components must be operable by all users
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must be robust enough for various assistive technologies

### Platform-Specific Guidelines
- **iOS**: Follow Apple's Human Interface Guidelines for Accessibility
- **Android**: Adhere to Material Design Accessibility principles
- **Cross-platform**: Ensure consistent experience across both platforms
