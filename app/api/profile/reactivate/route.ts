
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const GRACE_PERIOD_DAYS = 30

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find the deactivated user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // Check if account is actually deactivated
    if (user.isActive && !user.deletedAt) {
      return NextResponse.json(
        { error: 'Account is already active' },
        { status: 400 }
      )
    }

    // Check if account was permanently deleted
    if (user.isPermanentlyBanned) {
      return NextResponse.json(
        { error: 'This account has been permanently banned and cannot be reactivated' },
        { status: 403 }
      )
    }

    // Check if the grace period has expired
    if (user.deletedAt) {
      const deletionDate = new Date(user.deletedAt)
      const gracePeriodEnd = new Date(deletionDate.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
      const now = new Date()

      if (now > gracePeriodEnd) {
        return NextResponse.json(
          { 
            error: `Grace period expired. This account was scheduled for deletion on ${gracePeriodEnd.toLocaleDateString()}. Please contact support for assistance.`,
            expired: true
          },
          { status: 410 } // 410 Gone
        )
      }
    }

    // Verify password
    const bcrypt = require('bcryptjs')
    const passwordMatch = user.password ? await bcrypt.compare(password, user.password) : false

    if (!passwordMatch && !user.password) {
      // This is an OAuth-only account
      return NextResponse.json(
        { error: 'This account uses social login. Please sign in with your social provider to reactivate.' },
        { status: 400 }
      )
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Reactivate the account
    const reactivatedUser = await prisma.user.update({
      where: { email },
      data: {
        isActive: true,
        deletedAt: null,
        lastActive: new Date()
      }
    })

    return NextResponse.json({
      message: 'Account reactivated successfully! Welcome back!',
      user: {
        id: reactivatedUser.id,
        email: reactivatedUser.email,
        name: reactivatedUser.name,
        username: reactivatedUser.username
      }
    })
  } catch (error) {
    console.error('Error reactivating account:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate account' },
      { status: 500 }
    )
  }
}

// Check reactivation eligibility without requiring password
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        isActive: true,
        deletedAt: true,
        isPermanentlyBanned: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    if (user.isPermanentlyBanned) {
      return NextResponse.json({
        canReactivate: false,
        reason: 'permanently_banned'
      })
    }

    if (user.isActive && !user.deletedAt) {
      return NextResponse.json({
        canReactivate: false,
        reason: 'already_active'
      })
    }

    if (user.deletedAt) {
      const deletionDate = new Date(user.deletedAt)
      const gracePeriodEnd = new Date(deletionDate.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
      const now = new Date()
      const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

      if (now > gracePeriodEnd) {
        return NextResponse.json({
          canReactivate: false,
          reason: 'grace_period_expired',
          expiredOn: gracePeriodEnd.toISOString()
        })
      }

      return NextResponse.json({
        canReactivate: true,
        deletedAt: user.deletedAt,
        gracePeriodEnd: gracePeriodEnd.toISOString(),
        daysRemaining
      })
    }

    return NextResponse.json({
      canReactivate: true
    })
  } catch (error) {
    console.error('Error checking reactivation eligibility:', error)
    return NextResponse.json(
      { error: 'Failed to check account status' },
      { status: 500 }
    )
  }
}
