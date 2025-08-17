/**
 * Notification Settings Component
 * 
 * Allows users to configure gentle notification preferences
 * with clear explanations and privacy considerations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { notificationService } from '../services/notificationService';

interface NotificationPreferences {
  enabled: boolean;
  morningTime: string;
  eveningTime: string;
  weekdaysOnly: boolean;
  gentleNudges: boolean;
  crisisReminders: boolean;
}

interface NotificationSettingsProps {
  onPreferencesChange?: (preferences: NotificationPreferences) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onPreferencesChange,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    morningTime: '09:00',
    eveningTime: '20:00',
    weekdaysOnly: false,
    gentleNudges: true,
    crisisReminders: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkPermissions();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await notificationService.getPreferences();
      setPreferences(stored);
      onPreferencesChange?.(stored);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const enabled = await notificationService.areNotificationsEnabled();
      setHasPermission(enabled);
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      // Request permissions
      const { status } = await notificationService.requestPermissions();
      if (status !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'To receive gentle reminders, please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // This would open device settings
              console.log('Open device settings');
            }},
          ]
        );
        return;
      }
      setHasPermission(true);
    }

    const newPreferences = { ...preferences, enabled };
    setPreferences(newPreferences);
    await updatePreferences(newPreferences);
  };

  const handleTimeChange = (type: 'morningTime' | 'eveningTime', time: string) => {
    const newPreferences = { ...preferences, [type]: time };
    setPreferences(newPreferences);
    updatePreferences(newPreferences);
  };

  const handleToggleOption = (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    updatePreferences(newPreferences);
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await notificationService.updatePreferences(newPreferences);
      onPreferencesChange?.(newPreferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      Alert.alert(
        'Update Failed',
        'Failed to update notification settings. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert(
        'Test Sent',
        'A test notification should appear shortly.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to send test notification:', error);
      Alert.alert(
        'Test Failed',
        'Failed to send test notification. Please check your settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderTimeSelector = (
    label: string,
    value: string,
    onChange: (time: string) => void
  ) => (
    <View style={styles.timeSelector}>
      <Text style={styles.timeSelectorLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => {
          // This would open a time picker
          // For now, just cycle through common times
          const times = ['07:00', '08:00', '09:00', '10:00', '19:00', '20:00', '21:00', '22:00'];
          const currentIndex = times.indexOf(value);
          const nextIndex = (currentIndex + 1) % times.length;
          onChange(times[nextIndex]);
        }}
      >
        <Text style={styles.timeButtonText}>{value}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Gentle Reminders</Text>
        <Text style={styles.description}>
          Optional notifications to support your mental health journey
        </Text>
      </View>

      {/* Main Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Enable Notifications</Text>
          <Text style={styles.settingDescription}>
            Receive gentle reminders for mood check-ins
          </Text>
        </View>
        <Switch
          value={preferences.enabled}
          onValueChange={handleToggleNotifications}
          trackColor={{
            false: therapeuticColors.border,
            true: therapeuticColors.primary + '40',
          }}
          thumbColor={preferences.enabled ? therapeuticColors.primary : therapeuticColors.textTertiary}
        />
      </View>

      {preferences.enabled && (
        <>
          {/* Time Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Times</Text>
            
            {renderTimeSelector(
              'Morning check-in',
              preferences.morningTime,
              (time) => handleTimeChange('morningTime', time)
            )}
            
            {renderTimeSelector(
              'Evening reflection',
              preferences.eveningTime,
              (time) => handleTimeChange('eveningTime', time)
            )}
          </View>

          {/* Additional Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Weekdays Only</Text>
                <Text style={styles.settingDescription}>
                  Only send reminders Monday through Friday
                </Text>
              </View>
              <Switch
                value={preferences.weekdaysOnly}
                onValueChange={() => handleToggleOption('weekdaysOnly')}
                trackColor={{
                  false: therapeuticColors.border,
                  true: therapeuticColors.primary + '40',
                }}
                thumbColor={preferences.weekdaysOnly ? therapeuticColors.primary : therapeuticColors.textTertiary}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Gentle Nudges</Text>
                <Text style={styles.settingDescription}>
                  Occasional supportive messages based on your patterns
                </Text>
              </View>
              <Switch
                value={preferences.gentleNudges}
                onValueChange={() => handleToggleOption('gentleNudges')}
                trackColor={{
                  false: therapeuticColors.border,
                  true: therapeuticColors.primary + '40',
                }}
                thumbColor={preferences.gentleNudges ? therapeuticColors.primary : therapeuticColors.textTertiary}
              />
            </View>
          </View>

          {/* Test Notification */}
          <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Privacy Note */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyTitle}>Privacy & Control</Text>
        <Text style={styles.privacyText}>
          • Notifications are sent locally from your device{'\n'}
          • No personal data is shared with notification services{'\n'}
          • You can disable notifications anytime in device settings{'\n'}
          • All reminders use gentle, supportive language
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
  description: {
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
  timeSelector: {
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
  timeSelectorLabel: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '500',
  },
  timeButton: {
    backgroundColor: therapeuticColors.primary + '20',
    paddingHorizontal: spacing['3x'],
    paddingVertical: spacing['2x'],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: therapeuticColors.primary,
  },
  timeButtonText: {
    ...typography.body,
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: therapeuticColors.primary,
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['6x'],
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
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

export default NotificationSettings;
