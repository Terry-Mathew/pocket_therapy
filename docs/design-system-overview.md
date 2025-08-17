# PocketTherapy Design System Overview

## Table of Contents
- [Introduction](#introduction)
- [Design Philosophy](#design-philosophy)
- [System Components](#system-components)
- [Implementation Guidelines](#implementation-guidelines)
- [Development Integration](#development-integration)

## Introduction

The PocketTherapy design system is built specifically for mental health applications targeting Gen Z users experiencing anxiety. Every design decision prioritizes **therapeutic value, emotional safety, and accessibility** over traditional corporate aesthetics.

## Design Philosophy

### Core Values
1. **Therapeutic First**: Every element supports mental well-being
2. **Accessibility by Default**: WCAG 2.1 AA compliance minimum
3. **Anxiety-Friendly**: Large touch targets, clear navigation, crisis-safe design
4. **Gen Z Authentic**: Warm, approachable, non-clinical aesthetic
5. **Inclusive Design**: Works for all users regardless of ability or device

### Visual Principles
- **Calm over Exciting**: Muted, therapeutic colors instead of bright corporate palettes
- **Breathing Room**: Generous spacing around emotional content
- **Predictable Patterns**: Consistent interactions reduce cognitive load
- **Gentle Feedback**: Soft haptics and animations support rather than distract

## System Components

### 🎨 [Color System](./color-system.md)
- **Therapeutic Palette**: Soft Sage, Warm Cream, Dusty Rose, Lavender Mist
- **Mood-Specific Colors**: 5-point scale with psychological color theory
- **Accessibility**: High contrast mode, colorblind-safe patterns
- **Implementation**: React Native constants with dark mode support

### ✏️ [Typography System](./typography-system.md)
- **Font Family**: Inter (Google Fonts) for clarity and warmth
- **Scale**: 7-point scale from Caption (12px) to Display (32px)
- **Accessibility**: Dynamic type support, high contrast variants
- **Implementation**: React Native typography constants with responsive scaling

### 📐 [Spacing System](./spacing-system.md)
- **Base Scale**: 4pt system (4px, 8px, 16px, 24px, 32px, 48px)
- **Specialized Spacing**: Breathing room (40px), panic spacing (56px)
- **Touch Targets**: Minimum 44px, comfortable 56px, crisis 72px
- **Implementation**: React Native spacing constants with responsive adjustments

### 🌀 [UX Patterns](./ux-patterns.md)
- **Core Principles**: Zero-friction entry, predictable navigation, crisis-first logic
- **Interaction Patterns**: Gentle haptics, calm animations, supportive microcopy
- **Navigation**: Tab-based with floating SOS button
- **Implementation**: Reusable interaction patterns and animation configs

### ♿ [Accessibility Guidelines](./accessibility-guidelines.md)
- **Visual Accessibility**: Dynamic type, high contrast, reduced motion
- **Screen Reader Support**: Comprehensive labels, announcements, alternatives
- **Implementation**: React Native accessibility props and testing requirements
- **Compliance**: WCAG 2.1 AA standards with mental health considerations

## Implementation Guidelines

### File Structure
```
src/
├── constants/
│   ├── therapeuticColors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
├── components/
│   ├── base/
│   │   ├── TherapeuticButton/
│   │   ├── MoodEmoji/
│   │   └── TherapeuticCard/
│   └── index.ts
└── styles/
    ├── globalStyles.ts
    └── themes.ts
```

### Design Token Usage
```typescript
// Always use design tokens, never hardcoded values
import { therapeuticColors, typography, spacing } from '@constants';

// ✅ Correct
const styles = StyleSheet.create({
  container: {
    backgroundColor: therapeuticColors.background,
    padding: spacing['4x'],
    borderRadius: spacing['2x']
  },
  title: {
    ...typography.h1,
    color: therapeuticColors.textPrimary
  }
});

// ❌ Wrong
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F2E8',
    padding: 16,
    borderRadius: 8
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3C4142'
  }
});
```

### Component Development
```typescript
// All components must follow accessibility guidelines
interface TherapeuticButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'crisis';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const TherapeuticButton: React.FC<TherapeuticButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  accessibilityLabel,
  accessibilityHint
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant]]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
};
```

## Development Integration

### With Existing Rules
This design system complements the development rules in `.augment/rules/`:
- **File Organization**: Components grouped by feature with design system tokens
- **Component Naming**: PascalCase components with descriptive prop names
- **State Management**: Design tokens as global constants, component state local
- **Performance**: Optimized with React.memo and design token caching

### Testing Requirements
```typescript
// Design system compliance tests
describe('Design System Compliance', () => {
  test('uses therapeutic colors only', () => {
    const { getByTestId } = render(<MoodSelector />);
    const container = getByTestId('mood-container');
    
    expect(container.props.style.backgroundColor).toBe(therapeuticColors.background);
  });
  
  test('meets accessibility requirements', () => {
    const { getByRole } = render(<TherapeuticButton title="Start Exercise" />);
    const button = getByRole('button');
    
    expect(button).toHaveAccessibilityLabel('Start Exercise');
    expect(button.props.style.minHeight).toBeGreaterThanOrEqual(44);
  });
});
```

### Quality Checklist
Before any component is considered complete:

#### Design Compliance
- [ ] Uses only therapeutic color palette
- [ ] Follows typography scale and weights
- [ ] Implements proper spacing system
- [ ] Includes appropriate touch target sizes

#### Accessibility
- [ ] Has proper accessibility labels
- [ ] Supports screen readers
- [ ] Works with high contrast mode
- [ ] Supports dynamic type scaling

#### Mental Health Considerations
- [ ] Provides calm, non-alarming feedback
- [ ] Includes appropriate breathing room
- [ ] Supports crisis-safe interactions
- [ ] Uses supportive microcopy

#### Technical Implementation
- [ ] Uses design tokens (no hardcoded values)
- [ ] Follows component naming conventions
- [ ] Includes TypeScript interfaces
- [ ] Has comprehensive test coverage

## Maintenance and Evolution

### Version Control
- Design tokens are versioned with semantic versioning
- Breaking changes require major version bump
- New tokens can be added in minor versions
- Bug fixes and accessibility improvements are patches

### Documentation Updates
- All changes must update relevant documentation
- Examples must be kept current with implementation
- Accessibility guidelines updated with new patterns
- Performance implications documented

This design system ensures consistent, therapeutic, and accessible user experiences across the entire PocketTherapy application while supporting the mental health and well-being of our users.
