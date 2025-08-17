/**
 * System Testing Screen
 * 
 * Development screen for testing all enhanced system capabilities
 * including AI error handling, performance optimization, and notification testing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { therapeuticColors, spacing, typography } from '../constants/theme';
import { useSystemTesting } from '../hooks/useSystemTesting';
import { useAppStore } from '../store';

export default function SystemTestingScreen() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  
  const {
    isRunning,
    progress,
    currentTest,
    results,
    error,
    runComprehensiveTest,
    runQuickHealthCheck,
    clearResults,
  } = useSystemTesting();

  const {
    runSystemDiagnostics,
    optimizeForDevice,
    checkSystemHealth,
    testNotificationSystem,
    enableLowMemoryMode,
    getErrorStatistics,
  } = useAppStore((state) => state.actions);

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setActiveTest(testName);
    setTestResults(null);
    
    try {
      const result = await testFunction();
      setTestResults(result);
      Alert.alert('Test Completed', `${testName} completed successfully`);
    } catch (error) {
      Alert.alert('Test Failed', `${testName} failed: ${error.message}`);
    } finally {
      setActiveTest(null);
    }
  };

  const TestButton = ({ 
    title, 
    onPress, 
    isRunning = false, 
    description 
  }: {
    title: string;
    onPress: () => void;
    isRunning?: boolean;
    description: string;
  }) => (
    <TouchableOpacity
      style={[styles.testButton, isRunning && styles.testButtonRunning]}
      onPress={onPress}
      disabled={isRunning}
    >
      <View style={styles.testButtonContent}>
        <Text style={styles.testButtonTitle}>{title}</Text>
        <Text style={styles.testButtonDescription}>{description}</Text>
        {isRunning && (
          <ActivityIndicator 
            size="small" 
            color={therapeuticColors.primary} 
            style={styles.testButtonLoader}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const ResultCard = ({ title, data }: { title: string; data: any }) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultTitle}>{title}</Text>
      <Text style={styles.resultData}>{JSON.stringify(data, null, 2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>System Testing & Diagnostics</Text>
          <Text style={styles.subtitle}>
            Test enhanced error handling, performance optimization, and notification system
          </Text>
        </View>

        {/* Comprehensive Testing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comprehensive Testing</Text>
          
          <TestButton
            title="Full System Test"
            description="Run complete system diagnostics with AI, notifications, and performance analysis"
            isRunning={isRunning}
            onPress={() => runTest('Full System Test', runComprehensiveTest)}
          />

          <TestButton
            title="Quick Health Check"
            description="Fast system health assessment"
            isRunning={activeTest === 'Quick Health Check'}
            onPress={() => runTest('Quick Health Check', runQuickHealthCheck)}
          />

          {isRunning && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{currentTest}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
          )}
        </View>

        {/* Individual Component Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component Tests</Text>
          
          <TestButton
            title="AI Service Test"
            description="Test AI error handling and fallback mechanisms"
            isRunning={activeTest === 'AI Service Test'}
            onPress={() => runTest('AI Service Test', runSystemDiagnostics)}
          />

          <TestButton
            title="Notification System Test"
            description="Test notification permissions, scheduling, and delivery"
            isRunning={activeTest === 'Notification System Test'}
            onPress={() => runTest('Notification System Test', testNotificationSystem)}
          />

          <TestButton
            title="Performance Analysis"
            description="Analyze device performance and apply optimizations"
            isRunning={activeTest === 'Performance Analysis'}
            onPress={() => runTest('Performance Analysis', checkSystemHealth)}
          />
        </View>

        {/* System Optimizations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Optimizations</Text>
          
          <TestButton
            title="Optimize for Device"
            description="Apply device-specific performance optimizations"
            isRunning={activeTest === 'Optimize for Device'}
            onPress={() => runTest('Optimize for Device', optimizeForDevice)}
          />

          <TestButton
            title="Enable Low Memory Mode"
            description="Enable aggressive memory management for low-end devices"
            onPress={() => {
              enableLowMemoryMode();
              Alert.alert('Success', 'Low memory mode enabled');
            }}
          />

          <TestButton
            title="Get Error Statistics"
            description="View error statistics from all services"
            isRunning={activeTest === 'Get Error Statistics'}
            onPress={() => runTest('Get Error Statistics', getErrorStatistics)}
          />
        </View>

        {/* Test Results */}
        {(results || testResults || error) && (
          <View style={styles.section}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>Test Results</Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  clearResults();
                  setTestResults(null);
                }}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={[styles.resultCard, styles.errorCard]}>
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {results && (
              <>
                <ResultCard title="Overall Assessment" data={results.overall} />
                <ResultCard title="AI Service" data={results.ai} />
                <ResultCard title="Notifications" data={results.notifications} />
                <ResultCard title="Performance" data={results.performance} />
              </>
            )}

            {testResults && (
              <ResultCard title="Test Results" data={testResults} />
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This screen is for development and testing purposes only.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing['4x'],
  },
  header: {
    paddingVertical: spacing['6x'],
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2x'],
  },
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing['6x'],
  },
  sectionTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['4x'],
  },
  testButton: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['4x'],
    marginBottom: spacing['3x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  testButtonRunning: {
    backgroundColor: therapeuticColors.primaryLight,
    borderColor: therapeuticColors.primary,
  },
  testButtonContent: {
    flexDirection: 'column',
  },
  testButtonTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['1x'],
  },
  testButtonDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
  testButtonLoader: {
    alignSelf: 'flex-start',
    marginTop: spacing['2x'],
  },
  progressContainer: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 8,
    padding: spacing['3x'],
    marginTop: spacing['2x'],
  },
  progressText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
  },
  progressBar: {
    height: 6,
    backgroundColor: therapeuticColors.border,
    borderRadius: 3,
    marginBottom: spacing['1x'],
  },
  progressFill: {
    height: '100%',
    backgroundColor: therapeuticColors.primary,
    borderRadius: 3,
  },
  progressPercentage: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'right',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['4x'],
  },
  clearButton: {
    backgroundColor: therapeuticColors.accent,
    paddingHorizontal: spacing['3x'],
    paddingVertical: spacing['1x'],
    borderRadius: 6,
  },
  clearButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 8,
    padding: spacing['3x'],
    marginBottom: spacing['3x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
  },
  resultTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
  },
  resultData: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  errorTitle: {
    ...typography.h4,
    color: '#E53E3E',
    marginBottom: spacing['2x'],
  },
  errorText: {
    ...typography.body,
    color: '#E53E3E',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: spacing['6x'],
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
