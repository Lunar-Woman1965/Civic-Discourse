
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // === DAU/WAU/MAU Calculations ===
    const [dau, wau, mau] = await Promise.all([
      // Daily Active Users (logged in or had any activity in last 24 hours)
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

    // === User Signup and Verification Stats ===
    const totalUsers = await prisma.user.count()
    const verifiedUsers = await prisma.user.count({
      where: {
        emailVerified: { not: null },
      },
    })
    const unverifiedUsers = totalUsers - verifiedUsers

    // === Signup → Verification → Return Behavior ===
    
    // Users who verified their email
    const verifiedUsersData = await prisma.user.findMany({
      where: {
        emailVerified: { not: null },
      },
      select: {
        id: true,
        joinedAt: true,
        emailVerified: true,
        lastActive: true,
      },
    })

    // Calculate metrics for verified users
    let verifiedAndNeverReturned = 0
    let verifiedAndReturnedOnce = 0
    let verifiedAndActive = 0
    let totalDaysToReturn = 0
    let usersWhoReturned = 0

    for (const user of verifiedUsersData) {
      // Check if user has any login activity after email verification
      const loginActivities = await prisma.userActivityLog.findMany({
        where: {
          userId: user.id,
          activityType: 'login',
          timestamp: {
            gte: user.emailVerified || user.joinedAt,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      })

      if (loginActivities.length === 0) {
        // Never logged in after verification
        verifiedAndNeverReturned++
      } else if (loginActivities.length === 1) {
        // Logged in exactly once after verification
        verifiedAndReturnedOnce++
        
        // Calculate days to first return
        const daysToReturn = Math.floor(
          (loginActivities[0].timestamp.getTime() - (user.emailVerified || user.joinedAt).getTime()) /
            (24 * 60 * 60 * 1000)
        )
        totalDaysToReturn += daysToReturn
        usersWhoReturned++
      } else {
        // Logged in multiple times (active user)
        verifiedAndActive++
        
        // Calculate days to first return
        const daysToReturn = Math.floor(
          (loginActivities[0].timestamp.getTime() - (user.emailVerified || user.joinedAt).getTime()) /
            (24 * 60 * 60 * 1000)
        )
        totalDaysToReturn += daysToReturn
        usersWhoReturned++
      }
    }

    const avgDaysToReturn = usersWhoReturned > 0 ? totalDaysToReturn / usersWhoReturned : 0

    // === Cohort Analysis (by signup month) ===
    const cohorts: any[] = []
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    for (let i = 0; i < 6; i++) {
      const cohortStart = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1)
      const cohortEnd = new Date(cohortStart.getFullYear(), cohortStart.getMonth() + 1, 0, 23, 59, 59)

      const cohortUsers = await prisma.user.findMany({
        where: {
          joinedAt: {
            gte: cohortStart,
            lte: cohortEnd,
          },
        },
        select: {
          id: true,
          lastActive: true,
        },
      })

      const totalInCohort = cohortUsers.length
      const activeInLast7Days = cohortUsers.filter(
        (u: any) => u.lastActive >= sevenDaysAgo
      ).length
      const activeInLast30Days = cohortUsers.filter(
        (u: any) => u.lastActive >= thirtyDaysAgo
      ).length

      cohorts.push({
        month: cohortStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        totalUsers: totalInCohort,
        activeInLast7Days,
        activeInLast30Days,
        retention7Day:
          totalInCohort > 0
            ? Math.round((activeInLast7Days / totalInCohort) * 100)
            : 0,
        retention30Day:
          totalInCohort > 0
            ? Math.round((activeInLast30Days / totalInCohort) * 100)
            : 0,
      })
    }

    // === Engagement Distribution ===
    const engagementStats = await prisma.$queryRaw`
      SELECT 
        segment,
        COUNT(*) as user_count
      FROM (
        SELECT 
          u.id,
          CASE 
            WHEN COUNT(ual.id) = 0 THEN 'never_active'
            WHEN COUNT(ual.id) = 1 THEN 'one_time'
            WHEN COUNT(ual.id) BETWEEN 2 AND 5 THEN 'casual'
            WHEN COUNT(ual.id) BETWEEN 6 AND 20 THEN 'regular'
            ELSE 'power_user'
          END as segment
        FROM users u
        LEFT JOIN user_activity_logs ual ON u.id = ual."userId" AND ual.timestamp >= ${thirtyDaysAgo}
        GROUP BY u.id
      ) as user_activities
      GROUP BY segment
      ORDER BY 
        CASE segment
          WHEN 'never_active' THEN 1
          WHEN 'one_time' THEN 2
          WHEN 'casual' THEN 3
          WHEN 'regular' THEN 4
          WHEN 'power_user' THEN 5
        END
    `

    // === Activity Trends (last 30 days) ===
    const activityTrends = []
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0)
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59)

      const dailyActiveUsers = await prisma.user.count({
        where: {
          lastActive: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      })

      activityTrends.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activeUsers: dailyActiveUsers,
      })
    }

    // === Return Rate After Verification ===
    const returnRateAfterVerification = verifiedUsers > 0 
      ? Math.round(((verifiedAndReturnedOnce + verifiedAndActive) / verifiedUsers) * 100)
      : 0

    return NextResponse.json({
      // High-level metrics
      dau,
      wau,
      mau,
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      
      // Signup → Verification → Return behavior (THE KEY METRIC)
      signupFunnel: {
        verifiedAndNeverReturned,
        verifiedAndReturnedOnce,
        verifiedAndActive,
        returnRateAfterVerification,
        avgDaysToReturn: Math.round(avgDaysToReturn * 10) / 10, // Round to 1 decimal
      },
      
      // Cohort retention
      cohorts,
      
      // Engagement distribution
      engagementDistribution: engagementStats,
      
      // Activity trends
      activityTrends,
      
      // Additional calculated metrics
      stickinessRatio: wau > 0 ? Math.round((dau / wau) * 100) / 100 : 0, // DAU/WAU ratio
    })
  } catch (error) {
    console.error('Error fetching retention stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch retention statistics' },
      { status: 500 }
    )
  }
}
