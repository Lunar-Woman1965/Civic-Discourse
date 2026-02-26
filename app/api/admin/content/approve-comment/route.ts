

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// POST - Approve or reject a comment
export async function POST(request: Request) {
  const { error, user } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { commentId, action } = body // action: 'approve' or 'reject'

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Get the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
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

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Approve the comment
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          isApproved: true,
          approvedAt: new Date(),
          approvedById: user.id
        }
      })

      // Create notification for the author
      await prisma.notification.create({
        data: {
          userId: comment.authorId,
          actorId: user.id,
          type: 'comment_approved',
          title: 'Comment Approved',
          message: 'Your comment has been approved and is now visible to others'
        }
      })

      console.log(`[Admin Action] Comment ${commentId} approved by admin ${user.email}`)

      return NextResponse.json({ 
        success: true,
        message: 'Comment approved successfully'
      })
    } else {
      // Reject (delete) the comment
      await prisma.comment.delete({
        where: { id: commentId }
      })

      // Create notification for the author
      await prisma.notification.create({
        data: {
          userId: comment.authorId,
          actorId: user.id,
          type: 'comment_rejected',
          title: 'Comment Not Approved',
          message: 'Your comment was not approved and has been removed'
        }
      })

      console.log(`[Admin Action] Comment ${commentId} rejected by admin ${user.email}`)

      return NextResponse.json({ 
        success: true,
        message: 'Comment rejected and removed'
      })
    }
  } catch (error: any) {
    console.error('Error processing comment approval:', error)
    
    return NextResponse.json(
      { error: 'Failed to process comment approval' },
      { status: 500 }
    )
  }
}
