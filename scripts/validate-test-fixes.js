#!/usr/bin/env node

/**
 * Test Fixes Validation Script
 * 
 * This script validates that all the test fixes have been properly applied
 * and checks for common issues that could cause test failures.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Test Fixes...\n');

const issues = [];
const fixes = [];

// Check 1: Verify import paths are consistent
console.log('1. Checking import path consistency...');
const testFiles = [
  '__tests__/api/auth/users.test.ts',
  '__tests__/api/auth/register.test.ts',
  '__tests__/api/auth/nextauth.test.ts'
];

testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for old @lib/ imports
    if (content.includes('@lib/')) {
      issues.push(`❌ ${file} still contains @lib/ imports (should be @/lib/)`);
    } else {
      fixes.push(`✅ ${file} uses correct @/lib/ imports`);
    }
  } else {
    issues.push(`❌ Test file ${file} not found`);
  }
});

// Check 2: Verify NextAuth test structure
console.log('2. Checking NextAuth test structure...');
const nextAuthTest = '__tests__/api/auth/nextauth.test.ts';
if (fs.existsSync(nextAuthTest)) {
  const content = fs.readFileSync(nextAuthTest, 'utf8');
  
  if (content.includes('req parameter')) {
    fixes.push('✅ NextAuth test includes req parameter for authorize function');
  } else {
    issues.push('❌ NextAuth test missing req parameter for authorize function');
  }
  
  if (content.includes('try {') && content.includes('catch (error)')) {
    fixes.push('✅ NextAuth test uses proper error handling');
  } else {
    issues.push('❌ NextAuth test missing proper error handling');
  }
}

// Check 3: Verify RBAC test improvements
console.log('3. Checking RBAC test improvements...');
const rbacTest = '__tests__/lib/rbac.test.ts';
if (fs.existsSync(rbacTest)) {
  const content = fs.readFileSync(rbacTest, 'utf8');
  
  if (content.includes('console.warn')) {
    fixes.push('✅ RBAC test includes graceful error handling for missing permissions');
  } else {
    issues.push('❌ RBAC test missing graceful error handling');
  }
  
  if (content.includes('corePermissions')) {
    fixes.push('✅ RBAC test includes core permissions validation');
  } else {
    issues.push('❌ RBAC test missing core permissions validation');
  }
}

// Check 4: Verify Users API test improvements
console.log('4. Checking Users API test improvements...');
const usersTest = '__tests__/api/auth/users.test.ts';
if (fs.existsSync(usersTest)) {
  const content = fs.readFileSync(usersTest, 'utf8');
  
  if (content.includes('mockPrismaUserFindUnique.mockResolvedValue')) {
    fixes.push('✅ Users API test includes proper user lookup mocking');
  } else {
    issues.push('❌ Users API test missing user lookup mocking');
  }
  
  if (content.includes('Admin access required')) {
    fixes.push('✅ Users API test checks for correct error message');
  } else {
    issues.push('❌ Users API test missing correct error message check');
  }
}

// Check 5: Verify Registration test improvements
console.log('5. Checking Registration test improvements...');
const registerTest = '__tests__/api/auth/register.test.ts';
if (fs.existsSync(registerTest)) {
  const content = fs.readFileSync(registerTest, 'utf8');
  
  if (content.includes('test-helpers.utils')) {
    fixes.push('✅ Registration test uses renamed test helpers');
  } else {
    issues.push('❌ Registration test not using renamed test helpers');
  }
  
  if (content.includes('const data = await response.json()')) {
    fixes.push('✅ Registration test includes proper error response handling');
  } else {
    issues.push('❌ Registration test missing proper error response handling');
  }
}

// Check 6: Verify test helpers file rename
console.log('6. Checking test helpers file structure...');
if (fs.existsSync('__tests__/utils/test-helpers.utils.ts')) {
  fixes.push('✅ Test helpers file renamed to avoid Jest conflicts');
} else {
  issues.push('❌ Test helpers file not properly renamed');
}

if (fs.existsSync('__tests__/utils/test-helpers.ts')) {
  issues.push('❌ Old test helpers file still exists');
} else {
  fixes.push('✅ Old test helpers file properly removed');
}

// Check 7: Verify Jest setup improvements
console.log('7. Checking Jest setup improvements...');
const jestSetup = 'jest.setup.ts';
if (fs.existsSync(jestSetup)) {
  const content = fs.readFileSync(jestSetup, 'utf8');
  
  if (content.includes('serverPrisma')) {
    fixes.push('✅ Jest setup includes serverPrisma mocking');
  } else {
    issues.push('❌ Jest setup missing serverPrisma mocking');
  }
  
  if (content.includes('@/lib/prisma')) {
    fixes.push('✅ Jest setup includes Prisma mocking');
  } else {
    issues.push('❌ Jest setup missing Prisma mocking');
  }
}

// Check 8: Verify test factories still have tests
console.log('8. Checking test factories...');
const testFactories = '__tests__/utils/test-factories.ts';
if (fs.existsSync(testFactories)) {
  const content = fs.readFileSync(testFactories, 'utf8');
  
  if (content.includes('describe(') && content.includes('test(')) {
    fixes.push('✅ Test factories file includes required tests');
  } else {
    issues.push('❌ Test factories file missing required tests');
  }
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`✅ Fixes Applied: ${fixes.length}`);
console.log(`❌ Issues Found: ${issues.length}\n`);

if (fixes.length > 0) {
  console.log('✅ Applied Fixes:');
  fixes.forEach(fix => console.log(`  ${fix}`));
  console.log('');
}

if (issues.length > 0) {
  console.log('❌ Remaining Issues:');
  issues.forEach(issue => console.log(`  ${issue}`));
  console.log('');
  
  console.log('🔧 Recommended Actions:');
  console.log('1. Fix the remaining issues listed above');
  console.log('2. Run the tests to verify fixes: npm test');
  console.log('3. Check specific test files for detailed error messages');
  console.log('4. Ensure all imports use @/lib/ instead of @lib/');
  console.log('5. Verify all mocks are properly configured\n');
} else {
  console.log('🎉 All test fixes have been successfully applied!');
  console.log('✅ You can now run the tests with: npm test\n');
}

// Exit with appropriate code
process.exit(issues.length > 0 ? 1 : 0);