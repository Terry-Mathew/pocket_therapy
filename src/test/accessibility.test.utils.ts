/**
 * Accessibility Testing Utilities
 * 
 * Utilities for testing WCAG 2.1 AA compliance in PocketTherapy
 * including color contrast, touch targets, and screen reader support
 */

import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

// WCAG 2.1 AA Standards
export const WCAG_STANDARDS = {
  // Color contrast ratios
  CONTRAST_RATIOS: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    NON_TEXT: 3.0,
  },
  
  // Touch target sizes (in dp/pt)
  TOUCH_TARGETS: {
    MINIMUM_SIZE: 44,
    RECOMMENDED_SIZE: 48,
    SPACING: 8,
  },
  
  // Text sizing
  TEXT_SIZE: {
    MINIMUM_BODY: 16,
    MINIMUM_CAPTION: 12,
    MAXIMUM_LINE_HEIGHT: 1.5,
  },
  
  // Animation and motion
  ANIMATION: {
    MAX_DURATION: 5000, // 5 seconds
    RESPECT_REDUCED_MOTION: true,
  },
};

/**
 * Calculate color contrast ratio between two colors
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return 0;

  const fgLuminance = getLuminance(fg);
  const bgLuminance = getLuminance(bg);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Test if color combination meets WCAG contrast requirements
 */
export function testColorContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): {
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA' | 'fail';
} {
  const ratio = calculateContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? WCAG_STANDARDS.CONTRAST_RATIOS.LARGE_TEXT : WCAG_STANDARDS.CONTRAST_RATIOS.NORMAL_TEXT;
  const aaaRatio = isLargeText ? 4.5 : 7.0;

  return {
    ratio,
    passes: ratio >= requiredRatio,
    level: ratio >= aaaRatio ? 'AAA' : ratio >= requiredRatio ? 'AA' : 'fail',
  };
}

/**
 * Test touch target size compliance
 */
