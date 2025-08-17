/**
 * Offline Exercise List Component
 * 
 * Displays exercises available for offline use with
 * text-only fallbacks and offline indicators
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { Exercise } from '../types';
import { useAppStore } from '../store';

interface OfflineExerciseListProps {
  onExerciseSelect: (exercise: Exercise) => void;
  category?: string;
  showHeader?: boolean;
}

export const OfflineExerciseList: React.FC<OfflineExerciseListProps> = ({
  onExerciseSelect,
  category,
  showHeader = true,
}) => {
  const { actions } = useAppStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfflineExercises();
  }, [category]);

  const loadOfflineExercises = async () => {
    try {
      setLoading(true);
      const offlineExercises = await actions.getOfflineExercises();
      
      // Filter by category if specified
      const filteredExercises = category
        ? offlineExercises.filter(ex => ex.category === category)
        : offlineExercises;
      
      setExercises(filteredExercises);
    } catch (error) {
      console.error('Failed to load offline exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => onExerciseSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseTitle}>{item.title}</Text>
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>📱</Text>
        </View>
      </View>
      
      <Text style={styles.exerciseDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.exerciseFooter}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        
        <Text style={styles.durationText}>
          {Math.ceil(item.duration / 60)} min
        </Text>
      </View>
      
      <View style={styles.instructionPreview}>
        <Text style={styles.instructionText} numberOfLines={1}>
          {item.instructions[0]}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No offline exercises available</Text>
      <Text style={styles.emptyDescription}>
        {category
          ? `No ${category} exercises are available offline yet.`
          : 'Exercises will be downloaded for offline use automatically.'
        }
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={loadOfflineExercises}>
        <Text style={styles.refreshButtonText}>Check Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={therapeuticColors.primary} />
        <Text style={styles.loadingText}>Loading offline exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {category ? `${category} exercises` : 'Offline Exercises'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Available without internet connection
          </Text>
        </View>
      )}
      
      <FlatList
        data={exercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={exercises.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['3x'],
    borderBottomWidth: 1,
    borderBottomColor: therapeuticColors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['1x'],
  },
  headerSubtitle: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  exerciseCard: {
    backgroundColor: therapeuticColors.surface,
    marginHorizontal: spacing['4x'],
    marginVertical: spacing['2x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    shadowColor: therapeuticColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2x'],
  },
  exerciseTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    flex: 1,
    marginRight: spacing['2x'],
  },
  offlineIndicator: {
    backgroundColor: therapeuticColors.success + '20',
    paddingHorizontal: spacing['2x'],
    paddingVertical: spacing['1x'],
    borderRadius: 6,
  },
  offlineText: {
    fontSize: 12,
  },
  exerciseDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['3x'],
    lineHeight: 20,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2x'],
  },
  categoryBadge: {
    backgroundColor: therapeuticColors.primary + '20',
    paddingHorizontal: spacing['2x'],
    paddingVertical: spacing['1x'],
    borderRadius: 6,
  },
  categoryText: {
    ...typography.caption,
    color: therapeuticColors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  durationText: {
    ...typography.caption,
    color: therapeuticColors.textTertiary,
    fontWeight: '500',
  },
  instructionPreview: {
    backgroundColor: therapeuticColors.background,
    padding: spacing['2x'],
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: therapeuticColors.primary,
  },
  instructionText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    fontStyle: 'italic',
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
    marginTop: spacing['3x'],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['6x'],
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    ...typography.h4,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2x'],
  },
  emptyDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['4x'],
    lineHeight: 22,
  },
  refreshButton: {
    backgroundColor: therapeuticColors.primary,
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['3x'],
    borderRadius: 8,
  },
  refreshButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
});

export default OfflineExerciseList;
