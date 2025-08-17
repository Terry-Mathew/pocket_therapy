/**
 * Design System Demo Screen for PocketTherapy
 * 
 * Showcases all UI components and design tokens for testing and development.
 * This screen helps verify the therapeutic design system implementation.
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  CrisisButton,
  Card,
  ExerciseCard,
  MoodCard,
  InsightCard,
  Input,
  MoodNoteInput,
  SearchInput,
  Modal,
  ConfirmModal,
  LoadingSpinner,
  InlineLoader,
} from '../components';
import { theme } from '@constants/theme';

const DesignSystemDemo: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const handleButtonPress = (buttonType: string) => {
    Alert.alert('Button Pressed', `You pressed the ${buttonType} button!`);
  };

  const handleCardPress = (cardType: string) => {
    Alert.alert('Card Pressed', `You pressed the ${cardType} card!`);
  };

  const renderColorPalette = () => (
    <Card title="Color Palette" style={styles.section}>
      <View style={styles.colorGrid}>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary.sage }]} />
          <Text style={styles.colorLabel}>Primary Sage</Text>
        </View>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary.cream }]} />
          <Text style={styles.colorLabel}>Primary Cream</Text>
        </View>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary.rose }]} />
          <Text style={styles.colorLabel}>Primary Rose</Text>
        </View>
      </View>
    </Card>
  );

  const renderTypography = () => (
    <Card title="Typography" style={styles.section}>
      <Text style={theme.typography.styles.display}>Display Text</Text>
      <Text style={theme.typography.styles.h1}>Heading 1</Text>
      <Text style={theme.typography.styles.h2}>Heading 2</Text>
      <Text style={theme.typography.styles.h3}>Heading 3</Text>
      <Text style={theme.typography.styles.body}>Body text for reading content</Text>
      <Text style={theme.typography.styles.bodySmall}>Small body text</Text>
      <Text style={theme.typography.styles.caption}>Caption text</Text>
    </Card>
  );

  const renderButtons = () => (
    <Card title="Buttons" style={styles.section}>
      <View style={styles.buttonGrid}>
        <PrimaryButton
          title="Primary"
          onPress={() => handleButtonPress('primary')}
        />
        <SecondaryButton
          title="Secondary"
          onPress={() => handleButtonPress('secondary')}
        />
        <OutlineButton
          title="Outline"
          onPress={() => handleButtonPress('outline')}
        />
        <GhostButton
          title="Ghost"
          onPress={() => handleButtonPress('ghost')}
        />
        <CrisisButton
          title="Crisis"
          onPress={() => handleButtonPress('crisis')}
        />
        <Button
          title="Loading"
          loading
          onPress={() => {}}
        />
        <Button
          title="Disabled"
          disabled
          onPress={() => {}}
        />
      </View>
    </Card>
  );

  const renderCards = () => (
    <Card title="Cards" style={styles.section}>
      <ExerciseCard
        title="4-7-8 Breathing"
        subtitle="Calming breathing technique"
        duration="2 min"
        category="Breathing"
        difficulty="Beginner"
        onPress={() => handleCardPress('exercise')}
        style={styles.cardExample}
      />
      <MoodCard
        title="Today's Mood"
        subtitle="How are you feeling?"
        moodLevel={4}
        date="Today"
        onPress={() => handleCardPress('mood')}
        style={styles.cardExample}
      />
      <InsightCard
        title="Weekly Insight"
        subtitle="Your mood has been trending upward this week!"
        style={styles.cardExample}
      />
    </Card>
  );

  const renderInputs = () => (
    <Card title="Inputs" style={styles.section}>
      <Input
        label="Basic Input"
        placeholder="Enter text here"
        value={inputValue}
        onChangeText={setInputValue}
        helperText="This is helper text"
      />
      <Input
        label="Required Input"
        placeholder="This field is required"
        required
        {...(!inputValue && { error: 'This field is required' })}
      />
      <SearchInput
        value={searchValue}
        onChangeText={setSearchValue}
      />
      <MoodNoteInput
        value={moodNote}
        onChangeText={setMoodNote}
      />
    </Card>
  );

  const renderModals = () => (
    <Card title="Modals" style={styles.section}>
      <View style={styles.buttonGrid}>
        <Button
          title="Show Modal"
          onPress={() => setModalVisible(true)}
        />
        <Button
          title="Show Confirm"
          onPress={() => setConfirmModalVisible(true)}
        />
      </View>
    </Card>
  );

  const renderLoaders = () => (
    <Card title="Loading States" style={styles.section}>
      <View style={styles.loaderGrid}>
        <View style={styles.loaderExample}>
          <Text style={styles.loaderLabel}>Small</Text>
          <LoadingSpinner size="small" />
        </View>
        <View style={styles.loaderExample}>
          <Text style={styles.loaderLabel}>Medium</Text>
          <LoadingSpinner size="medium" />
        </View>
        <View style={styles.loaderExample}>
          <Text style={styles.loaderLabel}>Large</Text>
          <LoadingSpinner size="large" />
        </View>
      </View>
      <InlineLoader message="Loading content..." />
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>PocketTherapy Design System</Text>
      <Text style={styles.subtitle}>
        Therapeutic UI components for mental health support
      </Text>

      {renderColorPalette()}
      {renderTypography()}
      {renderButtons()}
      {renderCards()}
      {renderInputs()}
      {renderModals()}
      {renderLoaders()}

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Example Modal"
        subtitle="This is a demo modal"
      >
        <Text style={theme.typography.styles.body}>
          This modal demonstrates the therapeutic design with gentle animations
          and calming colors.
        </Text>
        <Button
          title="Close"
          onPress={() => setModalVisible(false)}
          style={{ marginTop: theme.spacing.md }}
        />
      </Modal>

      <ConfirmModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        title="Confirm Action"
        message="Are you sure you want to perform this action?"
        confirmText="Yes, Continue"
        cancelText="Cancel"
        onConfirm={() => {
          setConfirmModalVisible(false);
          Alert.alert('Confirmed', 'Action confirmed!');
        }}
        onCancel={() => setConfirmModalVisible(false)}
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
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.neutral.charcoal,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.grey,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  colorGrid: {
    gap: theme.spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral.lightGrey,
  },
  colorLabel: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.charcoal,
  },
  buttonGrid: {
    gap: theme.spacing.sm,
  },
  cardExample: {
    marginBottom: theme.spacing.sm,
  },
  loaderGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  loaderExample: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  loaderLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.neutral.grey,
  },
});

export default DesignSystemDemo;
