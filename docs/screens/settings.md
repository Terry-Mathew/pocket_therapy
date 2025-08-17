# Settings & Privacy Screen

## Overview
A comprehensive settings interface allowing users to personalize their PocketTherapy experience, manage privacy preferences, and access support resources.

## Layout Specifications

### Screen Configuration
- **Layout**: Grouped list with sections
- **Navigation**: Bottom tabs active on "Settings"
- **Scroll**: Vertical scroll with section headers

## Header Section (80px)

```typescript
const headerStyle = {
  height: 80,
  backgroundColor: therapeuticColors.background,
  paddingHorizontal: spacing['4x'], // 16px
  paddingVertical: spacing['3x']    // 12px
};
```

### Header Content
- **Title**: "Settings" (`typography.h2`, `therapeuticColors.textPrimary`)
- **Subtitle**: "Personalize your experience" (`typography.body`, opacity 0.8)

## Profile Section (120px)

```typescript
const profileSection = {
  height: 120,
  backgroundColor: therapeuticColors.surface,
  borderRadius: 16,
  padding: spacing['5x'], // 20px
  margin: spacing['4x'],  // 16px
  flexDirection: 'row',
  alignItems: 'center'
};
```

### Profile Content
#### Left: Avatar (60px circle)
```typescript
const avatar = {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: therapeuticColors.primary,
  alignItems: 'center',
  justifyContent: 'center'
};
```

- **Content**: Initial or default icon
- **Interaction**: Tap to change (optional)

#### Right: User Info
- **Name**: "Anonymous" or user-set name (`typography.h3`)
- **Status**: "Guest mode" or "Signed in" (`typography.body`, opacity 0.8)
- **Edit button**: "Edit profile" (`typography.caption`, `therapeuticColors.primary`)

## Notification Preferences Section

### Section Header
```typescript
const sectionHeader = {
  paddingHorizontal: spacing['4x'],
  paddingVertical: spacing['3x']
};
```

- **Title**: "Notifications" (`typography.h3`)

### Notification Options
```typescript
const notificationCard = {
  backgroundColor: therapeuticColors.surface,
  borderRadius: 12,
  marginHorizontal: spacing['4x'],
  marginBottom: spacing['2x']
};

const notificationItem = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: spacing['4x']
};
```

#### Available Options
```typescript
const notificationSettings = [
  {
    title: "Daily check-in reminders",
    description: "Gentle nudges to log your mood",
    type: "toggle",
    default: true
  },
  {
    title: "Exercise suggestions",
    description: "Personalized recommendations",
    type: "toggle",
    default: true
  },
  {
    title: "Streak celebrations",
    description: "Celebrate your consistency",
    type: "toggle",
    default: false
  },
  {
    title: "Reminder time",
    description: "Best time for daily reminders",
    type: "time_picker",
    default: "19:00"
  }
];
```

## Privacy & Data Section

### Section Layout
```typescript
const privacySection = {
  marginTop: spacing['6x'] // 24px
};
```

### Privacy Options
```typescript
const privacySettings = [
  {
    title: "Data Export",
    description: "Download your mood and exercise data",
    action: "export_data",
    icon: "download"
  },
  {
    title: "Clear All Data",
    description: "Permanently delete your local data",
    action: "clear_data",
    icon: "trash",
    destructive: true
  },
  {
    title: "Privacy Policy",
    description: "How we protect your information",
    action: "open_privacy_policy",
    icon: "shield"
  },
  {
    title: "Data Sharing",
    description: "Control what data is shared",
    action: "data_sharing_settings",
    icon: "share"
  }
];
```

## Accessibility Settings Section

### Accessibility Options
```typescript
const accessibilitySettings = [
  {
    title: "High Contrast Mode",
    description: "Increase color contrast for better visibility",
    type: "toggle",
    default: false
  },
  {
    title: "Reduce Motion",
    description: "Minimize animations and transitions",
    type: "toggle",
    default: false
  },
  {
    title: "Large Text",
    description: "Use system text size settings",
    type: "toggle",
    default: true
  },
  {
    title: "Voice Guidance",
    description: "Audio instructions for exercises",
    type: "toggle",
    default: false
  }
];
```

## App Preferences Section

