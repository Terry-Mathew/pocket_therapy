# PocketTherapy Project Structure

This document explains the folder structure and organization of the PocketTherapy React Native app.

## 📁 Root Directory Structure

```
PocketTherapy/
├── src/                    # Main source code directory
├── assets/                 # Static assets (images, fonts, sounds)
├── docs/                   # Project documentation
├── .expo/                  # Expo configuration and cache
├── node_modules/           # Dependencies
├── App.tsx                 # Main app component
├── app.json               # Expo app configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
└── .gitignore             # Git ignore rules
```

## 📂 Source Code Structure (`src/`)

### 🧩 Components (`src/components/`)

Reusable UI components organized by feature area:

```
components/
├── ui/                    # Basic UI building blocks
│   ├── Button.tsx         # Primary button component
│   ├── Card.tsx           # Card container component
│   ├── Input.tsx          # Text input component
│   ├── Modal.tsx          # Modal dialog component
│   └── LoadingSpinner.tsx # Loading indicator
├── forms/                 # Form-specific components
│   ├── FormInput.tsx      # Form input with validation
│   ├── FormButton.tsx     # Form submission button
│   └── FormError.tsx      # Error message display
├── mood/                  # Mood tracking components
│   ├── MoodPicker.tsx     # 5-emoji mood selector
│   ├── MoodCard.tsx       # Mood display card
│   ├── MoodHistory.tsx    # Mood history chart
│   └── TriggerTags.tsx    # Trigger tag selector
├── exercises/             # Exercise-related components
│   ├── ExerciseCard.tsx   # Exercise preview card
│   ├── ExercisePlayer.tsx # Exercise playback interface
│   ├── ExerciseList.tsx   # List of exercises
│   └── ProgressDots.tsx   # Progress indicator
├── sos/                   # Crisis/SOS components
│   ├── SOSButton.tsx      # Emergency SOS button
│   ├── BreathingExercise.tsx # Crisis breathing exercise
│   └── CrisisResources.tsx # Crisis helpline resources
└── index.ts               # Barrel export for all components
```

### 📱 Screens (`src/screens/`)

Full-screen views organized by app section:

```
screens/
├── auth/                  # Authentication screens
│   ├── LoginScreen.tsx    # Email/OTP login
│   ├── SignupScreen.tsx   # Account creation
│   └── OTPScreen.tsx      # OTP verification
├── onboarding/            # First-time user setup
│   ├── WelcomeScreen.tsx  # Welcome and intro
│   ├── MoodBaselineScreen.tsx # Initial mood setup
│   ├── TriggerSelectionScreen.tsx # Trigger preferences
│   ├── GoalsScreen.tsx    # Goal setting
│   ├── PreferencesScreen.tsx # App preferences
│   └── FirstSessionScreen.tsx # First exercise
├── home/                  # Main dashboard
│   └── HomeScreen.tsx     # Home dashboard
├── mood/                  # Mood tracking screens
│   ├── MoodCheckScreen.tsx # Daily mood check-in
│   └── MoodHistoryScreen.tsx # Mood history and trends
├── exercises/             # Exercise screens
│   ├── ExerciseLibraryScreen.tsx # Browse exercises
│   ├── ExercisePlayerScreen.tsx # Exercise playback
│   └── ExerciseCompletionScreen.tsx # Post-exercise feedback
├── sos/                   # Crisis support screens
│   ├── SOSScreen.tsx      # Crisis landing page
│   ├── BreathingScreen.tsx # Emergency breathing
│   └── CrisisResourcesScreen.tsx # Help resources
├── insights/              # Analytics and insights
│   ├── InsightsScreen.tsx # Main insights dashboard
│   └── MoodTrendsScreen.tsx # Detailed mood analysis
├── settings/              # App settings
│   ├── SettingsScreen.tsx # Main settings
│   ├── PrivacyScreen.tsx  # Privacy controls
│   ├── NotificationSettingsScreen.tsx # Notification preferences
│   └── CrisisResourcesSettingsScreen.tsx # Crisis resource management
└── index.ts               # Barrel export for all screens
```

### 🔧 Services (`src/services/`)

Business logic and external integrations:

