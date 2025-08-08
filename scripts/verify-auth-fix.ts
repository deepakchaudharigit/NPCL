#!/usr/bin/env tsx

/**
 * Verification script to test the authentication fix
 * This script attempts to import and validate the authOptions configuration
 */

import { resolve } from 'path';

async function verifyAuthConfiguration() {
  console.log('🔍 Verifying NPCL Dashboard Authentication Fix...\n');

  try {
    // Test 1: Import authOptions from the correct location
    console.log('1. Testing authOptions import from lib/nextauth...');
    const { authOptions } = await import('../lib/nextauth');
    
    if (authOptions) {
      console.log('✅ Successfully imported authOptions from lib/nextauth');
    } else {
      console.log('❌ authOptions is undefined');
      return false;
    }

    // Test 2: Check if authOptions has required properties
    console.log('\n2. Validating authOptions configuration...');
    
    const requiredProperties = ['providers', 'session', 'callbacks', 'secret'];
    const missingProperties = requiredProperties.filter(prop => !authOptions[prop]);
    
    if (missingProperties.length === 0) {
      console.log('✅ All required authOptions properties are present');
    } else {
      console.log('❌ Missing authOptions properties:', missingProperties.join(', '));
      return false;
    }

    // Test 3: Check providers configuration
    console.log('\n3. Checking providers configuration...');
    if (authOptions.providers && authOptions.providers.length > 0) {
      console.log('✅ Providers are configured');
      console.log(`   Found ${authOptions.providers.length} provider(s)`);
    } else {
      console.log('❌ No providers configured');
      return false;
    }

    // Test 4: Check secret configuration
    console.log('\n4. Checking secret configuration...');
    if (authOptions.secret) {
      console.log('✅ NextAuth secret is configured');
    } else {
      console.log('❌ NextAuth secret is missing');
      return false;
    }

    // Test 5: Test backward compatibility export
    console.log('\n5. Testing backward compatibility export...');
    try {
      const { authOptions: backwardCompatAuthOptions } = await import('../lib/auth');
      if (backwardCompatAuthOptions) {
        console.log('✅ Backward compatibility export works');
      } else {
        console.log('⚠️  Backward compatibility export not working (this is okay)');
      }
    } catch (error) {
      console.log('⚠️  Backward compatibility export failed (this is okay)');
    }

    // Test 6: Check environment configuration
    console.log('\n6. Checking environment configuration...');
    try {
      const { serverEnv } = await import('../config/env.server');
      if (serverEnv.NEXTAUTH_SECRET) {
        console.log('✅ Environment configuration is working');
      } else {
        console.log('❌ NEXTAUTH_SECRET not found in environment');
        return false;
      }
    } catch (error) {
      console.log('❌ Error loading environment configuration:', error.message);
      return false;
    }

    console.log('\n✅ All authentication configuration tests passed!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Restart your development server');
    console.log('   2. Clear browser cache and cookies');
    console.log('   3. Test login at http://localhost:3000/auth/login');
    
    return true;

  } catch (error) {
    console.log('❌ Error during verification:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure all dependencies are installed: npm install');
    console.log('   2. Check that TypeScript compilation is working: npm run build');
    console.log('   3. Verify environment variables are set in .env file');
    return false;
  }
}

// Run the verification
verifyAuthConfiguration().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});