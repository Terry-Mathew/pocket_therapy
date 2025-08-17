/**
 * System Testing Hook
 * 
 * Comprehensive testing hook that integrates all enhanced testing capabilities
 * for AI services, performance optimization, and notification system
 */

import { useState, useCallback } from 'react';
import { openAIService } from '../services/openAIService';
import { notificationService } from '../services/notificationService';
import { applyDeviceOptimizations, MemoryManager } from '../utils/performanceOptimization';

interface SystemTestResults {
  ai: {
    available: boolean;
    errorRate: number;
    recommendations: string[];
  };
  notifications: {
    functional: boolean;
    permissionsGranted: boolean;
    issues: string[];
  };
  performance: {
    deviceCategory: string;
    isVeryLowEnd: boolean;
    memoryPressure: string;
    optimizations: string[];
  };
  overall: {
    score: number; // 0-100
    status: 'excellent' | 'good' | 'fair' | 'poor';
    criticalIssues: string[];
    recommendations: string[];
  };
}

interface TestingState {
  isRunning: boolean;
  progress: number;
  currentTest: string;
  results: SystemTestResults | null;
  error: string | null;
}

export function useSystemTesting() {
  const [state, setState] = useState<TestingState>({
    isRunning: false,
    progress: 0,
    currentTest: '',
    results: null,
    error: null,
  });

  const updateProgress = useCallback((progress: number, currentTest: string) => {
    setState(prev => ({ ...prev, progress, currentTest }));
  }, []);

  const runComprehensiveTest = useCallback(async (): Promise<SystemTestResults> => {
    setState(prev => ({ ...prev, isRunning: true, progress: 0, error: null }));

    try {
      // Test 1: AI Service Testing (25%)
      updateProgress(10, 'Testing AI services...');
      const aiStats = openAIService.getErrorStatistics();
      const aiAvailable = await testAIAvailability();
      
      // Test 2: Notification System Testing (50%)
      updateProgress(35, 'Testing notification system...');
      const notificationTest = await notificationService.runComprehensiveTest();
      
      // Test 3: Performance Analysis (75%)
      updateProgress(60, 'Analyzing device performance...');
      const performanceInfo = applyDeviceOptimizations();
      const memoryManager = MemoryManager.getInstance();
      const memoryStats = memoryManager.getDetailedStats();
      
      // Test 4: Overall Assessment (100%)
      updateProgress(85, 'Generating assessment...');
      
      const results: SystemTestResults = {
        ai: {
          available: aiAvailable,
          errorRate: aiStats.errorRate,
          recommendations: aiStats.recentErrors.length > 0 
            ? ['Consider implementing more robust fallback mechanisms']
            : ['AI service is functioning well'],
        },
        notifications: {
          functional: notificationTest.success,
          permissionsGranted: notificationTest.permissionGranted,
          issues: notificationTest.errors,
        },
        performance: {
          deviceCategory: performanceInfo.isVeryLowEnd ? 'Very Low-End' : 
                        performanceInfo.config.maxCacheSize < 25 ? 'Low-End' : 
                        performanceInfo.config.maxCacheSize < 50 ? 'Mid-Range' : 'High-End',
          isVeryLowEnd: performanceInfo.isVeryLowEnd,
          memoryPressure: memoryStats.memoryPressure,
          optimizations: performanceInfo.recommendations,
        },
        overall: {
          score: 0,
          status: 'poor',
          criticalIssues: [],
          recommendations: [],
        },
      };

      // Calculate overall score
      let score = 0;
      const criticalIssues: string[] = [];
      const recommendations: string[] = [];

      // AI Service Score (30 points)
      if (results.ai.available) {
        score += 25;
        if (results.ai.errorRate < 0.1) score += 5; // Low error rate bonus
      } else {
        criticalIssues.push('AI service unavailable');
        recommendations.push('Check AI service configuration and API keys');
      }

      // Notification Score (30 points)
      if (results.notifications.functional) {
        score += 20;
        if (results.notifications.permissionsGranted) score += 10;
      } else {
        if (!results.notifications.permissionsGranted) {
          recommendations.push('Request notification permissions for better user engagement');
        }
        if (results.notifications.issues.length > 0) {
          criticalIssues.push('Notification system has issues');
          recommendations.push('Fix notification system issues');
        }
      }

      // Performance Score (40 points)
      if (results.performance.memoryPressure === 'low') {
        score += 40;
      } else if (results.performance.memoryPressure === 'medium') {
        score += 30;
        recommendations.push('Monitor memory usage');
      } else if (results.performance.memoryPressure === 'high') {
        score += 20;
        recommendations.push('Implement memory optimization');
      } else {
        score += 10;
        criticalIssues.push('Critical memory pressure detected');
        recommendations.push('Immediate memory optimization required');
      }

      // Very low-end device adjustments
      if (results.performance.isVeryLowEnd) {
        recommendations.push('Device optimizations applied for better performance');
        if (score > 70) score = 70; // Cap score for very low-end devices
      }

      // Determine status
      let status: SystemTestResults['overall']['status'] = 'poor';
      if (score >= 85) status = 'excellent';
      else if (score >= 70) status = 'good';
      else if (score >= 50) status = 'fair';

      results.overall = {
        score,
        status,
        criticalIssues,
        recommendations: [...new Set(recommendations)], // Remove duplicates
      };

      updateProgress(100, 'Test completed');
      
      setState(prev => ({ 
        ...prev, 
        isRunning: false, 
        results,
        progress: 100,
        currentTest: 'Completed'
      }));

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ 
        ...prev, 
        isRunning: false, 
        error: errorMessage,
        progress: 0,
        currentTest: 'Failed'
      }));
      throw error;
    }
  }, [updateProgress]);

  const testAIAvailability = async (): Promise<boolean> => {
    try {
      // Simple test to check if AI service is available
      const testRequest = {
        currentMood: 3,
        recentMoods: [3, 2, 3],
        timeOfDay: 'afternoon' as const,
        availableTime: 5,
      };
      
      const result = await openAIService.generateExerciseRecommendations(testRequest, []);
      return result.success || result.fallbackUsed;
    } catch (error) {
      console.error('AI availability test failed:', error);
      return false;
    }
  };

  const runQuickHealthCheck = useCallback(async () => {
    setState(prev => ({ ...prev, isRunning: true, progress: 0, currentTest: 'Quick health check...' }));
    
    try {
      // Quick checks without full testing
      const memoryManager = MemoryManager.getInstance();
      const memoryCheck = memoryManager.checkMemoryPressure();
      const notificationCheck = await notificationService.performPeriodicCheck();
      
      const quickResults: Partial<SystemTestResults> = {
        performance: {
          deviceCategory: 'Unknown',
          isVeryLowEnd: false,
          memoryPressure: memoryCheck.isEmergency ? 'critical' : 
                         memoryCheck.isWarning ? 'high' : 'low',
          optimizations: [memoryCheck.recommendation],
        },
        notifications: {
          functional: notificationCheck.functionalityOk,
          permissionsGranted: notificationCheck.permissionsOk,
          issues: notificationCheck.issues,
        },
      };

      setState(prev => ({ 
        ...prev, 
        isRunning: false, 
        results: quickResults as SystemTestResults,
        progress: 100,
        currentTest: 'Quick check completed'
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isRunning: false, 
        error: error instanceof Error ? error.message : 'Quick check failed',
        progress: 0,
        currentTest: 'Failed'
      }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setState({
      isRunning: false,
      progress: 0,
      currentTest: '',
      results: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    runComprehensiveTest,
    runQuickHealthCheck,
    clearResults,
  };
}
