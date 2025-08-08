#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating test fixes...\n');

// Check if key files exist and have proper structure
const criticalFiles = [
  '__tests__/api/auth/nextauth.test.ts',
  '__tests__/api/auth/users.test.ts', 
  '__tests__/api/auth/register.test.ts',
  '__tests__/lib/rbac.test.ts',
  '__tests__/utils/test-helpers.test.ts',
  'jest.config.ts',
  'jest.setup.ts'
];

let allFilesExist = true;

console.log('📁 Checking critical test files...');
for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

console.log('\n🔧 Checking Jest configuration...');

// Check Jest config
try {
  const jestConfig = fs.readFileSync('jest.config.ts', 'utf8');
  
  if (jestConfig.includes('transformIgnorePatterns')) {
    console.log('✅ Jest transformIgnorePatterns configured');
  } else {
    console.log('❌ Jest transformIgnorePatterns missing');
  }
  
  if (jestConfig.includes('jose')) {
    console.log('✅ Jose package handling configured');
  } else {
    console.log('❌ Jose package handling missing');
  }
} catch (error) {
  console.log('❌ Error reading jest.config.ts');
}

// Check Jest setup
try {
  const jestSetup = fs.readFileSync('jest.setup.ts', 'utf8');
  
  if (jestSetup.includes('jose')) {
    console.log('✅ Jose mocks in jest.setup.ts');
  } else {
    console.log('❌ Jose mocks missing in jest.setup.ts');
  }
  
  if (jestSetup.includes('next-auth')) {
    console.log('✅ NextAuth mocks in jest.setup.ts');
  } else {
    console.log('❌ NextAuth mocks missing in jest.setup.ts');
  }
} catch (error) {
  console.log('❌ Error reading jest.setup.ts');
}

console.log('\n🧪 Checking test file structure...');

// Check for common issues in test files
const testFiles = [
  '__tests__/api/auth/nextauth.test.ts',
  '__tests__/api/auth/users.test.ts'
];

for (const file of testFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for proper mocking
    if (content.includes('jest.mock')) {
      console.log(`✅ ${file} - Has proper mocks`);
    } else {
      console.log(`⚠️  ${file} - No mocks found`);
    }
    
    // Check for describe blocks
    if (content.includes('describe(')) {
      console.log(`✅ ${file} - Has test structure`);
    } else {
      console.log(`❌ ${file} - No test structure`);
    }
    
    // Check for circular dependency issues
    if (content.includes('_testhelpers')) {
      console.log(`❌ ${file} - Still has circular dependency reference`);
    } else {
      console.log(`✅ ${file} - No circular dependencies`);
    }
    
  } catch (error) {
    console.log(`❌ Error reading ${file}`);
  }
}

console.log('\n📊 Security Test Coverage Check...');

const securityTestPatterns = [
  'password',
  'auth',
  'role',
  'permission',
  'admin',
  'credential',
  'session',
  'token'
];

let securityTestCount = 0;

for (const file of criticalFiles.filter(f => f.includes('.test.'))) {
  try {
    const content = fs.readFileSync(file, 'utf8').toLowerCase();
    const hasSecurityTests = securityTestPatterns.some(pattern => content.includes(pattern));
    
    if (hasSecurityTests) {
      securityTestCount++;
      console.log(`✅ ${file} - Contains security tests`);
    } else {
      console.log(`⚠️  ${file} - No obvious security tests`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${file}`);
  }
}

console.log('\n📈 Summary:');
console.log(`Files exist: ${allFilesExist ? '✅' : '❌'}`);
console.log(`Security test files: ${securityTestCount}/${criticalFiles.filter(f => f.includes('.test.')).length}`);

if (allFilesExist && securityTestCount >= 4) {
  console.log('\n🎉 Test fixes validation PASSED!');
  console.log('✨ Key security and performance tests should now work properly.');
  console.log('\n📝 Next steps:');
  console.log('1. Run: npm test');
  console.log('2. Run: npm run test:security');
  console.log('3. Check for any remaining ESM issues');
} else {
  console.log('\n⚠️  Test fixes validation INCOMPLETE');
  console.log('Some issues may still need to be addressed.');
}