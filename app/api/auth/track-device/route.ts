
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isDeviceBanned } from '@/lib/device-fingerprint';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { deviceFingerprint } = await req.json();
    
    if (!deviceFingerprint) {
      return NextResponse.json({ error: 'Device fingerprint is required' }, { status: 400 });
    }
    
    // Check if device is banned
    const deviceBanned = await isDeviceBanned(deviceFingerprint, prisma);
    if (deviceBanned) {
      return NextResponse.json({ 
        banned: true,
        message: 'This device is not eligible for access' 
      }, { status: 403 });
    }
    
    // Get current user fingerprints and consent
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        deviceFingerprints: true,
        dataCollectionConsent: true,
      },
    });
    
    // Only track if user has given consent
    if (!user?.dataCollectionConsent) {
      return NextResponse.json({ 
        success: true,
        banned: false,
        message: 'Device tracking disabled by user preference',
      });
    }
    
    const existingFingerprints = user?.deviceFingerprints || [];
    
    // Add fingerprint if not already tracked
    if (!existingFingerprints.includes(deviceFingerprint)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          deviceFingerprints: [...existingFingerprints, deviceFingerprint],
        },
      });
    }
    
    return NextResponse.json({ 
      success: true,
      banned: false,
    });
    
  } catch (error) {
    console.error('Error tracking device:', error);
    return NextResponse.json({ 
      error: 'Failed to track device' 
    }, { status: 500 });
  }
}
