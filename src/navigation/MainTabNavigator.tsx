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
import { theme } from '@constants/theme';
import { triggerHaptic } from '@utils';
import type { MainTabParamList } from '@types';

// Import placeholder screens (will be replaced with actual screens)
import HomeScreen from '@screens/HomeScreen';
import ExercisesScreen from '@screens/ExercisesScreen';
import InsightsScreen from '@screens/InsightsScreen';
import { ProfileScreen } from '@screens';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface SOSButtonProps {
  onPress: () => void;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onPress }) => {
  const handlePress = async () => {
    await triggerHaptic('medium');
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

const getTabBarIcon = (routeName: keyof MainTabParamList) => {
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
      case 'Profile':
        iconText = '👤';
        break;
    }

    return (
      <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        <Text style={[styles.tabIconText, { color }]}>{iconText}</Text>
      </View>
    );
  };
};

const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  const handleSOSPress = () => {
    // TODO: Navigate to SOS flow
    console.log('SOS button pressed - navigate to crisis support');
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: getTabBarIcon(route.name),
          tabBarActiveTintColor: theme.colors.primary.sage,
          tabBarInactiveTintColor: theme.colors.neutral.grey,
          tabBarStyle: [
            styles.tabBar,
            {
              paddingBottom: insets.bottom,
              height: theme.layout.tabBarHeight + insets.bottom,
            },
          ],
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarTestID: `${route.name.toLowerCase()}-tab`,
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
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarAccessibilityLabel: 'Profile tab',
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
    backgroundColor: theme.colors.primary.cream,
  },
  tabBar: {
    backgroundColor: theme.colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary.creamDark,
    elevation: 8,
    shadowColor: theme.colors.shadow.medium,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    ...theme.typography.styles.caption,
    fontFamily: theme.typography.fontFamily.medium,
    marginTop: 4,
  },
  tabBarItem: {
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tabIconFocused: {
    backgroundColor: theme.colors.primary.creamLight,
  },
  tabIconText: {
    fontSize: 20,
  },
  sosButton: {
    position: 'absolute',
    bottom: 80, // Above tab bar
    right: 20,
    width: theme.layout.sosButtonSize,
    height: theme.layout.sosButtonSize,
    borderRadius: theme.layout.sosButtonSize / 2,
    backgroundColor: theme.colors.crisis.urgent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.large,
    zIndex: 1000,
  },
  sosButtonText: {
    ...theme.typography.styles.sosButton,
    color: theme.colors.neutral.white,
  },
});

export default MainTabNavigator;
