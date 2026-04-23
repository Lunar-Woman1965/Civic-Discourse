export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { moderateContent } from '@/lib/content-moderation'
import { extractMentions, getUserIdsByUsernames, isValidQuote } from '@/lib/mention-utils'
import { logActivity } from '@/lib/activity-tracker'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      postId,
      content,
      parentId,
      sourceCitation,
      quotedText,
      quotedAuthorId,
    } = await request.json()

    if (!postId || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (quotedText && !isValidQuote(quotedText)) {
      return NextResponse.json(
        { error: 'Quote text is too long (max 500 characters)' },
        { status: 400 }
      )
    }

    const mentionedUsernames = extractMentions(content)
    const mentionedUserIds = await getUserIdsByUsernames(mentionedUsernames, prisma)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isSuspended: true,
        suspendedUntil: true,
        isPermanentlyBanned: true,
        restrictionLevel: true,
      },
    })

    if (user?.isPermanentlyBanned) {
      return NextResponse.json(
        { error: 'Your account has been permanently banned' },
        { status: 403 }
      )
    }

    if (user?.isSuspended && user?.suspendedUntil) {
      if (new Date() < new Date(user.suspendedUntil)) {
        return NextResponse.json(
          {
            error: `Your account is suspended until ${new Date(
              user.suspendedUntil
            ).toLocaleDateString()}`,
          },
          { status: 403 }
        )
      } else {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { isSuspended: false, suspendedUntil: null },
        })
      }
    }

    if (user?.restrictionLevel === 'read_only') {
      return NextResponse.json(
        { error: 'Your account is in read-only mode. You cannot create comments.' },
        { status: 403 }
      )
    }

    const moderationResult = moderateContent(content)

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    })

    const needsApproval = user?.restrictionLevel === 'approval_required'

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        postId,
        parentId: parentId || null,
        sourceCitation: sourceCitation || null,
        civilityScore: 7.0,
        isApproved: !needsApproval,
        quotedText: quotedText || null,
        quotedAuthorId: quotedAuthorId || null,
        mentions: mentionedUserIds,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            username: true,
            displayNamePreference: true,
            profileImage: true,
            politicalLeaning: true,
            civilityScore: true,
            role: true,
            isAdmin: true,
            isFounder: true,
          },
        },
        quotedAuthor: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            username: true,
            displayNamePreference: true,
            politicalLeaning: true,
            role: true,
            isAdmin: true,
            isFounder: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
            replies: true,
          },
        },
      },
    })

    if (post.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: session.user.id,
          type: 'comment',
          title: 'New Comment',
          message: `${currentUser?.name || 'Someone'} commented on your post`,
          link: `/dashboard?postId=${postId}`,
        },
      })
    }

    if (moderationResult.isViolation) {
      await prisma.userViolation.create({
        data: {
          userId: session.user.id,
          violationType: moderationResult.violationType || 'inappropriate_language',
          severity: moderationResult.severity || 'minor',
          content: content.trim(),
          flaggedWords: moderationResult.flaggedWords,
          contentType: 'comment',
          contentId: comment.id,
          commentId: comment.id,
          status: 'pending',
        },
      })
    }

    if (mentionedUserIds.length > 0) {
      const currentUserData = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, username: true },
      })

      const displayName = currentUserData?.username || currentUserData?.name || 'Someone'

      await prisma.notification.createMany({
        data: mentionedUserIds.map((userId) => ({
          userId,
          actorId: session.user.id,
          type: 'mention',
          title: 'You were mentioned in a comment',
          message: `${displayName} mentioned you in a comment`,
          link: `/dashboard?postId=${postId}`,
        })),
      })
    }

    await logActivity({
      userId: session.user.id,
      activityType: 'comment_create',
      metadata: {
        commentId: comment.id,
        postId,
        isReply: !!parentId,
      },
    }).catch((err) => console.error('Failed to log comment creation activity:', err))

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}