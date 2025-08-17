/**
 * AI Settings Component
 * 
 * Allows users to configure AI features, view usage statistics,
 * and manage their OpenAI API preferences
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
  TextInput,
} from 'react-native';
import { therapeuticColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppStore } from '../store';

interface AISettingsProps {
  onSettingsChange?: (settings: any) => void;
}

export const AISettings: React.FC<AISettingsProps> = ({
  onSettingsChange,
}) => {
  const { actions } = useAppStore();
  
  const [aiEnabled, setAiEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadUsageStats();
  }, []);

  const loadSettings = async () => {
    try {
      // Load AI settings from storage
      // This would be implemented based on your storage strategy
      setLoading(false);
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      setLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const stats = await actions.getAIUsageStats();
      setUsageStats(stats);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const handleToggleAI = async (enabled: boolean) => {
    if (enabled && !apiKey) {
      Alert.alert(
        'API Key Required',
        'To enable AI features, you need to provide your OpenAI API key. This will be stored securely on your device.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add API Key', onPress: () => setShowApiKey(true) },
        ]
      );
      return;
    }

    try {
      if (enabled) {
        await actions.initializeAI(apiKey);
      }
      
      setAiEnabled(enabled);
      onSettingsChange?.({ aiEnabled: enabled, apiKey });
    } catch (error) {
      console.error('Failed to toggle AI:', error);
      Alert.alert(
        'AI Setup Failed',
        'Failed to initialize AI features. Please check your API key and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Invalid API Key', 'Please enter a valid OpenAI API key.');
      return;
    }

    try {
      await actions.initializeAI(apiKey);
      setShowApiKey(false);
      setAiEnabled(true);
      
      Alert.alert(
        'AI Enabled',
        'AI features have been successfully enabled. You can now get personalized recommendations!',
        [{ text: 'Great!' }]
      );
    } catch (error) {
      console.error('Failed to save API key:', error);
      Alert.alert(
        'Setup Failed',
        'Failed to initialize AI with the provided key. Please check your API key and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTestAI = async () => {
    try {
      const content = await actions.generateTherapeuticContent('affirmation', { mood: 3 });
      Alert.alert(
        'AI Test Successful',
        `Generated content: "${content}"`,
        [{ text: 'Great!' }]
      );
    } catch (error) {
      console.error('AI test failed:', error);
      Alert.alert(
        'AI Test Failed',
        'Failed to generate test content. Please check your settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderUsageStats = () => {
    if (!usageStats) return null;

    const usagePercentage = (usageStats.totalCost / usageStats.monthlyLimit) * 100;

    return (
      <View style={styles.usageContainer}>
        <Text style={styles.usageTitle}>Monthly Usage</Text>
        
        <View style={styles.usageBar}>
          <View style={[styles.usageProgress, { width: `${Math.min(usagePercentage, 100)}%` }]} />
        </View>
        
        <View style={styles.usageStats}>
          <Text style={styles.usageStat}>
            Cost: ${usageStats.totalCost.toFixed(4)} / ${usageStats.monthlyLimit.toFixed(2)}
          </Text>
          <Text style={styles.usageStat}>
            Requests: {usageStats.requestCount}
          </Text>
          <Text style={styles.usageStat}>
            Tokens: {usageStats.totalTokensUsed.toLocaleString()}
          </Text>
        </View>
        
        {usagePercentage > 80 && (
          <Text style={styles.usageWarning}>
            ⚠️ Approaching monthly limit. AI features may be disabled when limit is reached.
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading AI settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Features</Text>
        <Text style={styles.description}>
          Enable AI-powered personalized recommendations and insights
        </Text>
      </View>

      {/* Main AI Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Enable AI Features</Text>
          <Text style={styles.settingDescription}>
            Get personalized exercise recommendations and mood insights
          </Text>
        </View>
        <Switch
          value={aiEnabled}
          onValueChange={handleToggleAI}
          trackColor={{
            false: therapeuticColors.border,
            true: therapeuticColors.primary + '40',
          }}
          thumbColor={aiEnabled ? therapeuticColors.primary : therapeuticColors.textTertiary}
        />
      </View>

      {/* API Key Section */}
      {(showApiKey || !aiEnabled) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OpenAI API Key</Text>
          <Text style={styles.sectionDescription}>
            Your API key is stored securely on your device and never shared.
          </Text>
          
          <TextInput
            style={styles.apiKeyInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowApiKey(!showApiKey)}>
              <Text style={styles.secondaryButtonText}>
                {showApiKey ? 'Hide' : 'Show'} Key
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleSaveApiKey}>
              <Text style={styles.primaryButtonText}>Save & Enable</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* AI Features */}
      {aiEnabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Features</Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>✨ Personalized Recommendations</Text>
              <Text style={styles.featureDescription}>
                Get exercise suggestions tailored to your current mood and preferences
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>📊 Mood Pattern Analysis</Text>
              <Text style={styles.featureDescription}>
                Discover insights about your mood patterns and trends over time
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>💭 Therapeutic Content</Text>
              <Text style={styles.featureDescription}>
                Receive personalized affirmations and coping strategies
              </Text>
            </View>
          </View>

          {/* Usage Statistics */}
          {renderUsageStats()}

          {/* Test AI */}
          <TouchableOpacity style={styles.testButton} onPress={handleTestAI}>
            <Text style={styles.testButtonText}>Test AI Features</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Privacy & Cost Information */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyTitle}>Privacy & Cost</Text>
        <Text style={styles.privacyText}>
          • Your API key is stored locally and never shared{'\n'}
          • AI requests are sent directly to OpenAI from your device{'\n'}
          • Usage costs are charged to your OpenAI account{'\n'}
          • Typical cost: $0.01-0.05 per day with regular use{'\n'}
          • You can disable AI features anytime
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
    marginBottom: spacing['2x'],
    paddingHorizontal: spacing['4x'],
  },
  sectionDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    marginBottom: spacing['3x'],
    paddingHorizontal: spacing['4x'],
    lineHeight: 18,
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
  apiKeyInput: {
    backgroundColor: therapeuticColors.surface,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    borderRadius: 12,
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['3x'],
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['3x'],
    ...typography.body,
    color: therapeuticColors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing['3x'],
    paddingHorizontal: spacing['4x'],
  },
  primaryButton: {
    flex: 1,
    backgroundColor: therapeuticColors.primary,
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    color: therapeuticColors.background,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: therapeuticColors.surface,
    paddingVertical: spacing['3x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    color: therapeuticColors.textSecondary,
    fontWeight: '500',
  },
  featureItem: {
    backgroundColor: therapeuticColors.surface,
    paddingHorizontal: spacing['4x'],
    paddingVertical: spacing['3x'],
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['2x'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: therapeuticColors.border,
  },
  featureTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['1x'],
  },
  featureDescription: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
    lineHeight: 18,
  },
  usageContainer: {
    backgroundColor: therapeuticColors.primary + '10',
    marginHorizontal: spacing['4x'],
    marginBottom: spacing['4x'],
    padding: spacing['4x'],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: therapeuticColors.primary,
  },
  usageTitle: {
    ...typography.body,
    color: therapeuticColors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing['3x'],
  },
  usageBar: {
    height: 8,
    backgroundColor: therapeuticColors.border,
    borderRadius: 4,
    marginBottom: spacing['3x'],
    overflow: 'hidden',
  },
  usageProgress: {
    height: '100%',
    backgroundColor: therapeuticColors.primary,
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing['2x'],
  },
  usageStat: {
    ...typography.caption,
    color: therapeuticColors.textSecondary,
  },
  usageWarning: {
    ...typography.caption,
    color: therapeuticColors.warning,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: therapeuticColors.secondary,
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

export default AISettings;
