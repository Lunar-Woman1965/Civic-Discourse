
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// POST - Approve or reject a post
export async function POST(request: Request) {
  const { error, user } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { postId, action } = body // action: 'approve' or 'reject'

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Approve the post
      await prisma.post.update({
        where: { id: postId },
        data: {
          isApproved: true,
          approvedAt: new Date(),
          approvedById: user.id
        }
      })

      // Create notification for the author
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: user.id,
          type: 'post_approved',
          title: 'Post Approved',
          message: 'Your post has been approved and is now visible to others',
          link: `/dashboard?postId=${postId}`
        }
      })

      console.log(`[Admin Action] Post ${postId} approved by admin ${user.email}`)

      return NextResponse.json({ 
        success: true,
        message: 'Post approved successfully'
      })
    } else {
      // Reject (delete) the post
      await prisma.post.delete({
        where: { id: postId }
      })

      // Create notification for the author
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: user.id,
          type: 'post_rejected',
          title: 'Post Not Approved',
          message: 'Your post was not approved and has been removed'
        }
      })

      console.log(`[Admin Action] Post ${postId} rejected by admin ${user.email}`)

      return NextResponse.json({ 
        success: true,
        message: 'Post rejected and removed'
      })
    }
  } catch (error: any) {
    console.error('Error processing post approval:', error)
    
    return NextResponse.json(
      { error: 'Failed to process post approval' },
      { status: 500 }
    )
  }
}
