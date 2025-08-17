# Resources Screen

## Overview
A comprehensive collection of mental health resources, crisis support information, and educational content to support users beyond the app's core features.

## Layout Specifications

### Screen Configuration
- **Layout**: Scrollable with categorized sections
- **Navigation**: Accessible from settings or crisis flows
- **Search**: Searchable resource database

## Header Section (80px)

```typescript
const headerStyle = {
  height: 80,
  backgroundColor: therapeuticColors.background,
  paddingHorizontal: spacing['4x'],
  paddingVertical: spacing['3x']
};
```

### Header Content
- **Title**: "Support Resources" (`typography.h2`)
- **Subtitle**: "You're not alone in this journey" (`typography.body`, opacity 0.8)

## Crisis Support Section (Priority)

### Emergency Contacts
```typescript
const emergencySection = {
  backgroundColor: therapeuticColors.crisis + '10',
  borderRadius: 16,
  padding: spacing['5x'],
  margin: spacing['4x'],
  borderLeftWidth: 4,
  borderLeftColor: therapeuticColors.crisis
};
```

#### Crisis Hotlines
```typescript
const crisisContacts = [
  {
    name: "Emergency Services",
    number: "112",
    description: "Immediate emergency response",
    priority: "highest",
    available: "24/7"
  },
  {
    name: "Vandrevala Foundation",
    number: "1860 2662 345",
    description: "Mental health crisis support",
    priority: "high",
    available: "24/7"
  },
  {
    name: "Aasra Helpline",
    number: "91-9820466726",
    description: "Suicide prevention helpline",
    priority: "high",
    available: "24/7"
  }
];
```

### International Support
- **Crisis Text Line**: "Text HOME to 741741"
- **Suicide & Crisis Lifeline**: "988" (US)
- **Samaritans**: "116 123" (UK)

## Professional Help Section

### Finding Therapists
```typescript
const professionalHelp = [
  {
    title: "Find a Therapist",
    description: "Directory of mental health professionals",
    action: "open_therapist_directory",
    icon: "user-check"
  },
  {
    title: "Online Therapy Platforms",
    description: "Digital therapy options",
    resources: ["BetterHelp", "Talkspace", "7 Cups"],
    icon: "video"
  },
  {
    title: "Support Groups",
    description: "Connect with others who understand",
    action: "find_support_groups",
    icon: "users"
  }
];
```

## Educational Resources Section

### Mental Health Information
```typescript
const educationalResources = [
  {
    category: "Understanding Anxiety",
    articles: [
      "What is Anxiety?",
      "Types of Anxiety Disorders",
      "Anxiety vs. Stress",
      "When to Seek Help"
    ]
  },
  {
    category: "Coping Strategies",
    articles: [
      "Breathing Techniques",
      "Grounding Exercises",
      "Mindfulness Basics",
      "Sleep Hygiene"
    ]
  },
  {
    category: "Building Resilience",
    articles: [
      "Developing Healthy Habits",
      "Social Support Networks",
      "Stress Management",
      "Self-Care Practices"
    ]
  }
];
```

## Campus & Student Resources

### Student-Specific Support
```typescript
const studentResources = [
  {
    title: "Campus Counseling Centers",
    description: "Free mental health services for students",
    action: "find_campus_resources"
  },
  {
    title: "Academic Accommodations",
    description: "Support for anxiety-related academic challenges",
    action: "accommodation_info"
  },
  {
    title: "Peer Support Programs",
    description: "Student-led mental health initiatives",
    action: "peer_support_info"
  }
];
```

## Self-Help Tools Section

### Additional Apps and Tools
```typescript
const selfHelpTools = [
  {
    name: "Headspace",
    description: "Meditation and mindfulness",
    category: "meditation",
    rating: 4.8
  },
  {
    name: "Calm",
    description: "Sleep stories and relaxation",
    category: "sleep",
    rating: 4.7
  },
  {
    name: "Youper",
    description: "AI-powered mood tracking",
    category: "mood_tracking",
    rating: 4.5
  }
];
```

## Books and Reading Section

### Recommended Reading
```typescript
const recommendedBooks = [
  {
    title: "The Anxiety and Worry Workbook",
    author: "David A. Clark",
    category: "self_help",
    description: "Practical CBT techniques for anxiety"
  },
  {
    title: "Mindfulness for Beginners",
    author: "Jon Kabat-Zinn",
    category: "mindfulness",
    description: "Introduction to mindfulness practice"
  },
  {
    title: "The Gifts of Imperfection",
    author: "Brené Brown",
    category: "self_compassion",
    description: "Embracing vulnerability and authenticity"
  }
];
```

## Local Resources Section

### Community Support
```typescript
const localResources = {
  location_based: true,
  categories: [
    {
      name: "Community Centers",
      description: "Local mental health programs"
    },
    {
      name: "Religious Organizations",
      description: "Faith-based support groups"
    },
    {
      name: "Volunteer Opportunities",
      description: "Giving back for mental wellness"
    }
  ]
};
```

## Resource Cards Component

### Card Layout
```typescript
const resourceCard = {
  backgroundColor: therapeuticColors.surface,
  borderRadius: 12,
  padding: spacing['4x'],
  marginHorizontal: spacing['4x'],
  marginBottom: spacing['3x'],
  flexDirection: 'row',
  alignItems: 'center'
};
```

### Card Content
- **Icon**: Category-specific icon (32px)
- **Title**: Resource name (`typography.h4`)
- **Description**: Brief explanation (`typography.body`)
- **Action**: "Learn more" or direct contact button

## Search Functionality

### Search Implementation
```typescript
const searchConfig = {
  placeholder: "Search resources...",
  categories: ["crisis", "therapy", "education", "tools"],
  filters: ["availability", "cost", "location"],
  debounce: 300
};
```

### Search Results
- **Relevance ranking**: Crisis resources prioritized
- **Category filtering**: Filter by resource type
- **Location-based**: Show nearby resources first

## Accessibility

### Screen Reader Support
- **Priority announcements**: "Crisis resources available immediately"
- **Contact methods**: "Tap to call" or "Tap to text"
- **Resource descriptions**: Full context for each resource

### Crisis Accessibility
- **Large touch targets**: Minimum 72px for emergency contacts
- **High contrast**: Enhanced visibility for crisis information
- **Voice control**: "Call emergency services" voice command

## Privacy and Safety

### Safe Browsing
- **External links**: Warning before leaving app
- **Incognito mode**: Option for private browsing
- **History clearing**: Automatic clearing of sensitive searches

### Data Protection
- **No tracking**: Resource access not logged
- **Local storage**: Bookmarks stored locally only
- **Anonymity**: No personal information required

This resources screen provides comprehensive support information while prioritizing immediate crisis intervention and maintaining user privacy and safety.
