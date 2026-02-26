
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

    const formData = await request.formData()
    const content = formData.get('content') as string
    const sourceCitation = formData.get('sourceCitation') as string
    const politicalTagsStr = formData.get('politicalTags') as string
    const isAnonymousStr = formData.get('isAnonymous') as string
    const imageFile = formData.get('image') as File | null
    const groupId = formData.get('groupId') as string | null
    const quotedText = formData.get('quotedText') as string | null
    const quotedAuthorId = formData.get('quotedAuthorId') as string | null
    
    const isAnonymous = isAnonymousStr === 'true'

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Validate quote if present
    if (quotedText && !isValidQuote(quotedText)) {
      return NextResponse.json({ error: 'Quote text is too long (max 500 characters)' }, { status: 400 })
    }

    // Extract mentions from content
    const mentionedUsernames = extractMentions(content)
    const mentionedUserIds = await getUserIdsByUsernames(mentionedUsernames, prisma)

    // Check user status
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
          { error: `Your account is suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}` },
          { status: 403 }
        )
      } else {
        // Suspension expired, update user status
        await prisma.user.update({
          where: { id: session.user.id },
          data: { isSuspended: false, suspendedUntil: null },
        })
      }
    }

    // Check restriction level
    if (user?.restrictionLevel === 'read_only') {
      return NextResponse.json(
        { error: 'Your account is in read-only mode. You cannot create posts.' },
        { status: 403 }
      )
    }

    // Check content for violations
    const moderationResult = moderateContent(content)

    // Check if user is restricted in the group (if posting to a group)
    if (groupId) {
      const membership = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId
          }
        },
        select: {
          restricted: true
        }
      })

      if (membership?.restricted) {
        return NextResponse.json({ 
          error: 'You are currently restricted from posting in this group' 
        }, { status: 403 })
      }
    }

    let politicalTags: string[] = []
    try {
      politicalTags = politicalTagsStr ? JSON.parse(politicalTagsStr) : []
    } catch (error) {
      politicalTags = []
    }

    let imageUrl: string | null = null
    let cloudStoragePath: string | null = null

    // Handle image upload if present
    if (imageFile && imageFile.size > 0) {
      try {
        // For now, we'll skip image upload and just create the post
        // In a real implementation, you would upload to S3 here
        console.log('Image upload would happen here:', imageFile.name)
      } catch (error) {
        console.error('Image upload failed:', error)
        // Continue without image rather than failing the post
      }
    }

    // Determine if post needs approval
    const needsApproval = user?.restrictionLevel === 'approval_required'

    // Create the post
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        groupId: groupId || null,
        politicalTags,
        sourceCitation: sourceCitation || null,
        imageUrl,
        cloudStoragePath,
        isAnonymous, // Anonymous posting flag
        isFactChecked: !!sourceCitation, // Mark as fact-checked if source is provided
        civilityScore: 7.0, // Default civility score
        isApproved: !needsApproval, // Set to false if needs approval
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
            civilityScore: true
          }
        },
        quotedAuthor: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            username: true,
            displayNamePreference: true,
            politicalLeaning: true
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
                firstName: true,
                lastName: true,
                username: true,
                displayNamePreference: true,
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
      },
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
          contentId: post.id,
          postId: post.id,
          status: 'pending',
        },
      })
    }

    // Create mention notifications
    if (mentionedUserIds.length > 0) {
      const currentUserData = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, username: true }
      })

      const displayName = currentUserData?.username || currentUserData?.name || 'Someone'

      await prisma.notification.createMany({
        data: mentionedUserIds.map(userId => ({
          userId,
          actorId: session.user.id,
          type: 'mention',
          title: 'You were mentioned in a post',
          message: `${displayName} mentioned you in their post`,
          link: `/dashboard?postId=${post.id}`,
        })),
      })
    }

    // Log activity for retention tracking
    await logActivity({
      userId: session.user.id,
      activityType: 'post_create',
      metadata: {
        postId: post.id,
        isAnonymous,
        hasImage: !!imageUrl,
        politicalTags: politicalTags.length,
      },
    }).catch(err => console.error('Failed to log post creation activity:', err))

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Post creation error:', error)
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const filter = searchParams.get('filter') || 'all' // 'all', 'friends', 'following'

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    })

    // Build the where clause based on filter
    let whereClause: any = {
      groupId: null // Only show posts not in groups (main feed)
    }

    // Filter unapproved posts (unless user is admin or is viewing own posts)
    if (!currentUser?.isAdmin) {
      whereClause.OR = [
        { isApproved: true },
        { authorId: session.user.id } // Allow users to see their own unapproved posts
      ]
    }

    if (filter === 'friends') {
      // Get user's friends
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: session.user.id, status: 'accepted' },
            { receiverId: session.user.id, status: 'accepted' }
          ]
        }
      })

      const friendIds = friendships?.map((friendship: any) => 
        friendship.requesterId === session.user.id ? friendship.receiverId : friendship.requesterId
      ) ?? []

      const relevantUserIds = [session.user.id, ...friendIds]

      whereClause.authorId = {
        in: relevantUserIds
      }
    }
    // For 'all' filter, we show all posts (no authorId restriction)

    const posts = await prisma.post.findMany({
      where: whereClause,
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
            civilityScore: true
          }
        },
        quotedAuthor: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            username: true,
            displayNamePreference: true,
            politicalLeaning: true
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
                firstName: true,
                lastName: true,
                username: true,
                displayNamePreference: true,
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
      },
      orderBy: [
        { isPinned: 'desc' }, // Pinned posts first
        { createdAt: 'desc' }  // Then by date
      ],
      take: limit,
      skip: offset
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}