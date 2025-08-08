import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { UserRole } from '@prisma/client'

interface RouteParams {
  params: { id: string }
}

// GET /api/auth/users/[id] - Get specific user (admin only)
export const GET = withAdminAuth(async (req: NextRequest, { user }, { params }: RouteParams) => {
  try {
    const { id } = params

    const targetUser = await prisma.user.findUnique({
      where: { id },
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
            sessions: true,
          }
        }
      }
    })

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: targetUser,
    })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }, { status: 500 })
  }
})

// PUT /api/auth/users/[id] - Update user (admin only)
export const PUT = withAdminAuth(async (req: NextRequest, { user }, { params }: RouteParams) => {
  try {
    const { id } = params
    const body = await req.json()
    const { name, email, role, password } = body

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 })
    }

    // Prevent admin from demoting themselves
    if (targetUser.id === user.id && role && role !== UserRole.ADMIN) {
      return NextResponse.json({
        success: false,
        message: 'Cannot change your own admin role',
      }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (name) updateData.name = name.trim()
    if (email) updateData.email = email.toLowerCase()
    if (role && Object.values(UserRole).includes(role)) {
      updateData.role = role as UserRole
    }
    if (password) {
      updateData.password = await hashPassword(password)
    }

    // Check for email conflicts
    if (email && email.toLowerCase() !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })
      
      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: 'Email already in use by another user',
        }, { status: 409 })
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      }
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'update',
        resource: 'user',
        details: { 
          updatedUserId: id,
          changes: updateData,
          previousRole: targetUser.role 
        },
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }, { status: 500 })
  }
})

// DELETE /api/auth/users/[id] - Delete user (admin only)
export const DELETE = withAdminAuth(async (req: NextRequest, { user }, { params }: RouteParams) => {
  try {
    const { id } = params

    // Prevent admin from deleting themselves
    if (id === user.id) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete your own account',
      }, { status: 400 })
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 })
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete',
        resource: 'user',
        details: { 
          deletedUserId: id,
          deletedUserEmail: targetUser.email,
          deletedUserRole: targetUser.role 
        },
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }, { status: 500 })
  }
})