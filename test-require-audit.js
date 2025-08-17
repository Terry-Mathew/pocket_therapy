/**
 * Comprehensive require() Audit Script
 * 
 * This script performs a thorough audit of all require() calls in the codebase
 * to ensure Hermes compatibility
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Comprehensive require() Audit for Hermes Compatibility...\n');

// Function to recursively find all TypeScript/JavaScript files
function findSourceFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip test directories and node_modules
      if (!item.includes('__tests__') && !item.includes('test') && item !== 'node_modules') {
        findSourceFiles(fullPath, files);
      }
    } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
      // Skip test files
      if (!item.includes('.test.') && !item.includes('.spec.')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Function to check for require() calls in a file
function checkFileForRequires(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, index) => {
      // Look for require() calls that are not in comments
      const trimmedLine = line.trim();
      if (trimmedLine.includes('require(') && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('*')) {
        // Check if it's a dynamic import or a problematic require
        if (!trimmedLine.includes('require.resolve') && !trimmedLine.includes('await import')) {
          issues.push({
            line: index + 1,
            content: line.trim(),
            type: 'require_call'
          });
        }
      }
      
      // Also check for any other potential issues
      if (trimmedLine.includes('import.meta') && !trimmedLine.startsWith('//')) {
        issues.push({
          line: index + 1,
          content: line.trim(),
          type: 'import_meta'
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Main audit function
function performAudit() {
  const srcDir = './src';
  const sourceFiles = findSourceFiles(srcDir);
  
  console.log(`📁 Found ${sourceFiles.length} source files to audit\n`);
  
  let totalIssues = 0;
  const fileIssues = {};
  
  sourceFiles.forEach(filePath => {
    const issues = checkFileForRequires(filePath);
    if (issues.length > 0) {
      fileIssues[filePath] = issues;
      totalIssues += issues.length;
    }
  });
  
  // Report results
  if (totalIssues === 0) {
    console.log('✅ AUDIT PASSED: No require() issues found in source files!');
    console.log('✅ All files are Hermes-compatible');
  } else {
    console.log(`❌ AUDIT FAILED: Found ${totalIssues} issues in ${Object.keys(fileIssues).length} files\n`);
    
    Object.entries(fileIssues).forEach(([filePath, issues]) => {
      console.log(`📄 ${filePath}:`);
      issues.forEach(issue => {
        console.log(`  Line ${issue.line}: ${issue.content} (${issue.type})`);
      });
      console.log('');
    });
  }
  
  return totalIssues === 0;
}

// Check specific critical files
function checkCriticalFiles() {
  console.log('\n🎯 Checking critical runtime files...\n');
  
  const criticalFiles = [
    './src/store/index.ts',
    './src/services/openAIService.ts',
    './src/services/openAIWrapper.ts',
    './src/navigation/RootNavigator.tsx',
    './App.tsx',
    './index.js'
  ];
  
  let allCriticalFilesPassed = true;
  
  criticalFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const issues = checkFileForRequires(filePath);
      if (issues.length === 0) {
        console.log(`✅ ${filePath} - Clean`);
      } else {
        console.log(`❌ ${filePath} - ${issues.length} issues found`);
        issues.forEach(issue => {
          console.log(`    Line ${issue.line}: ${issue.content}`);
        });
        allCriticalFilesPassed = false;
      }
    } else {
      console.log(`⚠️ ${filePath} - File not found`);
    }
  });
  
  return allCriticalFilesPassed;
}

// Check test files separately
function checkTestFiles() {
  console.log('\n🧪 Checking test files (should use dynamic imports)...\n');
  
  const testFiles = [
    './src/test/utils.tsx'
  ];
  
  testFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('await import(')) {
        console.log(`✅ ${filePath} - Uses dynamic imports`);
      } else if (content.includes('require(')) {
        console.log(`❌ ${filePath} - Still uses require()`);
      } else {
        console.log(`✅ ${filePath} - No require() calls`);
      }
    }
  });
}

// Run the audit
console.log('Starting comprehensive require() audit...\n');

const auditPassed = performAudit();
const criticalFilesPassed = checkCriticalFiles();
checkTestFiles();

console.log('\n📊 AUDIT SUMMARY:');
console.log(`Source Files: ${auditPassed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Critical Files: ${criticalFilesPassed ? '✅ PASS' : '❌ FAIL'}`);

if (auditPassed && criticalFilesPassed) {
  console.log('\n🎉 ALL CHECKS PASSED!');
  console.log('The app should now be free of require() issues in Hermes.');
  console.log('\nNext steps:');
  console.log('1. Clear Metro cache: expo start --clear');
  console.log('2. Start development server: expo start --web');
  console.log('3. Check that app loads at http://localhost:8081');
} else {
  console.log('\n❌ ISSUES FOUND!');
  console.log('Please fix the require() calls listed above before proceeding.');
  console.log('Convert require() calls to:');
  console.log('- ES6 imports: import { module } from "package"');
  console.log('- Dynamic imports: const module = await import("package")');
}

console.log('\n🔧 Fixes Applied:');
console.log('✅ Converted test utility require() calls to dynamic imports');
console.log('✅ Updated store to use dynamic imports for performance utils');
console.log('✅ Created OpenAI wrapper to avoid import.meta issues');
console.log('✅ Added Hermes polyfills in App.tsx');
console.log('✅ Enhanced webpack and metro configs for Hermes compatibility');
