/**
 * Activity Tracking Utility for User Retention Analytics
 * 
 * This module provides functions to log user activities for retention analysis.
 * Activities are stored in the UserActivityLog table and used to calculate:
 * - Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
 * - User engagement patterns
 * - Retention cohorts
 * - Power users vs. at-risk users
 */

import { prisma } from './db'

export type ActivityType =
  | 'login'
  | 'page_view'
  | 'post_create'
  | 'comment_create'
  | 'reaction_create'
  | 'profile_update'
  | 'settings_update'
  | 'friend_request'
  | 'search'
  | 'notification_view'

interface LogActivityParams {
  userId: string
  activityType: ActivityType
  metadata?: any
  sessionId?: string
}

/**
 * Log a user activity event
 * 
 * This is an asynchronous, fire-and-forget function that won't block the main request.
 * If logging fails, it logs the error but doesn't throw to avoid disrupting user experience.
 */
export async function logActivity({
  userId,
  activityType,
  metadata,
  sessionId,
}: LogActivityParams): Promise<void> {
  try {
    // Log activity in background (fire-and-forget)
    await prisma.userActivityLog.create({
      data: {
        userId,
        activityType,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        sessionId,
      },
    })

    // Also update user's lastActive timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() },
    })
  } catch (error) {
    // Log error but don't throw to avoid disrupting the main flow
    console.error('Failed to log activity:', error)
  }
}

/**
 * Log multiple activities in a batch
 * Useful for bulk operations or data backfilling
 */
export async function logActivitiesBatch(
  activities: LogActivityParams[]
): Promise<void> {
  try {
    await prisma.userActivityLog.createMany({
      data: activities.map((activity) => ({
        userId: activity.userId,
        activityType: activity.activityType,
        metadata: activity.metadata
          ? JSON.parse(JSON.stringify(activity.metadata))
          : null,
        sessionId: activity.sessionId,
      })),
    })
  } catch (error) {
    console.error('Failed to log activities batch:', error)
  }
}

/**
 * Get recent activity for a user
 */
export async function getUserRecentActivity(
  userId: string,
  limit: number = 50
) {
  return await prisma.userActivityLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: limit,
  })
}

/**
 * Get activity count by type for a user within a date range
 */
export async function getUserActivityStats(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const activities = await prisma.userActivityLog.groupBy({
    by: ['activityType'],
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  })

  return activities.map((activity: any) => ({
    type: activity.activityType,
    count: activity._count.id,
  }))
}

/**
 * Check if user was active within a specific time window
 */
export async function wasUserActiveIn(
  userId: string,
  windowHours: number
): Promise<boolean> {
  const cutoffTime = new Date(Date.now() - windowHours * 60 * 60 * 1000)

  const recentActivity = await prisma.userActivityLog.findFirst({
    where: {
      userId,
      timestamp: {
        gte: cutoffTime,
      },
    },
  })

  return recentActivity !== null
}

/**
 * Get the user's first activity after signup
 * Useful for measuring time-to-first-action
 */
export async function getUserFirstActivity(userId: string) {
  return await prisma.userActivityLog.findFirst({
    where: { userId },
    orderBy: { timestamp: 'asc' },
  })
}

/**
 * Get the user's last activity
 */
export async function getUserLastActivity(userId: string) {
  return await prisma.userActivityLog.findFirst({
    where: { userId },
    orderBy: { timestamp: 'desc' },
  })
}
