import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Test component to verify all core dependencies are working
 * This will be removed once we implement the actual features
 */
export default function DependencyTest() {
  
  // Test Haptics (vibration feedback)
  const testHaptics = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('Success', 'Haptics working! You should feel a vibration.');
    } catch (error) {
      Alert.alert('Error', 'Haptics not available on this device');
    }
  };

  // Test AsyncStorage (local data storage)
  const testAsyncStorage = async () => {
    try {
      const testKey = 'pockettherapy_test';
      const testValue = 'Dependencies working!';
      
      // Store data
      await AsyncStorage.setItem(testKey, testValue);
      
      // Retrieve data
      const retrievedValue = await AsyncStorage.getItem(testKey);
      
      if (retrievedValue === testValue) {
        Alert.alert('Success', 'AsyncStorage working! Data saved and retrieved.');
      } else {
        Alert.alert('Error', 'AsyncStorage test failed');
      }
      
      // Clean up
      await AsyncStorage.removeItem(testKey);
    } catch (error) {
      Alert.alert('Error', 'AsyncStorage failed: ' + error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PocketTherapy Dependencies Test</Text>
      <Text style={styles.subtitle}>Testing core packages installation</Text>
      
      <TouchableOpacity style={styles.button} onPress={testHaptics}>
        <Text style={styles.buttonText}>Test Haptics (Vibration)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testAsyncStorage}>
        <Text style={styles.buttonText}>Test AsyncStorage (Local Data)</Text>
      </TouchableOpacity>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Installed Dependencies:</Text>
        <Text style={styles.statusItem}>✅ React Navigation</Text>
        <Text style={styles.statusItem}>✅ Expo Notifications</Text>
        <Text style={styles.statusItem}>✅ Expo Haptics</Text>
        <Text style={styles.statusItem}>✅ Expo AV (Audio/Video)</Text>
        <Text style={styles.statusItem}>✅ AsyncStorage</Text>
        <Text style={styles.statusItem}>✅ React Query</Text>
        <Text style={styles.statusItem}>✅ Linear Gradient</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2E8', // Warm cream from PocketTherapy design
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C4142', // Charcoal soft from design system
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7B7C', // Sage grey from design system
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#A8C09A', // Soft sage from design system
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#EFEBE2', // Slightly darker cream for cards
    borderRadius: 12,
    width: '100%',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C4142',
    marginBottom: 12,
  },
  statusItem: {
    fontSize: 14,
    color: '#6B7B7C',
    marginVertical: 2,
  },
});
