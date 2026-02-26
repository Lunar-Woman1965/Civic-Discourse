
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/db"
import { isDeviceBanned } from "@/lib/device-fingerprint"
import { sendVerificationEmail } from "@/lib/resend"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, firstName, lastName, useRealName, dateOfBirth, politicalLeaning, acceptTerms, deviceFingerprint } = body

    // Either username OR firstName is required (depending on useRealName)
    if (!email || !password || !dateOfBirth || !acceptTerms) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!useRealName && !username) {
      return NextResponse.json(
        { error: "Username is required for pseudonymous accounts" },
        { status: 400 }
      )
    }

    if (useRealName && !firstName) {
      return NextResponse.json(
        { error: "First name is required when using real name" },
        { status: 400 }
      )
    }

    // Check if device is banned
    if (deviceFingerprint) {
      const deviceBanned = await isDeviceBanned(deviceFingerprint, prisma)
      if (deviceBanned) {
        return NextResponse.json(
          { error: "This device is not eligible for registration" },
          { status: 403 }
        )
      }
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    if (age < 18) {
      return NextResponse.json(
        { error: "You must be 18 years or older to join" },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Check if username already exists (if using pseudonymous)
    if (!useRealName && username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: username.trim() }
      })
      
      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with either username or real name
    const userData: any = {
      email: normalizedEmail,
      password: hashedPassword,
      politicalLeaning: politicalLeaning || null,
      civilityScore: 5.0,
    }

    if (useRealName) {
      userData.firstName = firstName
      userData.lastName = lastName || ''
      userData.name = `${firstName} ${lastName || ''}`.trim()
    } else {
      userData.username = username.trim()
      userData.name = username.trim() // Use username as display name
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Add verification token to user data
    userData.verificationToken = verificationToken
    userData.verificationTokenExpiry = verificationTokenExpiry

    const user = await prisma.user.create({
      data: userData
    })

    // Send verification email (non-blocking - don't wait for it)
    const displayName = useRealName ? firstName : username
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`
    sendVerificationEmail(normalizedEmail, displayName, verificationUrl).catch((error) => {
      console.error('Failed to send verification email, but user was created:', error);
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        user: userWithoutPassword,
        message: 'Account created successfully! Please check your email to verify your account.'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
