/**
 * Data Migration Modal
 * 
 * Guides users through migrating their guest data
 * to an authenticated account with clear explanations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { dataMigrationService, MigrationResult } from '../services/dataMigrationService';

interface DataMigrationModalProps {
  visible: boolean;
  userId: string;
  onComplete: (result: MigrationResult) => void;
  onSkip: () => void;
}

type MigrationStep = 'intro' | 'migrating' | 'success' | 'error';

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({
  visible,
  userId,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState<MigrationStep>('intro');
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [hasGuestData, setHasGuestData] = useState(false);

  useEffect(() => {
    if (visible) {
      checkForGuestData();
    }
  }, [visible]);

  const checkForGuestData = async () => {
    try {
      const hasData = await dataMigrationService.hasGuestDataToMigrate();
      setHasGuestData(hasData);
      
      if (!hasData) {
        // No data to migrate, complete immediately
        onComplete({
          success: true,
          migratedItems: { moodLogs: 0, exerciseSessions: 0, preferences: false, favorites: 0 },
          conflicts: [],
          errors: [],
        });
      }
    } catch (error) {
      console.error('Failed to check for guest data:', error);
    }
  };

  const handleStartMigration = async () => {
    setCurrentStep('migrating');
    
    try {
      const result = await dataMigrationService.migrateGuestData(userId, {
        conflictResolution: 'merge_all',
        preserveTimestamps: true,
        backupBeforeMigration: true,
      });

      setMigrationResult(result);
      setCurrentStep(result.success ? 'success' : 'error');
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationResult({
        success: false,
        migratedItems: { moodLogs: 0, exerciseSessions: 0, preferences: false, favorites: 0 },
        conflicts: [],
        errors: [error.message],
      });
      setCurrentStep('error');
    }
  };

  const handleComplete = () => {
    if (migrationResult) {
      onComplete(migrationResult);
    }
  };

  const renderIntroStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Keep Your Progress</Text>
      <Text style={styles.description}>
        We found some data from when you were using the app as a guest. 
        Would you like to keep this progress in your new account?
      </Text>

      <View style={styles.dataPreview}>
        <Text style={styles.dataPreviewTitle}>What we'll save:</Text>
        <Text style={styles.dataPreviewItem}>• Your mood check-ins</Text>
        <Text style={styles.dataPreviewItem}>• Completed exercises</Text>
        <Text style={styles.dataPreviewItem}>• Your preferences</Text>
        <Text style={styles.dataPreviewItem}>• Favorite exercises</Text>
      </View>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          Your data will be securely transferred and the temporary guest data will be removed.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Start Fresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.migrateButton} onPress={handleStartMigration}>
          <Text style={styles.migrateButtonText}>Keep My Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMigratingStep = () => (
    <View style={styles.stepContainer}>
      <ActivityIndicator size="large" color={therapeuticColors.primary} />
      <Text style={styles.title}>Transferring Your Data</Text>
      <Text style={styles.description}>
        We're carefully moving your progress to your new account. 
        This will just take a moment...
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.successEmoji}>✨</Text>
      <Text style={styles.title}>All Set!</Text>
      <Text style={styles.description}>
        Your progress has been successfully transferred to your account.
      </Text>

      {migrationResult && (
        <View style={styles.migrationSummary}>
          <Text style={styles.summaryTitle}>What we transferred:</Text>
          {migrationResult.migratedItems.moodLogs > 0 && (
            <Text style={styles.summaryItem}>
              ✓ {migrationResult.migratedItems.moodLogs} mood check-ins
            </Text>
          )}
          {migrationResult.migratedItems.exerciseSessions > 0 && (
            <Text style={styles.summaryItem}>
              ✓ {migrationResult.migratedItems.exerciseSessions} exercise sessions
            </Text>
          )}
          {migrationResult.migratedItems.preferences && (
            <Text style={styles.summaryItem}>✓ Your preferences</Text>
          )}
          {migrationResult.migratedItems.favorites > 0 && (
            <Text style={styles.summaryItem}>
              ✓ {migrationResult.migratedItems.favorites} favorite exercises
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
        <Text style={styles.completeButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.errorEmoji}>⚠️</Text>
      <Text style={styles.title}>Something Went Wrong</Text>
      <Text style={styles.description}>
        We had trouble transferring some of your data. Don't worry - 
        your guest data is still safe.
      </Text>

      {migrationResult && migrationResult.errors.length > 0 && (
        <ScrollView style={styles.errorList}>
          {migrationResult.errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Start Fresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.retryButton} onPress={handleStartMigration}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro':
        return renderIntroStep();
      case 'migrating':
        return renderMigratingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderIntroStep();
    }
  };

  if (!visible || !hasGuestData) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {renderCurrentStep()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4x'],
  },
  modal: {
    backgroundColor: therapeuticColors.background,
    borderRadius: 20,
    padding: spacing['6x'],
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  stepContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['3x'],
  },
  description: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['4x'],
  },
  dataPreview: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['4x'],
    marginBottom: spacing['4x'],
    width: '100%',
  },
  dataPreviewTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['2x'],
  },
  dataPreviewItem: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['1x'],
  },
  privacyNote: {
    backgroundColor: therapeuticColors.primary + '10',
    borderRadius: 8,
    padding: spacing['3x'],
    marginBottom: spacing['4x'],
    width: '100%',
  },
  privacyText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing['3x'],
    width: '100%',
  },
  skipButton: {
    flex: 1,
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    backgroundColor: therapeuticColors.surface,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  migrateButton: {
    flex: 1,
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    backgroundColor: therapeuticColors.primary,
    alignItems: 'center',
  },
  migrateButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: spacing['3x'],
  },
  migrationSummary: {
    backgroundColor: therapeuticColors.success + '10',
    borderRadius: 12,
    padding: spacing['4x'],
    marginBottom: spacing['4x'],
    width: '100%',
  },
  summaryTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['2x'],
  },
  summaryItem: {
    ...typography.body,
    color: therapeuticColors.success,
    marginBottom: spacing['1x'],
  },
  completeButton: {
    paddingVertical: spacing['3x'],
    paddingHorizontal: spacing['6x'],
    borderRadius: 12,
    backgroundColor: therapeuticColors.primary,
    alignItems: 'center',
  },
  completeButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: spacing['3x'],
  },
  errorList: {
    backgroundColor: therapeuticColors.error + '10',
    borderRadius: 8,
    padding: spacing['3x'],
    marginBottom: spacing['4x'],
    maxHeight: 120,
    width: '100%',
  },
  errorText: {
    ...typography.caption,
    color: therapeuticColors.error,
    marginBottom: spacing['1x'],
  },
  retryButton: {
    flex: 1,
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    backgroundColor: therapeuticColors.warning,
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
});

export default DataMigrationModal;
