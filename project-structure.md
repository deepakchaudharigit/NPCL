# NPCL Dashboard - Project Structure

This document outlines the complete project structure for the NPCL Power Management Dashboard.

## 📁 Root Directory Structure

```
npcl-dashboard/
├── 📁 app/                     # Next.js 13+ App Router
│   ├── 📁 api/                 # API routes
│   │   ├── 📁 auth/            # Authentication endpoints (Next.js standard)
│   │   │   ├── 📁 [...nextauth]/   # ✅ NextAuth.js: login, logout, session, callbacks
│   │   │   ├── 📁 register/        # ✅ Custom: user registration
│   │   │   ├── 📁 forgot-password/ # ✅ Custom: forgot password (send reset email)
│   │   │   ├── 📁 reset-password/  # ✅ Custom: reset password (via token)
│   │   │   ├── 📁 change-password/ # ✅ Custom: user-initiated password change
│   │   │   ├── 📁 profile/         # ✅ Custom: user profile management
│   │   │   ├── 📁 users/           # ✅ Custom: user management (CRUD)
│   │   │   ├── 📁 test-session/    # ✅ Optional: session debug endpoint
│   │   │   └── 📁 test-login/      # ✅ Optional: login debug endpoint
│   │   └── 📁 dashboard/       # Dashboard API endpoints
│   │       ├── 📁 power-units/     # Power unit data
│   │       └── 📁 stats/           # Dashboard statistics
│   ├── 📁 auth/                # Authentication pages
│   │   ├── 📁 change-password/     # Change password page
│   │   ├── 📁 error/               # Auth error page
│   │   ├── 📁 forgot-password/     # Forgot password page
│   │   ├── 📁 login/               # Login page
│   │   ├── 📁 logout/              # Logout page
│   │   ├── 📁 register/            # Registration page
│   │   └── 📁 reset-password/      # Reset password page
│   ├── 📁 dashboard/           # Dashboard pages
│   ├── 📄 globals.css          # Global styles
│   ├── 📄 layout.tsx           # Root layout component
│   └── 📄 page.tsx             # Home page
├── 📁 components/              # Reusable React components
│   ├── 📁 auth/                # Authentication components
│   │   ├── 📄 LoginForm.tsx        # Login form component
│   │   ├── 📄 RegisterForm.tsx     # Registration form component
│   │   ├── 📄 RoleGuard.tsx        # Role-based access control
│   │   └── 📄 UserProfile.tsx      # User profile component
│   ├── 📁 dashboard/           # Dashboard components
│   │   ├── 📄 DashboardLayout.tsx  # Dashboard layout
│   │   ├── 📄 DashboardStats.tsx   # Statistics widgets
│   │   ├── 📄 PowerGenerationChart.tsx # Power generation charts
│   │   ├── 📄 PowerUnitsTable.tsx  # Power units table
│   │   └── 📄 RecentActivity.tsx   # Recent activity feed
│   └── 📁 providers/           # React context providers
│       └── 📄 session-provider.tsx # NextAuth session provider
├── 📁 config/                  # Configuration files
│   ├── 📄 app.ts               # Application configuration
│   ├── 📄 auth.ts              # Authentication configuration
│   ├── 📄 database.ts          # Database configuration
│   └── 📄 env.ts               # Environment variables management
├── 📁 docs/                    # Documentation
│   ├── 📄 AUTHENTICATION.md    # Authentication system docs
│   └── 📄 PASSWORD_FEATURES.md # Password management docs
├── 📁 hooks/                   # Custom React hooks
├── 📁 lib/                     # Utility libraries
│   ├── 📄 auth.ts              # Authentication utilities
│   ├── 📄 auth-utils.ts        # Additional auth utilities
│   ├── 📄 nextauth.ts          # NextAuth.js configuration
│   ├── 📄 prisma.ts            # Prisma client setup
│   ├── 📄 rbac.ts              # Role-based access control
│   ├── 📄 utils.ts             # General utilities
│   └── 📄 validations.ts       # Input validation schemas
├── 📁 middleware/              # Custom middleware
│   └── 📄 authMiddleware.ts    # Authentication middleware
├── 📁 models/                  # Data models and types
├── 📁 prisma/                  # Database schema and migrations
│   ├── 📄 schema.prisma        # Database schema
│   └── 📄 seed.ts              # Database seeding script
├── 📁 public/                  # Static assets
│   └── 📄 favicon.ico          # Site favicon
├── 📁 scripts/                 # Utility scripts
│   ├── 📄 setup-auth.js        # Authentication setup script
│   └── 📄 validate-implementation.js # Implementation validator
├── 📁 types/                   # TypeScript type definitions
│   ├── 📄 index.ts             # General type definitions
│   └── 📄 next-auth.d.ts       # NextAuth type extensions
├── 📁 __tests__/               # Test files
│   ├── 📁 api/                 # API endpoint tests
│   ├── 📁 components/          # Component tests
│   ├── 📁 lib/                 # Library function tests
│   ├── 📄 auth.test.ts         # Authentication tests
│   ├── 📄 middleware.test.ts   # Middleware tests
│   └── 📄 test-fixes.test.ts   # Test fixes
├── 📄 .env                     # Environment variables (local)
├── 📄 .env.example             # Environment variables template
├── 📄 .eslintrc.json           # ESLint configuration
├── 📄 .gitignore               # Git ignore rules
├── 📄 jest.config.ts           # Jest testing configuration
├── 📄 jest.setup.ts            # Jest setup file
├── 📄 middleware.ts            # Next.js middleware
├── 📄 next-env.d.ts            # Next.js type definitions
├── 📄 next.config.js           # Next.js configuration
├── 📄 package.json             # Project dependencies
├── 📄 postcss.config.js        # PostCSS configuration
├── 📄 postman.collection.json  # Postman API collection
├── 📄 README.md                # Project documentation
├── 📄 tailwind.config.js       # Tailwind CSS configuration
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 AUTHENTICATION_SETUP.md  # Authentication setup guide
├── 📄 IMPLEMENTATION_SUMMARY.md # Implementation summary
├── 📄 SETUP_GUIDE.md           # Project setup guide
└── 📄 test-status.md           # Testing status
```

