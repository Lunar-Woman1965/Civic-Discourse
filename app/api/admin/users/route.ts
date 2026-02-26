
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

const GRACE_PERIOD_DAYS = 30

// GET all users with their stats
export async function GET(request: NextRequest) {
  const { error, user } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active' or 'inactive'

    // Build the where clause based on status
    const whereClause = status === 'inactive' 
      ? { isActive: false }
      : { isActive: true }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        username: true,
        displayNamePreference: true,
        politicalLeaning: true,
        joinedAt: true,
        isAdmin: true,
        role: true,
        isPermanentlyBanned: true,
        isActive: true,
        deletedAt: true,
        restrictionLevel: true,
        emailVerified: true,
        verificationToken: true,
        verificationTokenExpiry: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            sentFriendRequests: true,
            receivedFriendRequests: true,
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    // Format the data based on status
    if (status === 'inactive') {
      const formattedUsers = users.map((user: any) => {
        // Calculate grace period remaining
        let daysRemaining = null
        let canReactivate = false

        if (user.isPermanentlyBanned) {
          canReactivate = false
        } else if (user.deletedAt) {
          const deletionDate = new Date(user.deletedAt)
          const gracePeriodEnd = new Date(deletionDate.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
          const now = new Date()
          daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
          canReactivate = daysRemaining > 0
        } else {
          // Legacy account without deletedAt - can always reactivate
          canReactivate = true
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          displayNamePreference: user.displayNamePreference,
          role: user.role,
          joinedAt: user.joinedAt,
          deletedAt: user.deletedAt,
          isPermanentlyBanned: user.isPermanentlyBanned,
          daysRemaining,
          canReactivate
        }
      })

      return NextResponse.json({ users: formattedUsers })
    } else {
      // Active users
      const formattedUsers = users.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        displayNamePreference: user.displayNamePreference,
        politicalIdentifier: user.politicalLeaning || 'Not set',
        joinedAt: user.joinedAt,
        isAdmin: user.isAdmin,
        role: user.role,
        isBanned: user.isPermanentlyBanned,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        hasVerificationToken: !!user.verificationToken,
        verificationTokenExpired: user.verificationTokenExpiry ? new Date(user.verificationTokenExpiry) < new Date() : false,
        restrictionLevel: user.restrictionLevel || 'none',
        postsCount: user._count.posts,
        commentsCount: user._count.comments,
        friendRequestsCount: user._count.sentFriendRequests + user._count.receivedFriendRequests
      }))

      return NextResponse.json({ users: formattedUsers })
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
