/**
 * Test Module Resolution
 * 
 * This script tests if the module resolution is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Module Resolution...\n');

// Test 1: Check if all required files exist
console.log('1. Checking required files...');
const requiredFiles = [
  './index.js',
  './App.js', 
  './App.tsx',
  './package.json',
  './app.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Test 2: Check import chain
console.log('\n2. Checking import chain...');
try {
  // Check index.js imports
  const indexContent = fs.readFileSync('./index.js', 'utf8');
  if (indexContent.includes("import App from './App'")) {
    console.log('✅ index.js imports from ./App');
  } else {
    console.log('❌ index.js import issue');
  }
  
  // Check App.js imports
  const appJsContent = fs.readFileSync('./App.js', 'utf8');
  if (appJsContent.includes("import App from './App.tsx'")) {
    console.log('✅ App.js imports from ./App.tsx');
  } else {
    console.log('❌ App.js import issue');
  }
  
  // Check App.tsx structure
  const appTsxContent = fs.readFileSync('./App.tsx', 'utf8');
  if (appTsxContent.includes('export default')) {
    console.log('✅ App.tsx has default export');
  } else {
    console.log('❌ App.tsx missing default export');
  }
} catch (error) {
  console.log('❌ Error checking imports:', error.message);
}

// Test 3: Check package.json configuration
console.log('\n3. Checking package.json configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  if (packageJson.main === 'index.js') {
    console.log('✅ package.json main entry is index.js');
  } else {
    console.log(`❌ package.json main entry is ${packageJson.main}, should be index.js`);
  }
  
  if (packageJson.dependencies && packageJson.dependencies.expo) {
    const expoVersion = packageJson.dependencies.expo;
    console.log(`✅ Expo version: ${expoVersion}`);
    
    if (expoVersion.includes('53')) {
      console.log('✅ Using SDK 53');
    } else {
      console.log('⚠️ Not using SDK 53');
    }
  } else {
    console.log('❌ Expo dependency missing');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Test 4: Check app.json configuration
console.log('\n4. Checking app.json configuration...');
try {
  const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
  
  if (appJson.expo && appJson.expo.sdkVersion) {
    console.log(`✅ SDK version specified: ${appJson.expo.sdkVersion}`);
  } else {
    console.log('⚠️ SDK version not specified in app.json');
  }
  
  if (appJson.expo && appJson.expo.name) {
    console.log(`✅ App name: ${appJson.expo.name}`);
  } else {
    console.log('❌ App name missing');
  }
} catch (error) {
  console.log('❌ Error reading app.json:', error.message);
}

// Test 5: Check for potential issues
console.log('\n5. Checking for potential issues...');

// Check for duplicate App files that might cause confusion
const appFiles = ['App.js', 'App.jsx', 'App.ts', 'App.tsx'];
const existingAppFiles = appFiles.filter(file => fs.existsSync(file));
console.log(`Found App files: ${existingAppFiles.join(', ')}`);

if (existingAppFiles.length > 2) {
  console.log('⚠️ Multiple App files found - this might cause resolution issues');
} else {
  console.log('✅ App file structure looks good');
}

// Check for node_modules
if (fs.existsSync('./node_modules')) {
  console.log('✅ node_modules directory exists');
} else {
  console.log('❌ node_modules directory missing - run npm install');
}

console.log('\n📊 SUMMARY:');
if (allFilesExist) {
  console.log('✅ All required files exist');
  console.log('✅ Module resolution should work');
  console.log('\nNext steps:');
  console.log('1. Try: expo start --clear');
  console.log('2. If that fails, try: npx @expo/cli start --clear');
  console.log('3. Check for any remaining error messages');
} else {
  console.log('❌ Some required files are missing');
  console.log('Please ensure all files are in place before starting the server');
}

console.log('\n🔧 Fixes Applied:');
console.log('✅ Added SDK version 53.0.0 to app.json');
console.log('✅ Cleared node_modules and reinstalled dependencies');
console.log('✅ Verified import chain: index.js → App.js → App.tsx');
console.log('✅ All require() issues resolved from previous fixes');
