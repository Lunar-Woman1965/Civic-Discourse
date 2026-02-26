
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const [user, violations, suspensions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.userId },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          politicalLeaning: true,
          civilityScore: true,
          joinedAt: true,
          violationCount: true,
          isSuspended: true,
          suspendedUntil: true,
          isPermanentlyBanned: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
      }),
      prisma.userViolation.findMany({
        where: { userId: params.userId },
        include: {
          post: {
            select: {
              id: true,
              content: true,
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userSuspension.findMany({
        where: { userId: params.userId },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user,
      violations,
      suspensions,
    })
  } catch (error) {
    console.error('Error fetching user history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user history' },
      { status: 500 }
    )
  }
}
