# 📱 Mobile Testing Guide for PocketTherapy

This guide provides step-by-step instructions for testing the PocketTherapy app on your mobile device using Expo Go.

## 🚀 Quick Start

### Prerequisites
- **Mobile Device**: iOS (iPhone) or Android smartphone
- **WiFi Connection**: Both your computer and mobile device must be on the same WiFi network
- **Expo Go App**: Download from App Store (iOS) or Google Play Store (Android)

### Step 1: Install Expo Go App

#### For iOS (iPhone):
1. Open the **App Store** on your iPhone
2. Search for **"Expo Go"**
3. Install the app by Expo (it's free)
4. Open the app and create an account or sign in

#### For Android:
1. Open **Google Play Store** on your Android device
2. Search for **"Expo Go"**
3. Install the app by Expo (it's free)
4. Open the app and create an account or sign in

### Step 2: Start the Development Server

On your computer, navigate to the PocketTherapy project directory and run:

```bash
cd "e:\Coding_Projects\Pocket Therapy\PocketTherapy"
npx expo start
```

You should see output similar to:
```
Starting project at E:\Coding_Projects\Pocket Therapy\PocketTherapy
Starting Metro Bundler

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▀▀ ████ ▄█ ▄▄▄▄▄ █
█ █   █ █▄▀██▀██▀ █ █   █ █
█ █▄▄▄█ █ ▄ █  ▀ ██ █▄▄▄█ █
█▄▄▄▄▄▄▄█ █ ▀▄█ █▄█▄▄▄▄▄▄▄█
█▄ █▄▀▀▄ ▀▀█  ▄▀▄▄▀  ▄▀▄▄▀█
██  ██▄▄▀ ▀▀  ▀ ▀█▄▀ ▀▀█▄▄█
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

› Metro waiting on exp://192.168.0.101:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Web is waiting on http://localhost:8081
```

### Step 3: Connect Your Mobile Device

#### For iOS (iPhone):
1. Open the **Camera app** on your iPhone
2. Point the camera at the QR code displayed in your terminal
3. A notification will appear at the top of your screen
4. Tap the notification to open the app in Expo Go

#### For Android:
1. Open the **Expo Go app** on your Android device
2. Tap **"Scan QR Code"** at the bottom of the screen
3. Point your camera at the QR code displayed in your terminal
4. The app will automatically load

### Step 4: Test the App

Once the app loads on your mobile device, you should see:

1. **PocketTherapy Branding**: The app title and therapeutic color scheme
2. **Dependency List**: A list of all installed packages with status indicators
3. **Test Buttons**: 
   - **"Test Haptics"** - Tap to feel vibration feedback
   - **"Test AsyncStorage"** - Tap to test local data storage

#### Testing Haptics:
- Tap the "Test Haptics" button
- You should feel a gentle vibration on your device
- If no vibration occurs, haptics may be disabled in your device settings

#### Testing Storage:
- Tap the "Test AsyncStorage" button
- You should see an alert confirming successful storage operation
- This tests the app's ability to save data locally

## 🔧 Troubleshooting

### Common Issues and Solutions:

#### "Unable to connect to Metro"
**Problem**: App won't load or shows connection error
**Solutions**:
1. Ensure both devices are on the same WiFi network
2. Try restarting the Expo development server:
   ```bash
   # Press Ctrl+C to stop, then restart
   npx expo start --clear
   ```
3. Check your computer's firewall settings
4. Try using the tunnel option: `npx expo start --tunnel`

#### "QR Code won't scan"
**Problem**: Camera won't recognize the QR code
**Solutions**:
1. Ensure good lighting when scanning
2. Hold the camera steady and at proper distance
3. Try manually entering the URL:
   - In Expo Go, tap "Enter URL manually"
   - Type: `exp://192.168.0.101:8081` (replace IP with your computer's IP)

#### "App crashes or won't load"
**Problem**: App loads but immediately crashes
**Solutions**:
1. Check the terminal for error messages
2. Restart the development server with cache clearing:
   ```bash
   npx expo start --clear
   ```
3. Update Expo Go app to the latest version
4. Restart your mobile device

#### "Haptics don't work"
**Problem**: Test Haptics button doesn't vibrate
**Solutions**:
1. Check if vibration is enabled in your device settings
2. Ensure your device supports haptic feedback
3. Try different haptic intensities in the app

### Network Configuration:

If you're having connection issues, you can find your computer's IP address:

#### Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

#### macOS/Linux:
```bash
ifconfig
```
Look for your WiFi interface IP address

## 📊 Performance Testing

### What to Test on Mobile:

1. **App Loading Speed**: Note how quickly the app loads initially
2. **UI Responsiveness**: Test scrolling and button interactions
3. **Haptic Feedback**: Verify vibration works as expected
4. **Storage Operations**: Confirm data persistence works
5. **Memory Usage**: Monitor if the app runs smoothly without lag
6. **Battery Impact**: Check if the app drains battery excessively during testing

### Expected Performance:
- **Initial Load**: Should complete within 3-5 seconds
- **Button Interactions**: Should respond immediately
- **Haptics**: Should trigger within 100ms of button press
- **Storage**: Should save/retrieve data instantly

## 🎯 Testing Checklist

- [ ] Expo Go app installed and working
- [ ] QR code scanning successful
- [ ] App loads without errors
- [ ] PocketTherapy branding displays correctly
- [ ] Therapeutic colors render properly (#F5F2E8 warm cream background)
- [ ] Dependency list shows all packages
- [ ] "Test Haptics" button triggers vibration
- [ ] "Test AsyncStorage" button shows success alert
- [ ] App remains stable during testing
- [ ] No crashes or freezing observed

## 🔄 Development Workflow

### Making Changes:
1. Edit code on your computer
2. Save the file
3. The app will automatically reload on your mobile device (Fast Refresh)
4. Test the changes immediately

### Debugging:
1. Check the terminal for error messages
2. Use `console.log()` statements in your code
3. View logs in the terminal while testing on mobile
4. Use React Developer Tools for advanced debugging

## 📱 Device-Specific Notes

### iOS Considerations:
- Camera app can scan QR codes directly
- Haptics work on iPhone 6s and newer
- Some features may require iOS 13+ for optimal experience

### Android Considerations:
- Must use Expo Go app to scan QR codes
- Haptic feedback varies by device manufacturer
- Performance may vary based on Android version and device specs

## 🚀 Next Steps

Once mobile testing is working:
1. Test the app on different screen sizes
2. Verify touch interactions work smoothly
3. Check that the therapeutic color scheme looks good on mobile
4. Prepare for implementing actual PocketTherapy features

---

**Need Help?** If you encounter issues not covered in this guide, check the Expo documentation at https://docs.expo.dev/ or create an issue in the project repository.
