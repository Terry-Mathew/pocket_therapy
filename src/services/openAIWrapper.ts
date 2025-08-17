/**
 * OpenAI Wrapper for React Native/Web Compatibility
 *
 * This wrapper handles ES module compatibility issues by conditionally loading
 * the OpenAI library and providing fallbacks for different environments
 */

import { Platform } from 'react-native';

// Type definitions for OpenAI
interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
}

interface ChatCompletion {
  choices: Array<{
    message: {
      content: string | null;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIClient {
  chat: {
    completions: {
      create: (params: any) => Promise<ChatCompletion>;
    };
  };
}

// Environment-specific OpenAI client creation
class OpenAIWrapper {
  private client: OpenAIClient | null = null;
  private isInitialized = false;
  private initError: string | null = null;

  async initialize(config: OpenAIConfig): Promise<boolean> {
    if (this.isInitialized) {
      return this.client !== null;
    }

    try {
      // Always use fetch-based implementation for React Native/Hermes compatibility
      // This avoids import.meta and require issues in Hermes
      if (Platform.OS === 'web') {
        try {
          // Try to use OpenAI library for web if available
          const { default: OpenAI } = await import('openai');
          this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
            organization: config.organization,
            dangerouslyAllowBrowser: true, // Required for web usage
          });
        } catch (importError) {
          console.warn('OpenAI library import failed, using fetch implementation:', importError);
          // Fallback to fetch-based implementation
          this.client = this.createFetchBasedClient(config);
        }
      } else {
        // For React Native/Hermes, always use fetch-based implementation
        // This avoids all import.meta and require issues
        this.client = this.createFetchBasedClient(config);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      this.initError = error instanceof Error ? error.message : 'Unknown error';
      this.isInitialized = true;
      return false;
    }
  }

  private createFetchBasedClient(config: OpenAIConfig): OpenAIClient {
    const baseURL = config.baseURL || 'https://api.openai.com/v1';
    
    return {
      chat: {
        completions: {
          create: async (params: any): Promise<ChatCompletion> => {
            const response = await fetch(`${baseURL}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                ...(config.organization && { 'OpenAI-Organization': config.organization }),
              },
              body: JSON.stringify(params),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
            }

            return await response.json();
          },
        },
      },
    };
  }

  getClient(): OpenAIClient | null {
    return this.client;
  }

  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  getError(): string | null {
    return this.initError;
  }

  // Utility method to check if OpenAI is available
  static async isOpenAIAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Try to dynamically import OpenAI
        await import('openai');
        return true;
      } else {
        // For React Native, we use fetch, so it's always available
        return true;
      }
    } catch (error) {
      console.warn('OpenAI library not available:', error);
      return false;
    }
  }

  // Create a chat completion with error handling
  async createChatCompletion(params: any): Promise<ChatCompletion> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      return await this.client.chat.completions.create(params);
    } catch (error) {
      console.error('Chat completion error:', error);
      throw error;
    }
  }

  // Utility method to calculate token costs
  calculateCost(promptTokens: number, completionTokens: number, model: string = 'gpt-3.5-turbo'): number {
    // Pricing as of 2024 (in USD per 1K tokens)
    const pricing: Record<string, { prompt: number; completion: number }> = {
      'gpt-3.5-turbo': {
        prompt: 0.0015,
        completion: 0.002,
      },
      'gpt-4': {
        prompt: 0.03,
        completion: 0.06,
      },
      'gpt-4-turbo': {
        prompt: 0.01,
        completion: 0.03,
      },
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    const promptCost = (promptTokens / 1000) * modelPricing!.prompt;
    const completionCost = (completionTokens / 1000) * modelPricing!.completion;

    return promptCost + completionCost;
  }
}

// Export singleton instance
export const openAIWrapper = new OpenAIWrapper();
export default openAIWrapper;
