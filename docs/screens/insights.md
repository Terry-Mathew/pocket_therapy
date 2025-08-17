# Insights & Analytics Screen

## Overview
A comprehensive view of user's mental health patterns, progress tracking, and personalized insights. Designed to help users understand their emotional patterns and celebrate progress.

## Layout Specifications

### Screen Configuration
- **Layout**: Scrollable with refresh capability
- **Navigation**: Bottom tabs active on "Insights"
- **Data period**: Configurable (7 days, 30 days, 3 months)

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
- **Title**: "Your Insights" (`typography.h2`, `therapeuticColors.textPrimary`)
- **Subtitle**: "Understanding your patterns" (`typography.body`, opacity 0.8)
- **Period selector**: "Last 30 days ▼" (`typography.caption`, right aligned)

## Summary Cards Section (180px)

```typescript
const summarySection = {
  height: 180,
  paddingVertical: spacing['4x']
};

const summaryCard = {
  width: 160,
  height: 120,
  borderRadius: 16,
  padding: spacing['4x'],
  marginRight: spacing['4x']
};
```

### Overall Mood Card
```typescript
const moodCard = {
  ...summaryCard,
  backgroundColor: therapeuticColors.primary + '10', // Tinted
  borderWidth: 1,
  borderColor: therapeuticColors.primary + '30'
};
```

#### Content
- **Icon**: Trending arrow (↗️ improving, → stable, ↘️ declining)
- **Trend**: "Improving ↗️" (`typography.h3`, `therapeuticColors.success`)
- **Average**: "3.4/5 this week" (`typography.body`)
- **Change**: "+0.6 from last week" (`typography.caption`, `therapeuticColors.success`)

### Check-in Streak Card
```typescript
const streakCard = {
  ...summaryCard,
  backgroundColor: therapeuticColors.accent + '10'
};
```

#### Content
- **Icon**: 🔥 (fire emoji)
- **Streak**: "12 days" (`typography.h3`, `therapeuticColors.accent`)
- **Description**: "Current streak" (`typography.body`)
- **Encouragement**: "Keep it up!" (`typography.caption`)

### Exercise Completion Card
```typescript
const exerciseCard = {
  ...summaryCard,
  backgroundColor: therapeuticColors.success + '10'
};
```

#### Content
- **Icon**: ✅ (checkmark)
- **Count**: "18 exercises" (`typography.h3`, `therapeuticColors.success`)
- **Description**: "This month" (`typography.body`)
- **Time**: "2.5 hours total" (`typography.caption`)

## Mood Trends Chart (300px)

```typescript
const chartSection = {
  height: 300,
  backgroundColor: therapeuticColors.surface,
  borderRadius: 16,
  margin: spacing['4x'],
  padding: spacing['5x'] // 20px
};
```

### Chart Header
- **Title**: "Mood Over Time" (`typography.h3`)
- **Period**: "Last 30 days" (`typography.caption`)
- **Toggle**: Line chart / Bar chart options

### Chart Implementation
```typescript
const chartConfig = {
  type: 'line',
  data: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: [2.8, 3.1, 3.4, 3.6],
      color: therapeuticColors.primary,
      strokeWidth: 3
    }]
  },
  options: {
    backgroundColor: 'transparent',
    decimalPlaces: 1,
    color: therapeuticColors.textSecondary
  }
};
```

### Chart Features
- **Interactive**: Tap points for detailed data
- **Smooth curves**: Gentle line interpolation
- **Mood colors**: Background gradient based on mood levels
- **Annotations**: Mark significant events or exercises

## Patterns & Insights Section

### Section Header
```typescript
const patternsHeader = {
  paddingHorizontal: spacing['4x'],
  paddingVertical: spacing['3x']
};
```

- **Title**: "Patterns & Insights" (`typography.h3`)
- **Subtitle**: "What we've learned about your wellbeing" (`typography.body`, opacity 0.8)

