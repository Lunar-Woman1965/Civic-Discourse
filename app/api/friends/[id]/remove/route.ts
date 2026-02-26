
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function DELETE(
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
        { error: 'Friendship not found' },
        { status: 404 }
      )
    }

    // Verify current user is part of the friendship
    if (
      friendship.requesterId !== currentUser.id &&
      friendship.receiverId !== currentUser.id
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to remove this friendship' },
        { status: 403 }
      )
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: friendshipId }
    })

    return NextResponse.json({ message: 'Friendship removed' })
  } catch (error) {
    console.error('Remove friendship error:', error)
    return NextResponse.json(
      { error: 'Failed to remove friendship' },
      { status: 500 }
    )
  }
}
