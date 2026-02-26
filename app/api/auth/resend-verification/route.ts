
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/resend"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account with that email exists, a verification email has been sent." },
        { status: 200 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      )
    }

    // Check if banned
    if (user.isPermanentlyBanned) {
      return NextResponse.json(
        { error: "This account has been permanently banned" },
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
    
    await sendVerificationEmail(normalizedEmail, displayName, verificationUrl)

    return NextResponse.json(
      { message: "Verification email sent successfully! Please check your inbox." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Failed to send verification email. Please try again." },
      { status: 500 }
    )
  }
}