### Insight Cards
```typescript
const insightCard = {
  backgroundColor: therapeuticColors.surface,
  borderRadius: 12,
  padding: spacing['4x'],
  marginHorizontal: spacing['4x'],
  marginBottom: spacing['3x']
};
```

#### Example Insights
```typescript
const insights = [
  {
    type: 'pattern',
    icon: '📅',
    title: 'Tuesday Dip',
    description: 'Your mood tends to be lower on Tuesdays. Consider scheduling a breathing exercise.',
    confidence: 'high'
  },
  {
    type: 'success',
    icon: '🌟',
    title: 'Evening Exercises Work',
    description: 'You complete 80% more exercises in the evening. Your optimal time is 7-9 PM.',
    confidence: 'high'
  },
  {
    type: 'recommendation',
    icon: '💡',
    title: 'Try Grounding',
    description: 'Based on your anxiety patterns, grounding exercises might help during study sessions.',
    confidence: 'medium'
  }
];
```

### Insight Card Layout
- **Icon**: Relevant emoji or symbol (32px)
- **Title**: Insight headline (`typography.h4`)
- **Description**: Detailed explanation (`typography.body`)
- **Confidence**: Visual indicator of data reliability

## Weekly Summary Section

### Layout
```typescript
const weeklySection = {
  backgroundColor: therapeuticColors.background,
  padding: spacing['4x'],
  marginTop: spacing['6x']
};
```

### Content
- **Title**: "This Week's Highlights" (`typography.h3`)
- **Mood summary**: Average mood with comparison
- **Exercise count**: Completed exercises
- **Streak status**: Current streak information
- **Achievement**: Any milestones reached

### Achievement Badges
```typescript
const achievementBadge = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: therapeuticColors.accent + '20',
  borderRadius: 20,
  paddingHorizontal: spacing['3x'],
  paddingVertical: spacing['2x'],
  marginRight: spacing['2x']
};
```

#### Badge Types
- **Consistency**: "7-day streak" 🔥
- **Explorer**: "Tried 5 different exercises" 🌟
- **Mindful**: "10 check-ins this week" 💭
- **Resilient**: "Improved mood 3 days in a row" 📈

## Data Export Section

### Layout
```typescript
const exportSection = {
  backgroundColor: therapeuticColors.surface,
  borderRadius: 12,
  padding: spacing['4x'],
  margin: spacing['4x']
};
```

### Content
- **Title**: "Export Your Data" (`typography.h4`)
- **Description**: "Download your mood and exercise data" (`typography.body`)
- **Button**: "Export as CSV" (secondary button)
- **Privacy note**: "Your data stays private and secure" (`typography.caption`)

## Empty States

### No Data State
```typescript
const noDataState = {
  alignItems: 'center',
  paddingVertical: spacing['12x'] // 48px
};
```

- **Illustration**: Chart with question mark (80px)
- **Title**: "Not enough data yet" (`typography.h3`, center)
- **Body**: "Check in for a few days to see your patterns" (`typography.body`, center)
- **CTA**: "Log your mood now" (primary button)

### Insufficient Data
- **Message**: "We need a few more check-ins to show meaningful insights"
- **Progress**: "3 of 7 check-ins this week"
- **Encouragement**: "You're building a great habit!"

## Accessibility

### Screen Reader Support
- **Chart descriptions**: "Mood trend showing improvement from 2.8 to 3.6 over 4 weeks"
- **Data announcements**: "Your mood improved by 0.6 points this week"
- **Insight reading**: Full insight descriptions with context

### Visual Accessibility
- **High contrast charts**: Alternative color schemes for data visualization
- **Pattern indicators**: Non-color-based pattern recognition
- **Large text**: Support for dynamic type scaling

### Data Privacy

### Privacy Controls
- **Data visibility**: Toggle for sharing insights with healthcare providers
- **Retention settings**: Control how long data is stored
- **Export options**: Full data portability
- **Deletion**: Complete data removal option

This insights screen design helps users understand their mental health patterns while maintaining privacy and providing actionable recommendations for continued wellbeing.
