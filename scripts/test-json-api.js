#!/usr/bin/env node

/**
 * Test script for NPCL Dashboard API with NextAuth.js
 * 
 * This script demonstrates how to interact with the API using NextAuth.js
 * session-based authentication.
 * 
 * Usage: node scripts/test-json-api.js
 */

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

async function testNextAuthApi() {
  console.log('🚀 Testing NPCL Dashboard API with NextAuth.js')
  console.log('Base URL:', baseUrl)
  console.log('')

  try {
    // Test 1: API Documentation
    console.log('📚 1. Getting API Documentation...')
    const docsResponse = await fetch(`${baseUrl}/api/docs`)
    const docs = await docsResponse.json()
    console.log('✅ API Documentation available')
    console.log('Available endpoints:', Object.keys(docs.endpoints).length)
    console.log('Authentication method:', docs.authentication.description)
    console.log('')

    // Test 2: Health Check
    console.log('🏥 2. Health Check...')
    const healthResponse = await fetch(`${baseUrl}/api/health`)
    const health = await healthResponse.json()
    console.log('✅ Health Status:', health.status)
    console.log('Database:', health.database)
    console.log('')

    // Test 3: Test credentials without session
    console.log('🔐 3. Testing Credentials (without session)...')
    const testLoginResponse = await fetch(`${baseUrl}/api/auth/test-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@npcl.com',
        password: 'admin123'
      })
    })

    if (!testLoginResponse.ok) {
      const error = await testLoginResponse.json()
      console.log('❌ Credential test failed:', error.error)
      console.log('💡 Make sure the database is seeded with test users')
      console.log('💡 Run: npm run db:seed')
      return
    }

    const testLoginData = await testLoginResponse.json()
    console.log('✅ Credentials are valid!')
    console.log('User:', testLoginData.user.name, `(${testLoginData.user.role})`)
    console.log('')

    // Test 4: Check session status (should be unauthenticated)
    console.log('🔍 4. Checking Session Status...')
    const verifyResponse = await fetch(`${baseUrl}/api/auth/verify`)
    
    if (verifyResponse.status === 401) {
      console.log('✅ No active session (as expected)')
      const verifyData = await verifyResponse.json()
      console.log('Message:', verifyData.error)
    } else {
      console.log('⚠️  Unexpected session state')
    }
    console.log('')

    // Test 5: Try to access protected endpoint without session
    console.log('📊 5. Trying Dashboard Stats without session...')
    const statsResponse = await fetch(`${baseUrl}/api/dashboard/stats`)
    
    if (statsResponse.status === 401) {
      console.log('✅ Protected endpoint correctly requires authentication')
      const statsError = await statsResponse.json()
      console.log('Message:', statsError.message)
    } else {
      console.log('⚠️  Protected endpoint should require authentication')
    }
    console.log('')

    // Test 6: NextAuth.js endpoints
    console.log('🔧 6. Testing NextAuth.js endpoints...')
    
    // Check CSRF token
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    if (csrfResponse.ok) {
      const csrfData = await csrfResponse.json()
      console.log('✅ CSRF token available:', csrfData.csrfToken ? 'Yes' : 'No')
    }

    // Check providers
    const providersResponse = await fetch(`${baseUrl}/api/auth/providers`)
    if (providersResponse.ok) {
      const providersData = await providersResponse.json()
      console.log('✅ Auth providers available:', Object.keys(providersData).join(', '))
    }

    // Check session endpoint
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`)
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json()
      console.log('✅ Session endpoint accessible')
      console.log('Current session:', sessionData.user ? 'Active' : 'None')
    }
    console.log('')

    console.log('🎉 All tests completed!')
    console.log('')
    console.log('📝 Summary:')
    console.log('- This API uses NextAuth.js for session-based authentication')
    console.log('- No manual JWT tokens - sessions are managed automatically')
    console.log('- Use /api/auth/signin for web-based login')
    console.log('- Session cookies are HTTP-only and secure')
    console.log('- CSRF protection is built-in')
    console.log('')
    console.log('🔗 NextAuth.js endpoints:')
    console.log('- GET /api/auth/session - Current session info')
    console.log('- GET /api/auth/csrf - CSRF token')
    console.log('- GET /api/auth/providers - Available providers')
    console.log('- POST /api/auth/signin/credentials - Sign in')
    console.log('- POST /api/auth/signout - Sign out')
    console.log('')
    console.log('🔗 Custom endpoints:')
    console.log('- GET /api/docs - Complete API documentation')
    console.log('- GET /api/health - Health check')
    console.log('- POST /api/auth/test-login - Test credentials without session')
    console.log('- GET /api/auth/verify - Verify current session')
    console.log('')
    console.log('💡 For web applications:')
    console.log('- Use next-auth/react for React components')
    console.log('- Use signIn() and signOut() functions')
    console.log('- Use useSession() hook for session data')
    console.log('')
    console.log('💡 For API testing:')
    console.log('- Use a web browser or tool that handles cookies')
    console.log('- Sign in through the web interface first')
    console.log('- Then make API calls with session cookies')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('')
    console.log('💡 Make sure the development server is running:')
    console.log('   npm run dev')
    console.log('')
    console.log('💡 And the database is set up:')
    console.log('   npm run db:push')
    console.log('   npm run db:seed')
  }
}

// Run the test
testNextAuthApi()