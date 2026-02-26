
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// GET - Fetch all pending content (posts and comments)
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    // Fetch pending posts
    const pendingPosts = await prisma.post.findMany({
      where: {
        isApproved: false
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            username: true,
            displayNamePreference: true,
            politicalLeaning: true,
            restrictionLevel: true
          }
        },
        _count: {
          select: {
            comments: true,
            reactions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Fetch pending comments
    const pendingComments = await prisma.comment.findMany({
      where: {
        isApproved: false
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            username: true,
            displayNamePreference: true,
            politicalLeaning: true,
            restrictionLevel: true
          }
        },
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            reactions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      posts: pendingPosts,
      comments: pendingComments,
      totalPending: pendingPosts.length + pendingComments.length
    })
  } catch (error: any) {
    console.error('Error fetching pending content:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch pending content' },
      { status: 500 }
    )
  }
}
