/**
 * Root Navigator for PocketTherapy
 * 
 * Main navigation container that handles authentication-aware routing.
 * Routes between Auth, Onboarding, and Main app flows based on user state.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@context/AuthContext';
import { LoadingSpinner } from '@components';
import { theme } from '@constants/theme';
import type { RootStackParamList } from '@types';

// Import navigators and screens
import MainTabNavigator from './MainTabNavigator';
import { AuthScreen } from '@screens';
import OnboardingScreen from '@screens/OnboardingScreen';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { authState, user, isLoading } = useAuth();

  // Show loading spinner while determining auth state
  if (isLoading || authState === 'loading') {
    return (
      <LoadingSpinner
        size="large"
        message="Loading PocketTherapy..."
        overlay
      />
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: theme.colors.primary.sage,
          background: theme.colors.primary.cream,
          card: theme.colors.neutral.white,
          text: theme.colors.neutral.charcoal,
          border: theme.colors.primary.creamDark,
          notification: theme.colors.semantic.info.primary,
        },
        fonts: {
          regular: {
            fontFamily: theme.typography.fontFamily.regular,
            fontWeight: '400',
          },
          medium: {
            fontFamily: theme.typography.fontFamily.medium,
            fontWeight: '500',
          },
          bold: {
            fontFamily: theme.typography.fontFamily.bold,
            fontWeight: '700',
          },
          heavy: {
            fontFamily: theme.typography.fontFamily.bold,
            fontWeight: '700',
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.primary.cream },
          gestureEnabled: false, // Disable swipe back for therapeutic UX
        }}
      >
        {authState === 'unauthenticated' ? (
          // Authentication flow
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        ) : (
          // Authenticated or guest user flows
          <>
            {/* Check if user needs onboarding */}
            {!(user as any)?.onboarding_completed ? (
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{
                  gestureEnabled: false, // Prevent going back during onboarding
                }}
              />
            ) : (
              <Stack.Screen
                name="Main"
                component={MainTabNavigator}
                options={{
                  animationTypeForReplace: 'push',
                }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
