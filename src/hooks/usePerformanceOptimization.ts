/**
 * Performance Optimization Hook
 * 
 * React hook for managing performance optimizations in components
 * including lazy loading, memoization, and device-specific adaptations
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  getPerformanceConfig,
  detectDevicePerformance,
  MemoryManager,
  AnimationOptimizer,
  PerformanceMonitor,
  type PerformanceConfig,
  type DevicePerformance,
} from '../utils/performanceOptimization';

interface PerformanceState {
  devicePerformance: DevicePerformance;
  config: PerformanceConfig;
  isLowEndDevice: boolean;
  memoryPressure: 'low' | 'medium' | 'high';
  isAppActive: boolean;
}

interface PerformanceOptimizations {
  // State
  performanceState: PerformanceState;
  
  // Memory management
  addToCache: (key: string, data: any) => void;
  getFromCache: (key: string) => any;
  clearCache: () => void;
  getCacheStats: () => { size: number; count: number; maxSize: number };
  
  // Animation management
  canStartAnimation: () => boolean;
  startAnimation: () => boolean;
  endAnimation: () => void;
  
  // Performance monitoring
  measureOperation: <T>(name: string, operation: () => T) => T;
  measureAsyncOperation: <T>(name: string, operation: () => Promise<T>) => Promise<{ result: T; duration: number }>;
  
  // Component optimization
  shouldRenderComponent: (componentName: string) => boolean;
  getOptimizedProps: (baseProps: any) => any;
  
  // Resource management
  shouldPreloadResource: (resourceType: string) => boolean;
  shouldEnableFeature: (featureName: string) => boolean;
}

export function usePerformanceOptimization(): PerformanceOptimizations {
  const [performanceState, setPerformanceState] = useState<PerformanceState>(() => {
    const devicePerformance = detectDevicePerformance();
    const config = getPerformanceConfig(devicePerformance);
    
    return {
      devicePerformance,
      config,
      isLowEndDevice: devicePerformance === 'low',
      memoryPressure: 'low',
      isAppActive: true,
    };
  });

  const memoryManager = useMemo(() => MemoryManager.getInstance(), []);
  const renderCountRef = useRef<Map<string, number>>(new Map());
  const lastRenderTimeRef = useRef<Map<string, number>>(new Map());

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setPerformanceState(prev => ({
        ...prev,
        isAppActive: nextAppState === 'active',
      }));

      // Clear cache when app goes to background to free memory
      if (nextAppState === 'background' && performanceState.isLowEndDevice) {
        memoryManager.clearCache();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [performanceState.isLowEndDevice, memoryManager]);

  // Monitor memory pressure
  useEffect(() => {
    const checkMemoryPressure = () => {
      const stats = memoryManager.getCacheStats();
      const usageRatio = stats.size / stats.maxSize;
      
      let memoryPressure: 'low' | 'medium' | 'high' = 'low';
      if (usageRatio > 0.8) {
        memoryPressure = 'high';
      } else if (usageRatio > 0.6) {
        memoryPressure = 'medium';
      }

      setPerformanceState(prev => ({
        ...prev,
        memoryPressure,
      }));
    };

    const interval = setInterval(checkMemoryPressure, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [memoryManager]);

  // Cache management
  const addToCache = useCallback((key: string, data: any) => {
    if (performanceState.isAppActive) {
      memoryManager.addToCache(key, data);
    }
  }, [memoryManager, performanceState.isAppActive]);

  const getFromCache = useCallback((key: string) => {
    return memoryManager.getFromCache(key);
  }, [memoryManager]);

  const clearCache = useCallback(() => {
    memoryManager.clearCache();
  }, [memoryManager]);

  const getCacheStats = useCallback(() => {
    return memoryManager.getCacheStats();
  }, [memoryManager]);

  // Animation management
  const canStartAnimation = useCallback(() => {
    if (!performanceState.config.enableAnimations) {
      return false;
    }
    return AnimationOptimizer.canStartAnimation();
  }, [performanceState.config.enableAnimations]);

  const startAnimation = useCallback(() => {
    if (!performanceState.config.enableAnimations) {
      return false;
    }
    return AnimationOptimizer.startAnimation();
  }, [performanceState.config.enableAnimations]);

  const endAnimation = useCallback(() => {
    AnimationOptimizer.endAnimation();
  }, []);

  // Performance monitoring
  const measureOperation = useCallback(<T>(name: string, operation: () => T): T => {
    PerformanceMonitor.startMeasurement(name);
    try {
      const result = operation();
      const duration = PerformanceMonitor.endMeasurement(name);
      
      // Log slow operations on low-end devices
      if (performanceState.isLowEndDevice && duration > 100) {
        console.warn(`Slow operation detected: ${name} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      PerformanceMonitor.endMeasurement(name);
      throw error;
    }
  }, [performanceState.isLowEndDevice]);

  const measureAsyncOperation = useCallback(async <T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> => {
    const result = await PerformanceMonitor.measureAsync(name, operation);
    
    // Log slow operations on low-end devices
    if (performanceState.isLowEndDevice && result.duration > 200) {
      console.warn(`Slow async operation detected: ${name} took ${result.duration}ms`);
    }
    
    return result;
  }, [performanceState.isLowEndDevice]);

  // Component optimization
  const shouldRenderComponent = useCallback((componentName: string): boolean => {
    // Skip rendering non-essential components on low-end devices under memory pressure
    if (performanceState.isLowEndDevice && performanceState.memoryPressure === 'high') {
      const nonEssentialComponents = [
        'AnimatedBackground',
        'ParticleEffect',
        'ComplexChart',
        'VideoPlayer',
      ];
      
      if (nonEssentialComponents.includes(componentName)) {
        return false;
      }
    }

    // Throttle frequent re-renders
    const now = Date.now();
    const lastRenderTime = lastRenderTimeRef.current.get(componentName) || 0;
    const renderCount = renderCountRef.current.get(componentName) || 0;

    // If component has rendered more than 10 times in the last second, throttle it
    if (now - lastRenderTime < 1000 && renderCount > 10) {
      return false;
    }

    // Update render tracking
    if (now - lastRenderTime > 1000) {
      renderCountRef.current.set(componentName, 1);
    } else {
      renderCountRef.current.set(componentName, renderCount + 1);
    }
    lastRenderTimeRef.current.set(componentName, now);

    return true;
  }, [performanceState.isLowEndDevice, performanceState.memoryPressure]);

  const getOptimizedProps = useCallback((baseProps: any) => {
    const optimizedProps = { ...baseProps };

    // Optimize based on device performance
    if (performanceState.isLowEndDevice) {
      // Disable expensive props
      if ('animationDuration' in optimizedProps) {
        optimizedProps.animationDuration = 0;
      }
      if ('enableShadow' in optimizedProps) {
        optimizedProps.enableShadow = false;
      }
      if ('enableBlur' in optimizedProps) {
        optimizedProps.enableBlur = false;
      }
      if ('quality' in optimizedProps) {
        optimizedProps.quality = 'low';
      }
    }

    // Optimize based on memory pressure
    if (performanceState.memoryPressure === 'high') {
      if ('cacheEnabled' in optimizedProps) {
        optimizedProps.cacheEnabled = false;
      }
      if ('preloadImages' in optimizedProps) {
        optimizedProps.preloadImages = false;
      }
    }

    return optimizedProps;
  }, [performanceState.isLowEndDevice, performanceState.memoryPressure]);

  // Resource management
  const shouldPreloadResource = useCallback((resourceType: string): boolean => {
    if (!performanceState.isAppActive) {
      return false;
    }

    if (performanceState.isLowEndDevice) {
      // Only preload essential resources on low-end devices
      const essentialResources = ['crisis-exercises', 'sos-resources'];
      return essentialResources.includes(resourceType);
    }

    return performanceState.config.preloadExercises;
  }, [performanceState.isAppActive, performanceState.isLowEndDevice, performanceState.config.preloadExercises]);

  const shouldEnableFeature = useCallback((featureName: string): boolean => {
    const featureMap: Record<string, keyof PerformanceConfig> = {
      haptics: 'enableHaptics',
      animations: 'enableAnimations',
      backgroundSync: 'enableBackgroundSync',
      preloadExercises: 'preloadExercises',
    };

    const configKey = featureMap[featureName];
    if (configKey) {
      return performanceState.config[configKey] as boolean;
    }

    // Default to enabled for unknown features on high-end devices
    return !performanceState.isLowEndDevice;
  }, [performanceState.config, performanceState.isLowEndDevice]);

  return {
    performanceState,
    addToCache,
    getFromCache,
    clearCache,
    getCacheStats,
    canStartAnimation,
    startAnimation,
    endAnimation,
    measureOperation,
    measureAsyncOperation,
    shouldRenderComponent,
    getOptimizedProps,
    shouldPreloadResource,
    shouldEnableFeature,
  };
}

// Higher-order component for performance optimization
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    const { shouldRenderComponent, getOptimizedProps } = usePerformanceOptimization();

    if (!shouldRenderComponent(componentName)) {
      return null;
    }

    const optimizedProps = getOptimizedProps(props);
    return <Component {...optimizedProps} />;
  });
}

// Hook for lazy loading components
export function useLazyComponent<T>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { shouldPreloadResource } = usePerformanceOptimization();

  const loadComponent = useCallback(async () => {
    if (Component || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const module = await importFunc();
      setComponent(module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [Component, isLoading, importFunc]);

  useEffect(() => {
    if (shouldPreloadResource('components')) {
      loadComponent();
    }
  }, [shouldPreloadResource, loadComponent]);

  return {
    Component,
    isLoading,
    error,
    loadComponent,
  };
}

// Hook for performance-aware data fetching
export function usePerformantDataFetching<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    cacheKey?: string;
    enableCache?: boolean;
    priority?: 'low' | 'normal' | 'high';
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const {
    performanceState,
    addToCache,
    getFromCache,
    measureAsyncOperation,
  } = usePerformanceOptimization();

  const { cacheKey, enableCache = true, priority = 'normal' } = options;

  const fetchData = useCallback(async () => {
    // Check cache first
    if (enableCache && cacheKey) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return;
      }
    }

    // Skip low-priority requests on low-end devices under memory pressure
    if (
      priority === 'low' &&
      performanceState.isLowEndDevice &&
      performanceState.memoryPressure === 'high'
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { result } = await measureAsyncOperation('data-fetch', fetchFunction);
      setData(result);

      // Cache the result
      if (enableCache && cacheKey) {
        addToCache(cacheKey, result);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchFunction,
    enableCache,
    cacheKey,
    priority,
    performanceState.isLowEndDevice,
    performanceState.memoryPressure,
    getFromCache,
    addToCache,
    measureAsyncOperation,
  ]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
