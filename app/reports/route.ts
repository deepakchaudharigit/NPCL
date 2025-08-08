import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// GET /api/reports - List all reports
export const GET = withAuth(async (req, user) => {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: user.id }, // Limit to user's own reports
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/reports - Create new report
export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const newReport = await prisma.report.create({
      data: {
        title: title.trim(),
        content: content || null,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Report created',
      data: newReport,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});