## 🏗️ Architecture Overview

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v4
- **State Management**: React hooks and context
- **Type Safety**: TypeScript

### Backend Architecture
- **API**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Authorization**: Role-based access control (RBAC)
- **Security**: bcrypt for password hashing, CSRF protection

### Database Schema
- **Users**: User accounts with roles (ADMIN, OPERATOR, VIEWER)
- **Sessions**: NextAuth.js session management
- **AuditLogs**: Security and compliance logging
- **PowerUnits**: Power generation unit data
- **MaintenanceSchedules**: Maintenance planning

## 🔧 Configuration Management

### Environment Variables
All environment variables are centrally managed through `config/env.ts`:

```typescript
// config/env.ts - Centralized environment management
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  // ... other environment variables
}
```

### Configuration Files
- `config/app.ts` - Application settings and feature flags
- `config/auth.ts` - Authentication and security settings
- `config/database.ts` - Database connection and pool settings
- `config/env.ts` - Environment variable validation and management

## 🔐 Authentication & Authorization (Next.js Standard)

### Next.js Authentication Standards
This project follows Next.js authentication best practices with NextAuth.js:

| Feature                | Built-in by NextAuth? | File                            | Notes                        |
| ---------------------- | ---------------------- | ------------------------------- | ---------------------------- |
| 🔐 **Login**           | ✅ Yes                  | auth/[...nextauth]/route.ts   | via credentials or providers |
| 🚪 **Logout**          | ✅ Yes                  | auth/[...nextauth]/route.ts   | handled by signOut()       |
| 👤 **Session**         | ✅ Yes                  | auth/[...nextauth]/route.ts   | use getServerSession()     |
| 🆕 **Register**        | ❌ No                   | auth/register/route.ts        | create user, hash password   |
| 🔁 **Change Password** | ❌ No                   | auth/change-password/route.ts | verify current password      |
| 📧 **Forgot Password** | ❌ No                   | auth/forgot-password/route.ts | send reset token             |
| 🔑 **Reset Password**  | ❌ No                   | auth/reset-password/route.ts  | validate token, update pw    |
| 🧪 Test Session        | Optional               | auth/test-session/route.ts    | useful for dev/postman       |
| 🧪 Test Login          | Optional               | auth/test-login/route.ts      | returns current user JWT     |

### Authentication Flow
1. **NextAuth.js** handles core authentication (login/logout/session)
2. **Credentials Provider** for email/password authentication
3. **JWT Strategy** for stateless sessions
4. **Prisma Adapter** for database integration
5. **Custom Routes** for features not provided by NextAuth

### Role-Based Access Control
- **ADMIN**: Full system access
- **OPERATOR**: Power unit management and monitoring
- **VIEWER**: Read-only dashboard access

### Security Features
- Password hashing with bcrypt (12 salt rounds)
- CSRF protection
- Secure cookies in production
- Rate limiting on authentication endpoints
- Audit logging for all user actions

