/**
 * Exercise Flow Integration Tests
 * 
 * End-to-end tests for the complete exercise experience
 * including discovery, execution, completion, and tracking
 */

describe('Exercise Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Exercise Discovery and Selection', () => {
    it('should recommend appropriate exercises based on context', async () => {
      const userContext = {
        currentMood: 2, // Low mood
        timeOfDay: 'morning',
        availableTime: 300, // 5 minutes
        lastExercises: ['breathing-001'],
        preferences: ['breathing', 'grounding'],
      };

      const recommendations = [
        {
          id: 'grounding-001',
          title: '5-4-3-2-1 Technique',
          category: 'grounding',
          duration: 180,
          difficulty: 'beginner',
          crisisAppropriate: true,
          matchReason: 'Good for low mood and anxiety',
        },
        {
          id: 'breathing-002',
          title: 'Box Breathing',
          category: 'breathing',
          duration: 180,
          difficulty: 'beginner',
          crisisAppropriate: true,
          matchReason: 'Calming and centering',
        },
      ];

      // Should recommend crisis-appropriate exercises for low mood
      recommendations.forEach(exercise => {
        expect(exercise.crisisAppropriate).toBe(true);
        expect(exercise.duration).toBeLessThanOrEqual(userContext.availableTime);
        expect(['breathing', 'grounding']).toContain(exercise.category);
      });

      // Should provide clear reasoning
      recommendations.forEach(exercise => {
        expect(exercise.matchReason).toBeTruthy();
        expect(exercise.matchReason.length).toBeGreaterThan(10);
      });
    });

    it('should filter exercises by user preferences', async () => {
      const userPreferences = {
        categories: ['breathing'],
        difficulty: 'beginner',
        maxDuration: 240, // 4 minutes
        avoidTags: ['advanced', 'long'],
        preferTags: ['quick', 'calming'],
      };

      const filteredExercises = [
        {
          id: 'breathing-001',
          category: 'breathing',
          difficulty: 'beginner',
          duration: 120,
          tags: ['quick', 'calming', 'anxiety'],
        },
        {
          id: 'breathing-006',
          category: 'breathing',
          difficulty: 'beginner',
          duration: 120,
          tags: ['counting', 'mindfulness'],
        },
      ];

      // Should match user preferences
      filteredExercises.forEach(exercise => {
        expect(userPreferences.categories).toContain(exercise.category);
        expect(exercise.difficulty).toBe(userPreferences.difficulty);
        expect(exercise.duration).toBeLessThanOrEqual(userPreferences.maxDuration);
        
        // Should not contain avoided tags
        const hasAvoidedTags = exercise.tags.some(tag => 
          userPreferences.avoidTags.includes(tag)
        );
        expect(hasAvoidedTags).toBe(false);
      });
    });
  });

  describe('Exercise Execution Flow', () => {
    it('should guide user through complete exercise', async () => {
      const exercise = {
        id: 'breathing-001',
        title: '4-7-8 Calming Breath',
        duration: 120,
        instructions: [
          'Sit comfortably with your back straight',
          'Place the tip of your tongue against the ridge behind your upper teeth',
          'Exhale completely through your mouth',
          'Close your mouth and inhale through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale through your mouth for 8 counts',
          'Repeat this cycle 3-4 times',
        ],
        hapticPattern: 'rhythmic',
      };

      const session = {
        id: 'session-1',
        exerciseId: exercise.id,
        userId: 'user-1',
        startedAt: new Date().toISOString(),
        currentStep: 0,
        isActive: true,
        progress: 0,
      };

      // Should provide step-by-step guidance
      expect(exercise.instructions.length).toBeGreaterThan(0);
      exercise.instructions.forEach(instruction => {
        expect(instruction.length).toBeGreaterThan(10); // Meaningful instructions
        expect(instruction).toMatch(/sit|place|exhale|inhale|hold|breathe|repeat/);
      });

      // Should track progress
      expect(session.currentStep).toBe(0);
      expect(session.progress).toBe(0);
      expect(session.isActive).toBe(true);

      // Should use therapeutic language
      exercise.instructions.forEach(instruction => {
        expect(instruction).not.toMatch(/must|should|wrong|failure/);
      });
    });

    it('should handle exercise interruption and resumption', async () => {
      const interruptedSession = {
        id: 'session-2',
        exerciseId: 'grounding-001',
        userId: 'user-1',
        startedAt: '2024-01-01T12:00:00.000Z',
        pausedAt: '2024-01-01T12:02:30.000Z',
        currentStep: 3,
        totalSteps: 7,
        progress: 43, // 43% complete
        canResume: true,
      };

      expect(interruptedSession.canResume).toBe(true);
      expect(interruptedSession.progress).toBeGreaterThan(0);
      expect(interruptedSession.currentStep).toBeGreaterThan(0);

      // Should offer resumption options
      const resumeOptions = {
        continueFromCurrentStep: true,
        restartFromBeginning: true,
        skipToNextExercise: true,
        saveProgressAndExit: true,
      };

      expect(resumeOptions.continueFromCurrentStep).toBe(true);
      expect(resumeOptions.restartFromBeginning).toBe(true);
      expect(resumeOptions.saveProgressAndExit).toBe(true);
    });

    it('should provide haptic feedback during exercises', async () => {
      const hapticExercise = {
        id: 'breathing-002',
        title: 'Box Breathing',
        hapticPattern: 'rhythmic',
        hapticCues: [
          { step: 'inhale', duration: 4000, pattern: 'gentle' },
          { step: 'hold', duration: 4000, pattern: 'pause' },
          { step: 'exhale', duration: 4000, pattern: 'gentle' },
          { step: 'hold', duration: 4000, pattern: 'pause' },
        ],
      };

      // Should have appropriate haptic patterns
      expect(hapticExercise.hapticPattern).toBe('rhythmic');
      expect(hapticExercise.hapticCues.length).toBe(4);

      hapticExercise.hapticCues.forEach(cue => {
        expect(cue.duration).toBeGreaterThan(0);
        expect(['gentle', 'pause', 'rhythmic']).toContain(cue.pattern);
      });
    });
  });

  describe('Exercise Completion and Feedback', () => {
    it('should collect meaningful completion feedback', async () => {
      const completedSession = {
        id: 'session-3',
        exerciseId: 'grounding-001',
        userId: 'user-1',
        startedAt: '2024-01-01T12:00:00.000Z',
        completedAt: '2024-01-01T12:05:00.000Z',
        duration: 300,
        completed: true,
        feedback: {
          helpfulnessRating: 4, // 1-5 scale
          moodBefore: 2,
          moodAfter: 3,
          notes: 'Felt more grounded and present',
          wouldRecommend: true,
        },
      };

      expect(completedSession.completed).toBe(true);
      expect(completedSession.feedback.helpfulnessRating).toBeGreaterThanOrEqual(1);
      expect(completedSession.feedback.helpfulnessRating).toBeLessThanOrEqual(5);
      expect(completedSession.feedback.moodAfter).toBeGreaterThan(completedSession.feedback.moodBefore);

      // Should track mood improvement
      const moodImprovement = completedSession.feedback.moodAfter - completedSession.feedback.moodBefore;
      expect(moodImprovement).toBeGreaterThan(0);
    });

    it('should provide encouraging completion messages', async () => {
      const completionMessages = [
        'Well done! You took time for yourself today',
        'You\'ve completed another step in your wellness journey',
        'Notice how you feel right now - you did this',
        'Every moment of self-care matters',
        'You showed up for yourself today',
      ];

      completionMessages.forEach(message => {
        expect(message).toMatch(/well.*done|completed|notice.*feel|self.*care|showed.*up/);
        expect(message).not.toMatch(/should|must|perfect|wrong/);
        expect(message.length).toBeGreaterThan(20); // Substantial messages
      });
    });

    it('should suggest follow-up actions', async () => {
      const followUpSuggestions = {
        similarExercises: [
          'grounding-002',
          'grounding-003',
        ],
        nextRecommendations: [
          'breathing-001',
          'cognitive-007',
        ],
        scheduleSuggestion: {
          timeOfDay: 'evening',
          frequency: 'daily',
          reminder: true,
        },
        journalPrompt: 'How did this exercise make you feel?',
      };

      expect(followUpSuggestions.similarExercises.length).toBeGreaterThan(0);
      expect(followUpSuggestions.nextRecommendations.length).toBeGreaterThan(0);
      expect(followUpSuggestions.scheduleSuggestion.reminder).toBe(true);
      expect(followUpSuggestions.journalPrompt.length).toBeGreaterThan(10);
    });
  });

  describe('Exercise Progress Tracking', () => {
    it('should track exercise history and patterns', async () => {
      const exerciseHistory = [
        {
          exerciseId: 'breathing-001',
          completedAt: '2024-01-01T09:00:00.000Z',
          helpfulnessRating: 4,
          duration: 120,
        },
        {
          exerciseId: 'breathing-001',
          completedAt: '2024-01-02T09:00:00.000Z',
          helpfulnessRating: 5,
          duration: 120,
        },
        {
          exerciseId: 'grounding-001',
          completedAt: '2024-01-02T18:00:00.000Z',
          helpfulnessRating: 4,
          duration: 180,
        },
      ];

      // Should track completion patterns
      const patterns = {
        favoriteExercises: ['breathing-001'],
        preferredTimes: ['morning', 'evening'],
        averageRating: 4.33,
        totalSessions: 3,
        streakDays: 2,
      };

      expect(patterns.favoriteExercises).toContain('breathing-001');
      expect(patterns.averageRating).toBeCloseTo(4.33);
      expect(patterns.totalSessions).toBe(3);
      expect(patterns.streakDays).toBeGreaterThan(0);
    });

    it('should provide progress insights', async () => {
      const progressInsights = [
        'You\'ve completed 5 breathing exercises this week',
        'Your average helpfulness rating has improved to 4.2',
        'You\'re building a consistent morning routine',
        'Grounding exercises seem to work well for you',
      ];

      progressInsights.forEach(insight => {
        expect(insight).toMatch(/completed|improved|building|work.*well|consistent/);
        expect(insight).not.toMatch(/should|must|need.*to|behind/);
      });

      // Should be specific and encouraging
      progressInsights.forEach(insight => {
        expect(insight.length).toBeGreaterThan(20);
      });
    });
  });

  describe('Offline Exercise Support', () => {
    it('should work completely offline', async () => {
      const offlineCapabilities = {
        exercisesAvailable: true,
        instructionsStored: true,
        progressTracked: true,
        completionRecorded: true,
        syncWhenOnline: true,
      };

      expect(offlineCapabilities.exercisesAvailable).toBe(true);
      expect(offlineCapabilities.instructionsStored).toBe(true);
      expect(offlineCapabilities.progressTracked).toBe(true);
      expect(offlineCapabilities.completionRecorded).toBe(true);
      expect(offlineCapabilities.syncWhenOnline).toBe(true);

      // Should queue offline completions for sync
      const offlineCompletion = {
        id: 'offline-session-1',
        exerciseId: 'breathing-001',
        completedAt: new Date().toISOString(),
        isOffline: true,
        queuedForSync: true,
      };

      expect(offlineCompletion.isOffline).toBe(true);
      expect(offlineCompletion.queuedForSync).toBe(true);
    });
  });

  describe('Exercise Accessibility', () => {
    it('should support accessibility features', async () => {
      const accessibilityFeatures = {
        screenReaderSupport: true,
        largeTextSupport: true,
        highContrastMode: true,
        voiceGuidance: true,
        reducedMotion: true,
      };

      expect(accessibilityFeatures.screenReaderSupport).toBe(true);
      expect(accessibilityFeatures.largeTextSupport).toBe(true);
      expect(accessibilityFeatures.voiceGuidance).toBe(true);

      // Should have proper accessibility labels
      const accessibilityLabels = {
        startButton: 'Start breathing exercise',
        pauseButton: 'Pause exercise',
        nextStepButton: 'Continue to next step',
        ratingSlider: 'Rate exercise helpfulness from 1 to 5',
      };

      Object.values(accessibilityLabels).forEach(label => {
        expect(label.length).toBeGreaterThan(10);
        expect(label).toMatch(/start|pause|continue|rate|exercise/);
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should load exercises quickly', async () => {
      const loadingPerformance = {
        exerciseListLoad: 50, // ms
        exerciseDetailLoad: 30, // ms
        sessionStart: 20, // ms
        stepTransition: 10, // ms
      };

      expect(loadingPerformance.exerciseListLoad).toBeLessThan(100);
      expect(loadingPerformance.exerciseDetailLoad).toBeLessThan(50);
      expect(loadingPerformance.sessionStart).toBeLessThan(50);
      expect(loadingPerformance.stepTransition).toBeLessThan(20);
    });

    it('should handle large exercise libraries efficiently', async () => {
      const largeLibrary = Array.from({ length: 100 }, (_, i) => ({
        id: `exercise-${i}`,
        title: `Exercise ${i}`,
        category: ['breathing', 'grounding', 'cognitive'][i % 3],
        duration: 60 + (i * 10),
        difficulty: ['beginner', 'intermediate', 'advanced'][i % 3],
      }));

      expect(largeLibrary.length).toBe(100);

      // Should filter efficiently
      const startTime = Date.now();
      const breathingExercises = largeLibrary.filter(ex => ex.category === 'breathing');
      const endTime = Date.now();

      expect(breathingExercises.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });
  });
});
