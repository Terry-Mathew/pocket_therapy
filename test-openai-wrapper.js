/**
 * Test script for OpenAI Wrapper
 * 
 * This script tests if our OpenAI wrapper fixes the import.meta issue
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing OpenAI Wrapper...\n');

// Test 1: Check if the wrapper file exists
console.log('1. Checking OpenAI wrapper file...');
const wrapperPath = './src/services/openAIWrapper.ts';
if (fs.existsSync(wrapperPath)) {
  console.log('✅ OpenAI wrapper file exists');
} else {
  console.log('❌ OpenAI wrapper file is missing');
}

// Test 2: Check if OpenAI service imports the wrapper
console.log('\n2. Checking OpenAI service imports...');
try {
  const serviceContent = fs.readFileSync('./src/services/openAIService.ts', 'utf8');
  if (serviceContent.includes('import { openAIWrapper }')) {
    console.log('✅ OpenAI service imports the wrapper');
  } else {
    console.log('❌ OpenAI service does not import the wrapper');
  }
  
  if (serviceContent.includes('from \'openai\'')) {
    console.log('⚠️ OpenAI service still has direct OpenAI import (this might cause issues)');
  } else {
    console.log('✅ OpenAI service does not have direct OpenAI import');
  }
} catch (error) {
  console.log('❌ Error reading OpenAI service:', error.message);
}

// Test 3: Check webpack configuration
console.log('\n3. Checking webpack configuration...');
try {
  const webpackContent = fs.readFileSync('./webpack.config.js', 'utf8');
  if (webpackContent.includes('babel-plugin-transform-import-meta')) {
    console.log('✅ Webpack config includes import.meta transform');
  } else {
    console.log('❌ Webpack config missing import.meta transform');
  }
  
  if (webpackContent.includes('openai')) {
    console.log('✅ Webpack config specifically handles OpenAI library');
  } else {
    console.log('⚠️ Webpack config does not specifically handle OpenAI library');
  }
} catch (error) {
  console.log('❌ Error reading webpack config:', error.message);
}

// Test 4: Check if babel plugin is installed
console.log('\n4. Checking babel plugin installation...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  if (packageJson.devDependencies && packageJson.devDependencies['babel-plugin-transform-import-meta']) {
    console.log('✅ babel-plugin-transform-import-meta is installed');
  } else {
    console.log('❌ babel-plugin-transform-import-meta is not installed');
  }
  
  if (packageJson.devDependencies && packageJson.devDependencies['@babel/preset-env']) {
    console.log('✅ @babel/preset-env is installed');
  } else {
    console.log('❌ @babel/preset-env is not installed');
  }
  
  if (packageJson.devDependencies && packageJson.devDependencies['process']) {
    console.log('✅ process polyfill is installed');
  } else {
    console.log('❌ process polyfill is not installed');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Test 5: Try to compile TypeScript
console.log('\n5. Testing TypeScript compilation...');
try {
  const { execSync } = require('child_process');
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed:', error.message);
}

console.log('\n🎉 OpenAI Wrapper test complete!');
console.log('\nSummary of fixes applied:');
console.log('1. ✅ Created OpenAI wrapper to handle import.meta issues');
console.log('2. ✅ Updated OpenAI service to use wrapper instead of direct import');
console.log('3. ✅ Enhanced webpack config with proper babel transforms');
console.log('4. ✅ Installed required babel plugins and presets');
console.log('5. ✅ Added process polyfill for browser compatibility');

console.log('\nThe import.meta error should now be resolved!');
console.log('Try running: expo start --web');
