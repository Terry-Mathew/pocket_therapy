/**
 * Navigation E2E Tests for PocketTherapy
 * 
 * Tests the main navigation flows, tab switching, and SOS button functionality.
 * These tests run on the web version to validate navigation logic.
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should show authentication screen for unauthenticated users', async ({ page }) => {
    // Should show the auth screen with welcome message
    await expect(page.getByText('Welcome to PocketTherapy')).toBeVisible();
    await expect(page.getByText('Continue with Google')).toBeVisible();
    await expect(page.getByText('Try as Guest')).toBeVisible();
  });

  test('should navigate to guest mode and show main tabs', async ({ page }) => {
    // Click "Try as Guest" button
    await page.getByTestId('guest-signin-button').click();
    
    // Wait for navigation to complete
    await page.waitForTimeout(1000);
    
    // Should show onboarding screen first
    await expect(page.getByText('Welcome to PocketTherapy')).toBeVisible();
    await expect(page.getByText("Let's get started")).toBeVisible();
    
    // Complete onboarding
    await page.getByTestId('start-onboarding-button').click();
    
    // Wait for navigation to main app
    await page.waitForTimeout(1000);
    
    // Should show main tab navigation
    await expect(page.getByTestId('home-tab')).toBeVisible();
    await expect(page.getByTestId('exercises-tab')).toBeVisible();
    await expect(page.getByTestId('insights-tab')).toBeVisible();
    await expect(page.getByTestId('profile-tab')).toBeVisible();
  });

  test('should navigate between tabs correctly', async ({ page }) => {
    // Set up guest user and complete onboarding
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(500);
    
    // Test Home tab (should be active by default)
    await expect(page.getByText('Good')).toBeVisible(); // Greeting text
    await expect(page.getByTestId('mood-checkin-button')).toBeVisible();
    
    // Navigate to Exercises tab
    await page.getByTestId('exercises-tab').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Choose from 31 therapeutic exercises')).toBeVisible();
    await expect(page.getByTestId('category-breathing')).toBeVisible();
    
    // Navigate to Insights tab
    await page.getByTestId('insights-tab').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Understand your mood patterns and progress')).toBeVisible();
    await expect(page.getByTestId('view-trends-button')).toBeVisible();
    
    // Navigate to Profile tab
    await page.getByTestId('profile-tab').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Guest Account')).toBeVisible();
    await expect(page.getByText('Upgrade to Google Account')).toBeVisible();
  });

  test('should show persistent SOS button on all tabs', async ({ page }) => {
    // Set up guest user and complete onboarding
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(500);
    
    // Check SOS button is visible on Home tab
    await expect(page.getByTestId('sos-button')).toBeVisible();
    
    // Check SOS button is visible on Exercises tab
    await page.getByTestId('exercises-tab').click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId('sos-button')).toBeVisible();
    
    // Check SOS button is visible on Insights tab
    await page.getByTestId('insights-tab').click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId('sos-button')).toBeVisible();
    
    // Check SOS button is visible on Profile tab
    await page.getByTestId('profile-tab').click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId('sos-button')).toBeVisible();
  });

  test('should handle SOS button interaction', async ({ page }) => {
    // Set up guest user and complete onboarding
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(500);
    
    // Click SOS button
    await page.getByTestId('sos-button').click();
    
    // For now, just verify the button is clickable
    // TODO: Add SOS flow navigation tests when implemented
    await expect(page.getByTestId('sos-button')).toBeVisible();
  });

  test('should show guest mode indicators', async ({ page }) => {
    // Set up guest user and complete onboarding
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(500);
    
    // Check Home screen shows guest mode indicator
    await expect(page.getByText('Guest Mode')).toBeVisible();
    
    // Check Insights screen shows guest mode limitation
    await page.getByTestId('insights-tab').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Limited Insights in Guest Mode')).toBeVisible();
    
    // Check Profile screen shows upgrade option
    await page.getByTestId('profile-tab').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Upgrade to Google Account')).toBeVisible();
  });

  test('should handle onboarding skip flow', async ({ page }) => {
    // Click "Try as Guest" button
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    
    // Skip onboarding
    await page.getByTestId('skip-onboarding-button').click();
    await page.waitForTimeout(500);
    
    // Should navigate directly to main app
    await expect(page.getByTestId('home-tab')).toBeVisible();
    await expect(page.getByText('Good')).toBeVisible(); // Greeting text
  });

  test('should maintain navigation state across tab switches', async ({ page }) => {
    // Set up guest user and complete onboarding
    await page.getByTestId('guest-signin-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('start-onboarding-button').click();
    await page.waitForTimeout(500);
    
    // Navigate to Exercises tab and verify content
    await page.getByTestId('exercises-tab').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Categories')).toBeVisible();
    
    // Navigate away and back
    await page.getByTestId('home-tab').click();
    await page.waitForTimeout(300);
    await page.getByTestId('exercises-tab').click();
    await page.waitForTimeout(300);
    
    // Content should still be there
    await expect(page.getByText('Categories')).toBeVisible();
    await expect(page.getByTestId('category-breathing')).toBeVisible();
  });
});
