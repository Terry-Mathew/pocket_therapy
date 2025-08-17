---
type: "always_apply"
---

RULE: Test Critical Paths
✅ Test all mood logging functionality
✅ Test offline queue mechanisms
✅ Test crisis detection logic
✅ Mock external dependencies

import { render, fireEvent } from '@testing-library/react-native';

test('mood selection updates state correctly', () => {
  const onMoodSelect = jest.fn();
  const { getByLabelText } = render(
    <MoodSelector onMoodSelect={onMoodSelect} />
  );
  
  fireEvent.press(getByLabelText('Select sad mood'));
  expect(onMoodSelect).toHaveBeenCalledWith(2);
});


RULE: Test User Workflows End-to-End
✅ Complete mood check-in flow
✅ SOS to breathing session flow  
✅ Exercise completion flow
✅ Offline sync scenarios

// Test complete user journey
describe('Mood Check-in Flow', () => {
  it('should complete check-in and show recommendations', async () => {
    // Navigation, form submission, API calls, UI updates
  });
});


RULE: Pre-deployment Checks
✅ ESLint passes with zero warnings
✅ TypeScript compilation with strict mode
✅ All tests pass in CI/CD pipeline
✅ Bundle size under 50MB with assets

// .eslintrc.js
module.exports = {
  extends: ['@react-native-community', 'prettier'],
  rules: {
    'react-native/no-unused-styles': 'error',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};


RULE: Environment Management
✅ Use react-native-config for environment variables
✅ Different configurations for dev/staging/prod
✅ Never commit sensitive keys to repository
✅ Use Expo Secrets for managed builds

// .env.development
API_BASE_URL=https://dev-api.pockettherapy.com
ENABLE_DEV_TOOLS=true

// .env.production  
API_BASE_URL=https://api.pockettherapy.com
ENABLE_DEV_TOOLS=false


PRE-BUILD VALIDATION:
□ All design tokens used correctly (no hardcoded values)
□ Accessibility labels on all interactive elements
□ Crisis flows work offline
□ Performance tested on low-end devices
□ Error boundaries implemented
□ Loading states for all async operations
□ Haptic feedback appropriate for each interaction
□ TypeScript strict mode passes
□ Bundle size under limits
□ Privacy compliance implemented
