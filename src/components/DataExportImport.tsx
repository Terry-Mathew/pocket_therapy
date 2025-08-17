/**
 * Data Export/Import Component
 * 
 * User interface for exporting and importing personal data
 * with privacy controls and clear explanations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { dataExportService } from '../services/dataExportService';

interface DataExportImportProps {
  onDataImported?: () => void;
}

export const DataExportImport: React.FC<DataExportImportProps> = ({
  onDataImported,
}) => {
  const [exportSettings, setExportSettings] = useState({
    includePersonalData: true,
    includeMoodLogs: true,
    includeExercises: true,
    includeSettings: true,
    dateRangeEnabled: false,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);

      // Show confirmation dialog
      Alert.alert(
        'Export Your Data',
        `This will create a file containing your ${exportSettings.includePersonalData ? 'personal ' : 'anonymized '}data. The file will be saved to your device.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export',
            onPress: async () => {
              const result = await dataExportService.exportUserData(
                exportSettings.includePersonalData
              );

              if (result.success && result.filePath) {
                Alert.alert(
                  'Export Complete',
                  'Your data has been exported successfully. Would you like to share the file?',
                  [
                    { text: 'Keep Local', style: 'cancel' },
                    {
                      text: 'Share',
                      onPress: async () => {
                        const shared = await dataExportService.shareExportedData(result.filePath!);
                        if (!shared) {
                          Alert.alert('Share Failed', 'Unable to share the file. It has been saved to your device.');
                        }
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Export Failed', result.error || 'Failed to export data. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsImporting(true);

      Alert.alert(
        'Import Data',
        'Choose how to handle existing data:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace All',
            style: 'destructive',
            onPress: () => performImport(false),
          },
          {
            text: 'Merge',
            onPress: () => performImport(true),
          },
        ]
      );
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const performImport = async (mergeWithExisting: boolean) => {
    try {
      const result = await dataExportService.importUserData(mergeWithExisting);

      if (result.success) {
        let message = `Successfully imported:\n• ${result.imported.moodLogs} mood logs\n• ${result.imported.exercises} exercise sessions`;
        
        if (result.imported.settings) {
          message += '\n• App settings';
        }

        if (result.warnings.length > 0) {
          message += '\n\nWarnings:\n' + result.warnings.join('\n');
        }

        Alert.alert('Import Complete', message, [
          {
            text: 'OK',
            onPress: () => onDataImported?.(),
          },
        ]);
      } else {
        Alert.alert(
          'Import Failed',
          'Errors:\n' + result.errors.join('\n'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Import Failed', 'An unexpected error occurred during import.');
    }
  };

  const renderExportOption = (
    title: string,
    description: string,
    key: keyof typeof exportSettings,
    value: boolean
  ) => (
    <View style={styles.optionItem}>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => 
          setExportSettings(prev => ({ ...prev, [key]: newValue }))
        }
        trackColor={{
          false: therapeuticColors.border,
          true: therapeuticColors.primary + '40',
        }}
        thumbColor={value ? therapeuticColors.primary : therapeuticColors.textTertiary}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Data Export & Import</Text>
        <Text style={styles.subtitle}>
          Backup your data or transfer it between devices
        </Text>
      </View>

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Your Data</Text>
        <Text style={styles.sectionDescription}>
          Create a backup file of your mood logs, exercises, and settings
        </Text>

        {renderExportOption(
          'Include Personal Data',
          'Include notes, triggers, and other personal information',
          'includePersonalData',
          exportSettings.includePersonalData
        )}

        {renderExportOption(
          'Include Mood Logs',
          'Export all your mood check-ins and patterns',
          'includeMoodLogs',
          exportSettings.includeMoodLogs
        )}

        {renderExportOption(
          'Include Exercise History',
          'Export completed exercises and session data',
          'includeExercises',
          exportSettings.includeExercises
        )}

        {renderExportOption(
          'Include App Settings',
          'Export your preferences and configuration',
          'includeSettings',
          exportSettings.includeSettings
        )}

        <TouchableOpacity 
          style={[styles.exportButton, isExporting && styles.buttonDisabled]} 
          onPress={handleExportData}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color={therapeuticColors.background} />
          ) : (
            <Text style={styles.exportButtonText}>Export Data</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Import Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Import Data</Text>
        <Text style={styles.sectionDescription}>
          Restore data from a previous export or another device
        </Text>

        <View style={styles.importInfo}>
          <Text style={styles.importInfoTitle}>Import Options:</Text>
          <Text style={styles.importInfoText}>
            • <Text style={styles.bold}>Replace All:</Text> Delete current data and replace with imported data{'\n'}
            • <Text style={styles.bold}>Merge:</Text> Add imported data to existing data (duplicates will be skipped)
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.importButton, isImporting && styles.buttonDisabled]} 
          onPress={handleImportData}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator size="small" color={therapeuticColors.background} />
          ) : (
            <Text style={styles.importButtonText}>Import Data</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Text style={styles.privacyTitle}>Privacy & Security</Text>
        <Text style={styles.privacyText}>
          • Export files contain your personal data - keep them secure{'\n'}
          • Files are saved locally on your device{'\n'}
          • No data is sent to external servers during export/import{'\n'}
          • You can choose to exclude personal information from exports{'\n'}
          • Import validates data integrity before processing
        </Text>
      </View>

      {/* File Format Info */}
      <View style={styles.formatInfo}>
        <Text style={styles.formatTitle}>File Format</Text>
        <Text style={styles.formatText}>
          Exports are saved as JSON files that can be opened with any text editor. 
          The format is human-readable and includes metadata about your export settings.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  header: {
    padding: spacing['4x'],
    paddingBottom: spacing['6x'],
  },
  title: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
  },
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing['6x'],
  },
  sectionTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
    paddingHorizontal: spacing['4x'],
  },
  sectionDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['4x'],
    paddingHorizontal: spacing['4x'],
    lineHeight: 22,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: therapeuticColors.surface,
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['4x'],
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['2x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  optionContent: {
    flex: 1,
    marginRight: spacing['3x'],
  },
  optionTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  optionDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
  exportButton: {
    backgroundColor: therapeuticColors.primary,
    marginHorizontal: spacing['4x'],
    marginTop: spacing['4x'],
    paddingVertical: spacing['4x'],
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  importButton: {
    backgroundColor: therapeuticColors.secondary,
    marginHorizontal: spacing['4x'],
    marginTop: spacing['4x'],
    paddingVertical: spacing['4x'],
    borderRadius: 12,
    alignItems: 'center',
  },
  importButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  importInfo: {
    backgroundColor: therapeuticColors.surface,
    marginHorizontal: spacing['4x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  importInfoTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['2x'],
  },
  importInfoText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
    color: therapeuticColors.textPrimary,
  },
  privacyNotice: {
    backgroundColor: therapeuticColors.primary + '10',
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['4x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: therapeuticColors.primary,
  },
  privacyTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['2x'],
  },
  privacyText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
  formatInfo: {
    backgroundColor: therapeuticColors.surface,
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['6x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  formatTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['2x'],
  },
  formatText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
});

export default DataExportImport;
