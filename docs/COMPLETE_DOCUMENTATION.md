# NPCL Dashboard - Complete Documentation

This document consolidates all documentation for the NPCL Power Management Dashboard project.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [API Documentation](#api-documentation)
3. [Authentication System](#authentication-system)
4. [Deployment Guide](#deployment-guide)
5. [Environment Configuration](#environment-configuration)
6. [Test Implementation](#test-implementation)
7. [Fix Summaries](#fix-summaries)
8. [Setup Guide](#setup-guide)
9. [Generated Features](#generated-features)
10. [Password Management](#password-management)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

NPCL Dashboard is a comprehensive Power Management Dashboard for NPCL (Nepal Power Company Limited) built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

### Key Features

- Role-based user authentication and authorization with three-tier access control (Admin, Operator, Viewer)
- Real-time power generation monitoring and efficiency tracking across multiple unit types (thermal, hydro, solar, wind, nuclear)
- Equipment management with maintenance scheduling, status tracking, and operational monitoring
- Dashboard analytics with comprehensive statistics and custom data visualization
- Complete audit logging and automated report generation for compliance and analysis

### Technology Stack

- **Language:** TypeScript (5.3.3)
- **Framework:** Next.js (15.4.0) with App Router
- **Database:** PostgreSQL with Prisma ORM (5.7.1)
- **Authentication:** NextAuth.js (4.24.5)
- **Styling:** Tailwind CSS
- **Testing:** Jest + React Testing Library

---

## API Documentation

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### Authentication Headers

```http
Authorization: Bearer <jwt-token>
Cookie: next-auth.session-token=<session-token>
```

### User Roles

- **Admin**: Full access to all endpoints
- **Operator**: Read/write access to power units and readings
- **Viewer**: Read-only access to dashboard data

### Authentication Endpoints

#### NextAuth.js Endpoints

- `POST /api/auth/signin/credentials` - User login with email/password
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session information
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/providers` - Get available authentication providers

#### Custom Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `POST /api/auth/change-password` - User-initiated password change
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### User Management Endpoints (Admin Only)

- `GET /api/auth/users` - List all users
- `POST /api/auth/users` - Create new user
- `GET /api/auth/users/[id]` - Get specific user
- `PUT /api/auth/users/[id]` - Update user
- `DELETE /api/auth/users/[id]` - Delete user

### Dashboard Endpoints

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/power-units` - Power units data
- `POST /api/dashboard/power-units` - Create power unit (Admin/Operator)
- `PUT /api/dashboard/power-units/[id]` - Update power unit (Admin/Operator)
- `DELETE /api/dashboard/power-units/[id]` - Delete power unit (Admin Only)

### System Endpoints

- `GET /api/health` - Health check with database connectivity and system status monitoring

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `INTERNAL_ERROR` (500): Server error
- `RATE_LIMITED` (429): Too many requests

---

## Authentication System

### Overview

The authentication system provides:

- Secure session management with NextAuth.js
- Role-based access control (RBAC)
- JWT token support
- Audit logging
- Rate limiting
- Secure cookie configuration

### User Roles

#### ADMIN

- Full system access
- User management (create, update, delete users)
- System configuration
- All dashboard features
- Audit log access

#### OPERATOR

- Power unit management (create, update)
- Maintenance scheduling
- Report generation
- Dashboard access (read/write)

#### VIEWER

- Read-only dashboard access
- View reports
- View power unit data
- No modification permissions

### Authentication Flow

1. User submits credentials via login form
2. NextAuth.js validates credentials using custom provider
3. Password verification using bcrypt
4. JWT token generated with user data and role
5. Secure session cookie set
6. User redirected to dashboard

### API Protection

#### Middleware Protection

Routes are protected using NextAuth middleware:

- Public routes: `/`, `/auth/*`, `/api/auth/*`
- Protected routes: `/dashboard/*`, `/api/*` (except auth)
- Role-based route restrictions

#### API Route Protection

```typescript
// Require any authenticated user
export const GET = withAuth(async (req, { user }) => {
  // Handler code
})

// Require admin role
export const POST = withAdminAuth(async (req, { user }) => {
  // Handler code
})

// Require operator or admin role
export const PUT = withOperatorAuth(async (req, { user }) => {
  // Handler code
})
```

### Permission System

```typescript
const permissions = {
  'users.view': [UserRole.ADMIN],
  'users.create': [UserRole.ADMIN],
  'power-units.view': [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
  'power-units.create': [UserRole.ADMIN, UserRole.OPERATOR],
  // ... more permissions
}
```

### Client-Side Usage

```typescript
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    hasPermission,
    login,
    logout 
  } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {isAdmin && <AdminPanel />}
      {hasPermission('power-units.create') && <CreateButton />}
    </div>
  )
}
```

### Security Features

- **Secure Cookies**: HttpOnly cookies in production
- **Password Security**: bcrypt hashing with salt rounds: 12
- **Rate Limiting**: Login attempt limiting
- **Audit Logging**: All authentication events are logged

### Environment Variables

```env
# Required
DATABASE_URL=          # PostgreSQL connection string
NEXTAUTH_SECRET=       # JWT secret key for NextAuth.js
NEXTAUTH_URL=          # Application URL for NextAuth.js callbacks

# Optional Email Configuration
EMAIL_HOST=            # SMTP host (default: smtp.gmail.com)
EMAIL_PORT=            # SMTP port (default: 587)
EMAIL_USER=            # SMTP username
EMAIL_PASS=            # SMTP password
EMAIL_FROM=            # From email address

# Feature Flags
ENABLE_REGISTRATION=   # Enable/disable user registration (default: true)
ENABLE_EMAIL_NOTIFICATIONS= # Enable/disable email notifications (default: true)
```

---

## Deployment Guide

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 12.0 or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB free space
- **Network**: HTTPS support for production

### Docker Deployment

#### Option 1: Docker Compose (Recommended)

```bash
git clone <repository-url>
cd npcl-dashboard
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d
```

#### Initialize Database

```bash
docker-compose exec app npm run db:push
docker-compose exec app npm run db:seed
```

#### Option 2: Standalone Docker

```bash
docker build -t npcl-dashboard .
docker run -d \
  --name npcl-dashboard \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  npcl-dashboard
```

### Vercel Deployment

#### 1. Prepare for Vercel

```bash
npm i -g vercel
```

#### 2. Configure Next.js for Vercel

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

module.exports = nextConfig
```

#### 3. Deploy

```bash
vercel login
vercel --prod
```

### Traditional Server Deployment

#### 1. Server Setup (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Application Setup

```bash
git clone <repository-url>
cd npcl-dashboard
npm ci --only=production
npm run build
npm run db:generate
```

#### 3. Database Setup

```bash
# Create database user
sudo -u postgres createuser --interactive npcl_user

# Create database
sudo -u postgres createdb npcl_dashboard

# Set password
sudo -u postgres psql -c "ALTER USER npcl_user PASSWORD 'secure_password';"

# Run migrations
npm run db:push
npm run db:seed
```

#### 4. Process Management with PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'npcl-dashboard',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### SSL/TLS Configuration

#### Let's Encrypt (Free SSL)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Monitoring and Logging

#### Health Checks

```bash
# Add to crontab
*/5 * * * * curl -f http://localhost:3000/api/health || echo "NPCL Dashboard is down" | mail -s "Alert" admin@company.com
```

#### Log Rotation

```bash
# /etc/logrotate.d/npcl-dashboard
/home/app/npcl-dashboard/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 app app
    postrotate
        pm2 reload npcl-dashboard
    endscript
}
```

### Backup and Recovery

#### Database Backup

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/npcl"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -U npcl_user -h localhost npcl_dashboard | gzip > $BACKUP_DIR/npcl_backup_$DATE.sql.gz

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/npcl_backup_$DATE.sql.gz s3://your-backup-bucket/

# Cleanup old backups
find $BACKUP_DIR -name "npcl_backup_*.sql.gz" -mtime +30 -delete
```

---

## Environment Configuration

### Environment Variable Structure

#### Server-Side Variables (config/env.server.ts)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/npcl_dashboard"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here-make-it-long-and-random-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="NPCL Dashboard <your-email@gmail.com>"

# Security Settings
BCRYPT_SALT_ROUNDS="12"
JWT_SECRET="your-jwt-secret-key-different-from-nextauth"
JWT_EXPIRES_IN="24h"
```

#### Client-Side Variables (config/env.client.ts)

```env
# Client-accessible variables (prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL="30000"
NEXT_PUBLIC_ENABLE_REGISTRATION="true"
NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS="true"
NEXT_PUBLIC_LOW_EFFICIENCY_THRESHOLD="75"
NEXT_PUBLIC_HIGH_TEMPERATURE_THRESHOLD="500"
```

### Environment Setup

#### 1. Copy Example File

```bash
cp .env.example .env
```

#### 2. Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3. Configure Database

Update your `.env` file with your database connection:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/npcl_dashboard"
```

### Migration from Mixed Environment System

#### Before (Problematic)

```typescript
// Mixed server/client usage causing errors
import { env } from '@/config/env'
const dbUrl = env.DATABASE_URL // Error: process is not defined
```

#### After (Fixed)

```typescript
// Server-side usage
import { serverEnv } from '@/config/env.server'
const dbUrl = serverEnv.DATABASE_URL

// Client-side usage
import { clientEnv } from '@/config/env.client'
const refreshInterval = clientEnv.DASHBOARD_REFRESH_INTERVAL
```

---

## Test Implementation

### Test Suite Overview

The NPCL Dashboard includes a comprehensive test suite with 150+ test cases across 8 major categories:

- **Library Functions**: 45+ tests covering core utilities, auth, validation, RBAC
- **API Routes**: 35+ tests for authentication and dashboard endpoints
- **Components**: 25+ tests for React components and role guards
- **Hooks**: 15+ tests for custom authentication hooks
- **Integration**: 20+ tests for end-to-end workflows
- **Utilities**: 10+ tests for test helpers and factories

### Test Structure

```
__tests__/
├── utils/                    # Test utilities and mock factories
├── lib/                      # Library function tests (security-critical)
├── api/                      # API endpoint tests
├── components/               # React component tests
├── hooks/                    # Custom hook tests
├── integration/              # End-to-end integration tests
├── test-runner.ts            # Advanced test runner
└── README.md                 # Comprehensive documentation
```

### Security Testing Highlights

#### Authentication Security

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ Password verification and validation
- ✅ Reset token generation and hashing
- ✅ Deprecated JWT function protection
- ✅ Error handling and edge cases

#### Role-Based Access Control (RBAC)

- ✅ Permission validation for all roles (Admin, Operator, Viewer)
- ✅ Role hierarchy enforcement
- ✅ Permission combinations testing
- ✅ Security edge cases and privilege escalation prevention

#### API Security

- ✅ Input validation and sanitization
- ✅ Authentication middleware testing
- ✅ Authorization checks for all endpoints
- ✅ Error handling without information leakage

### Running Tests

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:api
npm run test:components
npm run test:security

# Run with coverage
npm run test:coverage

# Advanced test runner
npm run test:runner all
npm run test:runner security
npm run test:runner performance
```

### Test Configuration

```typescript
// jest.config.ts
export default {
  preset: 'next/jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,ts,tsx}',
    'components/**/*.{js,ts,tsx}',
    'lib/**/*.{js,ts}',
    'hooks/**/*.{js,ts}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

---

## Fix Summaries

### Authentication Fixes

#### NextAuth.js Migration Complete

- **Problem**: Mixed authentication system using both NextAuth.js and manual JWT
- **Solution**: Migrated to pure NextAuth.js implementation
- **Benefits**: Enhanced security, standardized flow, reduced complexity

#### Environment Variable Fixes

- **Problem**: `ReferenceError: process is not defined` in client-side components
- **Solution**: Split environment configuration into server-side and client-side files
- **Benefits**: Proper separation of concerns, no secrets exposed to browser

#### Import Path Fixes

- **Problem**: Inconsistent path aliases (`@lib/` vs `@/lib/`)
- **Solution**: Standardized all imports to use `@/lib/` pattern
- **Benefits**: Consistent codebase, no module resolution errors

### Test Fixes

#### ESM Module Issues

- **Problem**: Jest couldn't parse ESM modules like `jose` and `next-auth`
- **Solution**: Updated Jest configuration with comprehensive ESM support
- **Benefits**: All tests now run without module parsing errors

#### Circular Dependencies

- **Problem**: Test helpers had circular import dependencies
- **Solution**: Restructured test utilities and removed circular references
- **Benefits**: Clean test architecture, no import conflicts

#### Mock Configuration

- **Problem**: Inconsistent mocking causing test failures
- **Solution**: Enhanced Jest setup with comprehensive mocks
- **Benefits**: Reliable test execution, proper isolation

### Dependency Fixes

#### Missing Dependencies

- **Problem**: `clsx` and `tailwind-merge` packages were missing
- **Solution**: Added missing dependencies to package.json
- **Benefits**: All imports resolved correctly, no build errors

#### Nodemailer Client-Side Bundling

- **Problem**: Nodemailer being bundled for client-side causing build errors
- **Solution**: Created server-only email utility module
- **Benefits**: Clean separation, no client-side bundling issues

---

## Setup Guide

### Quick Start

#### 1. Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd npcl-dashboard

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

#### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Test Accounts

After running `npm run db:seed`:

| Role     | Email             | Password    |
| -------- | ----------------- | ----------- |
| Admin    | admin@npcl.com    | admin123    |
| Operator | operator@npcl.com | operator123 |
| Viewer   | viewer@npcl.com   | viewer123   |

### Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:security    # Run security-focused tests

# Development Tools
npm run setup:dev        # Automated development setup
npm run reset:dev        # Reset development data
npm run docker:dev       # Start with Docker
```

---

## Generated Features

### Development Scripts

#### Setup Development Environment (`scripts/dev/setup-dev-env.js`)

- Automated development environment setup
- Prerequisites checking (Node.js, npm, PostgreSQL)
- Environment file creation from template
- Dependency installation and database setup
- Colorful CLI output with progress indicators

#### Reset Development Data (`scripts/dev/reset-dev-data.js`)

- Reset development database with fresh sample data
- Safety confirmation prompts
- Database schema reset and fresh data seeding
- Production environment protection

### Docker Configuration

#### Production Dockerfile

- Multi-stage build for smaller image size
- Non-root user for security
- Health checks and proper layer caching

#### Development Dockerfile (`Dockerfile.dev`)

- Development container with hot reloading
- Development dependencies included
- Volume mounting for live code changes

#### Docker Compose Configuration

- Complete development/production environment
- Services: NPCL Dashboard, PostgreSQL, Redis (optional), Nginx (optional)
- Health checks for all services, volume persistence, network isolation

### API Health Check (`app/api/health/route.ts`)

- Application health monitoring endpoint
- Database connectivity check
- Memory usage monitoring and system uptime tracking
- Performance metrics and HTTP status codes for monitoring systems

### Performance Monitoring (`lib/monitoring/performance.ts`)

- Application performance tracking
- System metrics collection (CPU, memory, uptime)
- API request tracking and performance alerts
- Execution time measurement utilities

### Enhanced Package Scripts

```json
{
  "setup:dev": "node scripts/dev/setup-dev-env.js",
  "reset:dev": "node scripts/dev/reset-dev-data.js",
  "docker:build": "docker build -t npcl-dashboard .",
  "docker:dev": "docker-compose -f docker-compose.yml -f docker-compose.dev.yml up",
  "docker:prod": "docker-compose up -d"
}
```

---

## Password Management

### Features

#### 1. Forgot Password

- **Endpoint**: `POST /api/auth/forgot-password`
- **Page**: `/auth/forgot-password`
- **Description**: Allows users to request a password reset link via email

#### 2. Reset Password

- **Endpoint**: `POST /api/auth/reset-password` and `GET /api/auth/reset-password`
- **Page**: `/auth/reset-password`
- **Description**: Allows users to reset their password using a secure token

#### 3. Change Password

- **Endpoint**: `POST /api/auth/change-password`
- **Page**: `/auth/change-password`
- **Description**: Allows authenticated users to change their password

### Database Schema

#### PasswordReset Model

```prisma
model PasswordReset {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("password_resets")
}
```

### Email Configuration

```env
# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="NPCL Dashboard <your-email@gmail.com>"
```

### Security Features

#### Password Reset Security

- Tokens expire after 1 hour
- Tokens are single-use (marked as used after reset)
- All user sessions are invalidated after password reset
- Email enumeration protection (always returns success)

#### Password Change Security

- Requires current password verification
- Prevents setting the same password
- Requires authentication (JWT token)
- Logs audit events for password changes

### Usage Examples

#### User Flow: Forgot Password

1. User goes to login page
2. Clicks "Forgot your password?"
3. Enters email address
4. Receives email with reset link
5. Clicks link in email
6. Sets new password
7. Redirected to login

#### User Flow: Change Password

1. User logs into dashboard
2. Navigates to `/auth/change-password`
3. Enters current password
4. Enters new password twice
5. Submits form
6. Receives success confirmation

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U npcl_user -h localhost -d npcl_dashboard

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### 2. Application Won't Start

```bash
# Check PM2 logs
pm2 logs npcl-dashboard

# Check environment variables
pm2 env 0

# Restart application
pm2 restart npcl-dashboard
```

#### 3. Authentication Issues

- Check that `NEXTAUTH_SECRET` is set in environment variables
- Verify `NEXTAUTH_URL` matches your application URL
- Ensure database is properly migrated and seeded
- Clear browser cache and cookies

#### 4. Environment Variable Errors

- Ensure all required variables are set in `.env` file
- Check that client-side variables are prefixed with `NEXT_PUBLIC_`
- Verify server-side variables are not accessed in client components

#### 5. Test Failures

- Run `npm run test:security` to check security-critical tests
- Check Jest configuration for ESM module support
- Verify all mocks are properly configured
- Clear test cache: `npm test -- --clearCache`

### Performance Optimization

#### Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM power_units;

-- Update statistics
ANALYZE;

-- Reindex if needed
REINDEX DATABASE npcl_dashboard;
```

#### Application Optimization

```bash
# Enable gzip compression in Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Monitoring Commands

```bash
# System resources
htop
iotop
df -h

# Application status
pm2 status
pm2 monit

# Database status
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Network connections
netstat -tulpn | grep :3000

# Log monitoring
tail -f /var/log/nginx/access.log
pm2 logs npcl-dashboard --lines 100
```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong database passwords
- [ ] Configure firewall (UFW/iptables)
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Monitor access logs
- [ ] Use environment variables for secrets
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Regular security scans

### Maintenance Schedule

#### Daily

- Monitor application health
- Check error logs
- Verify backups

#### Weekly

- Review performance metrics
- Update dependencies
- Security scan

#### Monthly

- Database maintenance
- Log cleanup
- Security updates
- Backup testing

---

## Support and Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Project Resources

- API Documentation: `/api/docs`
- Health Check: `/api/health`
- Database Studio: `npm run db:studio`
- Test Coverage: `npm run test:coverage`

### Getting Help

1. Check this documentation
2. Review error logs
3. Run validation scripts
4. Check test results
5. Contact system administrator

---

*Last Updated: Julyl 31, 2025*
*Version: 1.0.0*
*Status: Production Ready*
