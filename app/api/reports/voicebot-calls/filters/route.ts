import { prisma } from '@lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [languages, statuses] = await Promise.all([
      prisma.voicebotCall.findMany({
        distinct: ['language'],
        select: { language: true },
      }),
      prisma.voicebotCall.findMany({
        distinct: ['callResolutionStatus'],
        select: { callResolutionStatus: true },
        where: {
          callResolutionStatus: { not: null },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        languages: languages.map((l) => l.language).filter(Boolean),
        callResolutionStatuses: statuses
          .map((s) => s.callResolutionStatus)
          .filter(Boolean),
      },
    })
  } catch (error) {
    console.error('❌ Error fetching filters:', error)
    return NextResponse.json({ success: false, message: 'Failed to load filters' }, { status: 500 })
  }
}
