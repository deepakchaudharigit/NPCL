import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// ──────────────────────────────────────────────
// GET /api/auth/users — Fetch all users (admin)
// ──────────────────────────────────────────────
export const GET = withAdminAuth(async (req: NextRequest, { user }) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            auditLogs: true,
            reports: true, // ✅ Valid now, since User → Report[] is defined
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }, { status: 500 });
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/users — Create a new user
// ──────────────────────────────────────────────
export const POST = withAdminAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    // Basic input validation
    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'Name, email, password, and role are required',
      }, { status: 400 });
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid role specified',
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists',
      }, { status: 409 });
    }

    // Hash password securely
    const hashedPassword = await hashPassword(password);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role as UserRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Log the creation in audit logs
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'create',
        resource: 'user',
        details: {
          createdUserId: newUser.id,
          createdUserEmail: newUser.email,
          createdUserRole: newUser.role,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }, { status: 500 });
  }
});