export function testTouchTargetSize(
  width: number,
  height: number,
  spacing?: number
): {
  passes: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check minimum size
  if (width < WCAG_STANDARDS.TOUCH_TARGETS.MINIMUM_SIZE) {
    issues.push(`Width ${width}dp is below minimum ${WCAG_STANDARDS.TOUCH_TARGETS.MINIMUM_SIZE}dp`);
  }

  if (height < WCAG_STANDARDS.TOUCH_TARGETS.MINIMUM_SIZE) {
    issues.push(`Height ${height}dp is below minimum ${WCAG_STANDARDS.TOUCH_TARGETS.MINIMUM_SIZE}dp`);
  }

  // Check recommended size
  if (width < WCAG_STANDARDS.TOUCH_TARGETS.RECOMMENDED_SIZE) {
    recommendations.push(`Consider increasing width to ${WCAG_STANDARDS.TOUCH_TARGETS.RECOMMENDED_SIZE}dp for better usability`);
  }

  if (height < WCAG_STANDARDS.TOUCH_TARGETS.RECOMMENDED_SIZE) {
    recommendations.push(`Consider increasing height to ${WCAG_STANDARDS.TOUCH_TARGETS.RECOMMENDED_SIZE}dp for better usability`);
  }

  // Check spacing
  if (spacing !== undefined && spacing < WCAG_STANDARDS.TOUCH_TARGETS.SPACING) {
    issues.push(`Spacing ${spacing}dp is below minimum ${WCAG_STANDARDS.TOUCH_TARGETS.SPACING}dp`);
  }

  return {
    passes: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Test text size compliance
 */
export function testTextSize(
  fontSize: number,
  isCaption: boolean = false
): {
  passes: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const minimumSize = isCaption ? WCAG_STANDARDS.TEXT_SIZE.MINIMUM_CAPTION : WCAG_STANDARDS.TEXT_SIZE.MINIMUM_BODY;

  if (fontSize < minimumSize) {
    issues.push(`Font size ${fontSize}px is below minimum ${minimumSize}px for ${isCaption ? 'caption' : 'body'} text`);
  }

  return {
    passes: issues.length === 0,
    issues,
  };
}

/**
 * Test accessibility properties of a component
 */
export function testAccessibilityProps(props: any): {
  passes: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for accessibility label
  if (props.accessibilityRole === 'button' && !props.accessibilityLabel) {
    issues.push('Interactive elements must have accessibilityLabel');
  }

  // Check for accessibility role
  if ((props.onPress || props.onTouchEnd) && !props.accessibilityRole) {
    issues.push('Interactive elements should have accessibilityRole');
  }

  // Check for accessibility hint
  if (props.accessibilityRole === 'button' && !props.accessibilityHint && props.accessibilityLabel) {
    recommendations.push('Consider adding accessibilityHint for complex actions');
  }

  // Check for accessibility state
  if (props.disabled && !props.accessibilityState?.disabled) {
    recommendations.push('Disabled elements should have accessibilityState.disabled = true');
  }

  return {
    passes: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Test therapeutic color palette for accessibility
 */
export function testTherapeuticColors(): {
  results: Array<{
    combination: string;
    foreground: string;
    background: string;
    contrast: ReturnType<typeof testColorContrast>;
  }>;
  overallPasses: boolean;
} {
  const colorCombinations = [
    // Primary text combinations
    { name: 'Primary text on background', fg: therapeuticColors.textPrimary, bg: therapeuticColors.background },
    { name: 'Secondary text on background', fg: therapeuticColors.textSecondary, bg: therapeuticColors.background },
    { name: 'Primary text on surface', fg: therapeuticColors.textPrimary, bg: therapeuticColors.surface },
    
    // Button combinations
    { name: 'Primary button text', fg: therapeuticColors.background, bg: therapeuticColors.primary },
    { name: 'Secondary button text', fg: therapeuticColors.background, bg: therapeuticColors.secondary },
    
    // Status combinations
    { name: 'Success text', fg: therapeuticColors.success, bg: therapeuticColors.background },
    { name: 'Warning text', fg: therapeuticColors.warning, bg: therapeuticColors.background },
    { name: 'Error text', fg: therapeuticColors.error, bg: therapeuticColors.background },
  ];

  const results = colorCombinations.map(combo => ({
    combination: combo.name,
    foreground: combo.fg,
    background: combo.bg,
    contrast: testColorContrast(combo.fg, combo.bg),
  }));

  const overallPasses = results.every(result => result.contrast.passes);

  return { results, overallPasses };
}

/**
 * Test spacing system for touch targets
 */
export function testSpacingSystem(): {
  results: Array<{
    size: string;
    value: number;
    suitable: string[];
  }>;
  recommendations: string[];
} {
  const spacingSizes = Object.entries(spacing);
  const recommendations: string[] = [];

  const results = spacingSizes.map(([size, value]) => {
    const suitable: string[] = [];

    if (value >= WCAG_STANDARDS.TOUCH_TARGETS.MINIMUM_SIZE) {
      suitable.push('touch target size');
    }

    if (value >= WCAG_STANDARDS.TOUCH_TARGETS.SPACING) {
      suitable.push('touch target spacing');
    }

    if (value >= 16) {
      suitable.push('text padding');
    }

    return { size, value, suitable };
  });

  // Check if we have appropriate sizes for touch targets
  const hasTouchTargetSize = results.some(r => r.suitable.includes('touch target size'));
  if (!hasTouchTargetSize) {
    recommendations.push('Consider adding spacing values suitable for touch targets (44dp+)');
  }

  return { results, recommendations };
}

/**
 * Test typography system for accessibility
 */
export function testTypographySystem(): {
  results: Array<{
    style: string;
    fontSize: number;
    lineHeight: number;
    accessibility: {
      sizeCompliant: boolean;
      lineHeightCompliant: boolean;
    };
  }>;
  overallPasses: boolean;
} {
  const typographyStyles = Object.entries(typography);

  const results = typographyStyles.map(([style, styleObj]) => {
    const fontSize = styleObj.fontSize || 16;
    const lineHeight = styleObj.lineHeight || fontSize * 1.2;
    const lineHeightRatio = lineHeight / fontSize;

    return {
      style,
      fontSize,
      lineHeight,
      accessibility: {
        sizeCompliant: fontSize >= (style.includes('caption') ? 12 : 16),
        lineHeightCompliant: lineHeightRatio >= 1.2 && lineHeightRatio <= 1.5,
      },
    };
  });

  const overallPasses = results.every(result => 
    result.accessibility.sizeCompliant && result.accessibility.lineHeightCompliant
  );

  return { results, overallPasses };
}

/**
 * Generate accessibility report for the app
 */
export function generateAccessibilityReport(): {
  colors: ReturnType<typeof testTherapeuticColors>;
  spacing: ReturnType<typeof testSpacingSystem>;
  typography: ReturnType<typeof testTypographySystem>;
  summary: {
    overallCompliance: boolean;
    issues: string[];
    recommendations: string[];
  };
} {
  const colors = testTherapeuticColors();
  const spacingTest = testSpacingSystem();
  const typographyTest = testTypographySystem();

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Collect issues
  if (!colors.overallPasses) {
    issues.push('Some color combinations do not meet WCAG contrast requirements');
  }

  if (!typographyTest.overallPasses) {
    issues.push('Some typography styles do not meet accessibility requirements');
  }

  // Collect recommendations
  recommendations.push(...spacingTest.recommendations);

  const overallCompliance = colors.overallPasses && typographyTest.overallPasses && issues.length === 0;

  return {
    colors,
    spacing: spacingTest,
    typography: typographyTest,
    summary: {
      overallCompliance,
      issues,
      recommendations,
    },
  };
}

// Custom Jest matchers for accessibility testing
export const accessibilityMatchers = {
  toMeetContrastRequirements(received: { foreground: string; background: string }, isLargeText = false) {
    const result = testColorContrast(received.foreground, received.background, isLargeText);
    
    return {
      message: () => 
        `expected color combination to meet WCAG contrast requirements\n` +
        `Foreground: ${received.foreground}\n` +
        `Background: ${received.background}\n` +
        `Contrast ratio: ${result.ratio.toFixed(2)}\n` +
        `Required: ${isLargeText ? WCAG_STANDARDS.CONTRAST_RATIOS.LARGE_TEXT : WCAG_STANDARDS.CONTRAST_RATIOS.NORMAL_TEXT}\n` +
        `Level: ${result.level}`,
      pass: result.passes,
    };
  },

  toMeetTouchTargetRequirements(received: { width: number; height: number }) {
    const result = testTouchTargetSize(received.width, received.height);
    
    return {
      message: () => 
        `expected touch target to meet size requirements\n` +
        `Size: ${received.width}x${received.height}dp\n` +
        `Issues: ${result.issues.join(', ')}\n` +
        `Recommendations: ${result.recommendations.join(', ')}`,
      pass: result.passes,
    };
  },

  toHaveAccessibilityProps(received: any) {
    const result = testAccessibilityProps(received);
    
    return {
      message: () => 
        `expected element to have proper accessibility properties\n` +
        `Issues: ${result.issues.join(', ')}\n` +
        `Recommendations: ${result.recommendations.join(', ')}`,
      pass: result.passes,
    };
  },
};

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toMeetContrastRequirements(isLargeText?: boolean): R;
      toMeetTouchTargetRequirements(): R;
      toHaveAccessibilityProps(): R;
    }
  }
}
