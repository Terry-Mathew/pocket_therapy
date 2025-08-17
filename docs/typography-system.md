# PocketTherapy Typography System ✏️

Typography is **human, approachable, and clear** — designed for short bursts of interaction without overwhelming users.

---

## 📚 Font Family

- **Primary:** Inter (Google Fonts)  
  _Reason:_ Clean sans-serif, excellent readability across devices.
- **Fallback:** system-ui, Helvetica Neue, Arial, sans-serif.

---

## 🏷 Font Sizes & Styles

| Token        | Size (px) | Weight | Usage |
|--------------|-----------|--------|-------|
| Display      | 32        | 700    | Hero headings, onboarding titles |
| H1           | 24        | 600    | Section titles |
| H2           | 20        | 600    | Sub-section headings |
| H3           | 18        | 500    | Minor headings |
| Body Large   | 16        | 400    | Primary text |
| Body Small   | 14        | 400    | Secondary details |
| Caption      | 12        | 400    | Labels, timestamps |

---

## ✨ Rules

- Minimum font size: **14px** for body.
- Line height: **1.5** for text-heavy sections.
- Avoid ALL CAPS for main content — use for small labels only.
- Maintain **max 60 characters per line** for readability.

---

## 🎯 Accessibility

- Body copy contrast ratio ≥ **7:1** for maximum clarity.
- Large text (≥24px bold or ≥19px regular) can use 3:1 contrast ratio.
- Support dynamic type scaling up to 200% for accessibility
- Ensure readable text at minimum 85% scale

---

## 💡 Examples

- **Onboarding Headline:** Display 32 / Bold / Sky Blue text.
- **Exercise Title:** H1 24 / Semi-bold / Charcoal Gray.
- **Mood Prompt:** H2 20 / Semi-bold / Coral Pink for warmth.

---

## Implementation

### React Native Typography Constants

```typescript
export const typography = {
  display: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    fontFamily: 'Inter_700Bold'
  },
  h1: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    fontFamily: 'Inter_600SemiBold'
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    fontFamily: 'Inter_600SemiBold'
  },
  h3: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    fontFamily: 'Inter_500Medium'
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular'
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular'
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily: 'Inter_400Regular'
  }
};
```

### Usage Guidelines

#### Do's ✅
- Use Inter font family consistently throughout the app
- Maintain proper line height for readability (1.5x font size)
- Apply appropriate font weights for hierarchy
- Ensure sufficient contrast ratios for accessibility
- Support dynamic type scaling for accessibility

#### Don'ts ❌
- Don't use multiple font families
- Avoid text smaller than 14px for body content
- Don't use ALL CAPS for large blocks of text
- Avoid poor contrast ratios
- Don't ignore accessibility requirements

### Responsive Typography

```typescript
// Dynamic font scaling based on screen size
export const getResponsiveFontSize = (baseSize: number, screenWidth: number) => {
  const scale = screenWidth / 375; // Base iPhone width
  return Math.max(baseSize * scale, baseSize * 0.85); // Minimum 85% scale
};
```

### Accessibility Features

#### Dynamic Type Support
```typescript
// Support for iOS and Android system text scaling
export const getDynamicTypeSize = (baseSize: number, contentSizeCategory: string) => {
  const scaleFactors = {
    'extraSmall': 0.85,
    'small': 0.9,
    'medium': 1.0,
    'large': 1.15,
    'extraLarge': 1.3,
    'extraExtraLarge': 1.5,
    'extraExtraExtraLarge': 2.0
  };
  
  return baseSize * (scaleFactors[contentSizeCategory] || 1.0);
};
```

#### High Contrast Mode
```typescript
export const highContrastTypography = {
  ...typography,
  // Enhanced contrast versions
  display: {
    ...typography.display,
    color: '#000000', // Pure black for maximum contrast
    fontWeight: '700'
  },
  body: {
    ...typography.body,
    color: '#000000',
    fontWeight: '500' // Slightly bolder for better readability
  }
};
```

This typography system ensures clear, accessible, and therapeutic communication that supports users' mental health journey while maintaining excellent readability across all devices and accessibility needs.
