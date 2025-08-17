/**
 * Performance Optimization Utilities
 * 
 * Utilities for optimizing PocketTherapy performance on low-end devices
 * including memory management, rendering optimization, and resource loading
 */

import { Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Device performance categories
export type DevicePerformance = 'low' | 'medium' | 'high';

// Performance configuration based on device capabilities
export interface PerformanceConfig {
  maxConcurrentAnimations: number;
  imageQuality: 'low' | 'medium' | 'high';
  enableHaptics: boolean;
  enableAnimations: boolean;
  maxCacheSize: number; // in MB
  preloadExercises: boolean;
  enableBackgroundSync: boolean;
  renderBatchSize: number;
}

/**
 * Detect device performance category based on available metrics
 */
export function detectDevicePerformance(): DevicePerformance {
  const { width, height } = Dimensions.get('window');
  const screenArea = width * height;
  const pixelDensity = width * height;

  // Enhanced device detection with memory and CPU considerations
  if (Platform.OS === 'ios') {
    // iOS devices generally have better performance optimization
    // Consider older devices and budget models
    if (screenArea < 800 * 600 || pixelDensity < 480000) return 'low'; // iPhone SE, older models
    if (screenArea < 1200 * 800 || pixelDensity < 1000000) return 'medium'; // iPhone 8, XR
    return 'high'; // iPhone 11+, iPad
  } else {
    // Android has more variation - be more conservative
    if (screenArea < 720 * 480 || pixelDensity < 345600) return 'low'; // Budget Android, <2GB RAM
    if (screenArea < 1080 * 720 || pixelDensity < 777600) return 'medium'; // Mid-range Android
    return 'high'; // High-end Android
  }
}

/**
 * Enhanced device performance detection with memory estimation
 */
export function detectDevicePerformanceEnhanced(): {
  performance: DevicePerformance;
  estimatedRAM: number;
  cpuCores: number;
  isVeryLowEnd: boolean;
} {
  const { width, height } = Dimensions.get('window');
  const screenArea = width * height;
  const pixelRatio = Dimensions.get('window').scale || 1;
  const totalPixels = screenArea * pixelRatio * pixelRatio;

  let estimatedRAM = 4; // Default assumption
  let cpuCores = 4; // Default assumption
  let isVeryLowEnd = false;

  if (Platform.OS === 'ios') {
    // iOS RAM estimation based on screen size and year
    if (screenArea < 800 * 600) {
      estimatedRAM = 1; // iPhone SE 1st gen, very old devices
      cpuCores = 2;
      isVeryLowEnd = true;
    } else if (screenArea < 1000 * 700) {
      estimatedRAM = 2; // iPhone 8, older models
      cpuCores = 2;
    } else if (screenArea < 1200 * 800) {
      estimatedRAM = 3; // iPhone XR, 11
      cpuCores = 6;
    } else {
      estimatedRAM = 6; // iPhone 12+, iPad Pro
      cpuCores = 8;
    }
  } else {
    // Android RAM estimation - more conservative due to fragmentation
    if (totalPixels < 500000) {
      estimatedRAM = 1; // Very budget Android
      cpuCores = 2;
      isVeryLowEnd = true;
    } else if (totalPixels < 1000000) {
      estimatedRAM = 2; // Budget Android
      cpuCores = 4;
      isVeryLowEnd = true;
    } else if (totalPixels < 2000000) {
      estimatedRAM = 3; // Mid-range Android
      cpuCores = 6;
    } else {
      estimatedRAM = 6; // High-end Android
      cpuCores = 8;
    }
  }

  const performance: DevicePerformance =
    estimatedRAM <= 1.5 ? 'low' :
    estimatedRAM <= 3 ? 'medium' : 'high';

  return {
    performance,
    estimatedRAM,
    cpuCores,
    isVeryLowEnd,
  };
}

/**
 * Get performance configuration based on device capabilities
 */
export function getPerformanceConfig(devicePerformance?: DevicePerformance): PerformanceConfig {
  const performance = devicePerformance || detectDevicePerformance();
  
  const configs: Record<DevicePerformance, PerformanceConfig> = {
    low: {
      maxConcurrentAnimations: 1,
      imageQuality: 'low',
      enableHaptics: false,
      enableAnimations: false,
      maxCacheSize: 10, // 10MB
      preloadExercises: false,
      enableBackgroundSync: false,
      renderBatchSize: 5,
    },
    medium: {
      maxConcurrentAnimations: 2,
      imageQuality: 'medium',
      enableHaptics: true,
      enableAnimations: true,
      maxCacheSize: 25, // 25MB
      preloadExercises: true,
      enableBackgroundSync: true,
      renderBatchSize: 10,
    },
    high: {
      maxConcurrentAnimations: 4,
      imageQuality: 'high',
      enableHaptics: true,
      enableAnimations: true,
      maxCacheSize: 50, // 50MB
      preloadExercises: true,
      enableBackgroundSync: true,
      renderBatchSize: 20,
    },
  };
  
  return configs[performance];
}

/**
 * Get enhanced configuration for very low-end devices (<2GB RAM)
 */
export function getVeryLowEndConfig(): PerformanceConfig & {
  aggressiveMemoryManagement: boolean;
  disableImageCaching: boolean;
  simplifiedAnimations: boolean;
  batchProcessing: boolean;
  emergencyMemoryThreshold: number;
  maxMoodLogsInMemory: number;
  disableBackgroundTasks: boolean;
  forceGarbageCollection: boolean;
} {
  return {
    maxConcurrentAnimations: 0, // No animations
    imageQuality: 'low',
    enableHaptics: false,
    enableAnimations: false,
    maxCacheSize: 2, // 2MB only
    preloadExercises: false,
    enableBackgroundSync: false,
    renderBatchSize: 3, // Very small batches
    aggressiveMemoryManagement: true,
    disableImageCaching: true,
    simplifiedAnimations: true,
    batchProcessing: true,
    emergencyMemoryThreshold: 0.85, // Trigger cleanup at 85% memory usage
    maxMoodLogsInMemory: 10, // Keep only 10 recent mood logs in memory
    disableBackgroundTasks: true,
    forceGarbageCollection: true,
  };
}

/**
 * Apply device-specific optimizations based on enhanced detection
 */
export function applyDeviceOptimizations(): {
  config: PerformanceConfig;
  isVeryLowEnd: boolean;
  recommendations: string[];
} {
  const deviceInfo = detectDevicePerformanceEnhanced();
  const config = deviceInfo.isVeryLowEnd
    ? getVeryLowEndConfig()
    : getPerformanceConfig(deviceInfo.performance);

  const recommendations: string[] = [];

  if (deviceInfo.isVeryLowEnd) {
    recommendations.push(
      'Disabled animations for better performance',
      'Reduced cache size to preserve memory',
      'Limited background processing',
      'Simplified UI interactions'
    );
  } else if (deviceInfo.performance === 'low') {
    recommendations.push(
      'Optimized for your device performance',
      'Reduced visual effects for smoother experience'
    );
  }

  return {
    config,
    isVeryLowEnd: deviceInfo.isVeryLowEnd,
    recommendations,
  };
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private cacheSize = 0;
  private maxCacheSize = 25 * 1024 * 1024; // 25MB default
  private cache = new Map<string, any>();
  private isLowMemoryMode = false;
  private memoryWarningThreshold = 0.8; // 80% of max cache
  private emergencyCleanupThreshold = 0.9; // 90% of max cache
  private lastCleanupTime = 0;
  private cleanupInterval = 30000; // 30 seconds
  
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }
  
  setMaxCacheSize(sizeInMB: number): void {
    this.maxCacheSize = sizeInMB * 1024 * 1024;
    this.enforceMemoryLimits();
  }
  
  addToCache(key: string, data: any): void {
    const dataSize = this.estimateSize(data);
    
    // Remove old items if cache would exceed limit
    while (this.cacheSize + dataSize > this.maxCacheSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      this.removeFromCache(firstKey);
    }
    
    this.cache.set(key, data);
    this.cacheSize += dataSize;
  }
  
  getFromCache(key: string): any {
    return this.cache.get(key);
  }
  
  removeFromCache(key: string): void {
    const data = this.cache.get(key);
    if (data) {
      this.cacheSize -= this.estimateSize(data);
      this.cache.delete(key);
    }
  }
  
  clearCache(): void {
    this.cache.clear();
    this.cacheSize = 0;
  }
  
  getCacheStats(): { size: number; count: number; maxSize: number } {
    return {
      size: this.cacheSize,
      count: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }
  
  private estimateSize(data: any): number {
    // Rough estimation of object size in bytes
    const jsonString = JSON.stringify(data);
    return jsonString.length * 2; // Approximate UTF-16 encoding
  }
  
  private enforceMemoryLimits(): void {
    while (this.cacheSize > this.maxCacheSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      this.removeFromCache(firstKey);
    }
  }

  /**
   * Enable low memory mode for very low-end devices
   */
  enableLowMemoryMode(): void {
    this.isLowMemoryMode = true;
    this.maxCacheSize = 2 * 1024 * 1024; // 2MB for low memory mode
    this.memoryWarningThreshold = 0.7; // More aggressive threshold
    this.emergencyCleanupThreshold = 0.8;
    this.enforceMemoryLimits();
  }

  /**
   * Aggressive memory cleanup for emergency situations
   */
  emergencyCleanup(): void {
    const now = Date.now();

    // Only run emergency cleanup if enough time has passed
    if (now - this.lastCleanupTime < this.cleanupInterval) {
      return;
    }

    // Remove 50% of cache items, starting with oldest
    const itemsToRemove = Math.floor(this.cache.size * 0.5);
    const keys = Array.from(this.cache.keys());

    for (let i = 0; i < itemsToRemove && keys.length > 0; i++) {
      this.removeFromCache(keys[i]);
    }

    this.lastCleanupTime = now;

    // Force garbage collection if available (development only)
    if (__DEV__ && global.gc) {
      global.gc();
    }
  }

  /**
   * Check if memory usage is approaching limits
   */
  checkMemoryPressure(): {
    isWarning: boolean;
    isEmergency: boolean;
    usagePercentage: number;
    recommendation: string;
  } {
    const usagePercentage = this.cacheSize / this.maxCacheSize;
    const isWarning = usagePercentage > this.memoryWarningThreshold;
    const isEmergency = usagePercentage > this.emergencyCleanupThreshold;

    let recommendation = 'Memory usage is normal';

    if (isEmergency) {
      recommendation = 'Emergency cleanup recommended - memory critically low';
      this.emergencyCleanup();
    } else if (isWarning) {
      recommendation = 'Consider clearing some cached data';
    }

    return {
      isWarning,
      isEmergency,
      usagePercentage,
      recommendation,
    };
  }

  /**
   * Smart cache eviction based on usage patterns
   */
  smartEviction(): void {
    if (this.cache.size === 0) return;

    // In low memory mode, be more aggressive
    const evictionPercentage = this.isLowMemoryMode ? 0.4 : 0.2;
    const itemsToRemove = Math.floor(this.cache.size * evictionPercentage);

    // Remove oldest items first (FIFO)
    const keys = Array.from(this.cache.keys());
    for (let i = 0; i < itemsToRemove && i < keys.length; i++) {
      this.removeFromCache(keys[i]);
    }
  }

  /**
   * Get detailed memory statistics
   */
  getDetailedStats(): {
    cacheSize: number;
    maxCacheSize: number;
    itemCount: number;
    usagePercentage: number;
    isLowMemoryMode: boolean;
    memoryPressure: 'low' | 'medium' | 'high' | 'critical';
  } {
    const usagePercentage = this.cacheSize / this.maxCacheSize;

    let memoryPressure: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (usagePercentage > this.emergencyCleanupThreshold) {
      memoryPressure = 'critical';
    } else if (usagePercentage > this.memoryWarningThreshold) {
      memoryPressure = 'high';
    } else if (usagePercentage > 0.5) {
      memoryPressure = 'medium';
    }

    return {
      cacheSize: this.cacheSize,
      maxCacheSize: this.maxCacheSize,
      itemCount: this.cache.size,
      usagePercentage,
      isLowMemoryMode: this.isLowMemoryMode,
      memoryPressure,
    };
  }
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Batch processing utility for large datasets
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayBetweenBatches: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    // Small delay to prevent blocking the main thread
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}

/**
 * Lazy loading utility for components
 */
export function createLazyComponent<T>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return React.lazy(importFunc);
}

