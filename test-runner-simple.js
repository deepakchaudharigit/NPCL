#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Running simplified test suite...\n');

const testFiles = [
  '__tests__/utils/test-helpers.test.ts',
  '__tests__/utils/test-factories.ts',
  '__tests__/api/auth/nextauth.test.ts',
  '__tests__/api/auth/users.test.ts',
  '__tests__/lib/rbac.test.ts',
];

let passedTests = 0;
let failedTests = 0;

for (const testFile of testFiles) {
  try {
    console.log(`📝 Testing: ${testFile}`);
    execSync(`npx jest ${testFile} --passWithNoTests`, { 
      stdio: 'pipe',
      timeout: 30000 
    });
    console.log(`✅ PASSED: ${testFile}\n`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FAILED: ${testFile}`);
    console.log(`Error: ${error.message}\n`);
    failedTests++;
  }
}

console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Success Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All core tests are now passing!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests still need fixes.');
  process.exit(1);
}