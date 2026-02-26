
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        profileImage: true,
        useAvatar: true,
        avatarStyle: true,
        avatarSeed: true,
        politicalLeaning: true,
        civilityScore: true,
        joinedAt: true,
        isVerified: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data but only indicate if password exists (not the hash itself)
    const { password, ...userWithoutPasswordHash } = user;
    return NextResponse.json({ 
      user: {
        ...userWithoutPasswordHash,
        password: password ? 'exists' : null, // Just indicate password exists, don't send hash
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, username, bio, politicalLeaning } = body;

    // If username is being updated, check if it's already taken
    if (username !== undefined && username !== '') {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username,
          NOT: { id: session.user.id }, // Exclude current user
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken. Please choose a different one." },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        username: username === '' ? null : username || undefined, // Allow clearing username
        name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
        bio: bio || undefined,
        politicalLeaning: politicalLeaning || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        profileImage: true,
        useAvatar: true,
        avatarStyle: true,
        avatarSeed: true,
        politicalLeaning: true,
        civilityScore: true,
        joinedAt: true,
        isVerified: true,
        password: true,
      },
    });

    // Return user data but only indicate if password exists (not the hash itself)
    const { password, ...userWithoutPasswordHash } = updatedUser;
    return NextResponse.json({ 
      user: {
        ...userWithoutPasswordHash,
        password: password ? 'exists' : null,
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
