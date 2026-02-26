
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/resend"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date() // Token hasn't expired
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      )
    }

    // Verify the email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null
      }
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email).catch((error) => {
      console.error('Failed to send welcome email after verification:', error);
    });

    return NextResponse.json(
      { message: "Email verified successfully! You can now sign in." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
