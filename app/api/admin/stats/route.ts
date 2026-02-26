
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalViolations,
      pendingViolations,
      activeSuspensions,
      permanentBans,
      violationsLast7Days,
      violationsLast30Days,
      recentUsers,
      dau,
      wau,
      mau,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.userViolation.count(),
      prisma.userViolation.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { isSuspended: true } }),
      prisma.user.count({ where: { isPermanentlyBanned: true } }),
      prisma.userViolation.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.userViolation.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { joinedAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          joinedAt: true,
          violationCount: true,
        },
      }),
      // Daily Active Users
      prisma.user.count({
        where: {
          lastActive: {
            gte: oneDayAgo,
          },
        },
      }),
      // Weekly Active Users
      prisma.user.count({
        where: {
          lastActive: {
            gte: sevenDaysAgo,
          },
        },
      }),
      // Monthly Active Users
      prisma.user.count({
        where: {
          lastActive: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ])

    // Get violation breakdown by type
    const violationsByType = await prisma.userViolation.groupBy({
      by: ['violationType'],
      _count: {
        id: true,
      },
    })

    return NextResponse.json({
      totalUsers,
      totalPosts,
      totalComments,
      totalViolations,
      pendingViolations,
      activeSuspensions,
      permanentBans,
      violationsLast7Days,
      violationsLast30Days,
      violationsByType: violationsByType.map((v: any) => ({
        type: v.violationType,
        count: v._count.id,
      })),
      recentUsers,
      // Retention metrics
      dau,
      wau,
      mau,
      stickinessRatio: wau > 0 ? Math.round((dau / wau) * 100) / 100 : 0,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
