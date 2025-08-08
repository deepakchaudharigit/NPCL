/**
 * User Registration API Route
 * Handles new user registration with input validation, password hashing, and duplicate email checking for NPCL Dashboard.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input data against schema
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.issues,
        },
        { status: 400 }
      )
    }
    
    const { name, email, password, role = 'VIEWER' } = validationResult.data

    // Check for existing user with same email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password for secure storage
    const hashedPassword = await hashPassword(password)

    // Create new user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: user,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}