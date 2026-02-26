
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const friendshipId = params.id

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        requester: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      )
    }

    // Verify current user is the receiver
    if (friendship.receiverId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized to accept this request' },
        { status: 403 }
      )
    }

    // Update friendship status
    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'accepted' },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })

    // Create notification for requester
    await prisma.notification.create({
      data: {
        userId: friendship.requesterId,
        actorId: currentUser.id,
        type: 'friend_accept',
        title: 'Friend Request Accepted',
        message: `${currentUser.name} accepted your friend request`,
        link: '/friends'
      }
    })

    return NextResponse.json(updatedFriendship)
  } catch (error) {
    console.error('Accept friend request error:', error)
    return NextResponse.json(
      { error: 'Failed to accept friend request' },
      { status: 500 }
    )
  }
}
