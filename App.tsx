import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F2E8",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A5568",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.title}>PocketTherapy</Text>
        <Text style={styles.subtitle}>
          Your mental wellness companion is ready!
        </Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}