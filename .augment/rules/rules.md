---
type: "always_apply"
---

RULE: File Organization
✅ Group by feature, not by file type
✅ Max 200 lines per component file
✅ Use index.js for clean imports
✅ Separate styles from component logic

/src
  /screens/HomeScreen/
    index.ts
    HomeScreen.tsx
    HomeScreen.styles.ts
    HomeScreen.types.ts
  /components/Button/
    index.ts
    Button.tsx
    Button.styles.ts

RULE: Component Naming & Props
✅ Use PascalCase for components: MoodSelector, BreathingCircle
✅ Use descriptive prop names: isSelected not active
✅ Always define TypeScript interfaces for props
✅ Export types alongside components

interface MoodSelectorProps {
  selectedMood: 1 | 2 | 3 | 4 | 5;
  onMoodSelect: (mood: number) => void;
  disabled?: boolean;
}

RULE: Local vs Global State
✅ Use useState for component-local state only
✅ Use Zustand for global app state (mood logs, settings)
✅ Use React Query for server state (exercises, sync)
✅ Never mix local and global state for same data

// ✅ Correct
const [isPressed, setIsPressed] = useState(false); // Local UI state
const { moodLogs } = useMoodStore(); // Global app state

// ❌ Wrong
const [moodLogs, setMoodLogs] = useState([]); // Should be global


RULE: Always Use Design Tokens
✅ Import colors from therapeuticColors constant
✅ Import spacing from spacing constant  
✅ Import typography from typography constant
✅ Never use hardcoded values like '#FF0000' or 16

// ✅ Correct
backgroundColor: therapeuticColors.primary,
padding: spacing['4x'],
fontSize: typography.body.fontSize

// ❌ Wrong  
backgroundColor: '#A8C09A',
padding: 16,
fontSize: 16


RULE: StyleSheet Organization
✅ Use StyleSheet.create for all styles
✅ Group styles by component section (header, content, footer)
✅ Use descriptive style names: primaryButton not btn1
✅ Keep styles in separate .styles.ts files

const styles = StyleSheet.create({
  // Header section
  header: {
    backgroundColor: therapeuticColors.background,
    paddingHorizontal: spacing['6x']
  },
  headerTitle: {
    ...typography.h2,
    color: therapeuticColors.textPrimary
  },
  
  // Content section
  moodGrid: {
    flexDirection: 'row',
    gap: spacing['2x']
  }
});


RULE: Screen Size Handling
✅ Use Dimensions API for screen-dependent sizing
✅ Test on small screens (iPhone SE, Android 5.5")
✅ Use percentage widths where possible
✅ Implement safe area handling

import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const insets = useSafeAreaInsets();

RULE: Prevent Unnecessary Re-renders
✅ Use React.memo for pure components
✅ Use useCallback for event handlers
✅ Use useMemo for expensive calculations
✅ Implement lazy loading for screens

const MoodEmoji = React.memo(({ value, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(value);
  }, [value, onPress]);
  
  return <TouchableOpacity onPress={handlePress}>...</TouchableOpacity>;
});

RULE: Clean Up Resources
✅ Clear timers in useEffect cleanup
✅ Remove event listeners on unmount
✅ Cancel network requests when component unmounts
✅ Limit FlatList data to visible items + buffer

useEffect(() => {
  const timer = setInterval(() => {
    // Breathing animation
  }, 1000);
  
  return () => clearInterval(timer); // ✅ Cleanup
}, []);

RULE: Optimize Assets
✅ Use appropriate image formats (WebP when possible)
✅ Provide @2x and @3x versions for icons
✅ Preload critical assets (SOS button, mood emojis)
✅ Use FastImage for better performance

import FastImage from 'react-native-fast-image';

<FastImage 
  source={{ uri: 'image-url', priority: FastImage.priority.high }}
  style={styles.image}
/>


RULE: Secure Data Storage
✅ Use @react-native-async-storage/async-storage for app data
✅ Use react-native-keychain for sensitive data (auth tokens)
✅ Encrypt mood logs before storing locally
✅ Never store API keys in async storage

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// ✅ App data
await AsyncStorage.setItem('moodLogs', JSON.stringify(logs));

// ✅ Sensitive data  
await Keychain.setInternetCredentials('auth', username, token);


RULE: Secure API Calls
✅ Use HTTPS only for all API calls
✅ Implement request timeouts (10s max)
✅ Add retry logic with exponential backoff
✅ Validate all API responses before using

const apiCall = async (endpoint) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (error) {
    // Handle error with retry logic
  }
};


RULE: VoiceOver/TalkBack Compliance
✅ Add accessibilityLabel to all interactive elements
✅ Use accessibilityRole for semantic meaning
✅ Implement accessibilityHint for complex actions
✅ Group related elements with accessibilityElements

<TouchableOpacity 
  accessibilityRole="button"
  accessibilityLabel="Select very sad mood"
  accessibilityHint="Double tap to log your current mood as very sad"
>
  <Text>😢</Text>
</TouchableOpacity>

RULE: Accessible Dynamic Updates
✅ Use accessibilityLiveRegion for status updates
✅ Announce important state changes
✅ Support Dynamic Type scaling
✅ Maintain focus management during navigation

// Announce completion
<View accessibilityLiveRegion="assertive">
  <Text>Mood check-in completed successfully</Text>
</View>

RULE: Offline Functionality
✅ All core features work without internet
✅ Queue actions for later sync when offline
✅ Show clear offline indicators to user
✅ Graceful degradation for network-dependent features

const [isOnline, setIsOnline] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected);
  });
  return unsubscribe;
}, []);


RULE: Conflict-Free Sync
✅ Use timestamps for conflict resolution
✅ Implement pessimistic UI for critical actions
✅ Show sync status to users
✅ Handle partial sync failures gracefully

const syncMoodLogs = async (localLogs) => {
  for (const log of localLogs) {
    try {
      await syncSingleLog(log);
      markLogAsSynced(log.id);
    } catch (error) {
      // Keep in queue for next sync attempt
      logSyncError(log.id, error);
    }
  }
};


RULE: Never Show Blank Screens
✅ Show skeleton loaders during data fetch
✅ Maximum 3 seconds for initial app load
✅ Immediate feedback for all user actions
✅ Progressive loading for complex screens

const LoadingSkeleton = () => (
  <View>
    {[...Array(3)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);


RULE: Gentle Error Recovery
✅ Never show technical error messages to users
✅ Provide actionable recovery options
✅ Log errors for debugging but don't expose them
✅ Use therapeutic language for error states

// ✅ Good error message
"That didn't work - let's try again in a moment"

// ❌ Bad error message  
"Network request failed with status 500"


RULE: Meaningful Haptics
✅ Light impact for mood selection
✅ Medium impact for button presses
✅ Strong impact for SOS actions
✅ Success pattern for completions
✅ Respect system haptic settings

import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

const handleMoodSelect = (mood) => {
  trigger('impactLight'); // ✅ Appropriate for mood selection
  onMoodSelect(mood);
};


RULE: Crisis-Safe Implementation
✅ SOS features work offline always
✅ No delays or loading states in crisis flows
✅ Large touch targets (72px minimum)
✅ Clear exit paths but not accidental exits

const SOSButton = () => (
  <TouchableOpacity
    style={styles.sosButton} // 72px diameter
    onPress={handleSOSPress}
    accessibilityLabel="Emergency support"
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Text style={styles.sosText}>SOS</Text>
  </TouchableOpacity>
);


