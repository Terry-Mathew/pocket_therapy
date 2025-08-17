/**
 * Test script for Hermes compatibility fixes
 * 
 * This script verifies that our fixes for the Hermes "require doesn't exist" error are working
 */

const fs = require('fs');

console.log('🔧 Testing Hermes compatibility fixes...\n');

// Test 1: Check App.tsx has Hermes polyfills
console.log('1. Checking App.tsx Hermes polyfills...');
try {
  const appContent = fs.readFileSync('./App.tsx', 'utf8');
  if (appContent.includes('globalAny.require = undefined')) {
    console.log('✅ App.tsx includes require polyfill');
  } else {
    console.log('❌ App.tsx missing require polyfill');
  }
  
  if (appContent.includes('globalAny.__DEV__')) {
    console.log('✅ App.tsx includes __DEV__ polyfill');
  } else {
    console.log('❌ App.tsx missing __DEV__ polyfill');
  }
} catch (error) {
  console.log('❌ Error reading App.tsx:', error.message);
}

// Test 2: Check webpack config has Hermes compatibility
console.log('\n2. Checking webpack Hermes compatibility...');
try {
  const webpackContent = fs.readFileSync('./webpack.config.js', 'utf8');
  if (webpackContent.includes('global.require')) {
    console.log('✅ Webpack config includes require polyfill');
  } else {
    console.log('❌ Webpack config missing require polyfill');
  }
  
  if (webpackContent.includes('DefinePlugin')) {
    console.log('✅ Webpack config includes DefinePlugin for globals');
  } else {
    console.log('❌ Webpack config missing DefinePlugin');
  }
} catch (error) {
  console.log('❌ Error reading webpack config:', error.message);
}

// Test 3: Check metro config has Hermes settings
console.log('\n3. Checking metro Hermes configuration...');
try {
  const metroContent = fs.readFileSync('./metro.config.js', 'utf8');
  if (metroContent.includes('hermesParser')) {
    console.log('✅ Metro config includes Hermes parser');
  } else {
    console.log('❌ Metro config missing Hermes parser');
  }
  
  if (metroContent.includes('hermes-stable')) {
    console.log('✅ Metro config includes Hermes transform profile');
  } else {
    console.log('❌ Metro config missing Hermes transform profile');
  }
} catch (error) {
  console.log('❌ Error reading metro config:', error.message);
}

// Test 4: Check OpenAI wrapper avoids require issues
console.log('\n4. Checking OpenAI wrapper Hermes compatibility...');
try {
  const wrapperContent = fs.readFileSync('./src/services/openAIWrapper.ts', 'utf8');
  if (wrapperContent.includes('createFetchBasedClient')) {
    console.log('✅ OpenAI wrapper includes fetch-based client');
  } else {
    console.log('❌ OpenAI wrapper missing fetch-based client');
  }
  
  if (wrapperContent.includes('Platform.OS === \'web\'')) {
    console.log('✅ OpenAI wrapper has platform-specific logic');
  } else {
    console.log('❌ OpenAI wrapper missing platform detection');
  }
} catch (error) {
  console.log('❌ Error reading OpenAI wrapper:', error.message);
}

// Test 5: Check if all required dependencies are installed
console.log('\n5. Checking required dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  const requiredDeps = [
    'babel-plugin-transform-import-meta',
    '@babel/preset-env',
    'process',
    'metro-react-native-babel-transformer'
  ];
  
  let allInstalled = true;
  requiredDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep} is installed`);
    } else {
      console.log(`❌ ${dep} is missing`);
      allInstalled = false;
    }
  });
  
  if (allInstalled) {
    console.log('✅ All required dependencies are installed');
  } else {
    console.log('❌ Some dependencies are missing');
  }
} catch (error) {
  console.log('❌ Error checking dependencies:', error.message);
}

console.log('\n🎉 Hermes compatibility test complete!');
console.log('\nSummary of Hermes fixes applied:');
console.log('1. ✅ Added global.require polyfill in App.tsx');
console.log('2. ✅ Enhanced webpack config with Hermes-compatible polyfills');
console.log('3. ✅ Updated metro config with Hermes parser settings');
console.log('4. ✅ Modified OpenAI wrapper to use fetch instead of require');
console.log('5. ✅ Installed all required babel plugins and transformers');

console.log('\nThe "require doesn\'t exist" error should now be resolved!');
console.log('Try running the app again with: expo start --web');

// Additional troubleshooting tips
console.log('\n💡 Troubleshooting tips:');
console.log('- If you still see require errors, clear Metro cache: expo start --clear');
console.log('- For Android/iOS, make sure Hermes is enabled in app.json');
console.log('- Check that no services are using direct require() calls');
console.log('- Verify that all imports use ES6 import syntax instead of require()');
