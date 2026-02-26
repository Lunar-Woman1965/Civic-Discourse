
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/resend'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with that email, a password reset link has been sent.'
      })
    }

    // Check if user has a password (not OAuth only)
    if (!user.password) {
      return NextResponse.json({
        message: 'This account uses Google Sign-In. Please sign in with Google.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expires,
      }
    })

    // Send password reset email via Resend
    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://bridgingtheaisle.com'}/auth/reset-password?token=${resetToken}`
    
    // Send email and log result
    console.log('📧 Attempting to send password reset email to:', user.email);
    const emailResult = await sendPasswordResetEmail(user.email, user.firstName || 'User', resetUrl);
    
    if (emailResult.success) {
      console.log('✅ Password reset email sent successfully to:', user.email);
    } else {
      console.error('❌ Failed to send password reset email:', emailResult.error);
    }

    // In development, return the reset URL so user can access it directly
    const isDev = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({
      message: 'If an account exists with that email, a password reset link has been sent.',
      ...(isDev && { resetUrl }) // Only include resetUrl in development mode
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
