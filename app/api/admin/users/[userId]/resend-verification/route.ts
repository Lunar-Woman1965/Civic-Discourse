
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/resend'
import crypto from 'crypto'

/**
 * Admin endpoint to resend verification email for any user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { error: authError, user: adminUser } = await requireAdmin()
  if (authError) return authError

  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Find the target user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        username: true,
        emailVerified: true,
        isPermanentlyBanned: true,
        isActive: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Check if banned
    if (user.isPermanentlyBanned) {
      return NextResponse.json(
        { error: 'Cannot send verification to a banned account' },
        { status: 403 }
      )
    }

    // Check if inactive
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Cannot send verification to an inactive account' },
        { status: 403 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry
      }
    })

    // Send verification email
    const displayName = user.username || user.firstName || user.name || 'there'
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`
    
    await sendVerificationEmail(user.email, displayName, verificationUrl)

    console.log(`Admin ${adminUser.email} resent verification email to ${user.email}`)

    return NextResponse.json(
      { 
        message: 'Verification email sent successfully',
        email: user.email
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}
