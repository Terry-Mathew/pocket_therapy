/**
 * Root Navigator for PocketTherapy
 * 
 * Main navigation container that handles authentication-aware routing.
 * Routes between Auth, Onboarding, and Main app flows based on user state.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../store';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { therapeuticColors } from '../constants/theme';

// Import navigators and screens
import MainTabNavigator from './MainTabNavigator';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import MoodBaselineScreen from '../screens/onboarding/MoodBaselineScreen';
import TriggerSelectionScreen from '../screens/onboarding/TriggerSelectionScreen';
import PreferencesSetupScreen from '../screens/onboarding/PreferencesSetupScreen';
import FirstMicroSessionScreen from '../screens/onboarding/FirstMicroSessionScreen';

const Stack = createStackNavigator();

const RootNavigator: React.FC = () => {
  const { auth, user } = useAuth();

  // Show loading spinner while determining auth state
  if (auth === 'loading') {
    return (
      <LoadingSpinner
        size="large"
        message="Loading PocketTherapy..."
      />
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: therapeuticColors.primary,
          background: therapeuticColors.background,
          card: therapeuticColors.surface,
          text: therapeuticColors.textPrimary,
          border: therapeuticColors.border,
          notification: therapeuticColors.accent,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: therapeuticColors.background },
          gestureEnabled: false, // Disable swipe back for therapeutic UX
        }}
      >
        {auth === 'unauthenticated' ? (
          // Onboarding flow for new users
          <>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="MoodBaseline"
              component={MoodBaselineScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="TriggerSelection"
              component={TriggerSelectionScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="PreferencesSetup"
              component={PreferencesSetupScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="FirstMicroSession"
              component={FirstMicroSessionScreen}
              options={{ gestureEnabled: false }}
            />
          </>
        ) : (
          // Main app for authenticated/guest users
          <Stack.Screen
            name="MainApp"
            component={MainTabNavigator}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
