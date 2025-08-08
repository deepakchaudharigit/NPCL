import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { changePasswordSchema } from '@/lib/validations'

export const POST = withAuth(async (req: NextRequest, sessionUser) => {
  try {
    const body = await req.json()
    console.log('Change password payload:', body)

    const validatedData = changePasswordSchema.parse(body)
    const { currentPassword, newPassword, confirmNewPassword } = validatedData

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { success: false, message: 'New password and confirm password do not match' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, email: true, password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: 'User not found or password not set' },
        { status: 404 }
      )
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    const isSameAsCurrent = await verifyPassword(newPassword, user.password)
    if (isSameAsCurrent) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    const hashedNewPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'password_change',
        resource: 'user',
        details: JSON.stringify({ email: user.email }),
        ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json(
      { success: true, message: 'Password changed successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Change password error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})
