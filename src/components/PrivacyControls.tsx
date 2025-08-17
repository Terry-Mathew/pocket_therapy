/**
 * Privacy Controls Component
 * 
 * Comprehensive privacy settings with clear explanations,
 * local-only mode, data retention, and account deletion options
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

interface PrivacySettings {
  localOnlyMode: boolean;
  dataRetentionDays: number;
  shareAnalytics: boolean;
  shareUsageData: boolean;
  autoDeleteOldData: boolean;
  encryptLocalData: boolean;
}

interface PrivacyControlsProps {
  onSettingsChange?: (settings: PrivacySettings) => void;
}

export const PrivacyControls: React.FC<PrivacyControlsProps> = ({
  onSettingsChange,
}) => {
  const { actions, user } = useAppStore();
  
  const [settings, setSettings] = useState<PrivacySettings>({
    localOnlyMode: false,
    dataRetentionDays: 90,
    shareAnalytics: false,
    shareUsageData: false,
    autoDeleteOldData: true,
    encryptLocalData: true,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      // Load privacy settings from storage
      // This would be implemented based on your storage strategy
      setLoading(false);
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: keyof PrivacySettings, value: boolean | number) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // Save to storage
      await actions.updateUserProfile({ privacySettings: newSettings });
      onSettingsChange?.(newSettings);
      
      // Show confirmation for important changes
      if (key === 'localOnlyMode' && value === true) {
        Alert.alert(
          'Local-Only Mode Enabled',
          'Your data will now stay completely on your device. You can change this anytime.',
          [{ text: 'Got it' }]
        );
      }
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
      Alert.alert('Update Failed', 'Failed to update privacy setting. Please try again.');
    }
  };

  const handleDataRetentionChange = (days: number) => {
    Alert.alert(
      'Change Data Retention',
      `Keep mood logs and exercise data for ${days} days?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => handleSettingChange('dataRetentionDays', days),
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your mood logs, exercise history, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.deleteAllUserData();
              Alert.alert(
                'Data Deleted',
                'All your data has been permanently deleted.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Your account and all data will be permanently deleted. You will need to create a new account to use PocketTherapy again.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await actions.deleteUserAccount();
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been permanently deleted.',
                        [{ text: 'OK' }]
                      );
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete account. Please contact support.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderPrivacyToggle = (
    title: string,
    description: string,
    key: keyof PrivacySettings,
    value: boolean,
    isRecommended?: boolean
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingTitle}>{title}</Text>
          {isRecommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}
        </View>
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

  const renderDataRetentionSelector = () => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>Data Retention Period</Text>
        <Text style={styles.settingDescription}>
          How long to keep your mood logs and exercise history
        </Text>
        <View style={styles.retentionOptions}>
          {[30, 90, 180, 365].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.retentionOption,
                settings.dataRetentionDays === days && styles.retentionOptionActive,
              ]}
              onPress={() => handleDataRetentionChange(days)}
            >
              <Text style={[
                styles.retentionOptionText,
                settings.dataRetentionDays === days && styles.retentionOptionTextActive,
              ]}>
                {days} days
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy Controls</Text>
        <Text style={styles.subtitle}>
          You're in complete control of your data and privacy
        </Text>
      </View>

      {/* Data Storage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Storage</Text>
        
        {renderPrivacyToggle(
          'Local-Only Mode',
          'Keep all data on your device only. No cloud sync or backup.',
          'localOnlyMode',
          settings.localOnlyMode,
          true
        )}
        
        {renderPrivacyToggle(
          'Encrypt Local Data',
          'Encrypt mood logs and personal data stored on your device.',
          'encryptLocalData',
          settings.encryptLocalData,
          true
        )}
        
        {renderPrivacyToggle(
          'Auto-Delete Old Data',
          'Automatically delete data older than your retention period.',
          'autoDeleteOldData',
          settings.autoDeleteOldData
        )}
      </View>

      {/* Data Retention */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Retention</Text>
        {renderDataRetentionSelector()}
      </View>

      {/* Data Sharing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Sharing</Text>
        
        {renderPrivacyToggle(
          'Share Anonymous Analytics',
          'Help improve the app by sharing anonymous usage patterns.',
          'shareAnalytics',
          settings.shareAnalytics
        )}
        
        {renderPrivacyToggle(
          'Share Usage Data',
          'Share anonymized data to help improve mental health research.',
          'shareUsageData',
          settings.shareUsageData
        )}
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAllData}>
          <Text style={styles.actionButtonText}>Delete All My Data</Text>
          <Text style={styles.actionButtonDescription}>
            Permanently delete all mood logs, exercises, and preferences
          </Text>
        </TouchableOpacity>
        
        {user && !('isGuest' in user && user.isGuest) && (
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
            <Text style={styles.dangerButtonText}>Delete My Account</Text>
            <Text style={styles.dangerButtonDescription}>
              Permanently delete your account and all associated data
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Privacy Information */}
      <View style={styles.privacyInfo}>
        <Text style={styles.privacyTitle}>Your Privacy Rights</Text>
        <Text style={styles.privacyText}>
          • You own your data completely{'\n'}
          • We never sell or share personal information{'\n'}
          • Local-only mode keeps everything on your device{'\n'}
          • You can export or delete your data anytime{'\n'}
          • No tracking or advertising{'\n'}
          • Open source and transparent
        </Text>
      </View>

      {/* Contact */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Questions about privacy?</Text>
        <Text style={styles.contactText}>
          Contact us at privacy@pockettherapy.app for any privacy-related questions or concerns.
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
  section: {
    marginBottom: spacing['6x'],
  },
  sectionTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['3x'],
    paddingHorizontal: spacing['4x'],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['1x'],
  },
  settingTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginRight: spacing['2x'],
  },
  recommendedBadge: {
    backgroundColor: therapeuticColors.success + '20',
    paddingHorizontal: spacing['2x'],
    paddingVertical: spacing['1x'],
    borderRadius: 4,
  },
  recommendedText: {
    ...typography.caption,
    color: therapeuticColors.success,
    fontWeight: '600',
    fontSize: 10,
  },
  settingDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
  retentionOptions: {
    flexDirection: 'row',
    gap: spacing['2x'],
    marginTop: spacing['3x'],
  },
  retentionOption: {
    backgroundColor: therapeuticColors.border + '40',
    paddingHorizontal: spacing['3x'],
    paddingVertical: spacing['2x'],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  retentionOptionActive: {
    backgroundColor: therapeuticColors.primary + '20',
    borderColor: therapeuticColors.primary,
  },
  retentionOptionText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  retentionOptionTextActive: {
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: therapeuticColors.surface,
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['3x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  actionButtonText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  actionButtonDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
  dangerButton: {
    backgroundColor: therapeuticColors.error + '10',
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['3x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.error + '40',
  },
  dangerButtonText: {
    ...typography.body,
    color: therapeuticColors.error,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  dangerButtonDescription: {
    ...typography.caption,
    color: therapeuticColors.error,
    lineHeight: 18,
  },
  privacyInfo: {
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
  contactSection: {
    backgroundColor: therapeuticColors.surface,
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['6x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  contactTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['2x'],
  },
  contactText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
});

export default PrivacyControls;
