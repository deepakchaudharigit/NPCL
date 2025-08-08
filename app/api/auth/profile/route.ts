import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// GET /api/auth/profile
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
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
            reports: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});

// PATCH /api/auth/profile
export const PATCH = withAuth(async (req: NextRequest, user) => {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});

// DELETE /api/auth/profile
export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    // Soft delete the user
    await prisma.user.update({
      where: { id: user.id },
      data: { isDeleted: false }, 
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete',
        resource: 'user',
        details: { selfDeleted: true },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your account has been deactivated',
    });
  } catch (error) {
    console.error('Soft delete error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});
