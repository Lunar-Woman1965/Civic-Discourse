
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { calculateSuspensionEndDate } from '@/lib/content-moderation'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { action, reviewNote } = body // action: 'dismiss' | 'warning' | '14_days' | '28_days' | 'permanent'

    const violation = await prisma.userViolation.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!violation) {
      return NextResponse.json({ error: 'Violation not found' }, { status: 404 })
    }

    if (action === 'dismiss') {
      // Dismiss the violation
      await prisma.userViolation.update({
        where: { id: params.id },
        data: {
          status: 'dismissed',
          reviewNote,
          reviewedAt: new Date(),
        },
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Violation dismissed' 
      })
    }

    // Take enforcement action
    const endDate = calculateSuspensionEndDate(action)
    
    // Create suspension record
    await prisma.userSuspension.create({
      data: {
        userId: violation.userId,
        suspensionType: action,
        reason: `${violation.violationType}: ${violation.flaggedWords.join(', ')}`,
        violationId: violation.id,
        endDate,
        isActive: true,
      },
    })

    // Update user status
    const updateData: any = {
      violationCount: { increment: 1 },
    }

    if (action === 'permanent') {
      updateData.isPermanentlyBanned = true
      updateData.isSuspended = false
      updateData.suspendedUntil = null
      
      // Ban phone number and device fingerprints
      const bannedUser = violation.user
      const banReason = `User permanently banned for: ${violation.violationType}`
      
      // Ban phone number if exists
      if (bannedUser.phone) {
        await prisma.bannedIdentifier.upsert({
          where: {
            type_value: {
              type: 'phone',
              value: bannedUser.phone,
            },
          },
          create: {
            type: 'phone',
            value: bannedUser.phone,
            reason: banReason,
            bannedUserId: bannedUser.id,
          },
          update: {
            reason: banReason,
            bannedUserId: bannedUser.id,
          },
        })
      }
      
      // Ban all device fingerprints
      if (bannedUser.deviceFingerprints && bannedUser.deviceFingerprints.length > 0) {
        for (const fingerprint of bannedUser.deviceFingerprints) {
          await prisma.bannedIdentifier.upsert({
            where: {
              type_value: {
                type: 'device_fingerprint',
                value: fingerprint,
              },
            },
            create: {
              type: 'device_fingerprint',
              value: fingerprint,
              reason: banReason,
              bannedUserId: bannedUser.id,
            },
            update: {
              reason: banReason,
              bannedUserId: bannedUser.id,
            },
          })
        }
      }
    } else if (action === '14_days' || action === '28_days') {
      updateData.isSuspended = true
      updateData.suspendedUntil = endDate
    }

    await prisma.user.update({
      where: { id: violation.userId },
      data: updateData,
    })

    // Update violation record
    await prisma.userViolation.update({
      where: { id: params.id },
      data: {
        status: 'action_taken',
        actionTaken: action,
        reviewNote,
        reviewedAt: new Date(),
      },
    })

    // Create notification for the user
    let notificationMessage = ''
    if (action === 'warning') {
      notificationMessage = 'You have received a written warning for violating community standards. Please review our guidelines. If you believe this was issued in error, you may appeal to appealBTA@outlook.com'
    } else if (action === '14_days') {
      notificationMessage = 'Your account has been suspended for 14 days due to community standard violations. You may appeal this decision by contacting appealBTA@outlook.com'
    } else if (action === '28_days') {
      notificationMessage = 'Your account has been suspended for 28 days due to community standard violations. You may appeal this decision by contacting appealBTA@outlook.com'
    } else if (action === 'permanent') {
      notificationMessage = 'Your account has been permanently banned due to repeated violations of community standards. You may appeal this decision by contacting appealBTA@outlook.com'
    }

    await prisma.notification.create({
      data: {
        userId: violation.userId,
        type: 'moderation',
        title: 'Account Status Update',
        message: notificationMessage,
        link: '/settings',
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: `Action taken: ${action}` 
    })
  } catch (error) {
    console.error('Error taking enforcement action:', error)
    return NextResponse.json(
      { error: 'Failed to take action' },
      { status: 500 }
    )
  }
}
