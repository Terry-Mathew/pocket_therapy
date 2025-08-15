/**
 * Components Barrel Export
 *
 * This file exports all components for easy importing throughout the app.
 * Usage: import { Button, Card, MoodPicker } from '@components';
 */

// UI Components (Basic building blocks)
export { default as Button, PrimaryButton, SecondaryButton, OutlineButton, GhostButton, CrisisButton } from './ui/Button';
export { default as Card, ExerciseCard, MoodCard, InsightCard } from './ui/Card';
export { default as Input, MoodNoteInput, SearchInput, EmailInput, OTPInput } from './ui/Input';
export { default as Modal, ConfirmModal } from './ui/Modal';
export { default as LoadingSpinner, FullScreenLoader, InlineLoader, ExerciseLoader, MoodSyncLoader, AuthLoader } from './ui/LoadingSpinner';
// export { default as EmptyState } from './ui/EmptyState';

// Authentication Components
export { default as AuthGuard } from './auth/AuthGuard';
// export { default as LoginForm } from './auth/LoginForm';
// export { default as SignupForm } from './auth/SignupForm';

// Form Components
// export { default as FormInput } from './forms/FormInput';
// export { default as FormButton } from './forms/FormButton';
// export { default as FormError } from './forms/FormError';

// Mood Components
// export { default as MoodPicker } from './mood/MoodPicker';
// export { default as MoodCard } from './mood/MoodCard';
// export { default as MoodHistory } from './mood/MoodHistory';
// export { default as TriggerTags } from './mood/TriggerTags';

// Exercise Components
// export { default as ExerciseCard } from './exercises/ExerciseCard';
// export { default as ExercisePlayer } from './exercises/ExercisePlayer';
// export { default as ExerciseList } from './exercises/ExerciseList';
// export { default as ProgressDots } from './exercises/ProgressDots';

// SOS Components
// export { default as SOSButton } from './sos/SOSButton';
// export { default as BreathingExercise } from './sos/BreathingExercise';
// export { default as CrisisResources } from './sos/CrisisResources';

// Note: Components are commented out until they are created
// Uncomment each export as you implement the corresponding component
