/**
 * Profile Screen for PocketTherapy
 * 
 * User profile management with preferences, settings, and account actions.
 * Supports both authenticated users and guest accounts with upgrade options.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  Input,
  LoadingSpinner,
  ConfirmModal,
} from '../../components';
import { useAuth } from '../../store';
import { theme } from '@constants/theme';
import { triggerHaptic } from '@utils';
import type { User } from '../../types';

const ProfileScreen: React.FC = () => {
  const { 
    user, 
    authState, 
    isGuest, 
    updateProfile, 
    upgradeGuestAccount, 
    signOut, 
    deleteAccount,
    isLoading 
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState((user as any)?.display_name || '');
  const [timezone, setTimezone] = useState((user as any)?.timezone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Used in delete confirmation modal

  const handleEditToggle = async () => {
    await triggerHaptic('light');
    if (isEditing) {
      // Cancel editing - reset values
      setDisplayName((user as any)?.display_name || '');
      setTimezone((user as any)?.timezone || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user || authState !== 'authenticated') return;

    try {
      setIsSaving(true);
      await triggerHaptic('light');

      const updates: Partial<User> = {
        display_name: displayName.trim() || null,
        timezone: timezone.trim() || null,
      };

      await updateProfile(updates);
      setIsEditing(false);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradeAccount = async () => {
    try {
      await triggerHaptic('light');
      await upgradeGuestAccount();
      Alert.alert(
        'Account Upgraded!',
        'Your guest data has been saved to your Google account.'
      );
    } catch (error) {
      console.error('Account upgrade failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await triggerHaptic('light');
      Alert.alert(
        'Sign Out',
        isGuest 
          ? 'Are you sure you want to sign out? Your guest data will be lost.'
          : 'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await signOut();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await triggerHaptic('medium');
      await deleteAccount();
      Alert.alert(
        'Account Deleted',
        'Your account and all data have been permanently deleted.'
      );
    } catch (error) {
      console.error('Account deletion failed:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading profile..." />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(user as any)?.display_name ? (user as any).display_name.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {(user as any)?.display_name || 'Anonymous User'}
            </Text>
            <Text style={styles.profileType}>
              {isGuest ? 'Guest Account' : 'Google Account'}
            </Text>
            {(user as any)?.email && (
              <Text style={styles.profileEmail}>{(user as any).email}</Text>
            )}
          </View>
        </View>

        {isGuest && (
          <View style={styles.upgradeSection}>
            <Text style={styles.upgradeText}>
              Upgrade to save your data across devices
            </Text>
            <PrimaryButton
              title="Upgrade to Google Account"
              onPress={handleUpgradeAccount}
              size="small"
              style={styles.upgradeButton}
            />
          </View>
        )}
      </Card>

      {/* Profile Settings */}
      {authState === 'authenticated' && (
        <Card title="Profile Settings" style={styles.settingsCard}>
          <Input
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            editable={isEditing}
            style={!isEditing && styles.disabledInput}
          />
          
          <Input
            label="Timezone"
            value={timezone}
            onChangeText={setTimezone}
            placeholder="e.g., America/New_York"
            editable={isEditing}
            style={!isEditing && styles.disabledInput}
            helperText="Used for scheduling notifications and insights"
          />

          <View style={styles.editActions}>
            {isEditing ? (
              <View style={styles.editButtonRow}>
                <OutlineButton
                  title="Cancel"
                  onPress={handleEditToggle}
                  style={styles.editButton}
                />
                <PrimaryButton
                  title="Save"
                  onPress={handleSaveProfile}
                  loading={isSaving}
                  style={styles.editButton}
                />
              </View>
            ) : (
              <SecondaryButton
                title="Edit Profile"
                onPress={handleEditToggle}
              />
            )}
          </View>
        </Card>
      )}

      {/* Account Actions */}
      <Card title="Account" style={styles.actionsCard}>
        <View style={styles.actionsList}>
          <SecondaryButton
            title="Sign Out"
            onPress={handleSignOut}
            style={styles.actionButton}
          />
          
          <OutlineButton
            title="Delete Account"
            onPress={() => setShowDeleteModal(true)}
            style={[styles.actionButton, styles.deleteButton]}
          />
        </View>
      </Card>

      {/* Privacy Notice */}
      <Card style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Privacy & Data</Text>
        <Text style={styles.privacyText}>
          {isGuest 
            ? 'Your data is stored locally on this device. Upgrade to sync across devices.'
            : 'Your data is encrypted and synced securely across your devices.'
          }
        </Text>
      </Card>

      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        message={
          isGuest
            ? 'Are you sure you want to delete your guest account? All your data will be permanently lost.'
            : 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        destructive
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.cream,
  },
  content: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.styles.body,
    color: theme.colors.semantic.error.primary,
    textAlign: 'center',
    margin: theme.spacing.lg,
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.sage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    ...theme.typography.styles.h2,
    color: theme.colors.neutral.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.styles.h3,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.xs,
  },
  profileType: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral.grey,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    ...theme.typography.styles.caption,
    color: theme.colors.neutral.grey,
  },
  upgradeSection: {
    backgroundColor: theme.colors.primary.creamLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  upgradeText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral.charcoal,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  upgradeButton: {
    minWidth: 200,
  },
  settingsCard: {
    marginBottom: theme.spacing.lg,
  },
  disabledInput: {
    opacity: 0.7,
  },
  editActions: {
    marginTop: theme.spacing.md,
  },
  editButtonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  editButton: {
    flex: 1,
  },
  actionsCard: {
    marginBottom: theme.spacing.lg,
  },
  actionsList: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    marginBottom: theme.spacing.xs,
  },
  deleteButton: {
    borderColor: theme.colors.semantic.error.primary,
  },
  privacyCard: {
    backgroundColor: theme.colors.primary.creamLight,
    borderColor: theme.colors.primary.sage,
  },
  privacyTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.primary.sage,
    marginBottom: theme.spacing.sm,
  },
  privacyText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral.charcoal,
  },
});

export default ProfileScreen;
