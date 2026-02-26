
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { moderateContent } from '@/lib/content-moderation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, sourceCitation } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check if comment exists and user is the author
    const existingComment = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { authorId: true }
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      )
    }

    // Check content for violations
    const moderationResult = moderateContent(content)

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: params.id },
      data: {
        content: content.trim(),
        sourceCitation: sourceCitation || null,
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            politicalLeaning: true,
            civilityScore: true
          }
        },
        reactions: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: {
            reactions: true,
            replies: true
          }
        }
      }
    })

    // If content violation detected, create violation record
    if (moderationResult.isViolation) {
      await prisma.userViolation.create({
        data: {
          userId: session.user.id,
          violationType: moderationResult.violationType || 'inappropriate_language',
          severity: moderationResult.severity || 'minor',
          content: content.trim(),
          flaggedWords: moderationResult.flaggedWords,
          contentType: 'comment',
          contentId: params.id,
          commentId: params.id,
          status: 'pending',
        },
      })
    }

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Comment edit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
