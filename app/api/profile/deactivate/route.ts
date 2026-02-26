
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update user account to deactivated with soft delete timestamp
    // Account can be reinstated within 30 days
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        isActive: false,
        deletedAt: new Date() // Set deletion timestamp for soft delete
      }
    })

    return NextResponse.json({
      message: 'Account deactivated successfully. You have 30 days to reactivate before permanent deletion.',
      user,
      canReinstateUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    })
  } catch (error) {
    console.error('Error deactivating account:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate account' },
      { status: 500 }
    )
  }
}
