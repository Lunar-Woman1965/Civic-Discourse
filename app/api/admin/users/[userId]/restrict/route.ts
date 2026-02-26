

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// POST - Set user restriction level
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
    const body = await request.json()
    const { restrictionLevel } = body

    // Validate restriction level
    const validLevels = ['none', 'read_only', 'approval_required']
    if (!restrictionLevel || !validLevels.includes(restrictionLevel)) {
      return NextResponse.json(
        { error: 'Invalid restriction level. Must be: none, read_only, or approval_required' },
        { status: 400 }
      )
    }

    // Check if trying to restrict yourself
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'You cannot restrict your own admin account' },
        { status: 400 }
      )
    }

    // Get user to check if they're an admin
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        role: true,
        restrictionLevel: true
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only Platform Founder can restrict other admins
    if (targetUser.isAdmin) {
      if (user.role !== 'PLATFORM_FOUNDER') {
        return NextResponse.json(
          { error: 'Only Platform Founder can restrict other admins' },
          { status: 403 }
        )
      }
    }

    // Update user restriction level
    await prisma.user.update({
      where: { id: userId },
      data: {
        restrictionLevel
      }
    })

    const restrictionNames = {
      none: 'No Restrictions',
      read_only: 'Read-Only Mode',
      approval_required: 'Approval Required Mode'
    }

    console.log(`[Admin Action] User ${targetUser.email} restriction set to ${restrictionLevel} by admin ${user.email}`)

    return NextResponse.json({ 
      success: true,
      message: `User restriction set to: ${restrictionNames[restrictionLevel as keyof typeof restrictionNames]}`,
      restrictionLevel
    })
  } catch (error: any) {
    console.error('Error setting user restriction:', error)
    
    return NextResponse.json(
      { error: 'Failed to set user restriction' },
      { status: 500 }
    )
  }
}
