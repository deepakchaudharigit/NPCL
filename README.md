# NPCL Dashboard

A comprehensive Power Management Dashboard for NPCL (Noida Power Company Limited) built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

- **User Authentication & Authorization**: Role-based access control (Admin, Operator, Viewer)
- **Real-time Power Monitoring**: Live power generation tracking and efficiency monitoring
- **Equipment Management**: Power unit status tracking and maintenance scheduling
- **Dashboard Analytics**: Comprehensive statistics and data visualization
- **Audit Logging**: Complete audit trail for all system activities
- **Report Generation**: Automated daily, weekly, monthly, and annual reports
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with JWT strategy
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel-ready

## Project Structure

```
npcl-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── src/components/        # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth.ts            # Authentication utilities
│   ├── prisma.ts          # Prisma client
│   ├── utils.ts           # General utilities
│   └── validations.ts     # Zod schemas
├── middleware/            # Custom middleware
├── models/                # Data models
├── types/                 # TypeScript type definitions
├── config/                # Configuration files
├── prisma/                # Database schema and migrations
├── __tests__/             # Test files
└── public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/npcl-dashboard.git
   cd npcl-dashboard
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/npcl_dashboard"
   NEXTAUTH_SECRET="your-secret-key-here-make-it-long-and-random"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push database schema
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```
5. **Start the development server**

   ```bash
   npm run dev
   ```
6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Users

After seeding the database, you can log in with these default accounts:

| Role     | Email             | Password    |
| -------- | ----------------- | ----------- |
| Admin    | admin@npcl.com    | admin123    |
| Operator | operator@npcl.com | operator123 |
| Viewer   | viewer@npcl.com   | viewer123   |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## API Endpoints

### Authentication (NextAuth.js)

- `POST /api/auth/signin/credentials` - User login (NextAuth.js)
- `POST /api/auth/signout` - User logout (NextAuth.js)
- `GET /api/auth/session` - Get session info (NextAuth.js)
- `POST /api/auth/register` - User registration (Custom)
- `POST /api/auth/forgot-password` - Password reset request (Custom)
- `POST /api/auth/reset-password` - Password reset confirmation (Custom)
- `POST /api/auth/change-password` - Change password (Custom)

### Debug Endpoints (Development)

- `GET /api/auth/test-session` - Session debugging
- `POST /api/auth/test-login` - Credential validation testing

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/power-units` - Get power units with readings

### User Management (Admin only)

- `GET /api/auth/users` - Get all users
- `PUT /api/auth/users/[id]` - Update user
- `DELETE /api/auth/users/[id]` - Delete user

## Database Schema

The application uses the following main entities:

- **Users**: System users with role-based access
- **PowerUnits**: Power generation units (thermal, hydro, solar, wind, nuclear)
- **PowerReadings**: Real-time power generation data
- **MaintenanceRecords**: Equipment maintenance tracking
- **Reports**: Generated reports and analytics
- **AuditLogs**: System activity audit trail
- **SystemConfig**: Application configuration

## Testing

Run the test suite:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Docker

```bash
# Build Docker image
docker build -t npcl-dashboard .

# Run container
docker run -p 3000:3000 npcl-dashboard
```

## Environment Variables

| Variable            | Description                  | Required |
| ------------------- | ---------------------------- | -------- |
| `DATABASE_URL`    | PostgreSQL connection string | Yes      |
| `NEXTAUTH_SECRET` | JWT secret key               | Yes      |
| `NEXTAUTH_URL`    | Application URL              | Yes      |
| `JWT_EXPIRES_IN`  | JWT expiration time          | No       |
| `EMAIL_HOST`      | SMTP host for notifications  | No       |
| `EMAIL_PORT`      | SMTP port                    | No       |
| `EMAIL_USER`      | SMTP username                | No       |
| `EMAIL_PASS`      | SMTP password                | No       |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@npcl.com or create an issue in the GitHub repository.

## Roadmap

- [ ] Real-time WebSocket connections for live data
- [ ] Advanced analytics and forecasting
- [ ] Mobile application
- [ ] Integration with external monitoring systems
- [ ] Advanced reporting with PDF export
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced user permissions
- [ ] API rate limiting
- [ ] Data export functionality
