import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { avatarStyle, avatarSeed } = await request.json();

    if (!avatarStyle || !avatarSeed) {
      return NextResponse.json(
        { error: "Avatar style and seed are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email: session.user.email.toLowerCase().trim() },
      data: {
        avatarStyle,
        avatarSeed,
        useAvatar: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        bio: true,
        profileImage: true,
        useAvatar: true,
        avatarStyle: true,
        avatarSeed: true,
        politicalLeaning: true,
        civilityScore: true,
        joinedAt: true,
        emailVerified: true,
        password: true,
      },
    });

    const { password, ...userWithoutPasswordHash } = user;

    return NextResponse.json({
      user: {
        ...userWithoutPasswordHash,
        isVerified: !!user.emailVerified,
        password: password ? "exists" : null,
      },
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 }
    );
  }
}