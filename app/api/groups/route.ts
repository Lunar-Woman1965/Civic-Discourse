
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, politicalFocus, privacyLevel } = await request.json()

    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
    }

    // Validate privacy level
    const validPrivacyLevels = ['PUBLIC', 'PRIVATE_DISCOVERABLE', 'PRIVATE_HIDDEN']
    const privacy = validPrivacyLevels.includes(privacyLevel) ? privacyLevel : 'PUBLIC'

    // Create the group
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        politicalFocus: politicalFocus || null,
        privacyLevel: privacy,
        isPrivate: privacy !== 'PUBLIC', // Keep backward compatibility
        creatorId: session.user.id,
        civilityRules: 'Please maintain respectful dialogue and cite sources when making claims.'
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      }
    })

    // Add creator as admin member
    await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: 'admin'
      }
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Group creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch groups, excluding PRIVATE_HIDDEN groups unless user is a member
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { privacyLevel: { not: 'PRIVATE_HIDDEN' } }, // Show public and private discoverable
          { 
            members: {
              some: {
                userId: session.user.id // Show hidden groups user is member of
              }
            }
          }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        members: {
          where: {
            userId: session.user.id
          },
          select: {
            role: true
          }
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Groups fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
