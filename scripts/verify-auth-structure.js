#!/usr/bin/env node

/**
 * Authentication Structure Verification Script
 * 
 * This script verifies that the authentication structure follows
 * Next.js standards and all required files are in place.
 */

const fs = require('fs');
const path = require('path');

const AUTH_DIR = path.join(process.cwd(), 'app', 'api', 'auth');

// Expected authentication structure
const EXPECTED_STRUCTURE = {
  // NextAuth.js built-in functionality
  '[...nextauth]': {
    type: 'nextauth',
    required: true,
    description: 'NextAuth.js: login, logout, session, callbacks'
  },
  
  // Custom authentication features
  'register': {
    type: 'custom',
    required: true,
    description: 'Custom: user registration'
  },
  'forgot-password': {
    type: 'custom',
    required: true,
    description: 'Custom: forgot password (send reset email)'
  },
  'reset-password': {
    type: 'custom',
    required: true,
    description: 'Custom: reset password (via token)'
  },
  'change-password': {
    type: 'custom',
    required: true,
    description: 'Custom: user-initiated password change'
  },
  'profile': {
    type: 'custom',
    required: true,
    description: 'Custom: user profile management'
  },
  'users': {
    type: 'custom',
    required: true,
    description: 'Custom: user management (CRUD)'
  },
  'session': {
    type: 'custom',
    required: false,
    description: 'Custom: session info (API compatibility)'
  },
  
  // Debug/test endpoints
  'test-session': {
    type: 'debug',
    required: false,
    description: 'Optional: session debug endpoint'
  },
  'test-login': {
    type: 'debug',
    required: false,
    description: 'Optional: login debug endpoint'
  }
};

// Routes that should NOT exist (removed in restructuring)
const FORBIDDEN_ROUTES = ['login', 'logout'];

function checkAuthStructure() {
  console.log('🔍 Verifying Next.js Authentication Structure...\n');
  
  let errors = [];
  let warnings = [];
  let success = [];

  // Check if auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    errors.push('❌ Authentication directory not found: app/api/auth/');
    return { errors, warnings, success };
  }

  // Get all directories in auth folder
  const authDirs = fs.readdirSync(AUTH_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Check for forbidden routes
  for (const forbidden of FORBIDDEN_ROUTES) {
    if (authDirs.includes(forbidden)) {
      errors.push(`❌ Forbidden route found: ${forbidden}/ (should be handled by NextAuth.js)`);
    }
  }

  // Check expected structure
  for (const [routeName, config] of Object.entries(EXPECTED_STRUCTURE)) {
    const routePath = path.join(AUTH_DIR, routeName);
    const routeFile = path.join(routePath, 'route.ts');
    
    if (fs.existsSync(routePath) && fs.existsSync(routeFile)) {
      success.push(`✅ ${routeName}/ - ${config.description}`);
    } else if (config.required) {
      errors.push(`❌ Required route missing: ${routeName}/ - ${config.description}`);
    } else {
      warnings.push(`⚠️  Optional route missing: ${routeName}/ - ${config.description}`);
    }
  }

  // Check for unexpected routes
  for (const dir of authDirs) {
    if (!EXPECTED_STRUCTURE[dir] && !FORBIDDEN_ROUTES.includes(dir)) {
      warnings.push(`⚠️  Unexpected route found: ${dir}/ (not in standard structure)`);
    }
  }

  return { errors, warnings, success };
}

function checkNextAuthConfig() {
  console.log('🔧 Checking NextAuth.js Configuration...\n');
  
  const configPath = path.join(process.cwd(), 'lib', 'nextauth.ts');
  
  if (!fs.existsSync(configPath)) {
    return ['❌ NextAuth configuration not found: lib/nextauth.ts'];
  }

  const configContent = fs.readFileSync(configPath, 'utf8');
  const checks = [];

  // Check for required configurations
  if (configContent.includes('CredentialsProvider')) {
    checks.push('✅ Credentials provider configured');
  } else {
    checks.push('❌ Credentials provider not found');
  }

  if (configContent.includes('PrismaAdapter')) {
    checks.push('✅ Prisma adapter configured');
  } else {
    checks.push('⚠️  Prisma adapter not found (optional)');
  }

  if (configContent.includes('strategy: \'jwt\'')) {
    checks.push('✅ JWT strategy configured');
  } else {
    checks.push('⚠️  JWT strategy not explicitly set');
  }

  return checks;
}

function main() {
  console.log('🚀 Next.js Authentication Structure Verification\n');
  console.log('=' .repeat(60) + '\n');

  // Check authentication structure
  const { errors, warnings, success } = checkAuthStructure();

  // Display results
  if (success.length > 0) {
    console.log('✅ CORRECT STRUCTURE:');
    success.forEach(msg => console.log(`   ${msg}`));
    console.log();
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(msg => console.log(`   ${msg}`));
    console.log();
  }

  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(msg => console.log(`   ${msg}`));
    console.log();
  }

  // Check NextAuth configuration
  const configChecks = checkNextAuthConfig();
  configChecks.forEach(msg => console.log(`   ${msg}`));
  console.log();

  // Summary
  console.log('=' .repeat(60));
  if (errors.length === 0) {
    console.log('🎉 Authentication structure verification PASSED!');
    console.log('   Your authentication setup follows Next.js standards.');
  } else {
    console.log('💥 Authentication structure verification FAILED!');
    console.log(`   Found ${errors.length} error(s) that need to be fixed.`);
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Note: ${warnings.length} warning(s) found (non-critical).`);
  }

  console.log('\n📚 For more information, see: AUTHENTICATION_RESTRUCTURE.md');
}

if (require.main === module) {
  main();
}

module.exports = { checkAuthStructure, checkNextAuthConfig };