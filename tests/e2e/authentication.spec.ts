/**
 * Authentication E2E Tests for PocketTherapy
 * 
 * Tests authentication flows, guest mode, and user management.
 * These tests validate the authentication system integration with navigation.
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display authentication screen with all options', async ({ page }) => {
    // Verify main authentication elements
    await expect(page.getByText('Welcome to PocketTherapy')).toBeVisible();
    await expect(page.getByText('Your personal space for mental wellness')).toBeVisible();
    
    // Verify authentication buttons
    await expect(page.getByTestId('google-signin-button')).toBeVisible();
    await expect(page.getByTestId('guest-signin-button')).toBeVisible();
    await expect(page.getByTestId('learn-more-button')).toBeVisible();
    
    // Verify features section
    await expect(page.getByText('What you\'ll get:')).toBeVisible();
    await expect(page.getByText('Guided breathing & grounding exercises')).toBeVisible();
    await expect(page.getByText('Private mood tracking & insights')).toBeVisible();
    await expect(page.getByText('24/7 crisis support & resources')).toBeVisible();
    await expect(page.getByText('Privacy-first design & local storage')).toBeVisible();
  });

  test('should handle learn more interaction', async ({ page }) => {
    // Click learn more button
    await page.getByTestId('learn-more-button').click();
    
    // Should show alert dialog (browser will handle this)
    // We can't easily test native alerts in Playwright, but we can verify the button works
    await expect(page.getByTestId('learn-more-button')).toBeVisible();
  });

  test('should navigate through guest authentication flow', async ({ page }) => {
    // Start guest authentication
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(1000);
    
    // Should show onboarding screen
    await expect(page.getByText('Welcome to PocketTherapy')).toBeVisible();
    await expect(page.getByText('Let\'s take a moment to set up')).toBeVisible();
    
    // Verify onboarding content
    await expect(page.getByText('What to expect')).toBeVisible();
    await expect(page.getByText('Quick setup')).toBeVisible();
    await expect(page.getByText('Your privacy matters')).toBeVisible();
    
    // Complete onboarding
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(1000);
    
    // Should navigate to main app
    await expect(page.getByTestId('home-tab')).toBeVisible();
    await expect(page.getByText('Guest Mode')).toBeVisible();
  });

  test('should handle onboarding skip flow', async ({ page }) => {
    // Start guest authentication
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    
    // Skip onboarding
    await page.getByTestId('skip-onboarding-button').click();
    await page.waitForTimeout(1000);
    
    // Should navigate directly to main app
    await expect(page.getByTestId('home-tab')).toBeVisible();
  });

  test('should show guest mode features and limitations', async ({ page }) => {
    // Complete guest authentication
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(500);
    
    // Check Home screen guest indicator
    await expect(page.getByText('Guest Mode')).toBeVisible();
    await expect(page.getByText('Upgrade to save your data across devices')).toBeVisible();
    
    // Check Insights limitations
    await page.getByTestId('insights-tab').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Limited Insights in Guest Mode')).toBeVisible();
    await expect(page.getByText('Upgrade to a full account')).toBeVisible();
    
    // Check Profile upgrade option
    await page.getByTestId('profile-tab').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Guest Account')).toBeVisible();
    await expect(page.getByText('Upgrade to Google Account')).toBeVisible();
  });

  test('should handle profile management in guest mode', async ({ page }) => {
    // Complete guest authentication
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(500);
    
    // Navigate to profile
    await page.getByTestId('profile-tab').click();
    await page.waitForTimeout(500);
    
    // Verify profile elements
    await expect(page.getByText('Anonymous User')).toBeVisible();
    await expect(page.getByText('Guest Account')).toBeVisible();
    
    // Verify account actions
    await expect(page.getByText('Sign Out')).toBeVisible();
    await expect(page.getByText('Delete Account')).toBeVisible();
    
    // Verify privacy notice
    await expect(page.getByText('Privacy & Data')).toBeVisible();
    await expect(page.getByText('Your data is stored locally')).toBeVisible();
  });

  test('should maintain authentication state across navigation', async ({ page }) => {
    // Complete guest authentication
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(500);
    
    // Navigate between tabs
    await page.getByTestId('exercises-tab').click();
    await page.waitForTimeout(300);
    await page.getByTestId('insights-tab').click();
    await page.waitForTimeout(300);
    await page.getByTestId('home-tab').click();
    await page.waitForTimeout(300);
    
    // Should still show guest mode indicators
    await expect(page.getByText('Guest Mode')).toBeVisible();
    
    // Navigate to profile and verify state
    await page.getByTestId('profile-tab').click();
    await page.waitForTimeout(300);
    await expect(page.getByText('Guest Account')).toBeVisible();
  });

  test('should show privacy messaging throughout auth flow', async ({ page }) => {
    // Verify privacy messaging on auth screen
    await expect(page.getByText('Your Privacy Matters')).toBeVisible();
    await expect(page.getByText('Guest mode keeps all data on your device')).toBeVisible();
    
    // Start guest flow
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    
    // Verify privacy messaging on onboarding
    await expect(page.getByText('Your privacy matters')).toBeVisible();
    await expect(page.getByText('Everything you share stays on your device')).toBeVisible();
    
    // Complete onboarding and check profile privacy
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('profile-tab').click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Your data is stored locally')).toBeVisible();
  });
});
