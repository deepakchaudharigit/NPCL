#!/usr/bin/env node

/**
 * Test script to verify authentication configuration
 * This script checks if all auth-related imports and exports are working correctly
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Testing NPCL Dashboard Authentication Configuration...\n');

// Test 1: Check if environment variables are set
console.log('1. Checking environment variables...');
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const missingEnvVars = [];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
  }
});

if (missingEnvVars.length > 0) {
  console.log('❌ Missing environment variables:', missingEnvVars.join(', '));
  console.log('   Please check your .env file\n');
} else {
  console.log('✅ All required environment variables are set\n');
}

// Test 2: Check if files exist
console.log('2. Checking authentication files...');
const authFiles = [
  'lib/nextauth.ts',
  'lib/auth.ts',
  'app/api/auth/[...nextauth]/route.ts',
  'config/auth.ts',
  'config/env.server.ts'
];

const missingFiles = [];
authFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('❌ Missing files:', missingFiles.join(', '));
} else {
  console.log('✅ All authentication files exist\n');
}

// Test 3: Check file contents for common issues
console.log('3. Checking file contents...');

try {
  // Check NextAuth route handler
  const routeHandlerPath = path.join(process.cwd(), 'app/api/auth/[...nextauth]/route.ts');
  const routeHandlerContent = fs.readFileSync(routeHandlerPath, 'utf8');
  
  if (routeHandlerContent.includes("from '@/lib/nextauth'")) {
    console.log('✅ NextAuth route handler imports from correct file');
  } else if (routeHandlerContent.includes("from '@/lib/auth'")) {
    console.log('⚠️  NextAuth route handler imports from @/lib/auth (should be @/lib/nextauth)');
  } else {
    console.log('❌ NextAuth route handler has incorrect import');
  }

  // Check if authOptions is exported
  const nextauthPath = path.join(process.cwd(), 'lib/nextauth.ts');
  const nextauthContent = fs.readFileSync(nextauthPath, 'utf8');
  
  if (nextauthContent.includes('export const authOptions')) {
    console.log('✅ authOptions is properly exported from lib/nextauth.ts');
  } else {
    console.log('❌ authOptions is not exported from lib/nextauth.ts');
  }

  // Check if secret is configured
  if (nextauthContent.includes('secret: serverEnv.NEXTAUTH_SECRET')) {
    console.log('✅ NextAuth secret is properly configured');
  } else {
    console.log('❌ NextAuth secret is not properly configured');
  }

} catch (error) {
  console.log('❌ Error reading files:', error.message);
}

console.log('\n4. Summary:');
if (missingEnvVars.length === 0 && missingFiles.length === 0) {
  console.log('✅ Authentication configuration appears to be correct!');
  console.log('   If you\'re still experiencing issues, try:');
  console.log('   1. Restart your development server');
  console.log('   2. Clear the .next cache folder');
  console.log('   3. Run: npm run db:generate');
} else {
  console.log('❌ Issues found that need to be fixed:');
  if (missingEnvVars.length > 0) {
    console.log('   - Set missing environment variables');
  }
  if (missingFiles.length > 0) {
    console.log('   - Create missing files');
  }
}

console.log('\n🔧 To test authentication manually:');
console.log('   1. Start the dev server: npm run dev');
console.log('   2. Visit: http://localhost:3000/auth/login');
console.log('   3. Check browser console for any errors');
console.log('   4. Check terminal for server errors');