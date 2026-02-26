
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { avatarStyle, avatarSeed } = await request.json();

    if (!avatarStyle || !avatarSeed) {
      return NextResponse.json(
        { error: 'Avatar style and seed are required' },
        { status: 400 }
      );
    }

    // Update user profile with avatar configuration
    const user = await prisma.user.update({
      where: { email: session.user.email },
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
        isVerified: true,
        password: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}
