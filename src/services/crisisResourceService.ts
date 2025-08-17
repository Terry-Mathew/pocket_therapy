/**
 * Crisis Resource Service
 * 
 * Manages crisis resources, provides location-aware support,
 * and handles emergency contact functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';
import * as Location from 'expo-location';
import { 
  crisisResources, 
  CrisisResource, 
  getRecommendedResources,
  getEmergencyNumber,
  emergencyNumbers 
} from '../data/crisisResources';

interface UserLocation {
  region: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface CrisisContext {
  severity: 'low' | 'medium' | 'high' | 'emergency';
  userPreferences?: {
    contactMethod: 'phone' | 'text' | 'chat';
    language: string;
  };
  specialNeeds?: string[];
}

class CrisisResourceService {
  private readonly USER_LOCATION_KEY = 'user_location';
  private readonly CRISIS_PREFERENCES_KEY = 'crisis_preferences';
  private readonly RESOURCE_CACHE_KEY = 'cached_crisis_resources';

  /**
   * Get crisis resources based on user location and context
   */
  async getCrisisResources(context: CrisisContext): Promise<CrisisResource[]> {
    try {
      const userLocation = await this.getUserLocation();
      const preferences = await this.getUserPreferences();

      const recommendedResources = getRecommendedResources({
        region: userLocation?.region,
        isEmergency: context.severity === 'emergency',
        preferredContact: context.userPreferences?.contactMethod || preferences?.contactMethod,
        language: context.userPreferences?.language || preferences?.language,
        specialization: context.specialNeeds?.[0],
      });

      // Cache resources for offline access
      await this.cacheResources(recommendedResources);

      return recommendedResources;
    } catch (error) {
      console.error('Failed to get crisis resources:', error);
      // Return cached resources as fallback
      return this.getCachedResources();
    }
  }

  /**
   * Get immediate emergency resources
   */
  async getEmergencyResources(): Promise<{
    emergencyNumber: string;
    crisisHotlines: CrisisResource[];
    textSupport: CrisisResource[];
  }> {
    try {
      const userLocation = await this.getUserLocation();
      const region = userLocation?.region || 'global';
      
      const emergencyNumber = getEmergencyNumber(region);
      
      const allResources = await this.getCrisisResources({ severity: 'emergency' });
      
      const crisisHotlines = allResources.filter(resource => 
        resource.type === 'hotline' && resource.availability === '24/7'
      );
      
      const textSupport = allResources.filter(resource => 
        resource.type === 'text' && resource.availability === '24/7'
      );

      return {
        emergencyNumber,
        crisisHotlines: crisisHotlines.slice(0, 3), // Top 3
        textSupport: textSupport.slice(0, 2), // Top 2
      };
    } catch (error) {
      console.error('Failed to get emergency resources:', error);
      // Return basic emergency info
      return {
        emergencyNumber: '911',
        crisisHotlines: crisisResources.filter(r => r.type === 'hotline').slice(0, 3),
        textSupport: crisisResources.filter(r => r.type === 'text').slice(0, 2),
      };
    }
  }

  /**
   * Initiate contact with a crisis resource
   */
  async contactResource(resource: CrisisResource, method: 'phone' | 'text' | 'chat' | 'website'): Promise<boolean> {
    try {
      let url: string | null = null;

      switch (method) {
        case 'phone':
          if (resource.phone) {
            url = `tel:${resource.phone}`;
          }
          break;
        case 'text':
          if (resource.textNumber) {
            url = `sms:${resource.textNumber}`;
          }
          break;
        case 'chat':
          if (resource.chatUrl) {
            url = resource.chatUrl;
          }
          break;
        case 'website':
          if (resource.website) {
            url = resource.website;
          }
          break;
      }

      if (url) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          
          // Log usage for analytics (anonymized)
          await this.logResourceUsage(resource.id, method);
          
          return true;
        } else {
          Alert.alert(
            'Unable to Open',
            `Cannot open ${method} for this resource. Please try another contact method.`
          );
          return false;
        }
      } else {
        Alert.alert(
          'Contact Method Unavailable',
          `${method} is not available for this resource. Please try another contact method.`
        );
        return false;
      }
    } catch (error) {
      console.error('Failed to contact resource:', error);
      Alert.alert(
        'Contact Failed',
        'Unable to initiate contact. Please try again or use another resource.'
      );
      return false;
    }
  }

  /**
   * Get user's location for region-specific resources
   */
  async getUserLocation(): Promise<UserLocation | null> {
    try {
      // Try to get cached location first
      const cachedLocation = await AsyncStorage.getItem(this.USER_LOCATION_KEY);
      if (cachedLocation) {
        const parsed = JSON.parse(cachedLocation);
        // Use cached if less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.location;
        }
      }

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return this.getLocationFromIP();
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      // Reverse geocode to get region
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const region = this.mapCountryToRegion(address.country || '');
        
        const userLocation: UserLocation = {
          region,
          country: address.country || '',
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        };

        // Cache location
        await AsyncStorage.setItem(this.USER_LOCATION_KEY, JSON.stringify({
          location: userLocation,
          timestamp: Date.now(),
        }));

        return userLocation;
      }

      return null;
    } catch (error) {
      console.error('Failed to get user location:', error);
      return this.getLocationFromIP();
    }
  }

  /**
   * Fallback location detection using IP geolocation
   */
  private async getLocationFromIP(): Promise<UserLocation | null> {
    try {
      // This would typically use a geolocation API
      // For now, return a default location
      return {
        region: 'us',
        country: 'United States',
      };
    } catch (error) {
      console.error('Failed to get location from IP:', error);
      return null;
    }
  }

  /**
   * Map country names to our region codes
   */
  private mapCountryToRegion(country: string): string {
    const countryMap: Record<string, string> = {
      'United States': 'us',
      'Canada': 'canada',
      'United Kingdom': 'uk',
      'Australia': 'australia',
      'India': 'india',
      'Germany': 'eu',
      'France': 'eu',
      'Spain': 'eu',
      'Italy': 'eu',
      'Netherlands': 'eu',
      // Add more mappings as needed
    };

    return countryMap[country] || 'global';
  }

  /**
   * Get user's crisis contact preferences
   */
  async getUserPreferences(): Promise<{
    contactMethod: 'phone' | 'text' | 'chat';
    language: string;
  } | null> {
    try {
      const preferences = await AsyncStorage.getItem(this.CRISIS_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  /**
   * Update user's crisis contact preferences
   */
  async updateUserPreferences(preferences: {
    contactMethod: 'phone' | 'text' | 'chat';
    language: string;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CRISIS_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  }

  /**
   * Cache crisis resources for offline access
   */
  private async cacheResources(resources: CrisisResource[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.RESOURCE_CACHE_KEY, JSON.stringify({
        resources,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to cache resources:', error);
    }
  }

  /**
   * Get cached crisis resources
   */
  private async getCachedResources(): Promise<CrisisResource[]> {
    try {
      const cached = await AsyncStorage.getItem(this.RESOURCE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.resources || [];
      }
      // Return basic resources as final fallback
      return crisisResources.filter(r => r.region === 'global' || r.region === 'us').slice(0, 5);
    } catch (error) {
      console.error('Failed to get cached resources:', error);
      return crisisResources.slice(0, 5);
    }
  }

  /**
   * Log resource usage for analytics (anonymized)
   */
  private async logResourceUsage(resourceId: string, method: string): Promise<void> {
    try {
      // This would typically send anonymized usage data to analytics
      console.log(`Resource used: ${resourceId} via ${method}`);
    } catch (error) {
      console.error('Failed to log resource usage:', error);
    }
  }

  /**
   * Validate and update crisis resources
   */
  async validateResources(): Promise<{
    valid: number;
    invalid: number;
    needsUpdate: string[];
  }> {
    const result = {
      valid: 0,
      invalid: 0,
      needsUpdate: [] as string[],
    };

    for (const resource of crisisResources) {
      try {
        // Check if resource was verified recently (within 6 months)
        const lastVerified = new Date(resource.lastVerified);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (lastVerified < sixMonthsAgo) {
          result.needsUpdate.push(resource.id);
        }

        // Basic validation of contact methods
        if (resource.phone || resource.textNumber || resource.website || resource.chatUrl) {
          result.valid++;
        } else {
          result.invalid++;
        }
      } catch (error) {
        result.invalid++;
      }
    }

    return result;
  }

  /**
   * Get crisis resources by specialization
   */
  async getSpecializedResources(specialization: string): Promise<CrisisResource[]> {
    const userLocation = await this.getUserLocation();
    
    return getRecommendedResources({
      region: userLocation?.region,
      specialization,
      isEmergency: false,
    });
  }

  /**
   * Search crisis resources
   */
  searchResources(query: string): CrisisResource[] {
    const lowercaseQuery = query.toLowerCase();
    
    return crisisResources.filter(resource =>
      resource.name.toLowerCase().includes(lowercaseQuery) ||
      resource.description.toLowerCase().includes(lowercaseQuery) ||
      resource.specializations?.some(spec => 
        spec.toLowerCase().includes(lowercaseQuery)
      )
    );
  }
}

export const crisisResourceService = new CrisisResourceService();
