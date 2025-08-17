/**
 * Offline Exercise Status Component
 * 
 * Shows offline readiness status and provides controls
 * for managing offline exercise content
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';

interface OfflineStatus {
  isReady: boolean;
  coreExercisesCount: number;
  totalOfflineExercises: number;
  lastUpdated?: string;
}

interface OfflineExerciseStatusProps {
  onRefresh?: () => void;
  showDetails?: boolean;
}

export const OfflineExerciseStatus: React.FC<OfflineExerciseStatusProps> = ({
  onRefresh,
  showDetails = false,
}) => {
  const { actions } = useAppStore();
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const offlineStatus = await actions.checkOfflineReadiness();
      setStatus(offlineStatus);
    } catch (error) {
      console.error('Failed to check offline status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await checkStatus();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to refresh offline status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={therapeuticColors.primary} />
        <Text style={styles.loadingText}>Checking offline status...</Text>
      </View>
    );
  }

  if (!status) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to check offline status</Text>
        <TouchableOpacity style={styles.retryButton} onPress={checkStatus}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: status.isReady ? therapeuticColors.success : therapeuticColors.warning }
        ]} />
        <Text style={styles.statusText}>
          {status.isReady ? 'Ready for offline use' : 'Setting up offline content...'}
        </Text>
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>
            {status.totalOfflineExercises} exercises available offline
          </Text>
          {status.lastUpdated && (
            <Text style={styles.lastUpdatedText}>
              Last updated: {new Date(status.lastUpdated).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color={therapeuticColors.textSecondary} />
        ) : (
          <Text style={styles.refreshButtonText}>Refresh</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    padding: spacing['4x'],
    marginVertical: spacing['2x'],
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2x'],
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing['2x'],
  },
  statusText: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    flex: 1,
  },
  detailsContainer: {
    marginTop: spacing['2x'],
    paddingTop: spacing['2x'],
    borderTopWidth: 1,
    borderTopColor: therapeuticColors.border,
  },
  detailText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['1x'],
  },
  lastUpdatedText: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
    fontSize: 12,
  },
  refreshButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing['3x'],
    paddingVertical: spacing['1x'],
    borderRadius: 6,
    backgroundColor: therapeuticColors.background,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  refreshButtonText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  loadingText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginLeft: spacing['2x'],
  },
  errorText: {
    ...typography.body,
    color: therapeuticColors.error,
    textAlign: 'center',
    marginBottom: spacing['2x'],
  },
  retryButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['2x'],
    borderRadius: 8,
    backgroundColor: therapeuticColors.primary,
  },
  retryButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
});

export default OfflineExerciseStatus;
