
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { error, user: admin } = await requireAdmin()
    if (error) return error

    // Find the user to reactivate
    const targetUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        isActive: true,
        deletedAt: true,
        isPermanentlyBanned: true,
        isAdmin: true,
        role: true
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if account is already active
    if (targetUser.isActive && !targetUser.deletedAt) {
      return NextResponse.json(
        { error: 'Account is already active' },
        { status: 400 }
      )
    }

    // Only Platform Founder can reactivate other admins
    if (targetUser.isAdmin && admin.role !== 'PLATFORM_FOUNDER') {
      return NextResponse.json(
        { error: 'Only Platform Founder can reactivate other admins' },
        { status: 403 }
      )
    }

    // Check if account is permanently banned
    if (targetUser.isPermanentlyBanned) {
      // Only Platform Founder can reactivate permanently banned users
      if (admin.role !== 'PLATFORM_FOUNDER') {
        return NextResponse.json(
          { error: 'Only Platform Founder can reactivate permanently banned users' },
          { status: 403 }
        )
      }
      
      // Reactivate and unban
      const reactivatedUser = await prisma.user.update({
        where: { id: params.userId },
        data: {
          isActive: true,
          deletedAt: null,
          isPermanentlyBanned: false,
          lastActive: new Date()
        }
      })
      
      console.log(`Platform Founder ${admin.email} reactivated and unbanned account ${targetUser.email}`)
      
      return NextResponse.json({
        message: 'Account reactivated and unbanned successfully',
        user: {
          id: reactivatedUser.id,
          email: reactivatedUser.email,
          name: reactivatedUser.name,
          username: reactivatedUser.username
        }
      })
    }

    // Admin override: Reactivate the account without password verification
    const reactivatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        isActive: true,
        deletedAt: null,
        lastActive: new Date()
      }
    })

    // Log the admin action
    console.log(`Admin ${admin.email} reactivated account ${targetUser.email}`)

    return NextResponse.json({
      message: 'Account reactivated successfully by admin',
      user: {
        id: reactivatedUser.id,
        email: reactivatedUser.email,
        name: reactivatedUser.name,
        username: reactivatedUser.username
      }
    })
  } catch (error) {
    console.error('Error in admin reactivation:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate account' },
      { status: 500 }
    )
  }
}
