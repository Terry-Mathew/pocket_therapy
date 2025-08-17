/**
 * Crisis Detection Service
 * 
 * Implements local-only crisis detection using keyword matching
 * to identify users who may need immediate mental health support.
 * 
 * Privacy-first approach: All analysis happens on-device,
 * no user text is ever transmitted to servers.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CrisisDetection, CrisisLevel, CrisisEvent } from '../types';

// Crisis keywords as defined in documentation
const IMMEDIATE_CRISIS_KEYWORDS = [
  // Direct self-harm indicators
  'kill myself', 'end my life', 'suicide', 'want to die',
  'hurt myself', 'cut myself', 'harm myself', 'end it all',
  
  // Planning indicators
  'have a plan', 'pills to', 'bridge to jump', 'rope to',
  'gun to', 'razor to', 'ways to die', 'how to kill',
  
  // Immediate danger
  'tonight is the night', 'can\'t go on', 'no point living',
  'better off dead', 'everyone would be better without me'
];

const MODERATE_RISK_KEYWORDS = [
  'hopeless', 'worthless', 'burden to everyone', 'can\'t take it',
  'give up', 'no way out', 'trapped', 'nothing matters',
  'hate myself', 'wish I was dead', 'disappear forever'
];

class LocalCrisisDetection {
  private keywords = {
    immediate: IMMEDIATE_CRISIS_KEYWORDS,
    moderate: MODERATE_RISK_KEYWORDS
  };

  /**
   * Analyzes text for crisis indicators
   * @param text - User input text to analyze
   * @returns CrisisDetection result with level and matched keywords
   */
  detectInText(text: string): CrisisDetection {
    const result = this.analyzeText(text);
    
    // Log detection event (no text content) for safety monitoring
    if (result.level !== 'NONE') {
      this.logCrisisEvent(result.level, []);
    }
    
    return result;
  }

  /**
   * Core analysis algorithm
   * @param text - Text to analyze
   * @returns CrisisDetection result
   */
  private analyzeText(text: string): CrisisDetection {
    const cleanText = text.toLowerCase().trim();
    
    // Tier 1: Immediate intervention needed
    const tier1Matches = this.keywords.immediate.filter(keyword => 
      cleanText.includes(keyword)
    );
    
    if (tier1Matches.length > 0) {
      return { 
        level: 'IMMEDIATE', 
        keywords: tier1Matches,
        confidence: 0.9 
      };
    }
    
    // Tier 2: Supportive resources offered
    const tier2Matches = this.keywords.moderate.filter(keyword => 
      cleanText.includes(keyword)
    );
    
    if (tier2Matches.length >= 2) { // Multiple moderate indicators
      return { 
        level: 'MODERATE', 
        keywords: tier2Matches,
        confidence: 0.7 
      };
    }
    
    return { level: 'NONE', keywords: [], confidence: 0 };
  }

  /**
   * Logs crisis detection event (privacy-safe)
   * @param level - Crisis level detected
   * @param userActions - Actions user took after detection
   */
  private async logCrisisEvent(level: CrisisLevel, userActions: string[]) {
    const safeLog: CrisisEvent = {
      id: this.generateUUID(),
      level,
      timestamp: new Date(),
      user_actions: userActions,
      session_id: await this.getAnonymousSessionId()
    };
    
    try {
      // Store locally for safety monitoring
      const existingLogs = await AsyncStorage.getItem('crisis_events');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(safeLog);
      
      // Keep only last 50 events (7 days max as per documentation)
      const recentLogs = logs.slice(-50);
      await AsyncStorage.setItem('crisis_events', JSON.stringify(recentLogs));
      
      // Send anonymized aggregate to improve crisis support
      // Note: This would integrate with analytics service
      console.log('Crisis event logged (anonymized):', {
        level,
        timestamp: safeLog.timestamp,
        effective_resources: userActions.length > 0
      });
      
    } catch (error) {
      console.error('Failed to log crisis event:', error);
    }
  }

  /**
   * Updates crisis event with user actions taken
   * @param eventId - Crisis event ID
   * @param actions - Actions user took
   */
  async updateCrisisEventActions(eventId: string, actions: string[]) {
    try {
      const existingLogs = await AsyncStorage.getItem('crisis_events');
      if (!existingLogs) return;
      
      const logs: CrisisEvent[] = JSON.parse(existingLogs);
      const eventIndex = logs.findIndex(log => log.id === eventId);
      
      if (eventIndex !== -1) {
        logs[eventIndex].user_actions = actions;
        await AsyncStorage.setItem('crisis_events', JSON.stringify(logs));
      }
    } catch (error) {
      console.error('Failed to update crisis event actions:', error);
    }
  }

  /**
   * Gets recent crisis events for pattern analysis
   * @param days - Number of days to look back
   * @returns Array of recent crisis events
   */
  async getRecentCrisisEvents(days: number = 7): Promise<CrisisEvent[]> {
    try {
      const existingLogs = await AsyncStorage.getItem('crisis_events');
      if (!existingLogs) return [];
      
      const logs: CrisisEvent[] = JSON.parse(existingLogs);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return logs.filter(log => new Date(log.timestamp) > cutoffDate);
    } catch (error) {
      console.error('Failed to get recent crisis events:', error);
      return [];
    }
  }

  /**
   * Cleans up old crisis events (privacy protection)
   */
  async cleanupOldEvents() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const existingLogs = await AsyncStorage.getItem('crisis_events');
      if (!existingLogs) return;
      
      const logs: CrisisEvent[] = JSON.parse(existingLogs);
      const recentLogs = logs.filter(log => 
        new Date(log.timestamp) > sevenDaysAgo
      );
      
      await AsyncStorage.setItem('crisis_events', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to cleanup old crisis events:', error);
    }
  }

  /**
   * Generates anonymous session ID for tracking
   * @returns Anonymous session identifier
   */
  private async getAnonymousSessionId(): Promise<string> {
    try {
      let sessionId = await AsyncStorage.getItem('anonymous_session_id');
      if (!sessionId) {
        sessionId = this.generateUUID();
        await AsyncStorage.setItem('anonymous_session_id', sessionId);
      }
      return sessionId;
    } catch (error) {
      return 'unknown_session';
    }
  }

  /**
   * Generates UUID for event tracking
   * @returns UUID string
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Checks if crisis detection is enabled in user settings
   * @returns Boolean indicating if detection is enabled
   */
  async isDetectionEnabled(): Promise<boolean> {
    try {
      const settings = await AsyncStorage.getItem('privacy_settings');
      if (!settings) return true; // Default enabled
      
      const privacySettings = JSON.parse(settings);
      return privacySettings.crisis_detection_enabled !== false;
    } catch (error) {
      return true; // Default enabled for safety
    }
  }

  /**
   * Enables or disables crisis detection
   * @param enabled - Whether to enable detection
   */
  async setDetectionEnabled(enabled: boolean) {
    try {
      const existingSettings = await AsyncStorage.getItem('privacy_settings');
      const settings = existingSettings ? JSON.parse(existingSettings) : {};
      
      settings.crisis_detection_enabled = enabled;
      await AsyncStorage.setItem('privacy_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to update crisis detection setting:', error);
    }
  }
}

// Export singleton instance
export const crisisDetectionService = new LocalCrisisDetection();

// Export class for testing
export { LocalCrisisDetection };

// Export emergency contact information
export const EMERGENCY_CONTACTS = {
  india: {
    emergency: '112',
    mental_health: [
      { name: 'Vandrevala Foundation', phone: '1860 2662 345' },
      { name: 'Aasra Helpline', phone: '91-9820466726' },
      { name: 'iCall', phone: '9152987821' }
    ]
  },
  us: {
    emergency: '911',
    mental_health: [
      { name: 'National Suicide Prevention Lifeline', phone: '988' },
      { name: 'Crisis Text Line', phone: 'Text HOME to 741741' },
      { name: 'SAMHSA Helpline', phone: '1-800-662-4357' }
    ]
  }
};
