
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// DELETE a user (with cascade handling)
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { error, user } = await requireAdmin()
  if (error) return error

  const { userId } = params

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  try {
    // Check if trying to delete yourself
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own admin account' },
        { status: 400 }
      )
    }

    // Delete user with cascade (Prisma will handle related records based on schema)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully' 
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    
    // Handle specific errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
