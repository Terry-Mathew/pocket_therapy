/**
 * SOS Session Manager
 * 
 * Manages crisis sessions with auto-save, resume functionality,
 * and gentle check-ins for user safety and support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface SOSSession {
  id: string;
  startedAt: string;
  lastActiveAt: string;
  exerciseId?: string;
  exerciseProgress?: {
    currentStep: number;
    totalSteps: number;
    timeElapsed: number;
  };
  checkIns: SOSCheckIn[];
  isActive: boolean;
  completedAt?: string;
  outcome?: 'completed' | 'interrupted' | 'escalated';
  notes?: string;
}

interface SOSCheckIn {
  timestamp: string;
  type: 'auto' | 'manual';
  response?: 'better' | 'same' | 'worse' | 'need_help';
  message?: string;
}

interface SOSSessionOptions {
  exerciseId?: string;
  autoCheckInInterval?: number; // seconds
  maxSessionDuration?: number; // seconds
}

const STORAGE_KEY = 'sos_sessions';
const ACTIVE_SESSION_KEY = 'active_sos_session';

class SOSSessionManager {
  private checkInTimer: NodeJS.Timeout | null = null;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private currentSession: SOSSession | null = null;

  /**
   * Start a new SOS session
   */
  async startSession(options: SOSSessionOptions = {}): Promise<SOSSession> {
    try {
      // End any existing session first
      if (this.currentSession) {
        await this.endSession('interrupted');
      }

      const session: SOSSession = {
        id: this.generateSessionId(),
        startedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        exerciseId: options.exerciseId,
        checkIns: [],
        isActive: true,
      };

      this.currentSession = session;
      
      // Save session
      await this.saveSession(session);
      await this.setActiveSession(session);

      // Start auto-save timer (every 10 seconds)
      this.startAutoSave();

      // Start check-in timer (default 60 seconds)
      this.startCheckInTimer(options.autoCheckInInterval || 60);

      console.log('SOS session started:', session.id);
      return session;
    } catch (error) {
      console.error('Failed to start SOS session:', error);
      throw new Error('Failed to start crisis session');
    }
  }

  /**
   * Resume an existing session
   */
  async resumeSession(): Promise<SOSSession | null> {
    try {
      const activeSession = await this.getActiveSession();
      
      if (!activeSession || !activeSession.isActive) {
        return null;
      }

      // Check if session is too old (more than 30 minutes)
      const sessionAge = Date.now() - new Date(activeSession.startedAt).getTime();
      const maxAge = 30 * 60 * 1000; // 30 minutes

      if (sessionAge > maxAge) {
        await this.endSession('interrupted');
        return null;
      }

      this.currentSession = activeSession;
      
      // Update last active time
      activeSession.lastActiveAt = new Date().toISOString();
      await this.saveSession(activeSession);

      // Restart timers
      this.startAutoSave();
      this.startCheckInTimer(60);

      console.log('SOS session resumed:', activeSession.id);
      return activeSession;
    } catch (error) {
      console.error('Failed to resume SOS session:', error);
      return null;
    }
  }

  /**
   * Update session progress
   */
  async updateProgress(progress: SOSSession['exerciseProgress']): Promise<void> {
    if (!this.currentSession) return;

    try {
      this.currentSession.exerciseProgress = progress;
      this.currentSession.lastActiveAt = new Date().toISOString();
      
      await this.saveSession(this.currentSession);
    } catch (error) {
      console.error('Failed to update session progress:', error);
    }
  }

  /**
   * Add a check-in to the current session
   */
  async addCheckIn(checkIn: Omit<SOSCheckIn, 'timestamp'>): Promise<void> {
    if (!this.currentSession) return;

    try {
      const newCheckIn: SOSCheckIn = {
        ...checkIn,
        timestamp: new Date().toISOString(),
      };

      this.currentSession.checkIns.push(newCheckIn);
      this.currentSession.lastActiveAt = new Date().toISOString();
      
      await this.saveSession(this.currentSession);

      // Handle escalation if user needs help
      if (checkIn.response === 'need_help') {
        await this.handleEscalation();
      }

      console.log('Check-in added:', newCheckIn);
    } catch (error) {
      console.error('Failed to add check-in:', error);
    }
  }

  /**
   * End the current session
   */
  async endSession(outcome: SOSSession['outcome'] = 'completed', notes?: string): Promise<void> {
    if (!this.currentSession) return;

    try {
      this.currentSession.isActive = false;
      this.currentSession.completedAt = new Date().toISOString();
      this.currentSession.outcome = outcome;
      this.currentSession.notes = notes;

      await this.saveSession(this.currentSession);
      await this.clearActiveSession();

      // Clear timers
      this.stopTimers();

      console.log('SOS session ended:', this.currentSession.id, 'outcome:', outcome);
      this.currentSession = null;
    } catch (error) {
      console.error('Failed to end SOS session:', error);
    }
  }

  /**
   * Get current active session
   */
  getCurrentSession(): SOSSession | null {
    return this.currentSession;
  }

  /**
   * Get session history
   */
  async getSessionHistory(limit: number = 10): Promise<SOSSession[]> {
    try {
      const sessions = await this.getAllSessions();
      return sessions
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get session history:', error);
      return [];
    }
  }

  /**
   * Private methods
   */

  private generateSessionId(): string {
    return `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startAutoSave(): void {
    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      if (this.currentSession) {
        this.currentSession.lastActiveAt = new Date().toISOString();
        this.saveSession(this.currentSession);
      }
    }, 10000); // Every 10 seconds
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private startCheckInTimer(intervalSeconds: number): void {
    this.stopCheckInTimer();
    this.checkInTimer = setTimeout(() => {
      this.performAutoCheckIn();
    }, intervalSeconds * 1000);
  }

  private stopCheckInTimer(): void {
    if (this.checkInTimer) {
      clearTimeout(this.checkInTimer);
      this.checkInTimer = null;
    }
  }

  private stopTimers(): void {
    this.stopAutoSave();
    this.stopCheckInTimer();
  }

  private async performAutoCheckIn(): Promise<void> {
    if (!this.currentSession) return;

    await this.addCheckIn({
      type: 'auto',
      message: 'Automatic check-in after 60 seconds',
    });

    // Schedule next check-in (every 2 minutes after first)
    this.startCheckInTimer(120);
  }

  private async handleEscalation(): Promise<void> {
    // This would trigger crisis resource display or emergency contacts
    console.log('SOS session escalated - user needs help');
    
    // End session with escalation outcome
    await this.endSession('escalated', 'User requested additional help');
  }

  private async saveSession(session: SOSSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private async getAllSessions(): Promise<SOSSession[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  private async setActiveSession(session: SOSSession): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to set active session:', error);
    }
  }

  private async getActiveSession(): Promise<SOSSession | null> {
    try {
      const stored = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get active session:', error);
      return null;
    }
  }

  private async clearActiveSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear active session:', error);
    }
  }

  /**
   * Cleanup old sessions (keep last 50)
   */
  async cleanupOldSessions(): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      if (sessions.length > 50) {
        const sortedSessions = sessions
          .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
          .slice(0, 50);
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sortedSessions));
        console.log(`Cleaned up ${sessions.length - 50} old SOS sessions`);
      }
    } catch (error) {
      console.error('Failed to cleanup old sessions:', error);
    }
  }
}

export const sosSessionManager = new SOSSessionManager();
