
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { politicalLeaning: true }
    })

    // Get existing friend IDs
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      select: {
        requesterId: true,
        receiverId: true
      }
    })

    const friendIds = friendships.map((f: any) => 
      f.requesterId === session.user.id ? f.receiverId : f.requesterId
    )

    // Get groups user is already a member of
    const userGroupIds = await prisma.groupMember.findMany({
      where: { userId: session.user.id },
      select: { groupId: true }
    }).then((members: any) => members.map((m: any) => m.groupId))

    // Recommend users with similar political leanings
    const similarUsers = await prisma.user.findMany({
      where: {
        id: { notIn: [session.user.id, ...friendIds] },
        politicalLeaning: currentUser?.politicalLeaning ?? undefined
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        politicalLeaning: true,
        civilityScore: true
      },
      take: 3,
      orderBy: { civilityScore: 'desc' }
    })

    // Recommend users with different political leanings (for diversity)
    const diverseUsers = await prisma.user.findMany({
      where: {
        id: { notIn: [session.user.id, ...friendIds, ...similarUsers.map((u: any) => u.id)] },
        politicalLeaning: { not: currentUser?.politicalLeaning ?? undefined }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        politicalLeaning: true,
        civilityScore: true
      },
      take: 2,
      orderBy: { civilityScore: 'desc' }
    })

    // Add reason for recommendation
    const recommendedUsers = [
      ...similarUsers.map((u: any) => ({ ...u, reason: 'Similar political views' })),
      ...diverseUsers.map((u: any) => ({ ...u, reason: 'Different perspective to consider' }))
    ]

    // Recommend groups based on political focus and activity
    const recommendedGroups = await prisma.group.findMany({
      where: {
        id: { notIn: userGroupIds },
        privacyLevel: { in: ['PUBLIC', 'PRIVATE_DISCOVERABLE'] } // Don't recommend hidden groups
      },
      select: {
        id: true,
        name: true,
        description: true,
        politicalFocus: true,
        privacyLevel: true,
        _count: {
          select: { members: true, posts: true }
        }
      },
      take: 5,
      orderBy: [
        { members: { _count: 'desc' } },
        { posts: { _count: 'desc' } }
      ]
    })

    return NextResponse.json({
      users: recommendedUsers,
      groups: recommendedGroups
    })
  } catch (error) {
    console.error('Recommendations fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
