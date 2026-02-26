

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// POST - Permanently ban a user
export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { error, user } = await requireAdmin()
  if (error) return error

  const { userId } = params

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  try {
    // Check if trying to ban yourself
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'You cannot ban your own admin account' },
        { status: 400 }
      )
    }

    // Get user to check if they're an admin
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        role: true,
        isPermanentlyBanned: true
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only Platform Founder can ban other admins
    if (targetUser.isAdmin) {
      if (user.role !== 'PLATFORM_FOUNDER') {
        return NextResponse.json(
          { error: 'Only Platform Founder can ban other admins' },
          { status: 403 }
        )
      }
      // Platform Founder cannot ban themselves
      if (userId === user.id) {
        return NextResponse.json(
          { error: 'Platform Founder cannot ban themselves' },
          { status: 400 }
        )
      }
    }

    if (targetUser.isPermanentlyBanned) {
      return NextResponse.json(
        { error: 'User is already permanently banned' },
        { status: 400 }
      )
    }

    // Permanently ban the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPermanentlyBanned: true,
        isActive: false,
        deletedAt: new Date() // Mark deletion date for tracking
      }
    })

    console.log(`[Admin Action] User ${targetUser.email} permanently banned by admin ${user.email}`)

    return NextResponse.json({ 
      success: true,
      message: 'User permanently banned' 
    })
  } catch (error: any) {
    console.error('Error banning user:', error)
    
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    )
  }
}
