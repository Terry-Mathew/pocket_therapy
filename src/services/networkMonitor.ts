/**
 * Network Monitor Service
 * 
 * Network connectivity detection with gentle offline mode indicators,
 * fallback messaging, and connection quality monitoring
 */

import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { localStorageService } from './localStorage';

export interface NetworkState {
  isConnected: boolean;
  type: NetInfoStateType;
  isInternetReachable: boolean | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  lastConnected: string | null;
  offlineDuration: number; // in seconds
}

export interface NetworkListener {
  id: string;
  callback: (state: NetworkState) => void;
}

class NetworkMonitorService {
  private currentState: NetworkState = {
    isConnected: false,
    type: NetInfoStateType.unknown,
    isInternetReachable: null,
    connectionQuality: 'offline',
    lastConnected: null,
    offlineDuration: 0,
  };

  private listeners: Map<string, NetworkListener> = new Map();
  private offlineStartTime: number | null = null;
  private connectionQualityTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load last known state
      await this.loadLastKnownState();

      // Set up network state listener
      NetInfo.addEventListener(this.handleNetworkStateChange.bind(this));

      // Get initial network state
      const initialState = await NetInfo.fetch();
      this.handleNetworkStateChange(initialState);

      // Start connection quality monitoring
      this.startConnectionQualityMonitoring();

