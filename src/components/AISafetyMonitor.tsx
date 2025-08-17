/**
 * AI Safety Monitor Component
 * 
 * Provides monitoring and management interface for AI safety
 * including content filtering statistics and safety settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';

interface AISafetyMonitorProps {
  onClose?: () => void;
}

export const AISafetyMonitor: React.FC<AISafetyMonitorProps> = ({
  onClose,
}) => {
  const { actions } = useAppStore();
  
  const [safetyStats, setSafetyStats] = useState<any>(null);
  const [safetySettings, setSafetySettings] = useState({
    strictMode: true,
    requireDisclaimer: true,
    blockHarmfulContent: true,
    requireTherapeuticLanguage: true,
    logAllContent: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = async () => {
    try {
      setLoading(true);
      const stats = await actions.getAISafetyStats();
      setSafetyStats(stats);
    } catch (error) {
      console.error('Failed to load safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    try {
      const newSettings = { ...safetySettings, [key]: value };
      setSafetySettings(newSettings);
      await actions.updateAISafetySettings(newSettings);
    } catch (error) {
      console.error('Failed to update safety setting:', error);
      Alert.alert('Update Failed', 'Failed to update safety setting. Please try again.');
    }
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Safety Logs',
      'This will permanently delete all AI safety logs and reports. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Logs',
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.clearAISafetyLogs();
              await loadSafetyData();
              Alert.alert('Success', 'Safety logs have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear safety logs.');
            }
          },
        },
      ]
    );
  };

  const renderStatCard = (title: string, value: number, color: string, description?: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {description && <Text style={styles.statDescription}>{description}</Text>}
    </View>
  );

  const renderSafetyToggle = (
    title: string,
    description: string,
    key: string,
    value: boolean
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => handleSettingChange(key, newValue)}
        trackColor={{
          false: therapeuticColors.border,
          true: therapeuticColors.primary + '40',
        }}
        thumbColor={value ? therapeuticColors.primary : therapeuticColors.textTertiary}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading safety data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Safety Monitor</Text>
        <Text style={styles.subtitle}>
          Content filtering and safety monitoring for AI-generated content
        </Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Safety Statistics */}
      {safetyStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Statistics</Text>
          
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Total Reports',
              safetyStats.totalReports,
              therapeuticColors.primary,
              'All AI content analyzed'
            )}
            
            {renderStatCard(
              'Approved',
              safetyStats.approvedCount,
              therapeuticColors.success,
              'Content passed safety checks'
            )}
            
            {renderStatCard(
              'Rejected',
              safetyStats.rejectedCount,
              therapeuticColors.warning,
              'Content blocked for safety'
            )}
            
            {renderStatCard(
              'Critical Issues',
              safetyStats.criticalIssues,
              therapeuticColors.error,
              'High-risk content detected'
            )}
          </View>

          {safetyStats.totalReports > 0 && (
            <View style={styles.approvalRate}>
              <Text style={styles.approvalRateLabel}>Approval Rate</Text>
              <Text style={styles.approvalRateValue}>
                {((safetyStats.approvedCount / safetyStats.totalReports) * 100).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Recent Blocked Content */}
      {safetyStats?.recentBlocked?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Blocked Content</Text>
          {safetyStats.recentBlocked.slice(0, 5).map((item: any, index: number) => (
            <View key={index} style={styles.blockedItem}>
              <View style={styles.blockedHeader}>
                <Text style={styles.blockedType}>{item.contentType}</Text>
                <Text style={[
                  styles.blockedSeverity,
                  { color: item.severity === 'critical' ? therapeuticColors.error : therapeuticColors.warning }
                ]}>
                  {item.severity}
                </Text>
              </View>
              <Text style={styles.blockedIssues}>
                Issues: {item.issues.join(', ')}
              </Text>
              <Text style={styles.blockedTime}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Safety Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Settings</Text>
        
        {renderSafetyToggle(
          'Strict Mode',
          'Enable the most restrictive content filtering',
          'strictMode',
          safetySettings.strictMode
        )}
        
        {renderSafetyToggle(
          'Require Disclaimers',
          'Ensure all recommendations include appropriate disclaimers',
          'requireDisclaimer',
          safetySettings.requireDisclaimer
        )}
        
        {renderSafetyToggle(
          'Block Harmful Content',
          'Automatically block content with harmful language or suggestions',
          'blockHarmfulContent',
          safetySettings.blockHarmfulContent
        )}
        
        {renderSafetyToggle(
          'Require Therapeutic Language',
          'Ensure all content uses supportive, therapeutic language',
          'requireTherapeuticLanguage',
          safetySettings.requireTherapeuticLanguage
        )}
        
        {renderSafetyToggle(
          'Log All Content',
          'Keep detailed logs of all AI-generated content for monitoring',
          'logAllContent',
          safetySettings.logAllContent
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity style={styles.refreshButton} onPress={loadSafetyData}>
          <Text style={styles.refreshButtonText}>Refresh Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={handleClearLogs}>
          <Text style={styles.clearButtonText}>Clear Safety Logs</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyTitle}>Privacy & Data Handling</Text>
        <Text style={styles.privacyText}>
          • Safety logs are stored locally on the device{'\n'}
          • No personal data is included in safety reports{'\n'}
          • Logs can be cleared at any time{'\n'}
          • Content filtering helps ensure user safety{'\n'}
          • All AI content is validated before being shown to users
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['6x'],
  },
  loadingText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
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
  closeButton: {
    position: 'absolute',
    top: spacing['4x'],
    right: spacing['4x'],
    backgroundColor: therapeuticColors.surface,
    paddingHorizontal: spacing['3x'],
    paddingVertical: spacing['2x'],
    borderRadius: 8,
  },
  closeButtonText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing['6x'],
  },
  sectionTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['3x'],
    paddingHorizontal: spacing['4x'],
  },
  statsGrid: {
    paddingHorizontal: spacing['4x'],
  },
  statCard: {
    backgroundColor: therapeuticColors.surface,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: spacing['4x'],
    marginBottom: spacing['2x'],
  },
  statValue: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    fontWeight: '700',
  },
  statTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginTop: spacing['1x'],
  },
  statDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginTop: spacing['1x'],
  },
  approvalRate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: therapeuticColors.success + '10',
    marginHorizontal: spacing['4x'],
    marginTop: spacing['3x'],
    padding: spacing['4x'],
    borderRadius: 12,
  },
  approvalRateLabel: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
  },
  approvalRateValue: {
    ...typography.h3,
    color: therapeuticColors.success,
    fontWeight: '700',
  },
  blockedItem: {
    backgroundColor: therapeuticColors.surface,
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['2x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  blockedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2x'],
  },
  blockedType: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  blockedSeverity: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  blockedIssues: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['1x'],
  },
  blockedTime: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
  },
  settingItem: {
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
  settingContent: {
    flex: 1,
    marginRight: spacing['3x'],
  },
  settingTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  settingDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
  refreshButton: {
    backgroundColor: therapeuticColors.primary,
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['3x'],
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: therapeuticColors.error,
    marginHorizontal: spacing['4x'],
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  privacyNote: {
    backgroundColor: therapeuticColors.primary + '10',
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['6x'],
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
});

export default AISafetyMonitor;
