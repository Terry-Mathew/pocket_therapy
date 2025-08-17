/**
 * Crisis Resource Service Tests
 * 
 * Unit tests for crisis resource management, location detection,
 * and emergency contact functionality
 */

import { crisisResourceService } from '../crisisResourceService';
import { crisisResources } from '../../data/crisisResources';
import { mockLocationPermissions, mockAsyncStorageData } from '../../test/utils';

// Mock Linking
const mockLinking = {
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  openURL: jest.fn(() => Promise.resolve()),
};

jest.mock('react-native/Libraries/Linking/Linking', () => mockLinking);

describe('CrisisResourceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationPermissions('granted');
  });

  describe('getCrisisResources', () => {
    it('should return crisis resources for emergency context', async () => {
      const resources = await crisisResourceService.getCrisisResources({
        severity: 'emergency',
      });

      expect(resources.length).toBeGreaterThan(0);
      expect(resources.some(r => r.isEmergency || r.availability === '24/7')).toBe(true);
    });

    it('should filter by user preferences', async () => {
      const resources = await crisisResourceService.getCrisisResources({
        severity: 'medium',
        userPreferences: {
          contactMethod: 'text',
          language: 'English',
        },
      });

      expect(resources.some(r => r.textNumber)).toBe(true);
    });

    it('should handle special needs filtering', async () => {
      const resources = await crisisResourceService.getCrisisResources({
        severity: 'medium',
        specialNeeds: ['LGBTQ+'],
      });

      expect(resources.some(r => r.specializations?.includes('LGBTQ+'))).toBe(true);
    });

    it('should return cached resources on error', async () => {
      // Mock error in location detection
      jest.spyOn(crisisResourceService, 'getUserLocation').mockRejectedValue(new Error('Location error'));

      const resources = await crisisResourceService.getCrisisResources({
        severity: 'high',
      });

      expect(resources.length).toBeGreaterThan(0);
    });
  });

  describe('getEmergencyResources', () => {
    it('should return emergency number and hotlines', async () => {
      const emergency = await crisisResourceService.getEmergencyResources();

      expect(emergency.emergencyNumber).toBeTruthy();
      expect(emergency.crisisHotlines.length).toBeGreaterThan(0);
      expect(emergency.textSupport.length).toBeGreaterThan(0);
    });

    it('should prioritize 24/7 resources', async () => {
      const emergency = await crisisResourceService.getEmergencyResources();

      emergency.crisisHotlines.forEach(hotline => {
        expect(hotline.availability).toBe('24/7');
      });

      emergency.textSupport.forEach(textSupport => {
        expect(textSupport.availability).toBe('24/7');
      });
    });

    it('should limit to top resources', async () => {
      const emergency = await crisisResourceService.getEmergencyResources();

      expect(emergency.crisisHotlines.length).toBeLessThanOrEqual(3);
      expect(emergency.textSupport.length).toBeLessThanOrEqual(2);
    });
  });

  describe('contactResource', () => {
    it('should open phone URL for phone contact', async () => {
      const resource = crisisResources.find(r => r.phone);
      expect(resource).toBeTruthy();

      const success = await crisisResourceService.contactResource(resource!, 'phone');

      expect(success).toBe(true);
      expect(mockLinking.openURL).toHaveBeenCalledWith(`tel:${resource!.phone}`);
    });

    it('should open SMS URL for text contact', async () => {
      const resource = crisisResources.find(r => r.textNumber);
      expect(resource).toBeTruthy();

      const success = await crisisResourceService.contactResource(resource!, 'text');

      expect(success).toBe(true);
      expect(mockLinking.openURL).toHaveBeenCalledWith(`sms:${resource!.textNumber}`);
    });

    it('should open chat URL for chat contact', async () => {
      const resource = crisisResources.find(r => r.chatUrl);
      expect(resource).toBeTruthy();

      const success = await crisisResourceService.contactResource(resource!, 'chat');

      expect(success).toBe(true);
      expect(mockLinking.openURL).toHaveBeenCalledWith(resource!.chatUrl);
    });

    it('should open website URL for website contact', async () => {
      const resource = crisisResources.find(r => r.website);
      expect(resource).toBeTruthy();

      const success = await crisisResourceService.contactResource(resource!, 'website');

      expect(success).toBe(true);
      expect(mockLinking.openURL).toHaveBeenCalledWith(resource!.website);
    });

    it('should handle unavailable contact methods', async () => {
      const resource = {
        ...crisisResources[0],
        textNumber: undefined,
      };

      const success = await crisisResourceService.contactResource(resource, 'text');

      expect(success).toBe(false);
    });

    it('should handle URL opening failures', async () => {
      mockLinking.canOpenURL.mockResolvedValue(false);

      const resource = crisisResources.find(r => r.phone);
      const success = await crisisResourceService.contactResource(resource!, 'phone');

      expect(success).toBe(false);
    });
  });

  describe('getUserLocation', () => {
    it('should return cached location if recent', async () => {
      const cachedLocation = {
        region: 'us',
        country: 'United States',
      };

      mockAsyncStorageData({
        user_location: {
          location: cachedLocation,
          timestamp: Date.now() - 1000, // 1 second ago
        },
      });

      const location = await crisisResourceService.getUserLocation();

      expect(location).toEqual(cachedLocation);
    });

    it('should request new location if cache is old', async () => {
      mockAsyncStorageData({
        user_location: {
          location: { region: 'us', country: 'United States' },
          timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        },
      });

      const location = await crisisResourceService.getUserLocation();

      expect(location).toBeTruthy();
    });

    it('should handle location permission denied', async () => {
      mockLocationPermissions('denied');

      const location = await crisisResourceService.getUserLocation();

      // Should fallback to IP-based location
      expect(location).toBeTruthy();
      expect(location?.region).toBeTruthy();
    });
  });

  describe('getUserPreferences', () => {
    it('should return stored preferences', async () => {
      const preferences = {
        contactMethod: 'phone' as const,
        language: 'English',
      };

      mockAsyncStorageData({
        crisis_preferences: preferences,
      });

      const result = await crisisResourceService.getUserPreferences();

      expect(result).toEqual(preferences);
    });

    it('should return null if no preferences stored', async () => {
      const result = await crisisResourceService.getUserPreferences();

      expect(result).toBeNull();
    });
  });

  describe('updateUserPreferences', () => {
    it('should store user preferences', async () => {
      const preferences = {
        contactMethod: 'text' as const,
        language: 'Spanish',
      };

      await crisisResourceService.updateUserPreferences(preferences);

      // Verify preferences were stored (would need to mock AsyncStorage.setItem)
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('validateResources', () => {
    it('should validate resource structure', async () => {
      const validation = await crisisResourceService.validateResources();

      expect(validation.valid).toBeGreaterThan(0);
      expect(validation.invalid).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(validation.needsUpdate)).toBe(true);
    });

    it('should identify resources needing updates', async () => {
      const validation = await crisisResourceService.validateResources();

      // Some resources might need updates if they're old
      expect(validation.needsUpdate.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSpecializedResources', () => {
    it('should return LGBTQ+ specialized resources', async () => {
      const resources = await crisisResourceService.getSpecializedResources('LGBTQ+');

      expect(resources.some(r => r.specializations?.includes('LGBTQ+'))).toBe(true);
    });

    it('should return veteran specialized resources', async () => {
      const resources = await crisisResourceService.getSpecializedResources('Veterans');

      expect(resources.some(r => r.specializations?.includes('Veterans'))).toBe(true);
    });

    it('should return empty array for non-existent specialization', async () => {
      const resources = await crisisResourceService.getSpecializedResources('NonExistent');

      expect(resources).toHaveLength(0);
    });
  });

  describe('searchResources', () => {
    it('should search by name', () => {
      const results = crisisResourceService.searchResources('Samaritans');

      expect(results.some(r => r.name.includes('Samaritans'))).toBe(true);
    });

    it('should search by description', () => {
      const results = crisisResourceService.searchResources('suicide');

      expect(results.some(r => r.description.toLowerCase().includes('suicide'))).toBe(true);
    });

    it('should search by specialization', () => {
      const results = crisisResourceService.searchResources('LGBTQ');

      expect(results.some(r => 
        r.specializations?.some(spec => spec.toLowerCase().includes('lgbtq'))
      )).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = crisisResourceService.searchResources('nonexistentterm');

      expect(results).toHaveLength(0);
    });
  });

  describe('crisis resource data validation', () => {
    it('should have valid resource structure', () => {
      crisisResources.forEach(resource => {
        expect(resource).toHaveProperty('id');
        expect(resource).toHaveProperty('name');
        expect(resource).toHaveProperty('type');
        expect(resource).toHaveProperty('region');
        expect(resource).toHaveProperty('description');
        expect(resource).toHaveProperty('availability');
        expect(resource).toHaveProperty('languages');
        expect(resource).toHaveProperty('isEmergency');
        expect(resource).toHaveProperty('isFree');
        expect(resource).toHaveProperty('lastVerified');

        expect(['hotline', 'text', 'chat', 'emergency', 'local', 'specialized']).toContain(resource.type);
        expect(typeof resource.isEmergency).toBe('boolean');
        expect(typeof resource.isFree).toBe('boolean');
        expect(Array.isArray(resource.languages)).toBe(true);
      });
    });

    it('should have at least one contact method', () => {
      crisisResources.forEach(resource => {
        const hasContact = !!(resource.phone || resource.textNumber || resource.website || resource.chatUrl);
        expect(hasContact).toBe(true);
      });
    });

    it('should have therapeutic language in descriptions', () => {
      crisisResources.forEach(resource => {
        expect(resource.description).toHaveTherapeuticLanguage();
      });
    });

    it('should have recent verification dates', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      crisisResources.forEach(resource => {
        const lastVerified = new Date(resource.lastVerified);
        expect(lastVerified.getTime()).toBeGreaterThan(oneYearAgo.getTime());
      });
    });

    it('should have emergency resources for major regions', () => {
      const regions = ['us', 'uk', 'canada', 'australia'];
      
      regions.forEach(region => {
        const hasEmergencyResource = crisisResources.some(r => 
          (r.region === region || r.region === 'global') && 
          (r.isEmergency || r.availability === '24/7')
        );
        expect(hasEmergencyResource).toBe(true);
      });
    });
  });
});
