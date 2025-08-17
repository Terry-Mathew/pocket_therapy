# PocketTherapy: Mental Health-Focused Color System

For a mental health app targeting Gen Z anxiety relief, we need colors that are **therapeutic, warm, and emotionally supportive** – not business-like at all.

---

# Redesigned Color System (Mental Health Focused)

## Core Therapeutic Palette

| Color Name     | Hex Code   | Psychology & Usage                           | Visual                |
|----------------|------------|----------------------------------------------|-----------------------|
| **Soft Sage**  | `#A8C09A`  | Main brand – natural calm, growth, hope      | 🟢 Muted green        |
| **Warm Cream** | `#F5F2E8`  | Primary background – safe, cozy, breathable | 🟡 Off-white warmth   |
| **Dusty Rose** | `#E8B4B8`  | Secondary accent – gentle, nurturing, self-care | 🌸 Soft pink      |
| **Lavender Mist** | `#C8B8DB` | Tertiary – calming, sleep, meditation       | 💜 Light purple       |
| **Golden Hour** | `#F4D06F` | Success/achievements – optimism, energy     | ☀️ Warm yellow        |

## Mood-Specific Colors (Redesigned)

| Mood         | Emoji | Color Name     | Hex       | Why This Color                               |
|--------------|-------|---------------|-----------|----------------------------------------------|
| Very Anxious | 😢    | Deep Ocean    | `#4A6969` | Grounding, depth, not overwhelming           |
| Stressed     | 😕    | Cloudy Sky   | `#7A8B99` | Overcast but not dark, relatable             |
| Neutral      | 😐    | Gentle Grey  | `#B5BFC7` | Balanced, accepting, no pressure             |
| Good         | 🙂    | Soft Meadow  | `#9BB896` | Growth, nature, gentle positivity            |
| Great        | 😊    | Sunrise Peach | `#F4B678` | Warm energy, joy, celebration                |

## Semantic Colors (Non-Corporate)

| Purpose             | Color Name       | Hex       | Usage                              | Why Not Traditional                              |
|---------------------|------------------|-----------|------------------------------------|--------------------------------------------------|
| **Crisis/Emergency** | Deep Berry      | `#A8556C` | SOS button, urgent help            | Warmer than harsh red, less alarming             |
| **Success**         | Forest Whisper  | `#6B8B73` | Completed exercises, streaks       | Earthy green vs corporate teal                   |
| **Gentle Warning**  | Sunset Orange   | `#E5A663` | Reminders, gentle nudges           | Soft vs aggressive yellow/orange                 |
| **Text Primary**    | Charcoal Soft   | `#3C4142` | Main text, readable but warm       | Not stark black                                  |
| **Text Secondary**  | Sage Grey       | `#6B7B7C` | Subtitles, less important info     | Muted vs cold grey                               |

---

## Gen Z Visual Identity

### Instagram/TikTok Inspired Gradients

```typescript
// Gradient definitions for calming backgrounds
export const gradients = {
  // Main app background gradient
  primaryBg: ['#F5F2E8', '#E8F0F2'], // Cream to soft mint
  
  // Mood check-in screen
  moodFlow: ['#C8B8DB', '#A8C09A'], // Lavender to sage
  
  // Exercise completion celebration
  successFlow: ['#F4D06F', '#E8B4B8'], // Golden to dusty rose
  
  // SOS/Crisis screen (calming, not alarming)
  crisisFlow: ['#7A8B99', '#A8556C'], // Cloudy to deep berry
  
  // Night mode breathing exercises
  breathingFlow: ['#4A6969', '#6B8B73'] // Deep ocean to forest
};
```

## Implementation

### React Native Color Constants

```typescript
export const therapeuticColors = {
  // Core palette
  primary: '#A8C09A',      // Soft Sage
  background: '#F5F2E8',   // Warm Cream
  secondary: '#E8B4B8',    // Dusty Rose
  tertiary: '#C8B8DB',     // Lavender Mist
  accent: '#F4D06F',       // Golden Hour
  
  // Mood colors
  moodColors: {
    1: '#4A6969', // Very Anxious - Deep Ocean
    2: '#7A8B99', // Stressed - Cloudy Sky
    3: '#B5BFC7', // Neutral - Gentle Grey
    4: '#9BB896', // Good - Soft Meadow
    5: '#F4B678'  // Great - Sunrise Peach
  },
  
  // Semantic colors
  crisis: '#A8556C',       // Deep Berry
  success: '#6B8B73',      // Forest Whisper
  warning: '#E5A663',      // Sunset Orange
  textPrimary: '#3C4142',  // Charcoal Soft
  textSecondary: '#6B7B7C' // Sage Grey
};
```

### Usage Guidelines

#### Do's ✅
- Use Soft Sage for primary actions and branding
- Apply Warm Cream as the main background color
- Use mood-specific colors consistently across the app
- Implement gradients for visual interest and depth
- Ensure sufficient contrast for accessibility

#### Don'ts ❌
- Don't use harsh, corporate colors (bright blues, stark whites)
- Avoid high-contrast combinations that feel clinical
- Don't mix warm and cool tones inappropriately
- Avoid using red for anything except true emergencies

### Accessibility Considerations

#### Color Contrast Ratios
- All text must meet WCAG AA standards (4.5:1 for normal text)
- Interactive elements require 3:1 contrast minimum
- Crisis/emergency elements use enhanced contrast

#### Color Blindness Support
- Mood indicators include pattern differentiation
- Important information never relies solely on color
- Alternative visual cues provided for all color-coded content

### Dark Mode Adaptation

```typescript
export const darkModeColors = {
  primary: '#8FA885',      // Darker Sage
  background: '#2C2A26',   // Dark Cream
  secondary: '#C49499',    // Muted Rose
  tertiary: '#A098B3',     // Darker Lavender
  accent: '#D4B85F',       // Muted Golden
  
  textPrimary: '#E8E5E0',  // Light text
  textSecondary: '#B8B5B0' // Muted light text
};
```

This color system creates a therapeutic, non-clinical environment that supports mental health and emotional well-being while maintaining visual appeal for Gen Z users.
