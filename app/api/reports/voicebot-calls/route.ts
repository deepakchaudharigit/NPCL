import { prisma } from '@lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 10
    const offset = (page - 1) * limit

    // Extract filters from query
    const language = searchParams.get('language') || undefined
    const cli = searchParams.get('cli') || undefined
    const callResolutionStatus = searchParams.get('callResolutionStatus') || undefined

    const durationMin = parseInt(searchParams.get('durationMin') || '')
    const durationMax = parseInt(searchParams.get('durationMax') || '')

    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Dynamically build 'where' object only when filters are defined
    const where: any = {}

    if (!isNaN(durationMin) || !isNaN(durationMax)) {
      where.durationSeconds = {
        ...(isNaN(durationMin) ? {} : { gte: durationMin }),
        ...(isNaN(durationMax) ? {} : { lte: durationMax }),
      }
    }

    if (language) where.language = language
    if (cli) where.cli = cli
    if (callResolutionStatus) where.callResolutionStatus = callResolutionStatus

    if (dateFrom && dateTo) {
      where.receivedAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      }
    }

    // Optional: debug filter output
    console.log('🔍 WHERE FILTER:', where)

    // Query data and count
    const [totalRecords, calls] = await Promise.all([
      prisma.voicebotCall.count({ where }),
      prisma.voicebotCall.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { receivedAt: 'desc' },
        select: {
          id: true,
          cli: true,
          receivedAt: true,
          language: true,
          queryType: true,
          ticketsIdentified: true,
          transferredToIvr: true,
        },
      }),
    ])

    const totalPages = Math.ceil(totalRecords / limit)

    return NextResponse.json({
      success: true,
      data: calls,
      meta: {
        page,
        totalPages,
        totalRecords,
        perPage: limit,
      },
    })
  } catch (error) {
    console.error('❌ Error fetching voicebot calls:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
