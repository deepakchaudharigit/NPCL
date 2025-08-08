import { prisma } from '@lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Parser } from '@json2csv/plainjs';
import ExcelJS from 'exceljs';

// Utility: clean data for export
function sanitizeForExport(row: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {}
  for (const key in row) {
    const value = row[key]
    if (value === null || value === undefined) {
      clean[key] = ''
    } else if (value instanceof Date) {
      clean[key] = value.toISOString()
    } else {
      clean[key] = value
    }
  }
  return clean
}

// Optional: Choose only columns you want to export
const exportFields = [
  'cli',
  'language',
  'queryType',
  'ticketsIdentified',
  'receivedAt',
  'transferredToIvr',
  'durationSeconds',
  'callResolutionStatus',
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'csv'

    // Filters
    const language = searchParams.get('language') || undefined
    const cli = searchParams.get('cli') || undefined
    const callResolutionStatus = searchParams.get('callResolutionStatus') || undefined
    const durationMin = parseInt(searchParams.get('durationMin') || 'NaN', 10)
    const durationMax = parseInt(searchParams.get('durationMax') || 'NaN', 10)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

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

    let data = await prisma.voicebotCall.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
    })

    if (data.length === 0) {
      return NextResponse.json({ success: true, message: 'No data found', data: [] }, { status: 200 })
    }

    // Sanitize + optionally trim to selected fields
    data = data.map((item) => {
      const sanitized = sanitizeForExport(item)
      const filtered: Record<string, any> = {}
      exportFields.forEach((key) => {
        filtered[key] = sanitized[key]
      })
      return filtered
    })

    // === CSV Export ===
    if (format === 'csv') {
      const parser = new Parser({ defaultValue: '' })
      const csv = parser.parse(data)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=voicebot_calls.csv',
        },
      })
    }

    // === Excel Export ===
    if (format === 'xls' || format === 'xlsx') {
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Voicebot Calls')

      sheet.columns = exportFields.map((key) => ({
        header: key,
        key,
        width: 20,
      }))

      sheet.addRows(data)

      const buffer = await workbook.xlsx.writeBuffer()

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=voicebot_calls.xlsx',
        },
      })
    }

    // === Unsupported format ===
    return NextResponse.json({ success: false, message: 'Unsupported format' }, { status: 400 })
  } catch (error) {
    console.error('❌ Export failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal error: ' + (error as Error).message,
    }, { status: 500 })
  }
}
