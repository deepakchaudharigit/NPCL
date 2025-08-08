#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Core security and performance tests
const coreTests = [
  '__tests__/api/auth/nextauth.test.ts',
  '__tests__/api/auth/users.test.ts', 
  '__tests__/api/auth/register.test.ts',
  '__tests__/lib/rbac.test.ts',
  '__tests__/lib/auth.test.ts'
];

console.log('🧪 Running Core Security & Performance Tests\n');

async function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`📋 Testing: ${testFile}`);
    
    const jest = spawn('npx', ['jest', testFile, '--verbose', '--no-coverage'], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let errorOutput = '';

    jest.stdout.on('data', (data) => {
      output += data.toString();
    });

    jest.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} - PASSED\n`);
        resolve({ file: testFile, status: 'PASSED', code });
      } else {
        console.log(`❌ ${testFile} - FAILED`);
        console.log('Error output:', errorOutput.slice(0, 500));
        console.log('---\n');
        resolve({ file: testFile, status: 'FAILED', code, error: errorOutput });
      }
    });

    jest.on('error', (error) => {
      console.log(`❌ ${testFile} - ERROR: ${error.message}\n`);
      resolve({ file: testFile, status: 'ERROR', error: error.message });
    });
  });
}

async function runAllTests() {
  const results = [];
  
  for (const testFile of coreTests) {
    const result = await runTest(testFile);
    results.push(result);
  }

  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚨 Errors: ${errors}`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`);

  if (failed > 0 || errors > 0) {
    console.log('\n🔍 Failed Tests:');
    results.filter(r => r.status !== 'PASSED').forEach(r => {
      console.log(`- ${r.file}: ${r.status}`);
    });
  }

  return results;
}

runAllTests().catch(console.error);