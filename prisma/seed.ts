import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@npcl.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@npcl.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  // Create operator user
  const operatorPassword = await hashPassword('operator123')
  const operator = await prisma.user.upsert({
    where: { email: 'operator@npcl.com' },
    update: {},
    create: {
      name: 'Power Plant Operator',
      email: 'operator@npcl.com',
      password: operatorPassword,
      role: UserRole.OPERATOR,
    },
  })

  // Create viewer user
  const viewerPassword = await hashPassword('viewer123')
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@npcl.com' },
    update: {},
    create: {
      name: 'System Viewer',
      email: 'viewer@npcl.com',
      password: viewerPassword,
      role: UserRole.VIEWER,
    },
  })

  console.log('👥 Created users:', {
    admin: admin.email,
    operator: operator.email,
    viewer: viewer.email,
  })

  // Seed voicebot call records
  await prisma.voicebotCall.createMany({
    data: [
      {
        cli: '+91-9876543210',
        receivedAt: new Date('2025-07-16T09:30:15'),
        language: 'Hindi',
        queryType: 'Technical Support',
        ticketsIdentified: 2,
        transferredToIvr: new Date('2025-07-16T09:33:15'),
        durationSeconds: 180,
        callResolutionStatus: 'Resolved',
      },
      {
        cli: '+91-9876543210',
        receivedAt: new Date('2025-07-16T09:30:15'),
        language: 'Hindi',
        queryType: 'Billing Inquiry',
        ticketsIdentified: 5,
        transferredToIvr: new Date('2025-07-16T09:33:15'),
        durationSeconds: 210,
        callResolutionStatus: 'Escalated',
      },
      {
        cli: '+91-9876543211',
        receivedAt: new Date('2025-07-17T10:15:45'),
        language: 'English',
        queryType: 'Account Recovery',
        ticketsIdentified: 7,
        transferredToIvr: new Date('2025-07-17T10:18:30'),
        durationSeconds: 195,
        callResolutionStatus: 'Resolved',
      },
      {
        cli: '+91-9876543212',
        receivedAt: new Date('2025-07-18T11:45:30'),
        language: 'Marathi',
        queryType: 'Product Feedback',
        ticketsIdentified: 3,
        transferredToIvr: null,
        durationSeconds: 140,
        callResolutionStatus: 'Open',
      },
      {
        cli: '+91-9876543213',
        receivedAt: new Date('2025-07-19T12:00:20'),
        language: 'Gujarati',
        queryType: 'Feature Request',
        ticketsIdentified: 1,
        transferredToIvr: new Date('2025-07-19T12:05:00'),
        durationSeconds: 160,
        callResolutionStatus: 'Pending',
      },
      {
        cli: '+91-9876543214',
        receivedAt: new Date('2025-07-20T14:30:10'),
        language: 'Bengali',
        queryType: 'Service Outage Report',
        ticketsIdentified: 6,
        transferredToIvr: null,
        durationSeconds: 170,
        callResolutionStatus: 'Resolved',
      },
      {
        cli: '+91-9876543215',
        receivedAt: new Date('2025-07-21T15:15:00'),
        language: 'Tamil',
        queryType: 'General Inquiry',
        ticketsIdentified: 4,
        transferredToIvr: new Date('2025-07-21T15:20:00'),
        durationSeconds: 150,
        callResolutionStatus: 'Resolved',
      },
      {
        cli: '+91-9876543216',
        receivedAt: new Date('2025-07-22T16:45:50'),
        language: 'Telugu',
        queryType: 'Subscription Cancellation',
        ticketsIdentified: 9,
        transferredToIvr: new Date('2025-07-22T16:50:00'),
        durationSeconds: 200,
        callResolutionStatus: 'Resolved',
      },
      {
        cli: '+91-9876543217',
        receivedAt: new Date('2025-07-23T17:10:40'),
        language: 'Kannada',
        queryType: 'Refund Request',
        ticketsIdentified: 2,
        transferredToIvr: new Date('2025-07-23T17:15:00'),
        durationSeconds: 185,
        callResolutionStatus: 'Resolved',
      },
      {
        cli: '+91-9876543221',
        receivedAt: new Date('2025-07-27T21:00:40'),
        language: 'Urdu',
        queryType: 'Complaint Resolution',
        ticketsIdentified: 10,
        transferredToIvr: new Date('2025-07-27T21:05:00'),
        durationSeconds: 220,
        callResolutionStatus: 'Escalated',
      },
    ],
  })

  console.log('📞 Seeded 10 voicebot call records')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
