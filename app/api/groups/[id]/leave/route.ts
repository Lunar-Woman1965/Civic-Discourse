

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

    const groupId = params.id

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        creator: true
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Don't allow creator to leave
    if (group.creatorId === session.user.id) {
      return NextResponse.json({ error: 'Group creator cannot leave the group' }, { status: 400 })
    }

    // Check if member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: groupId
        }
      }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 400 })
    }

    // Remove member
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: groupId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Leave group error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
