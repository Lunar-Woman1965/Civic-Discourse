
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

    const { postId, commentId, type } = await request.json()

    if (!type || (!postId && !commentId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validReactionTypes = ['like', 'dislike', 'care', 'mad', 'angry', 'horrified']
    if (!validReactionTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    // Check user restriction level
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        restrictionLevel: true,
      },
    })

    if (user?.restrictionLevel === 'read_only') {
      return NextResponse.json(
        { error: 'Your account is in read-only mode. You cannot add reactions.' },
        { status: 403 }
      )
    }

    // Check if user already reacted
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        userId: session.user.id,
        ...(postId ? { postId } : { commentId })
      }
    })

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if same type
        await prisma.reaction.delete({
          where: { id: existingReaction.id }
        })
        return NextResponse.json({ removed: true })
      } else {
        // Update reaction type
        const updatedReaction = await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        })
        return NextResponse.json(updatedReaction)
      }
    } else {
      // Create new reaction
      const newReaction = await prisma.reaction.create({
        data: {
          userId: session.user.id,
          type,
          ...(postId ? { postId } : { commentId })
        },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      })

      // Create notification for the post/comment author
      if (postId) {
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: { authorId: true }
        })
        
        if (post && post.authorId !== session.user.id) {
          await prisma.notification.create({
            data: {
              userId: post.authorId,
              actorId: session.user.id,
              type: 'reaction',
              title: 'New Reaction',
              message: `${session.user.name || 'Someone'} reacted ${type} to your post`,
              link: `/dashboard?postId=${postId}`
            }
          })
        }
      } else if (commentId) {
        const comment = await prisma.comment.findUnique({
          where: { id: commentId },
          select: { authorId: true, postId: true }
        })
        
        if (comment && comment.authorId !== session.user.id) {
          await prisma.notification.create({
            data: {
              userId: comment.authorId,
              actorId: session.user.id,
              type: 'reaction',
              title: 'New Reaction',
              message: `${session.user.name || 'Someone'} reacted ${type} to your comment`,
              link: `/dashboard?postId=${comment.postId}`
            }
          })
        }
      }

      return NextResponse.json(newReaction)
    }
  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
