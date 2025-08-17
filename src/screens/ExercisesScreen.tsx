/**
 * ExercisesScreen
 *
 * Main exercises screen with categories, search, and filtering
 * Displays exercise library with offline support
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../constants/theme';
import { ExerciseLibrary } from '../components/exercises/ExerciseLibrary';
import { useExercises, useActions } from '../store';
import { Exercise } from '../types';

interface ExercisesScreenProps {
  navigation?: any;
}

const CATEGORIES = [
  { id: null, label: 'All', emoji: '🌟', description: 'All exercises' },
  { id: 'breathing', label: 'Breathing', emoji: '🫁', description: 'Breathing techniques for calm' },
  { id: 'grounding', label: 'Grounding', emoji: '🌱', description: 'Present moment awareness' },
  { id: 'cognitive', label: 'Cognitive', emoji: '🧠', description: 'Thought pattern exercises' },
];

const DIFFICULTY_FILTERS = [
  { id: null, label: 'All levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const ExercisesScreen: React.FC<ExercisesScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { library, favorites } = useExercises();
  const { loadExercises } = useActions();

  // Load exercises on mount
  useEffect(() => {
    if (library.length === 0) {
      loadExercises();
    }
  }, [library.length, loadExercises]);

  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    if (navigation) {
      navigation.navigate('ExercisePlayer', { exercise });
    } else {
      console.log('Selected exercise:', exercise.title);
    }
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadExercises();
    } catch (error) {
      console.error('Failed to refresh exercises:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadExercises]);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleDifficultySelect = useCallback((difficultyId: string | null) => {
    setSelectedDifficulty(difficultyId);
  }, []);

  const toggleFavoritesOnly = useCallback(() => {
    setShowFavoritesOnly(prev => !prev);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Exercises</Text>
          <Text style={styles.subtitle}>
            Therapeutic exercises for mental wellness
          </Text>
        </View>

        <ExerciseLibrary
          onExerciseSelect={handleExerciseSelect}
          showFavoritesOnly={showFavoritesOnly}
          category={selectedCategory as any}
          difficulty={selectedDifficulty as any}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },

  content: {
    flex: 1,
  },

  header: {
    paddingHorizontal: spacing['6x'], // 24px
    paddingTop: spacing['6x'], // 24px
    paddingBottom: spacing['4x'], // 16px
  },

  title: {
    ...typography.h1,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['2x'], // 8px
  },

  subtitle: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    lineHeight: 24,
  },
});

export default ExercisesScreen;
