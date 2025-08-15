/**
 * Exercises Screen for PocketTherapy
 * 
 * Exercise library with categories and search functionality.
 * Placeholder implementation for navigation testing.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, SearchInput, OutlineButton } from '@components';
import { theme } from '@constants/theme';

const ExercisesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const exerciseCategories = [
    {
      id: 'breathing',
      title: 'Breathing',
      icon: '🫁',
      count: 10,
      description: 'Calming breath work exercises',
    },
    {
      id: 'grounding',
      title: 'Grounding',
      icon: '🌱',
      count: 10,
      description: '5-4-3-2-1 and sensory techniques',
    },
    {
      id: 'cognitive',
      title: 'Cognitive',
      icon: '🧠',
      count: 11,
      description: 'Thought reframing exercises',
    },
  ];

  const handleCategoryPress = (categoryId: string) => {
    console.log(`Navigate to ${categoryId} exercises`);
  };

  const handleExercisePress = (exerciseId: string) => {
    console.log(`Navigate to exercise ${exerciseId}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Exercises</Text>
        <Text style={styles.subtitle}>
          Choose from 31 therapeutic exercises
        </Text>
      </View>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {exerciseCategories.map((category) => (
          <Card
            key={category.id}
            title={`${category.icon} ${category.title}`}
            subtitle={category.description}
            onPress={() => handleCategoryPress(category.id)}
            style={styles.categoryCard}
            testID={`category-${category.id}`}
          >
            <View style={styles.categoryContent}>
              <Text style={styles.categoryCount}>
                {category.count} exercises
              </Text>
              <OutlineButton
                title="Browse"
                size="small"
                onPress={() => handleCategoryPress(category.id)}
              />
            </View>
          </Card>
        ))}
      </View>

      {/* Quick Access */}
      <View style={styles.quickAccessSection}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <Card
          title="🆘 Crisis Support"
          subtitle="Immediate breathing and grounding"
          onPress={() => handleExercisePress('sos')}
          style={styles.sosCard}
          testID="sos-exercises"
        />
        <Card
          title="⚡ 2-Minute Relief"
          subtitle="Quick exercises for busy moments"
          onPress={() => handleExercisePress('quick')}
          style={styles.quickCard}
          testID="quick-exercises"
        />
      </View>

      {/* Spacer for SOS button */}
      <View style={styles.spacer} />
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
    paddingTop: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.grey,
  },
  searchInput: {
    marginBottom: theme.spacing.lg,
  },
  categoriesSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.md,
  },
  categoryCard: {
    marginBottom: theme.spacing.md,
  },
  categoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  categoryCount: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral.grey,
  },
  quickAccessSection: {
    marginBottom: theme.spacing.xl,
  },
  sosCard: {
    backgroundColor: theme.colors.crisis.urgent.background,
    borderColor: theme.colors.crisis.urgent.primary,
    marginBottom: theme.spacing.md,
  },
  quickCard: {
    backgroundColor: theme.colors.primary.creamLight,
    borderColor: theme.colors.primary.sage,
  },
  spacer: {
    height: 100, // Space for SOS button
  },
});

export default ExercisesScreen;