## 📊 API Structure

### Authentication Endpoints

#### NextAuth.js Built-in Endpoints
- `POST /api/auth/signin/credentials` - User login (NextAuth)
- `POST /api/auth/signout` - User logout (NextAuth)
- `GET /api/auth/session` - Current session info (NextAuth)
- `GET /api/auth/csrf` - CSRF token (NextAuth)
- `GET /api/auth/providers` - Available providers (NextAuth)
- `GET /api/auth/callback/[provider]` - OAuth callbacks (NextAuth)

#### Custom Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `POST /api/auth/change-password` - Password change
- `GET /api/auth/profile` - User profile info
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/users` - User management (Admin only)
- `POST /api/auth/users` - Create user (Admin only)
- `PUT /api/auth/users/[id]` - Update user (Admin only)
- `DELETE /api/auth/users/[id]` - Delete user (Admin only)

#### Debug/Test Endpoints (Development)
- `GET /api/auth/test-session` - Session debugging
- `GET /api/auth/test-login` - Login status and user info
- `POST /api/auth/test-login` - Test credentials without session

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/power-units` - Power unit data

## 🧪 Testing Strategy

### Test Structure
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Component Tests**: React component testing
- **E2E Tests**: Full user flow testing

### Test Files
- `__tests__/lib/` - Library function tests
- `__tests__/api/` - API endpoint tests
- `__tests__/components/` - Component tests

## 🚀 Deployment

### Build Process
1. TypeScript compilation
2. Next.js build optimization
3. Database migration
4. Environment validation

### Production Considerations
- Environment variables validation
- Database connection pooling
- Secure cookie configuration
- HTTPS enforcement
- Rate limiting
- Audit logging

## 📝 Development Guidelines

### Code Organization
- Use TypeScript for type safety
- Follow Next.js 13+ App Router conventions
- Implement proper error handling
- Use centralized configuration management
- Follow security best practices

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure database connection
3. Run `npm install`
4. Run `npm run db:migrate`
5. Run `npm run db:seed`
6. Start development server: `npm run dev`

### Key Dependencies
- **next**: React framework
- **next-auth**: Authentication
- **@prisma/client**: Database ORM
- **bcryptjs**: Password hashing
- **zod**: Input validation
- **tailwindcss**: Styling
- **typescript**: Type safety

## 🔄 Recent Changes

### Authentication Restructuring (Next.js Standards)
- ✅ **Restructured** `app/api/auth/` to follow Next.js authentication standards
- ❌ **Removed** `app/api/auth/login/` - Now handled by NextAuth.js `[...nextauth]` route
- ❌ **Removed** `app/api/auth/logout/` - Now handled by NextAuth.js `[...nextauth]` route
- ✅ **Added** `app/api/auth/test-session/` - Debug endpoint for session testing
- ✅ **Added** `app/api/auth/test-login/` - Debug endpoint for login testing
- ✅ **Kept** all custom routes (register, forgot-password, reset-password, change-password, profile, users)
- ✅ **Updated** project structure documentation to reflect Next.js standards

### Authentication Flow Changes
- ✅ **Login**: Use `POST /api/auth/signin/credentials` (NextAuth standard)
- ✅ **Logout**: Use `POST /api/auth/signout` (NextAuth standard)
- ✅ **Session**: Use `GET /api/auth/session` (NextAuth standard)
- ✅ **Custom Features**: Maintained separate routes for non-NextAuth functionality
- ❌ **Removed**: Custom `/api/auth/login` and `/api/auth/logout` routes (duplicated NextAuth functionality)
- ❌ **Removed**: Custom `/api/auth/session` route (duplicated NextAuth functionality)

### Removed Dependencies
- ❌ `jsonwebtoken` - Replaced with NextAuth.js JWT handling
- ❌ `@types/jsonwebtoken` - No longer needed

### Added Features
- ✅ Centralized environment configuration (`config/env.ts`)
- ✅ Improved type safety for environment variables
- ✅ Better separation of concerns in configuration
- ✅ Removed duplicate `src/` directory structure
- ✅ Debug endpoints for development and testing

### Migration Notes
- All `process.env` usage moved to centralized config
- Custom JWT functions deprecated in favor of NextAuth.js
- Improved middleware using NextAuth session management
- Better error handling and validation
- **Breaking Change**: Login/logout endpoints moved to NextAuth standard URLs
- Frontend applications should update authentication calls to use NextAuth endpoints

This structure provides a scalable, maintainable, and secure foundation for the NPCL Power Management Dashboard.