/**
 * Image optimization utilities
 */
export class ImageOptimizer {
  static getOptimizedImageProps(
    source: any,
    performanceConfig: PerformanceConfig
  ): any {
    const baseProps = {
      source,
      resizeMode: 'contain' as const,
    };
    
    switch (performanceConfig.imageQuality) {
      case 'low':
        return {
          ...baseProps,
          quality: 0.6,
          cache: 'memory',
        };
      case 'medium':
        return {
          ...baseProps,
          quality: 0.8,
          cache: 'memory',
        };
      case 'high':
        return {
          ...baseProps,
          quality: 1.0,
          cache: 'memory',
        };
      default:
        return baseProps;
    }
  }
}

/**
 * Animation optimization utilities
 */
export class AnimationOptimizer {
  private static activeAnimations = 0;
  private static maxConcurrentAnimations = 2;
  
  static setMaxConcurrentAnimations(max: number): void {
    AnimationOptimizer.maxConcurrentAnimations = max;
  }
  
  static canStartAnimation(): boolean {
    return AnimationOptimizer.activeAnimations < AnimationOptimizer.maxConcurrentAnimations;
  }
  
  static startAnimation(): boolean {
    if (AnimationOptimizer.canStartAnimation()) {
      AnimationOptimizer.activeAnimations++;
      return true;
    }
    return false;
  }
  
