
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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    // Check if current user is admin or creator of the group
    const currentMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: currentUser.id,
          groupId: params.id
        }
      }
    })

    const group = await prisma.group.findUnique({
      where: { id: params.id }
    })

    if (!group) {
      return NextResponse.json({ message: 'Group not found' }, { status: 404 })
    }

    const isCreator = group.creatorId === currentUser.id
    const isAdmin = currentMembership?.role === 'admin' || currentMembership?.role === 'moderator'

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ message: 'Only admins can remove members' }, { status: 403 })
    }

    // Prevent removing the creator
    if (userId === group.creatorId) {
      return NextResponse.json({ message: 'Cannot remove the group creator' }, { status: 403 })
    }

    // Prevent removing yourself
    if (userId === currentUser.id) {
      return NextResponse.json({ message: 'Cannot remove yourself. Use leave group instead.' }, { status: 403 })
    }

    // Remove the member
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: params.id
        }
      }
    })

    return NextResponse.json({ 
      message: 'Member removed successfully' 
    }, { status: 200 })

  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ 
      message: 'Failed to remove member' 
    }, { status: 500 })
  }
}
