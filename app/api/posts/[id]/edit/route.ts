
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

    const { content, sourceCitation, politicalTags } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      select: { authorId: true }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      )
    }

    // Check content for violations
    const moderationResult = moderateContent(content)

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        content: content.trim(),
        sourceCitation: sourceCitation || null,
        politicalTags: politicalTags || [],
        isFactChecked: !!sourceCitation,
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                politicalLeaning: true
              }
            },
            reactions: {
              include: {
                user: {
                  select: { id: true, name: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            comments: true,
            reactions: true
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
          contentType: 'post',
          contentId: params.id,
          postId: params.id,
          status: 'pending',
        },
      })
    }

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Post edit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
