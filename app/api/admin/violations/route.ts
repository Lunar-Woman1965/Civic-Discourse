
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { error, user } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  try {
    const [violations, total] = await Promise.all([
      prisma.userViolation.findMany({
        where: status === 'all' ? {} : { status },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              violationCount: true,
              isSuspended: true,
              isPermanentlyBanned: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userViolation.count({
        where: status === 'all' ? {} : { status },
      }),
    ])

    return NextResponse.json({
      violations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching violations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch violations' },
      { status: 500 }
    )
  }
}
