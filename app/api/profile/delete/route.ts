
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete all user-related data (cascade)
    // Delete user's reactions
    await prisma.reaction.deleteMany({
      where: { userId: user.id }
    })

    // Delete user's comments
    await prisma.comment.deleteMany({
      where: { authorId: user.id }
    })

    // Delete user's posts (and their reactions/comments)
    const userPosts = await prisma.post.findMany({
      where: { authorId: user.id }
    })

    for (const post of userPosts) {
      await prisma.reaction.deleteMany({
        where: { postId: post.id }
      })
      await prisma.comment.deleteMany({
        where: { postId: post.id }
      })
    }

    await prisma.post.deleteMany({
      where: { authorId: user.id }
    })

    // Delete friendships
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: user.id },
          { receiverId: user.id }
        ]
      }
    })

    // Delete group memberships
    await prisma.groupMember.deleteMany({
      where: { userId: user.id }
    })

    // Delete notifications
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { userId: user.id },
          { actorId: user.id }
        ]
      }
    })

    // Delete violations
    await prisma.userViolation.deleteMany({
      where: { userId: user.id }
    })

    // Delete suspensions
    await prisma.userSuspension.deleteMany({
      where: { userId: user.id }
    })

    // Finally, delete the user account
    await prisma.user.delete({
      where: { id: user.id }
    })

    return NextResponse.json({ message: 'Account deleted permanently' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
