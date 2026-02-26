
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
      where: { id: friendshipId }
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
        { error: 'Unauthorized to decline this request' },
        { status: 403 }
      )
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: friendshipId }
    })

    return NextResponse.json({ message: 'Friend request declined' })
  } catch (error) {
    console.error('Decline friend request error:', error)
    return NextResponse.json(
      { error: 'Failed to decline friend request' },
      { status: 500 }
    )
  }
}