  static endAnimation(): void {
    if (AnimationOptimizer.activeAnimations > 0) {
      AnimationOptimizer.activeAnimations--;
    }
  }
  
  static getActiveAnimationCount(): number {
    return AnimationOptimizer.activeAnimations;
  }
}

/**
 * Storage optimization utilities
 */
export class StorageOptimizer {
  private static readonly STORAGE_KEYS = {
    PERFORMANCE_CONFIG: 'performance_config',
    CACHE_METADATA: 'cache_metadata',
  };
  
  static async savePerformanceConfig(config: PerformanceConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageOptimizer.STORAGE_KEYS.PERFORMANCE_CONFIG,
        JSON.stringify(config)
      );
    } catch (error) {
      console.error('Failed to save performance config:', error);
    }
  }
  
  static async loadPerformanceConfig(): Promise<PerformanceConfig | null> {
    try {
      const configString = await AsyncStorage.getItem(
        StorageOptimizer.STORAGE_KEYS.PERFORMANCE_CONFIG
      );
      return configString ? JSON.parse(configString) : null;
    } catch (error) {
      console.error('Failed to load performance config:', error);
      return null;
    }
  }
  
  static async optimizeStorage(): Promise<void> {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Remove old or unnecessary data
      const keysToRemove = keys.filter(key => 
        key.startsWith('temp_') || 
        key.startsWith('cache_') && this.isOldCacheKey(key)
      );
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.error('Failed to optimize storage:', error);
    }
  }
  
  private static isOldCacheKey(key: string): boolean {
    // Check if cache key is older than 7 days
    const match = key.match(/cache_(\d+)$/);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return timestamp < sevenDaysAgo;
    }
    return false;
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();
  
  static startMeasurement(name: string): void {
    PerformanceMonitor.measurements.set(name, Date.now());
  }
  
  static endMeasurement(name: string): number {
    const startTime = PerformanceMonitor.measurements.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      PerformanceMonitor.measurements.delete(name);
      return duration;
    }
    return 0;
  }
  
  static measureAsync<T>(
    name: string,
    asyncFunction: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        PerformanceMonitor.startMeasurement(name);
        const result = await asyncFunction();
        const duration = PerformanceMonitor.endMeasurement(name);
        resolve({ result, duration });
      } catch (error) {
        PerformanceMonitor.endMeasurement(name);
        reject(error);
      }
    });
  }
}

/**
 * Initialize performance optimizations
 */
export async function initializePerformanceOptimizations(): Promise<void> {
  try {
    // Detect device performance
    const devicePerformance = detectDevicePerformance();
    
    // Load or create performance config
    let config = await StorageOptimizer.loadPerformanceConfig();
    if (!config) {
      config = getPerformanceConfig(devicePerformance);
      await StorageOptimizer.savePerformanceConfig(config);
    }
    
    // Configure memory manager
    const memoryManager = MemoryManager.getInstance();
    memoryManager.setMaxCacheSize(config.maxCacheSize);
    
    // Configure animation optimizer
    AnimationOptimizer.setMaxConcurrentAnimations(config.maxConcurrentAnimations);
    
    // Optimize storage
    await StorageOptimizer.optimizeStorage();
    
    console.log('Performance optimizations initialized:', {
      devicePerformance,
      config,
    });
  } catch (error) {
    console.error('Failed to initialize performance optimizations:', error);
  }
}
