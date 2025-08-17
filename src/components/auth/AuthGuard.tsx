/**
 * Authentication Guard for PocketTherapy
 * 
 * Handles authentication state routing and provides loading states.
 * Determines whether to show auth screen, onboarding, or main app.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../store';
import AuthScreen from '../../screens/auth/AuthScreen';
import DesignSystemDemo from '../../screens/DesignSystemDemo'; // Temporary - will be replaced with main app
import { therapeuticColors } from '../../constants/theme';

interface AuthGuardProps {
  children?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { auth, user } = useAuth();

  // Show loading spinner while initializing auth
  if (auth === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner
          size="large"
          message="Loading PocketTherapy..."
          overlay
        />
      </View>
    );
  }

  // Show authentication screen for unauthenticated users
  if (auth === 'unauthenticated') {
    return <AuthScreen />;
  }

  // For authenticated or guest users, check if they need onboarding
  if (auth === 'authenticated' || auth === 'guest') {
    // Check if user needs onboarding
    const needsOnboarding = !(user as any)?.onboarding_completed;
    
    if (needsOnboarding) {
      // TODO: Return onboarding flow when implemented
      // For now, show the design system demo
      return <DesignSystemDemo />;
    }

    // User is authenticated/guest and has completed onboarding
    // Show main app or provided children
    return children ? <>{children}</> : <DesignSystemDemo />;
  }

  // Fallback - should not reach here
  return (
    <View style={styles.errorContainer}>
      <LoadingSpinner
        size="medium"
        message="Something went wrong..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthGuard;