### App Settings
```typescript
const appSettings = [
  {
    title: "Default Exercise Duration",
    description: "Preferred length for breathing exercises",
    type: "picker",
    options: ["1 minute", "2 minutes", "3 minutes", "5 minutes"],
    default: "2 minutes"
  },
  {
    title: "Haptic Feedback",
    description: "Vibration for interactions",
    type: "toggle",
    default: true
  },
  {
    title: "Background Sounds",
    description: "Default audio for exercises",
    type: "picker",
    options: ["None", "Rain", "Forest", "Ocean", "White Noise"],
    default: "None"
  },
  {
    title: "Auto-lock Prevention",
    description: "Keep screen on during exercises",
    type: "toggle",
    default: true
  }
];
```

## Support & Information Section

### Support Options
```typescript
const supportOptions = [
  {
    title: "Help & FAQ",
    description: "Common questions and answers",
    action: "open_help",
    icon: "help-circle"
  },
  {
    title: "Contact Support",
    description: "Get help with technical issues",
    action: "contact_support",
    icon: "mail"
  },
  {
    title: "Crisis Resources",
    description: "Emergency mental health support",
    action: "crisis_resources",
    icon: "heart",
    priority: "high"
  },
  {
    title: "Rate PocketTherapy",
    description: "Share your experience",
    action: "rate_app",
    icon: "star"
  }
];
```

## About Section

### App Information
```typescript
const aboutSection = {
  backgroundColor: therapeuticColors.surface,
  borderRadius: 12,
  margin: spacing['4x'],
  padding: spacing['4x']
};
```

#### Content
- **App version**: "PocketTherapy v1.0.0"
- **Build**: "Build 2024.1.15"
- **Privacy**: "Your data stays on your device"
- **Open source**: Link to repository (if applicable)

## Settings Item Component

### Standard Item Layout
```typescript
const settingsItem = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: spacing['4x'],
  paddingHorizontal: spacing['4x'],
  borderBottomWidth: 1,
  borderBottomColor: therapeuticColors.textMuted + '20'
};
```

### Item Types

#### Toggle Item
```typescript
const toggleItem = {
  ...settingsItem,
  justifyContent: 'space-between'
};
```

- **Left**: Title and description
- **Right**: Toggle switch

#### Navigation Item
```typescript
const navigationItem = {
  ...settingsItem,
  justifyContent: 'space-between'
};
```

- **Left**: Title and description with icon
- **Right**: Chevron arrow (>)

#### Picker Item
- **Left**: Title and current value
- **Right**: Chevron arrow
- **Action**: Opens picker modal

## Destructive Actions

### Confirmation Modals
```typescript
const destructiveModal = {
  backgroundColor: therapeuticColors.background,
  borderRadius: 20,
  padding: spacing['6x'],
  margin: spacing['4x']
};
```

#### Clear Data Confirmation
- **Title**: "Clear All Data?"
- **Message**: "This will permanently delete all your mood logs, exercise history, and settings. This cannot be undone."
- **Actions**: 
  - "Cancel" (secondary button)
  - "Clear Data" (destructive button, red background)

## Data Export Flow

### Export Options
```typescript
const exportOptions = [
  {
    format: "CSV",
    description: "Spreadsheet format for analysis",
    includes: ["mood_logs", "exercise_history", "insights"]
  },
  {
    format: "JSON",
    description: "Complete data backup",
    includes: ["all_data", "settings", "preferences"]
  }
];
```

### Export Process
1. **Selection**: Choose data format and date range
2. **Generation**: Create export file
3. **Sharing**: System share sheet for saving/sending

## Accessibility

### Screen Reader Support
- **Section announcements**: "Notification preferences section"
- **Setting descriptions**: Full descriptions for all toggles and options
- **State announcements**: "High contrast mode enabled"

### Keyboard Navigation
- **Tab order**: Logical progression through settings
- **Focus indicators**: Clear visual focus states
- **Activation**: Enter key activates toggles and navigation

### Visual Accessibility
- **High contrast**: Alternative color schemes when enabled
- **Large text**: Respects system text size settings
- **Focus indicators**: Enhanced visibility for keyboard users

This settings screen design provides comprehensive control over the PocketTherapy experience while maintaining simplicity and accessibility for all users.