```
services/
├── api/                   # API communication
│   ├── supabaseClient.ts  # Supabase configuration
│   ├── authService.ts     # Authentication API calls
│   ├── moodService.ts     # Mood tracking API
│   ├── exerciseService.ts # Exercise management API
│   └── userService.ts     # User profile API
├── storage/               # Local data storage
│   ├── storageService.ts  # AsyncStorage wrapper
│   ├── moodStorage.ts     # Mood data storage
│   ├── exerciseStorage.ts # Exercise data storage
│   ├── userStorage.ts     # User preferences storage
│   └── syncQueue.ts       # Offline sync queue
├── notifications/         # Push notifications
│   ├── notificationService.ts # Notification management
│   ├── reminderService.ts # Scheduled reminders
│   └── pushNotificationService.ts # Push notification handling
├── ai/                    # AI and machine learning
│   ├── openAIService.ts   # OpenAI API integration
│   ├── recommendationService.ts # Exercise recommendations
│   └── patternAnalysisService.ts # Mood pattern analysis
├── analytics/             # Usage analytics
│   ├── analyticsService.ts # Analytics tracking
│   ├── moodAnalytics.ts   # Mood-specific analytics
│   └── usageAnalytics.ts  # App usage tracking
└── index.ts               # Barrel export for all services
```

### 🏗️ Supporting Directories

#### Types (`src/types/`)

TypeScript type definitions for the entire app:

- User and authentication types
- Mood tracking interfaces
- Exercise system types
- Navigation parameter lists
- API response types
- Component prop types

#### Constants (`src/constants/`)

App-wide constants and configuration:

- Therapeutic color system
- Typography scale
- Spacing system
- Animation durations
- API configuration
- Mood and exercise constants

#### Utils (`src/utils/`)

Helper functions and utilities:

- Date and time formatting
- Mood calculation utilities
- String manipulation
- Array operations
- Validation functions
- Haptic feedback helpers

#### Hooks (`src/hooks/`)

Custom React hooks for reusable logic:

- Authentication hooks
- Data fetching hooks
- Storage hooks
- UI interaction hooks
- Utility hooks

#### Context (`src/context/`)

React Context providers for global state:

- Authentication context
- User preferences context
- Mood tracking context
- Exercise context
- Theme context

#### Navigation (`src/navigation/`)

React Navigation configuration:

- Main app navigator
- Authentication navigator
- Onboarding navigator
- Tab navigator
- Navigation utilities

## 🎯 Import Patterns

### Barrel Exports

Each directory includes an `index.ts` file that exports all modules, enabling clean imports:

```typescript
// Instead of multiple imports:
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

// Use barrel exports:
import { Button, Card, Input } from '@components';
```

### Path Mapping

TypeScript path mapping is configured for clean imports:

```typescript
import { Colors, Spacing } from '@constants';
import { MoodLevel, User } from '@types';
import { formatDate, getMoodEmoji } from '@utils';
import { useMoodTracking } from '@hooks';
import { AuthProvider } from '@context';
import { HomeScreen } from '@screens';
import { Button, MoodPicker } from '@components';
import { authService, moodService } from '@services';
```

## 📋 File Naming Conventions

- **Components**: PascalCase (e.g., `MoodPicker.tsx`)
- **Screens**: PascalCase with "Screen" suffix (e.g., `HomeScreen.tsx`)
- **Services**: camelCase with "Service" suffix (e.g., `authService.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `useMoodTracking.ts`)
- **Types**: PascalCase for interfaces (e.g., `User`, `MoodLevel`)
- **Constants**: PascalCase for objects, UPPER_CASE for primitives
- **Utils**: camelCase for functions (e.g., `formatDate`, `getMoodEmoji`)

## 🔄 Development Workflow

1. **Start with types**: Define interfaces in `src/types/`
2. **Add constants**: Define colors, spacing, etc. in `src/constants/`
3. **Create utilities**: Add helper functions in `src/utils/`
4. **Build services**: Implement business logic in `src/services/`
5. **Create components**: Build reusable UI in `src/components/`
6. **Build screens**: Compose components into full screens in `src/screens/`
7. **Add navigation**: Connect screens with navigation in `src/navigation/`
8. **Add state management**: Use hooks and context for global state

## 🎨 Design System Integration

The folder structure supports the PocketTherapy design system:

- **Colors**: Therapeutic palette in `src/constants/`
- **Typography**: Inter font system in `src/constants/`
- **Spacing**: 4pt scale system in `src/constants/`
- **Components**: Design system components in `src/components/ui/`
- **Patterns**: UX patterns implemented across screens

This structure ensures scalability, maintainability, and team collaboration as PocketTherapy grows from MVP to full production app.
