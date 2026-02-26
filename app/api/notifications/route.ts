
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: any = { userId: currentUser.id }
    if (unreadOnly) {
      where.read = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, markAllAsRead } = await request.json()

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId: currentUser.id,
          read: false
        },
        data: { read: true }
      })
      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    if (notificationId) {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      })
      return NextResponse.json(notification)
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
