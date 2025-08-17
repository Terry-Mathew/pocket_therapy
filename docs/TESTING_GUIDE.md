# 🧪 **PocketTherapy Testing Guide**

## **Overview**
This guide provides comprehensive testing procedures for PocketTherapy's navigation system, authentication flows, and core functionality. Use this for manual testing on mobile devices and web browsers.

---

## 🚀 **Getting Started**

### **Start Development Server**
```bash
npm start
```

### **Mobile Testing with Expo Go**
1. Install Expo Go on your mobile device
2. Scan the QR code displayed in terminal
3. Or manually enter: `exp://192.168.0.101:8081`

### **Web Testing**
1. Open browser to `http://localhost:8081`
2. Use browser dev tools to simulate mobile devices

---

## 🔐 **Authentication Flow Testing**

### **Test 1: Initial App Load**
**Expected**: Authentication screen with welcome message
- [ ] "Welcome to PocketTherapy" title visible
- [ ] "Continue with Google" button present
- [ ] "Try as Guest" button present
- [ ] "Learn More" button present
- [ ] Features list displayed (breathing, mood tracking, crisis support, privacy)
- [ ] Privacy section visible with clear messaging

### **Test 2: Guest Mode Authentication**
**Steps**:
1. Tap "Try as Guest" button
2. Wait for navigation

**Expected**: Onboarding screen
- [ ] Welcome message with plant emoji
- [ ] "What to expect" section with 4 features
- [ ] "Quick setup" section with 3 steps
- [ ] Privacy assurance section
- [ ] "Let's get started" button
- [ ] "Skip for now" button

### **Test 3: Complete Onboarding**
**Steps**:
1. From onboarding screen, tap "Let's get started"
2. Wait for navigation

**Expected**: Main app with tab navigation
- [ ] Bottom tab bar visible with 4 tabs
- [ ] Home tab active by default
- [ ] SOS button floating above tabs
- [ ] Home screen content loaded

### **Test 4: Skip Onboarding**
**Steps**:
1. From onboarding screen, tap "Skip for now"
2. Wait for navigation

**Expected**: Direct navigation to main app
- [ ] Same as Test 3 results

---

## 🧭 **Navigation System Testing**

### **Test 5: Tab Navigation**
**Steps**: Test each tab by tapping
1. Home tab
2. Exercises tab  
3. Insights tab
4. Profile tab

**Expected for Home Tab**:
- [ ] Greeting message with time of day
- [ ] "How am I feeling?" button
- [ ] "Start 4-7-8 Breathing" button
- [ ] Guest mode indicator (if in guest mode)

**Expected for Exercises Tab**:
- [ ] "Choose from 31 therapeutic exercises" subtitle
- [ ] Search input field
- [ ] Categories section with 3 categories
- [ ] Quick access section with SOS and 2-minute relief

**Expected for Insights Tab**:
- [ ] "Understand your mood patterns" subtitle
- [ ] Guest mode limitation notice (if in guest mode)
- [ ] Weekly overview with stats
- [ ] Patterns section
- [ ] Most helpful exercises section

**Expected for Profile Tab**:
- [ ] User avatar with initials or default icon
- [ ] "Guest Account" or "Google Account" indicator
- [ ] Upgrade button (if in guest mode)
- [ ] Account actions (Sign Out, Delete Account)

### **Test 6: SOS Button**
**Steps**:
1. Verify SOS button visible on all tabs
2. Tap SOS button

**Expected**:
- [ ] SOS button visible on Home tab
- [ ] SOS button visible on Exercises tab
- [ ] SOS button visible on Insights tab
- [ ] SOS button visible on Profile tab
- [ ] SOS button responds to tap (console log for now)
- [ ] Haptic feedback on tap (mobile only)

### **Test 7: Navigation State Persistence**
**Steps**:
1. Navigate to Exercises tab
2. Navigate to Insights tab
3. Return to Exercises tab

**Expected**:
- [ ] Exercises content still loaded
- [ ] No re-loading or flickering
- [ ] Tab state maintained

---

## 👤 **User Management Testing**

### **Test 8: Guest Mode Indicators**
**Expected throughout app**:
- [ ] Home screen shows "Guest Mode" card
- [ ] Insights shows "Limited Insights in Guest Mode"
- [ ] Profile shows "Guest Account" with upgrade option
- [ ] Privacy notices mention local storage

### **Test 9: Profile Management**
**Steps**:
1. Navigate to Profile tab
2. Test various profile actions

**Expected**:
- [ ] Profile information displayed correctly
- [ ] Account type clearly indicated
- [ ] Sign out button functional
- [ ] Delete account button shows confirmation

---

## 📱 **Mobile-Specific Testing**

### **Test 10: Touch Interactions**
**Expected**:
- [ ] All buttons have minimum 44pt touch targets
- [ ] Haptic feedback on button presses
- [ ] Smooth animations between screens
- [ ] No accidental touches on tab bar

### **Test 11: Safe Area Handling**
**Expected**:
- [ ] Content not hidden behind notch/status bar
- [ ] Tab bar properly positioned above home indicator
- [ ] SOS button positioned correctly relative to tabs

### **Test 12: Keyboard Handling**
**Steps**:
1. Navigate to Exercises tab
2. Tap search input
3. Type in search field

**Expected**:
- [ ] Tab bar hides when keyboard appears
- [ ] SOS button remains accessible
- [ ] Content scrolls properly with keyboard

---

## 🌐 **Web-Specific Testing**

### **Test 13: Browser Compatibility**
**Test in multiple browsers**:
- [ ] Chrome: All features work
- [ ] Safari: All features work  
- [ ] Firefox: All features work
- [ ] Mobile browsers: Touch interactions work

### **Test 14: Responsive Design**
**Test different screen sizes**:
- [ ] Desktop: Layout adapts properly
- [ ] Tablet: Touch targets appropriate
- [ ] Mobile: Navigation optimized

---

## 🔧 **Automated Testing**

### **Run E2E Tests**
```bash
# Run all tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run in headed mode to see browser
npm run test:e2e:headed
```

### **Test Results**
- [ ] Authentication flow tests pass
- [ ] Navigation tests pass
- [ ] No console errors during tests

---

## 🐛 **Common Issues & Troubleshooting**

### **Navigation Not Working**
- Check if React Navigation dependencies are installed
- Verify SafeAreaProvider is wrapping the app
- Check console for navigation errors

### **Tabs Not Responding**
- Verify testID props are correctly set
- Check if tab bar is properly configured
- Test on different devices/browsers

### **SOS Button Not Visible**
- Check z-index styling
- Verify positioning calculations
- Test on different screen sizes

### **Authentication Flow Issues**
- Check AuthContext provider wrapping
- Verify placeholder services are working
- Check console for authentication errors

---

## ✅ **Testing Checklist**

### **Before Release**
- [ ] All manual tests pass on iOS
- [ ] All manual tests pass on Android  
- [ ] All manual tests pass on web
- [ ] E2E tests pass
- [ ] No console errors
- [ ] Performance is smooth
- [ ] Accessibility features work
- [ ] Haptic feedback works on mobile

### **Regression Testing**
- [ ] Authentication flows still work
- [ ] Navigation state persists
- [ ] SOS button always accessible
- [ ] Guest mode features work
- [ ] Profile management functional

---

## 📞 **Support**

If you encounter issues during testing:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Try restarting the development server
4. Clear browser cache for web testing
5. Restart Expo Go for mobile testing

**Development Server Commands**:
```bash
# Restart with cache clear
npm run clean && npm start

# Reset everything
npm run reset
```
