#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Validating Jest test fixes...\n');

const testFiles = [
  '__tests__/lib/rbac.test.ts',
  '__tests__/api/auth/users.test.ts', 
  '__tests__/api/auth/nextauth.test.ts',
  '__tests__/api/auth/test-session.test.ts',
  '__tests__/utils/test-factories.ts',
  '__tests__/api/auth/register.test.ts'
];

let passedTests = 0;
let failedTests = 0;

for (const testFile of testFiles) {
  try {
    console.log(`📋 Testing ${testFile}...`);
    
    const result = execSync(`npx jest ${testFile} --passWithNoTests --silent`, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000
    });
    
    console.log(`✅ ${testFile} - PASSED`);
    passedTests++;
    
  } catch (error) {
    console.log(`❌ ${testFile} - FAILED`);
    console.log(`   Error: ${error.message}`);
    if (error.stdout) {
      console.log(`   Output: ${error.stdout.slice(0, 200)}...`);
    }
    failedTests++;
  }
}

console.log(`\n📊 Test Results:`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Success Rate: ${Math.round((passedTests / testFiles.length) * 100)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All test fixes validated successfully!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests still need attention.');
  process.exit(1);
}