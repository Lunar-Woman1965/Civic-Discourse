
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim()) {
      return NextResponse.json([])
    }

    // Search for users by username or name
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            isActive: true,
            isPermanentlyBanned: false,
          },
          {
            OR: [
              {
                username: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
      },
      take: limit,
    })

    // Filter out users without usernames (can't be mentioned)
    const mentionableUsers = users.filter((user: any) => user.username)

    return NextResponse.json(mentionableUsers)
  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
