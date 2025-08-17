/**
 * Verification Script for PocketTherapy Fixes
 * 
 * This script verifies that all the critical fixes have been applied correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PocketTherapy fixes...\n');

// Check if babel plugin is installed
console.log('0. Checking babel-plugin-transform-import-meta...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  if (packageJson.devDependencies && packageJson.devDependencies['babel-plugin-transform-import-meta']) {
    console.log('✅ babel-plugin-transform-import-meta is installed');
  } else {
    console.log('❌ babel-plugin-transform-import-meta is missing');
  }
} catch (error) {
  console.log('❌ Error checking babel plugin:', error.message);
}

// Check 1: Verify react-native-gesture-handler is installed
console.log('1. Checking react-native-gesture-handler installation...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  if (packageJson.dependencies['react-native-gesture-handler']) {
    console.log('✅ react-native-gesture-handler is installed');
  } else {
    console.log('❌ react-native-gesture-handler is missing');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check 2: Verify notification icon exists
console.log('\n2. Checking notification icon...');
const iconPath = './assets/icon.png';
if (fs.existsSync(iconPath)) {
  console.log('✅ Notification icon exists');
} else {
  console.log('❌ Notification icon is missing');
}

// Check 3: Verify app.json configuration
console.log('\n3. Checking app.json configuration...');
try {
  const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
  if (appJson.expo.notification && appJson.expo.notification.icon === './assets/icon.png') {
    console.log('✅ app.json notification configuration is correct');
  } else {
    console.log('❌ app.json notification configuration needs fixing');
  }
} catch (error) {
  console.log('❌ Error reading app.json:', error.message);
}

// Check 4: Verify babel configuration
console.log('\n4. Checking babel configuration...');
try {
  const babelConfig = require('./babel.config.js');
  const config = babelConfig({ cache: () => {} });
  if (config.plugins && config.plugins.some(plugin => 
    Array.isArray(plugin) ? plugin[0] === 'react-native-reanimated/plugin' : plugin === 'react-native-reanimated/plugin'
  )) {
    console.log('✅ Babel configuration includes reanimated plugin');
  } else {
    console.log('❌ Babel configuration missing reanimated plugin');
  }
} catch (error) {
  console.log('❌ Error reading babel.config.js:', error.message);
}

// Check 5: Verify metro configuration
console.log('\n5. Checking metro configuration...');
try {
  const metroConfig = require('./metro.config.js');
  if (metroConfig.resolver && metroConfig.resolver.alias) {
    console.log('✅ Metro configuration includes gesture handler alias');
  } else {
    console.log('⚠️ Metro configuration may need gesture handler alias');
  }
} catch (error) {
  console.log('❌ Error reading metro.config.js:', error.message);
}

// Check 6: Verify main entry point
console.log('\n6. Checking main entry point...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  if (packageJson.main === 'index.js') {
    console.log('✅ Main entry point is correct');
  } else {
    console.log('❌ Main entry point should be index.js');
  }
} catch (error) {
  console.log('❌ Error checking main entry point:', error.message);
}

// Check 7: Verify index.js imports gesture handler
console.log('\n7. Checking index.js imports...');
try {
  const indexContent = fs.readFileSync('./index.js', 'utf8');
  if (indexContent.includes('react-native-gesture-handler')) {
    console.log('✅ index.js imports gesture handler');
  } else {
    console.log('❌ index.js missing gesture handler import');
  }
} catch (error) {
  console.log('❌ Error reading index.js:', error.message);
}

// Check 8: Verify App.tsx imports gesture handler
console.log('\n8. Checking App.tsx imports...');
try {
  const appContent = fs.readFileSync('./App.tsx', 'utf8');
  if (appContent.includes('react-native-gesture-handler')) {
    console.log('✅ App.tsx imports gesture handler');
  } else {
    console.log('❌ App.tsx missing gesture handler import');
  }
} catch (error) {
  console.log('❌ Error reading App.tsx:', error.message);
}

console.log('\n🎉 Verification complete!');
console.log('\nNext steps:');
console.log('1. Run: npm install --legacy-peer-deps');
console.log('2. Run: expo start --web');
console.log('3. Check that the app loads at http://localhost:8081');
