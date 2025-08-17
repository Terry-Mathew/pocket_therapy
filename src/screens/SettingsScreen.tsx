/**
 * Settings Screen
 * 
 * Comprehensive settings dashboard with organized sections
 * for privacy, notifications, accessibility, and data management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';
import PrivacyControls from '../components/PrivacyControls';
import DataExportImport from '../components/DataExportImport';
import NotificationSettings from '../components/NotificationSettings';
import AISettings from '../components/AISettings';
import AISafetyMonitor from '../components/AISafetyMonitor';

interface SettingsScreenProps {
  navigation: any;
}

type SettingsModal = 
  | 'privacy' 
  | 'notifications' 
  | 'ai' 
  | 'data' 
  | 'safety' 
  | 'accessibility' 
  | 'about' 
  | null;

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const { user, settings } = useAppStore();
  const [activeModal, setActiveModal] = useState<SettingsModal>(null);

  const settingsSections = [
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'privacy',
          title: 'Privacy Controls',
          description: 'Data retention, local-only mode, and account deletion',
          icon: '🔒',
          onPress: () => setActiveModal('privacy'),
        },
        {
          id: 'data',
          title: 'Data Export & Import',
          description: 'Backup and restore your data',
          icon: '📁',
          onPress: () => setActiveModal('data'),
        },
      ],
    },
    {
      title: 'Personalization',
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Gentle reminders and check-in nudges',
          icon: '🔔',
          onPress: () => setActiveModal('notifications'),
        },
        {
          id: 'ai',
          title: 'AI Features',
          description: 'Personalized recommendations and insights',
          icon: '✨',
          onPress: () => setActiveModal('ai'),
        },
        {
          id: 'accessibility',
          title: 'Accessibility',
          description: 'Font size, contrast, and screen reader settings',
          icon: '♿',
          onPress: () => setActiveModal('accessibility'),
        },
      ],
    },
    {
      title: 'Support & Information',
      items: [
        {
          id: 'crisis',
          title: 'Crisis Resources',
          description: 'Emergency contacts and support information',
          icon: '🆘',
          onPress: () => navigation.navigate('CrisisResources'),
        },
        {
          id: 'safety',
          title: 'AI Safety Monitor',
          description: 'Content filtering and safety statistics',
          icon: '🛡️',
          onPress: () => setActiveModal('safety'),
        },
        {
          id: 'about',
          title: 'About PocketTherapy',
          description: 'Version info, credits, and open source licenses',
          icon: 'ℹ️',
          onPress: () => setActiveModal('about'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
    >
      <View style={styles.settingIcon}>
        <Text style={styles.settingIconText}>{item.icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      <View style={styles.settingArrow}>
        <Text style={styles.settingArrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUserInfo = () => (
    <View style={styles.userInfo}>
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>
          {user && 'email' in user ? user.email?.[0]?.toUpperCase() || '?' : '👤'}
        </Text>
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>
          {user && 'email' in user ? user.email : 'Guest User'}
        </Text>
        <Text style={styles.userStatus}>
          {user && 'isGuest' in user && user.isGuest 
            ? 'Local-only account' 
            : 'Synced account'}
        </Text>
      </View>
      {user && 'isGuest' in user && user.isGuest && (
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.upgradeButtonText}>Sign Up</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAboutModal = () => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>About PocketTherapy</Text>
        <TouchableOpacity onPress={() => setActiveModal(null)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.aboutContent}>
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Version</Text>
          <Text style={styles.aboutText}>1.0.0 (Beta)</Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Mission</Text>
          <Text style={styles.aboutText}>
            PocketTherapy provides gentle, accessible mental health support 
            with complete privacy and user control. We believe everyone deserves 
            compassionate tools for emotional wellbeing.
          </Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Privacy First</Text>
          <Text style={styles.aboutText}>
            • Your data stays on your device by default{'\n'}
            • No tracking or advertising{'\n'}
            • Open source and transparent{'\n'}
            • HIPAA-level privacy protections
          </Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Credits</Text>
          <Text style={styles.aboutText}>
            Built with love by the PocketTherapy team.{'\n'}
            Special thanks to mental health professionals who guided our approach.
          </Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Contact</Text>
          <Text style={styles.aboutText}>
            Support: support@pockettherapy.app{'\n'}
            Privacy: privacy@pockettherapy.app{'\n'}
            Website: pockettherapy.app
          </Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderAccessibilityModal = () => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Accessibility Settings</Text>
        <TouchableOpacity onPress={() => setActiveModal(null)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.accessibilityContent}>
        <Text style={styles.comingSoonText}>
          Accessibility settings coming soon!{'\n\n'}
          We're working on:{'\n'}
          • Font size controls{'\n'}
          • High contrast mode{'\n'}
          • Screen reader optimizations{'\n'}
          • Voice navigation{'\n'}
          • Reduced motion options
        </Text>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={therapeuticColors.background} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your PocketTherapy experience
          </Text>
        </View>

        {renderUserInfo()}

        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(renderSettingItem)}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            PocketTherapy v1.0.0 • Made with 💙 for mental wellness
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {activeModal === 'privacy' && (
            <PrivacyControls onSettingsChange={() => {}} />
          )}
          {activeModal === 'notifications' && (
            <NotificationSettings onClose={() => setActiveModal(null)} />
          )}
          {activeModal === 'ai' && (
            <AISettings onSettingsChange={() => {}} />
          )}
          {activeModal === 'data' && (
            <DataExportImport onDataImported={() => setActiveModal(null)} />
          )}
          {activeModal === 'safety' && (
            <AISafetyMonitor onClose={() => setActiveModal(null)} />
          )}
          {activeModal === 'about' && renderAboutModal()}
          {activeModal === 'accessibility' && renderAccessibilityModal()}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing['4x'],
    paddingBottom: spacing['6x'],
  },
  title: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
  },
  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 22,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: therapeuticColors.surface,
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['6x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: therapeuticColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing['3x'],
  },
  userAvatarText: {
    ...typography.h4,
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  userStatus: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  upgradeButton: {
    backgroundColor: therapeuticColors.primary,
    paddingHorizontal: spacing['3x'],
    paddingVertical: spacing['2x'],
    borderRadius: 8,
  },
  upgradeButtonText: {
    ...typography.caption,
    color: therapeuticColors.background,
    fontWeight: '600',
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
    backgroundColor: therapeuticColors.surface,
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['4x'],
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['2x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: therapeuticColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing['3x'],
  },
  settingIconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
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
  settingArrow: {
    marginLeft: spacing['2x'],
  },
  settingArrowText: {
    ...typography.h4,
    color: therapeuticColors.textTertiary,
  },
  footer: {
    padding: spacing['4x'],
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  modalContent: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['4x'],
    borderBottomWidth: 1,
    borderBottomColor: therapeuticColors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
  },
  closeButton: {
    ...typography.h4,
    color: therapeuticColors.textSecondary,
    padding: spacing['2x'],
  },
  aboutContent: {
    flex: 1,
    padding: spacing['4x'],
  },
  aboutSection: {
    marginBottom: spacing['4x'],
  },
  aboutTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'],
  },
  aboutText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 22,
  },
  accessibilityContent: {
    flex: 1,
    padding: spacing['4x'],
  },
  comingSoonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default SettingsScreen;
