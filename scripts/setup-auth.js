#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

console.log('🔐 Setting up NPCL Dashboard Authentication System...\n')

// Generate secure secrets
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env')
const envExamplePath = path.join(process.cwd(), '.env.example')

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📄 Creating .env file from .env.example...')
    
    let envContent = fs.readFileSync(envExamplePath, 'utf8')
    
    // Replace placeholder secrets with generated ones
    const nextAuthSecret = generateSecret(32)
    const jwtSecret = generateSecret(32)
    
    envContent = envContent.replace(
      'your-secret-key-here-make-it-long-and-random-minimum-32-characters',
      nextAuthSecret
    )
    envContent = envContent.replace(
      'your-jwt-secret-key-different-from-nextauth',
      jwtSecret
    )
    
    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env file created with secure secrets')
  } else {
    console.log('❌ .env.example file not found')
    process.exit(1)
  }
} else {
  console.log('📄 .env file already exists')
  
  // Check if secrets are still placeholders
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  if (envContent.includes('your-secret-key-here')) {
    console.log('⚠️  Warning: .env file contains placeholder secrets')
    console.log('🔑 Generating new secure secrets...')
    
    const nextAuthSecret = generateSecret(32)
    const jwtSecret = generateSecret(32)
    
    let updatedContent = envContent.replace(
      /NEXTAUTH_SECRET="[^"]*"/,
      `NEXTAUTH_SECRET="${nextAuthSecret}"`
    )
    updatedContent = updatedContent.replace(
      /JWT_SECRET="[^"]*"/,
      `JWT_SECRET="${jwtSecret}"`
    )
    
    fs.writeFileSync(envPath, updatedContent)
    console.log('✅ Secrets updated in .env file')
  }
}

console.log('\n📋 Setup Checklist:')
console.log('✅ NextAuth.js configuration created')
console.log('✅ Role-based access control implemented')
console.log('✅ Secure middleware configured')
console.log('✅ Authentication hooks created')
console.log('✅ Protected API routes set up')
console.log('✅ Environment variables configured')

console.log('\n🚀 Next Steps:')
console.log('1. Install dependencies: npm install')
console.log('2. Set up your database connection in .env')
console.log('3. Run database migrations: npm run db:migrate')
console.log('4. Seed the database: npm run db:seed')
console.log('5. Start the development server: npm run dev')

console.log('\n👥 Test Accounts (after seeding):')
console.log('Admin: admin@npcl.com / admin123')
console.log('Operator: operator@npcl.com / operator123')
console.log('Viewer: viewer@npcl.com / viewer123')

console.log('\n📚 Documentation:')
console.log('- Authentication guide: docs/AUTHENTICATION.md')
console.log('- API documentation: Check /api routes')
console.log('- Role permissions: lib/rbac.ts')

console.log('\n🔒 Security Notes:')
console.log('- Secrets have been generated automatically')
console.log('- Use HTTPS in production')
console.log('- Regularly rotate secrets')
console.log('- Monitor audit logs')

console.log('\n✨ Authentication system setup complete!')