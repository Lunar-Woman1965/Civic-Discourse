
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId } = await request.json()

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      )
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: currentUser.id, receiverId },
          { requesterId: receiverId, receiverId: currentUser.id }
        ]
      }
    })

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Friend request already exists' },
        { status: 400 }
      )
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: currentUser.id,
        receiverId,
        status: 'pending'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        actorId: currentUser.id,
        type: 'friend_request',
        title: 'New Friend Request',
        message: `${currentUser.name} sent you a friend request`,
        link: '/friends'
      }
    })

    return NextResponse.json(friendship)
  } catch (error) {
    console.error('Friend request error:', error)
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    )
  }
}
