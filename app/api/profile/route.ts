import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        emailVerified: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password, ...userWithoutPasswordHash } = user;

    return NextResponse.json({
      user: {
        ...userWithoutPasswordHash,
        isVerified: !!user.emailVerified,
        password: password ? "exists" : null,
      },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, username, bio, politicalLeaning } = body;

    if (username !== undefined && username !== "") {
      const trimmedUsername = username.trim();

      const existingUser = await prisma.user.findFirst({
        where: {
          username: trimmedUsername,
          NOT: { id: session.user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken. Please choose a different one." },
          { status: 400 }
        );
      }
    }

    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();
    const trimmedUsername = username?.trim();
    const trimmedBio = bio?.trim();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: trimmedFirstName || undefined,
        lastName: trimmedLastName || undefined,
        username: username === "" ? null : trimmedUsername || undefined,
        name:
          trimmedFirstName && trimmedLastName
            ? `${trimmedFirstName} ${trimmedLastName}`
            : undefined,
        bio: trimmedBio || undefined,
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
        emailVerified: true,
        password: true,
      },
    });

    const { password, ...userWithoutPasswordHash } = updatedUser;

    return NextResponse.json({
      user: {
        ...userWithoutPasswordHash,
        isVerified: !!updatedUser.emailVerified,
        password: password ? "exists" : null,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}