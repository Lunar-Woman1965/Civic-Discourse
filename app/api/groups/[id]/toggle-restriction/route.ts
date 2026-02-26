
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, restricted } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const groupId = params.id

    // Check if current user is admin/moderator/creator
    const currentUserMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId
        }
      }
    })

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { creatorId: true }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const isCreator = group.creatorId === session.user.id
    const isAdminOrMod = currentUserMembership?.role === 'admin' || currentUserMembership?.role === 'moderator'

    if (!isCreator && !isAdminOrMod) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Cannot restrict the creator
    if (userId === group.creatorId) {
      return NextResponse.json({ error: 'Cannot restrict the group creator' }, { status: 400 })
    }

    // Update member restriction
    const updatedMember = await prisma.groupMember.update({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      },
      data: {
        restricted: restricted
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      member: updatedMember,
      message: restricted ? 'Member restricted successfully' : 'Restrictions removed'
    })
  } catch (error) {
    console.error('Toggle restriction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
