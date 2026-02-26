
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get trending topics from hashtags in posts
    const recentPosts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        politicalTags: true,
        _count: {
          select: {
            comments: true,
            reactions: true
          }
        }
      }
    })

    // Count hashtag frequency and engagement
    const tagStats: { [key: string]: { count: number; engagement: number } } = {}
    
    recentPosts.forEach((post: any) => {
      const engagement = post._count.comments + post._count.reactions
      post.politicalTags?.forEach((tag: any) => {
        if (!tagStats[tag]) {
          tagStats[tag] = { count: 0, engagement: 0 }
        }
        tagStats[tag].count++
        tagStats[tag].engagement += engagement
      })
    })

    // Sort by engagement score
    const trendingTopics = Object.entries(tagStats)
      .map(([tag, stats]) => ({
        tag,
        count: stats.count,
        engagement: stats.engagement,
        score: stats.count * 10 + stats.engagement
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    // Get most active groups
    const activeGroups = await prisma.group.findMany({
      where: {
        OR: [
          { privacyLevel: 'PUBLIC' },
          {
            AND: [
              { privacyLevel: 'PRIVATE_DISCOVERABLE' },
              {
                members: {
                  some: {
                    userId: currentUser.id
                  }
                }
              }
            ]
          }
        ],
        posts: {
          some: {
            createdAt: {
              gte: sevenDaysAgo
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        politicalFocus: true,
        _count: {
          select: {
            posts: true,
            members: true
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: 5
    })

    return NextResponse.json({
      trendingTopics,
      activeGroups
    })
  } catch (error) {
    console.error('Fetch trending error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    )
  }
}
