/**
 * Main Tab Navigator for PocketTherapy
 * 
 * Bottom tab navigation with therapeutic design and persistent SOS button.
 * Includes Home, Exercises, Insights, and Profile tabs with custom styling.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { therapeuticColors, spacing, typography } from '../constants/theme';

// Import placeholder screens (will be replaced with actual screens)
const HomeScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Home</Text>
    <Text style={styles.screenSubtitle}>Welcome to PocketTherapy</Text>
  </View>
);

const ExercisesScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Exercises</Text>
    <Text style={styles.screenSubtitle}>Therapeutic exercises</Text>
  </View>
);

const InsightsScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Insights</Text>
    <Text style={styles.screenSubtitle}>Your progress</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Settings</Text>
    <Text style={styles.screenSubtitle}>App preferences</Text>
  </View>
);

const Tab = createBottomTabNavigator();

interface SOSButtonProps {
  onPress: () => void;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onPress }) => {
  const handlePress = () => {
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.sosButton}
      onPress={handlePress}
      activeOpacity={0.8}
      testID="sos-button"
      accessibilityRole="button"
      accessibilityLabel="SOS Crisis Support"
      accessibilityHint="Tap for immediate crisis support and breathing exercises"
    >
      <Text style={styles.sosButtonText}>SOS</Text>
    </TouchableOpacity>
  );
};

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const getTabBarIcon = (routeName: string) => {
  return ({ focused, color }: TabBarIconProps) => {
    let iconText = '';

    switch (routeName) {
      case 'Home':
        iconText = '🏠';
        break;
      case 'Exercises':
        iconText = '🧘‍♀️';
        break;
      case 'Insights':
        iconText = '📊';
        break;
      case 'Settings':
        iconText = '⚙️';
        break;
      default:
        iconText = '•';
    }

    return (
      <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        <Text style={[styles.tabIconText, { color }]}>{iconText}</Text>
      </View>
    );
  };
};

const MainTabNavigator: React.FC = () => {
  const handleSOSPress = () => {
    // TODO: Navigate to SOS flow
    console.log('SOS button pressed - navigate to crisis support');
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: getTabBarIcon(route.name),
          tabBarActiveTintColor: therapeuticColors.primary,
          tabBarInactiveTintColor: therapeuticColors.textSecondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          headerShown: false,
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarAccessibilityLabel: 'Home tab',
          }}
        />
        <Tab.Screen
          name="Exercises"
          component={ExercisesScreen}
          options={{
            tabBarLabel: 'Exercises',
            tabBarAccessibilityLabel: 'Exercises tab',
          }}
        />
        <Tab.Screen
          name="Insights"
          component={InsightsScreen}
          options={{
            tabBarLabel: 'Insights',
            tabBarAccessibilityLabel: 'Insights tab',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarAccessibilityLabel: 'Settings tab',
          }}
        />
      </Tab.Navigator>

      {/* Persistent SOS Button */}
      <SOSButton onPress={handleSOSPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },

  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: therapeuticColors.background,
    paddingHorizontal: spacing['6x'],
  },

  screenTitle: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['4x'],
  },

  screenSubtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
  },

  tabBar: {
    backgroundColor: therapeuticColors.surface,
    borderTopWidth: 1,
    borderTopColor: therapeuticColors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: spacing['2x'],
    height: 60,
  },

  tabBarLabel: {
    ...typography.caption,
    marginTop: spacing['1x'],
  },

  tabBarItem: {
    paddingTop: spacing['2x'],
  },

  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  tabIconFocused: {
    backgroundColor: therapeuticColors.primary + '20',
  },

  tabIconText: {
    fontSize: 20,
  },

  sosButton: {
    position: 'absolute',
    bottom: 80, // Above tab bar
    right: spacing['5x'],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: therapeuticColors.crisis,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: therapeuticColors.crisis,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },

  sosButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MainTabNavigator;
