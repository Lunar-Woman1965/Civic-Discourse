import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { isDeviceBanned } from "@/lib/device-fingerprint";
import { sendVerificationEmail } from "@/lib/resend";

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      password,
      username,
      firstName,
      lastName,
      useRealName,
      dateOfBirth,
      politicalLeaning,
      acceptTerms,
      deviceFingerprint,
    } = body;

    if (!email || !password || !dateOfBirth || !acceptTerms) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!useRealName && !username) {
      return NextResponse.json(
        { error: "Username is required for pseudonymous accounts" },
        { status: 400 }
      );
    }

    if (useRealName && !firstName) {
      return NextResponse.json(
        { error: "First name is required when using real name" },
        { status: 400 }
      );
    }

    if (deviceFingerprint) {
      const deviceBanned = await isDeviceBanned(deviceFingerprint, prisma);

      if (deviceBanned) {
        return NextResponse.json(
          { error: "This device is not eligible for registration" },
          { status: 403 }
        );
      }
    }

    const age = calculateAge(dateOfBirth);

    if (age < 18) {
      return NextResponse.json(
        { error: "You must be 18 years or older to join" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    if (!useRealName && username) {
      const trimmedUsername = username.trim();

      const existingUsername = await prisma.user.findUnique({
        where: { username: trimmedUsername },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userData: any = {
      email: normalizedEmail,
      password: hashedPassword,
      politicalLeaning: politicalLeaning || null,
      civilityScore: 5.0,
      emailVerified: null,
      verificationToken,
      verificationTokenExpiry,
    };

    if (useRealName) {
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName?.trim() || "";

      userData.firstName = trimmedFirstName;
      userData.lastName = trimmedLastName;
      userData.name = `${trimmedFirstName} ${trimmedLastName}`.trim();
    } else {
      const trimmedUsername = username.trim();

      userData.username = trimmedUsername;
      userData.name = trimmedUsername;
    }

    const user = await prisma.user.create({
      data: userData,
    });

    const displayName = useRealName ? firstName.trim() : username.trim();
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

    sendVerificationEmail(normalizedEmail, displayName, verificationUrl).catch(
      (error) => {
        console.error(
          "Failed to send verification email, but user was created:",
          error
        );
      }
    );

    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message:
          "Account created successfully! Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}