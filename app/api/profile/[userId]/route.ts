
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    // If viewing own profile, redirect to /profile
    if (userId === session.user.id) {
      return NextResponse.json({
        user: {
          friendshipStatus: 'self'
        }
      });
    }

    // Fetch the user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        username: true,
        displayNamePreference: true,
        bio: true,
        profileImage: true,
        useAvatar: true,
        avatarStyle: true,
        avatarSeed: true,
        politicalLeaning: true,
        civilityScore: true,
        joinedAt: true,
        isVerified: true,
        isAdmin: true,
        profileVisibility: true,
        email: true,
        atprotoHandle: true,
        atprotoDid: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check privacy settings
    const profileVisibility = user.profileVisibility || 'public';

    if (profileVisibility === 'private') {
      // Check if they're friends
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: session.user.id, receiverId: userId, status: 'accepted' },
            { requesterId: userId, receiverId: session.user.id, status: 'accepted' },
          ],
        },
      });

      if (!friendship) {
        return NextResponse.json(
          { error: 'This profile is private' },
          { status: 403 }
        );
      }
    } else if (profileVisibility === 'friends_only') {
      // Check if they're friends
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: session.user.id, receiverId: userId, status: 'accepted' },
            { requesterId: userId, receiverId: session.user.id, status: 'accepted' },
          ],
        },
      });

      if (!friendship) {
        return NextResponse.json(
          { error: 'This profile is private' },
          { status: 403 }
        );
      }
    }

    // Check friendship status
    let friendshipStatus: 'none' | 'pending' | 'accepted' = 'none';
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, receiverId: userId },
          { requesterId: userId, receiverId: session.user.id },
        ],
      },
    });

    if (friendship) {
      friendshipStatus = friendship.status === 'accepted' ? 'accepted' : 'pending';
    }

    // Fetch recent posts (last 5)
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
        groupId: null, // Only public posts
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Remove email from response for privacy
    const { email, ...userWithoutEmail } = user;

    return NextResponse.json({
      user: {
        ...userWithoutEmail,
        posts,
        friendshipStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