      this.isInitialized = true;
      console.log('Network monitor initialized');
    } catch (error) {
      console.error('Failed to initialize network monitor:', error);
    }
  }

  /**
   * Handle network state changes
   */
  private async handleNetworkStateChange(state: NetInfoState): Promise<void> {
    const wasConnected = this.currentState.isConnected;
    const isNowConnected = state.isConnected || false;

    // Update connection state
    this.currentState = {
      ...this.currentState,
      isConnected: isNowConnected,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    };

    // Handle connection state transitions
    if (!wasConnected && isNowConnected) {
      await this.handleConnectionRestored();
    } else if (wasConnected && !isNowConnected) {
      await this.handleConnectionLost();
    }

    // Update connection quality
    this.updateConnectionQuality(state);

    // Save current state
    await this.saveCurrentState();

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Handle connection restored
   */
  private async handleConnectionRestored(): Promise<void> {
    console.log('Network connection restored');
    
    this.currentState.lastConnected = new Date().toISOString();
    
    // Calculate offline duration
    if (this.offlineStartTime) {
      this.currentState.offlineDuration = Math.floor(
        (Date.now() - this.offlineStartTime) / 1000
      );
      this.offlineStartTime = null;
    }

    // Log connection restoration for analytics
    await this.logNetworkEvent('connection_restored', {
      offlineDuration: this.currentState.offlineDuration,
      connectionType: this.currentState.type,
    });
  }

  /**
   * Handle connection lost
   */
  private async handleConnectionLost(): Promise<void> {
    console.log('Network connection lost');
    
    this.offlineStartTime = Date.now();
    this.currentState.connectionQuality = 'offline';

    // Log connection loss for analytics
    await this.logNetworkEvent('connection_lost', {
      connectionType: this.currentState.type,
    });
  }

  /**
   * Update connection quality based on network state
   */
  private updateConnectionQuality(state: NetInfoState): void {
    if (!state.isConnected) {
      this.currentState.connectionQuality = 'offline';
      return;
    }

    // Determine quality based on connection type and details
    switch (state.type) {
      case NetInfoStateType.wifi:
        // For WiFi, use signal strength if available
        const wifiDetails = state.details as any;
        if (wifiDetails?.strength !== undefined) {
          if (wifiDetails.strength > 80) {
            this.currentState.connectionQuality = 'excellent';
          } else if (wifiDetails.strength > 60) {
            this.currentState.connectionQuality = 'good';
          } else {
            this.currentState.connectionQuality = 'poor';
          }
        } else {
          this.currentState.connectionQuality = 'good'; // Default for WiFi
        }
        break;

      case NetInfoStateType.cellular:
        // For cellular, use generation and signal strength
        const cellularDetails = state.details as any;
        if (cellularDetails?.cellularGeneration === '5g') {
          this.currentState.connectionQuality = 'excellent';
        } else if (cellularDetails?.cellularGeneration === '4g') {
          this.currentState.connectionQuality = 'good';
        } else {
          this.currentState.connectionQuality = 'poor';
        }
        break;

      case NetInfoStateType.ethernet:
        this.currentState.connectionQuality = 'excellent';
        break;

      default:
        this.currentState.connectionQuality = 'poor';
    }
  }

  /**
   * Start connection quality monitoring with periodic tests
   */
  private startConnectionQualityMonitoring(): void {
    // Test connection quality every 30 seconds when connected
    this.connectionQualityTimer = setInterval(async () => {
      if (this.currentState.isConnected) {
        await this.testConnectionQuality();
      }
    }, 30000);
  }

  /**
   * Test actual connection quality with a lightweight request
   */
  private async testConnectionQuality(): Promise<void> {
    if (!this.currentState.isConnected) return;

    try {
      const startTime = Date.now();
      
      // Make a lightweight request to test connectivity
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        // Update quality based on response time
        if (responseTime < 500) {
          this.currentState.connectionQuality = 'excellent';
        } else if (responseTime < 1500) {
          this.currentState.connectionQuality = 'good';
        } else {
          this.currentState.connectionQuality = 'poor';
        }
      } else {
        this.currentState.connectionQuality = 'poor';
      }
    } catch (error) {
      // If test fails, mark as poor quality but still connected
      this.currentState.connectionQuality = 'poor';
    }

    // Notify listeners of quality change
    this.notifyListeners();
  }

  /**
   * Add network state listener
   */
  addListener(callback: (state: NetworkState) => void): string {
    const id = this.generateId();
    this.listeners.set(id, { id, callback });
    
    // Immediately call with current state
    callback(this.currentState);
    
    return id;
  }

  /**
   * Remove network state listener
   */
  removeListener(id: string): void {
    this.listeners.delete(id);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener.callback(this.currentState);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  /**
   * Get current network state
   */
  getCurrentState(): NetworkState {
    return { ...this.currentState };
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return this.currentState.isConnected;
  }

  /**
   * Check if connection quality is good enough for sync
   */
  isGoodForSync(): boolean {
    return this.currentState.isConnected && 
           this.currentState.connectionQuality !== 'poor';
  }

  /**
   * Get user-friendly connection status message
   */
  getStatusMessage(): string {
    if (!this.currentState.isConnected) {
      if (this.currentState.offlineDuration > 0) {
        const minutes = Math.floor(this.currentState.offlineDuration / 60);
        if (minutes > 0) {
          return `Offline for ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
          return `Offline for ${this.currentState.offlineDuration} second${this.currentState.offlineDuration !== 1 ? 's' : ''}`;
        }
      }
      return 'No internet connection';
    }

    switch (this.currentState.connectionQuality) {
      case 'excellent':
        return 'Excellent connection';
      case 'good':
        return 'Good connection';
      case 'poor':
        return 'Slow connection';
      default:
        return 'Connected';
    }
  }

  /**
   * Get offline fallback message for features
   */
  getOfflineFallbackMessage(feature: string): string {
    const messages = {
      sync: "Your data is saved locally and will sync when you're back online.",
      exercises: "All exercises are available offline. Your progress will sync later.",
      insights: "Showing insights from your local data. Latest updates will appear when connected.",
      default: "This feature works offline. Changes will sync when you reconnect.",
    };

    return messages[feature] || messages.default;
  }

  /**
   * Persistence methods
   */
  private async loadLastKnownState(): Promise<void> {
    try {
      const savedState = await localStorageService.getItem<Partial<NetworkState>>('network_state');
      if (savedState) {
        this.currentState = {
          ...this.currentState,
          ...savedState,
          // Always start with current connection check
          isConnected: false,
          connectionQuality: 'offline',
        };
      }
    } catch (error) {
      console.error('Failed to load network state:', error);
    }
  }

  private async saveCurrentState(): Promise<void> {
    try {
      await localStorageService.setItem('network_state', {
        lastConnected: this.currentState.lastConnected,
        offlineDuration: this.currentState.offlineDuration,
      });
    } catch (error) {
      console.error('Failed to save network state:', error);
    }
  }

  private async logNetworkEvent(event: string, data: any): Promise<void> {
    try {
      const networkEvents = await localStorageService.getItem<any[]>('network_events', []);
      networkEvents.unshift({
        event,
        data,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 50 events
      if (networkEvents.length > 50) {
        networkEvents.splice(50);
      }

      await localStorageService.setItem('network_events', networkEvents);
    } catch (error) {
      console.error('Failed to log network event:', error);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.connectionQualityTimer) {
      clearInterval(this.connectionQualityTimer);
      this.connectionQualityTimer = null;
    }
    
    this.listeners.clear();
    this.isInitialized = false;
  }

  private generateId(): string {
    return 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const networkMonitorService = new NetworkMonitorService();

// Export class for testing
export { NetworkMonitorService };
