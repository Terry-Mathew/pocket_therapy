/**
 * PocketTherapy - Mental Wellness Companion
 *
 * Main application entry point that sets up the complete app infrastructure
 * including navigation, state management, and core services.
 */

import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

// Import navigation and core components
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";

// Import services for initialization
import { initializeApp } from "./src/services";
import { therapeuticColors } from "./src/constants/theme";

// Create QueryClient for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
});

export default function App() {
  useEffect(() => {
    // Initialize app services
    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootNavigator />
            <StatusBar style="auto" />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}