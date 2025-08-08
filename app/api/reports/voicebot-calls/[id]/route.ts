import { prisma } from '@lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const call = await prisma.voicebotCall.findUnique({
      where: { id: params.id },
    })

    if (!call) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: call })
  } catch (error) {
    console.error('❌ Error fetching voicebot call by ID:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
