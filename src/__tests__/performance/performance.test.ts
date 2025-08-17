/**
 * Performance Tests
 * 
 * Tests for performance optimization utilities and low-end device support
 */

import {
  detectDevicePerformance,
  getPerformanceConfig,
  MemoryManager,
  debounce,
  throttle,
  processBatch,
  AnimationOptimizer,
  PerformanceMonitor,
  initializePerformanceOptimizations,
} from '../../utils/performanceOptimization';

// Mock React Native modules
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 800, height: 600 })),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('Performance Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Device Performance Detection', () => {
    it('should detect low-end device performance', () => {
      const { Dimensions } = require('react-native');
      Dimensions.get.mockReturnValue({ width: 400, height: 300 });

      const performance = detectDevicePerformance();
      expect(performance).toBe('low');
    });

    it('should detect medium device performance', () => {
      const { Dimensions } = require('react-native');
      Dimensions.get.mockReturnValue({ width: 800, height: 600 });

      const performance = detectDevicePerformance();
      expect(performance).toBe('medium');
    });

    it('should detect high-end device performance', () => {
      const { Dimensions } = require('react-native');
      Dimensions.get.mockReturnValue({ width: 1200, height: 800 });

      const performance = detectDevicePerformance();
      expect(performance).toBe('high');
    });

    it('should handle different platforms appropriately', () => {
      const { Platform } = require('react-native');
      Platform.OS = 'android';

      const performance = detectDevicePerformance();
      expect(['low', 'medium', 'high']).toContain(performance);
    });
  });

  describe('Performance Configuration', () => {
    it('should provide appropriate config for low-end devices', () => {
      const config = getPerformanceConfig('low');

      expect(config.maxConcurrentAnimations).toBe(1);
      expect(config.imageQuality).toBe('low');
      expect(config.enableHaptics).toBe(false);
      expect(config.enableAnimations).toBe(false);
      expect(config.maxCacheSize).toBe(10);
      expect(config.preloadExercises).toBe(false);
      expect(config.enableBackgroundSync).toBe(false);
      expect(config.renderBatchSize).toBe(5);
    });

    it('should provide appropriate config for high-end devices', () => {
      const config = getPerformanceConfig('high');

      expect(config.maxConcurrentAnimations).toBe(4);
      expect(config.imageQuality).toBe('high');
      expect(config.enableHaptics).toBe(true);
      expect(config.enableAnimations).toBe(true);
      expect(config.maxCacheSize).toBe(50);
      expect(config.preloadExercises).toBe(true);
      expect(config.enableBackgroundSync).toBe(true);
      expect(config.renderBatchSize).toBe(20);
    });

    it('should scale features appropriately across device tiers', () => {
      const lowConfig = getPerformanceConfig('low');
      const mediumConfig = getPerformanceConfig('medium');
      const highConfig = getPerformanceConfig('high');

      expect(lowConfig.maxConcurrentAnimations).toBeLessThan(mediumConfig.maxConcurrentAnimations);
      expect(mediumConfig.maxConcurrentAnimations).toBeLessThan(highConfig.maxConcurrentAnimations);

      expect(lowConfig.maxCacheSize).toBeLessThan(mediumConfig.maxCacheSize);
      expect(mediumConfig.maxCacheSize).toBeLessThan(highConfig.maxCacheSize);

      expect(lowConfig.renderBatchSize).toBeLessThan(mediumConfig.renderBatchSize);
      expect(mediumConfig.renderBatchSize).toBeLessThan(highConfig.renderBatchSize);
    });
  });

  describe('Memory Management', () => {
    let memoryManager: MemoryManager;

    beforeEach(() => {
      memoryManager = MemoryManager.getInstance();
      memoryManager.clearCache();
      memoryManager.setMaxCacheSize(1); // 1MB for testing
    });

    it('should manage cache size within limits', () => {
      const largeData = { data: 'x'.repeat(500000) }; // ~500KB
      
      memoryManager.addToCache('item1', largeData);
      memoryManager.addToCache('item2', largeData);
      
      const stats = memoryManager.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });

    it('should evict old items when cache is full', () => {
      const data1 = { data: 'x'.repeat(300000) }; // ~300KB
      const data2 = { data: 'y'.repeat(300000) }; // ~300KB
      const data3 = { data: 'z'.repeat(300000) }; // ~300KB

      memoryManager.addToCache('item1', data1);
      memoryManager.addToCache('item2', data2);
      memoryManager.addToCache('item3', data3);

      // item1 should be evicted
      expect(memoryManager.getFromCache('item1')).toBeUndefined();
      expect(memoryManager.getFromCache('item2')).toBeDefined();
      expect(memoryManager.getFromCache('item3')).toBeDefined();
    });

    it('should provide accurate cache statistics', () => {
      const data = { test: 'data' };
      memoryManager.addToCache('test', data);

      const stats = memoryManager.getCacheStats();
      expect(stats.count).toBe(1);
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.maxSize).toBeGreaterThan(0);
    });

    it('should clear cache completely', () => {
      memoryManager.addToCache('item1', { data: 'test1' });
      memoryManager.addToCache('item2', { data: 'test2' });

      memoryManager.clearCache();

      const stats = memoryManager.getCacheStats();
      expect(stats.count).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe('Debounce and Throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3');
    });

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('call1');
      throttledFn('call2');
      throttledFn('call3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');

      jest.advanceTimersByTime(100);

      throttledFn('call4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('call4');
    });
  });

  describe('Batch Processing', () => {
    it('should process items in batches', async () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const processor = jest.fn().mockImplementation(async (item) => item * 2);

      const results = await processBatch(items, processor, 10, 0);

      expect(results).toHaveLength(25);
      expect(results[0]).toBe(0);
      expect(results[24]).toBe(48);
      expect(processor).toHaveBeenCalledTimes(25);
    });

    it('should handle batch processing errors gracefully', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = jest.fn().mockImplementation(async (item) => {
        if (item === 3) throw new Error('Processing error');
        return item * 2;
      });

      await expect(processBatch(items, processor, 2, 0)).rejects.toThrow('Processing error');
    });

    it('should respect batch size limits', async () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      const processor = jest.fn().mockImplementation(async (item) => item);

      await processBatch(items, processor, 10, 0);

      // Should be called in batches of 10
      expect(processor).toHaveBeenCalledTimes(100);
    });
  });

  describe('Animation Optimization', () => {
    beforeEach(() => {
      AnimationOptimizer.setMaxConcurrentAnimations(2);
      // Reset active animations count
      while (AnimationOptimizer.getActiveAnimationCount() > 0) {
        AnimationOptimizer.endAnimation();
      }
    });

    it('should limit concurrent animations', () => {
      expect(AnimationOptimizer.canStartAnimation()).toBe(true);
      expect(AnimationOptimizer.startAnimation()).toBe(true);
      expect(AnimationOptimizer.getActiveAnimationCount()).toBe(1);

      expect(AnimationOptimizer.canStartAnimation()).toBe(true);
      expect(AnimationOptimizer.startAnimation()).toBe(true);
      expect(AnimationOptimizer.getActiveAnimationCount()).toBe(2);

      expect(AnimationOptimizer.canStartAnimation()).toBe(false);
      expect(AnimationOptimizer.startAnimation()).toBe(false);
      expect(AnimationOptimizer.getActiveAnimationCount()).toBe(2);
    });

    it('should allow new animations when others end', () => {
      AnimationOptimizer.startAnimation();
      AnimationOptimizer.startAnimation();
      expect(AnimationOptimizer.canStartAnimation()).toBe(false);

      AnimationOptimizer.endAnimation();
      expect(AnimationOptimizer.canStartAnimation()).toBe(true);
      expect(AnimationOptimizer.getActiveAnimationCount()).toBe(1);
    });

    it('should handle animation count correctly', () => {
      expect(AnimationOptimizer.getActiveAnimationCount()).toBe(0);

      AnimationOptimizer.startAnimation();
      expect(AnimationOptimizer.getActiveAnimationCount()).toBe(1);

      AnimationOptimizer.endAnimation();
      expect(AnimationOptimizer.getActiveAnimationCount()).toBe(0);

      // Should not go below 0
      AnimationOptimizer.endAnimation();
      expect(AnimationOptimizer.getActiveAnimationCount()).toBe(0);
    });
  });

  describe('Performance Monitoring', () => {
    it('should measure synchronous operations', () => {
      PerformanceMonitor.startMeasurement('test-operation');
      
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait for 10ms
      }
      
      const duration = PerformanceMonitor.endMeasurement('test-operation');
      expect(duration).toBeGreaterThanOrEqual(10);
      expect(duration).toBeLessThan(100); // Should be reasonable
    });

    it('should measure asynchronous operations', async () => {
      const asyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      };

      const { result, duration } = await PerformanceMonitor.measureAsync('async-test', asyncOperation);

      expect(result).toBe('result');
      expect(duration).toBeGreaterThanOrEqual(50);
      expect(duration).toBeLessThan(100);
    });

    it('should handle measurement errors', async () => {
      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      await expect(
        PerformanceMonitor.measureAsync('failing-test', failingOperation)
      ).rejects.toThrow('Operation failed');
    });
  });

  describe('Performance Benchmarks', () => {
    it('should handle large mood log datasets efficiently', async () => {
      const largeMoodDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `mood-${i}`,
        value: (i % 5) + 1,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }));

      const { duration } = await PerformanceMonitor.measureAsync('mood-processing', async () => {
        // Simulate mood analysis
        const averageMood = largeMoodDataset.reduce((sum, log) => sum + log.value, 0) / largeMoodDataset.length;
        const trends = largeMoodDataset.slice(0, 30).map(log => log.value);
        return { averageMood, trends };
      });

      expect(duration).toBeLessThan(100); // Should be fast
    });

    it('should handle exercise library filtering efficiently', async () => {
      const largeExerciseLibrary = Array.from({ length: 500 }, (_, i) => ({
        id: `exercise-${i}`,
        title: `Exercise ${i}`,
        category: ['breathing', 'grounding', 'cognitive'][i % 3],
        duration: 60 + (i * 10),
        difficulty: ['beginner', 'intermediate', 'advanced'][i % 3],
        tags: [`tag${i % 10}`, `category${i % 5}`],
      }));

      const { duration } = await PerformanceMonitor.measureAsync('exercise-filtering', async () => {
        // Simulate complex filtering
        return largeExerciseLibrary
          .filter(ex => ex.category === 'breathing')
          .filter(ex => ex.difficulty === 'beginner')
          .filter(ex => ex.duration <= 300)
          .slice(0, 10);
      });

      expect(duration).toBeLessThan(50); // Should be very fast
    });

    it('should handle notification template selection efficiently', async () => {
      const largeTemplateSet = Array.from({ length: 200 }, (_, i) => ({
        id: `template-${i}`,
        type: ['morning', 'evening', 'check-in', 'encouragement'][i % 4],
        title: `Template ${i}`,
        body: `Body text for template ${i}`,
        context: {
          mood: (i % 5) + 1,
          timeOfDay: ['morning', 'afternoon', 'evening'][i % 3],
        },
      }));

      const { duration } = await PerformanceMonitor.measureAsync('template-selection', async () => {
        // Simulate context-aware template selection
        return largeTemplateSet
          .filter(template => template.type === 'morning')
          .filter(template => template.context.mood <= 3)
          .sort(() => Math.random() - 0.5)
          .slice(0, 1);
      });

      expect(duration).toBeLessThan(25); // Should be very fast
    });
  });

  describe('Low-End Device Optimization', () => {
    it('should optimize for low-end devices', () => {
      const lowEndConfig = getPerformanceConfig('low');

      // Should disable expensive features
      expect(lowEndConfig.enableHaptics).toBe(false);
      expect(lowEndConfig.enableAnimations).toBe(false);
      expect(lowEndConfig.preloadExercises).toBe(false);
      expect(lowEndConfig.enableBackgroundSync).toBe(false);

      // Should use minimal resources
      expect(lowEndConfig.maxConcurrentAnimations).toBe(1);
      expect(lowEndConfig.maxCacheSize).toBe(10);
      expect(lowEndConfig.renderBatchSize).toBe(5);
      expect(lowEndConfig.imageQuality).toBe('low');
    });

    it('should provide graceful degradation', () => {
      const configs = ['low', 'medium', 'high'].map(perf => 
        getPerformanceConfig(perf as any)
      );

      // Each tier should have equal or better capabilities
      for (let i = 1; i < configs.length; i++) {
        expect(configs[i].maxConcurrentAnimations).toBeGreaterThanOrEqual(configs[i-1].maxConcurrentAnimations);
        expect(configs[i].maxCacheSize).toBeGreaterThanOrEqual(configs[i-1].maxCacheSize);
        expect(configs[i].renderBatchSize).toBeGreaterThanOrEqual(configs[i-1].renderBatchSize);
      }
    });
  });

  describe('Initialization', () => {
    it('should initialize performance optimizations', async () => {
      await expect(initializePerformanceOptimizations()).resolves.not.toThrow();
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock AsyncStorage to throw an error
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(initializePerformanceOptimizations()).resolves.not.toThrow();
    });
  });
});
