

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
      where: { id: groupId }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: groupId
        }
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    // Add member
    const member = await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: groupId,
        role: 'member'
      }
    })

    return NextResponse.json({ success: true, member })
  } catch (error) {
    console.error('Join group error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
