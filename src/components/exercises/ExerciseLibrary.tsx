/**
 * ExerciseLibrary Component
 * 
 * Displays categorized exercise library with search, filtering,
 * and offline-first design
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView
} from 'react-native';
import { therapeuticColors, spacing, typography } from '../../constants/theme';
import { Exercise } from '../../types';
import { useExercises } from '../../store';

interface ExerciseLibraryProps {
  onExerciseSelect: (exercise: Exercise) => void;
  showFavoritesOnly?: boolean;
  category?: 'breathing' | 'grounding' | 'cognitive' | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
}

const CATEGORIES = [
  { id: null, label: 'All', emoji: '🌟' },
  { id: 'breathing', label: 'Breathing', emoji: '🫁' },
  { id: 'grounding', label: 'Grounding', emoji: '🌱' },
  { id: 'cognitive', label: 'Cognitive', emoji: '🧠' },
];

const DIFFICULTIES = [
  { id: null, label: 'All levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onExerciseSelect,
  showFavoritesOnly = false,
  category: initialCategory = null,
  difficulty: initialDifficulty = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  
  const { library, favorites } = useExercises();

  // Filter exercises based on current filters
  const filteredExercises = useMemo(() => {
    let filtered = library;

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(exercise => favorites.includes(exercise.id));
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(exercise =>
        exercise.title.toLowerCase().includes(query) ||
        exercise.description.toLowerCase().includes(query) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [library, favorites, showFavoritesOnly, selectedCategory, selectedDifficulty, searchQuery]);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId as any);
  }, []);

  const handleDifficultySelect = useCallback((difficultyId: string | null) => {
    setSelectedDifficulty(difficultyId as any);
  }, []);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return therapeuticColors.success;
      case 'intermediate':
        return therapeuticColors.warning;
      case 'advanced':
        return therapeuticColors.error;
      default:
        return therapeuticColors.textSecondary;
    }
  };

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id || 'all'}
          style={[
            styles.filterChip,
            selectedCategory === category.id && styles.selectedFilterChip
          ]}
          onPress={() => handleCategorySelect(category.id)}
          accessibilityLabel={`Filter by ${category.label}`}
          accessibilityState={{ selected: selectedCategory === category.id }}
        >
          <Text style={styles.filterEmoji}>{category.emoji}</Text>
          <Text style={[
            styles.filterText,
            selectedCategory === category.id && styles.selectedFilterText
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDifficultyFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {DIFFICULTIES.map((difficulty) => (
        <TouchableOpacity
          key={difficulty.id || 'all'}
          style={[
            styles.difficultyChip,
            selectedDifficulty === difficulty.id && styles.selectedDifficultyChip
          ]}
          onPress={() => handleDifficultySelect(difficulty.id)}
          accessibilityLabel={`Filter by ${difficulty.label}`}
          accessibilityState={{ selected: selectedDifficulty === difficulty.id }}
        >
          <Text style={[
            styles.difficultyText,
            selectedDifficulty === difficulty.id && styles.selectedDifficultyText
          ]}>
            {difficulty.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderExerciseCard = ({ item: exercise }: { item: Exercise }) => {
    const isFavorite = favorites.includes(exercise.id);
    
    return (
      <TouchableOpacity
        style={styles.exerciseCard}
        onPress={() => onExerciseSelect(exercise)}
        accessibilityLabel={`${exercise.title} exercise`}
        accessibilityHint={`${exercise.description}. Duration: ${formatDuration(exercise.duration_seconds)}`}
      >
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseTitle}>{exercise.title}</Text>
            <Text style={styles.exerciseDescription} numberOfLines={2}>
              {exercise.description}
            </Text>
          </View>
          
          {isFavorite && (
            <Text style={styles.favoriteIcon}>❤️</Text>
          )}
        </View>
        
        <View style={styles.exerciseFooter}>
          <View style={styles.exerciseMeta}>
            <Text style={styles.exerciseDuration}>
              {formatDuration(exercise.duration_seconds)}
            </Text>
            <Text style={[
              styles.exerciseDifficulty,
              { color: getDifficultyColor(exercise.difficulty) }
            ]}>
              {exercise.difficulty}
            </Text>
          </View>
          
          <View style={styles.exerciseTags}>
            {exercise.tags.slice(0, 2).map((tag, index) => (
              <Text key={index} style={styles.exerciseTag}>
                {tag}
              </Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🔍</Text>
      <Text style={styles.emptyStateTitle}>
        {showFavoritesOnly ? 'No favorites yet' : 'No exercises found'}
      </Text>
      <Text style={styles.emptyStateDescription}>
        {showFavoritesOnly 
          ? 'Heart exercises you love to add them to your favorites'
          : 'Try adjusting your search or filters'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search exercises..."
          placeholderTextColor={therapeuticColors.textSecondary}
          accessibilityLabel="Search exercises"
          accessibilityHint="Type to search for specific exercises"
        />
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Difficulty Filter */}
      {renderDifficultyFilter()}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
          {showFavoritesOnly && ' in favorites'}
        </Text>
      </View>

      {/* Exercise List */}
      {filteredExercises.length > 0 ? (
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: therapeuticColors.background,
  },
  
  searchContainer: {
    paddingHorizontal: spacing['6x'], // 24px
    paddingVertical: spacing['4x'], // 16px
  },
  
  searchInput: {
    ...typography.body,
    backgroundColor: therapeuticColors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing['4x'], // 16px
    paddingVertical: spacing['3x'], // 12px
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    color: therapeuticColors.textPrimary,
  },
  
  filterContainer: {
    marginBottom: spacing['4x'], // 16px
  },
  
  filterContent: {
    paddingHorizontal: spacing['6x'], // 24px
    gap: spacing['2x'], // 8px
  },
  
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: therapeuticColors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing['4x'], // 16px
    paddingVertical: spacing['2x'], // 8px
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    gap: spacing['1x'], // 4px
  },
  
  selectedFilterChip: {
    backgroundColor: therapeuticColors.primary + '20',
    borderColor: therapeuticColors.primary,
  },
  
  filterEmoji: {
    fontSize: 16,
  },
  
  filterText: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
  },
  
  selectedFilterText: {
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  
  difficultyChip: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing['3x'], // 12px
    paddingVertical: spacing['1x'], // 4px
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  
  selectedDifficultyChip: {
    backgroundColor: therapeuticColors.primary + '20',
    borderColor: therapeuticColors.primary,
  },
  
  difficultyText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  
  selectedDifficultyText: {
    color: therapeuticColors.primary,
    fontWeight: '600',
  },
  
  resultsContainer: {
    paddingHorizontal: spacing['6x'], // 24px
    paddingBottom: spacing['4x'], // 16px
  },
  
  resultsText: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  
  listContent: {
    paddingHorizontal: spacing['6x'], // 24px
    paddingBottom: spacing['8x'], // 32px
  },
  
  exerciseCard: {
    backgroundColor: therapeuticColors.surface,
    borderRadius: 16,
    padding: spacing['5x'], // 20px
    marginBottom: spacing['4x'], // 16px
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['3x'], // 12px
  },
  
  exerciseInfo: {
    flex: 1,
    marginRight: spacing['3x'], // 12px
  },
  
  exerciseTitle: {
    ...typography.h3,
    color: therapeuticColors.textPrimary,
    marginBottom: spacing['1x'], // 4px
  },
  
  exerciseDescription: {
    ...typography.bodySmall,
    color: therapeuticColors.textSecondary,
    lineHeight: 20,
  },
  
  favoriteIcon: {
    fontSize: 20,
  },
  
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3x'], // 12px
  },
  
  exerciseDuration: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  
  exerciseDifficulty: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  exerciseTags: {
    flexDirection: 'row',
    gap: spacing['1x'], // 4px
  },
  
  exerciseTag: {
    ...typography.caption,
    color: therapeuticColors.primary,
    backgroundColor: therapeuticColors.primary + '15',
    paddingHorizontal: spacing['2x'], // 8px
    paddingVertical: spacing['1x'], // 4px
    borderRadius: 8,
    fontSize: 10,
  },
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['8x'], // 32px
  },
  
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: spacing['4x'], // 16px
  },
  
  emptyStateTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['2x'], // 8px
  },
  
  emptyStateDescription: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ExerciseLibrary;
