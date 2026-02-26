
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { phone, code, deviceFingerprint } = await req.json();
    
    if (!phone || !code) {
      return NextResponse.json({ 
        error: 'Phone number and verification code are required' 
      }, { status: 400 });
    }
    
    // Normalize phone number
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Find verification record
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phone: normalizedPhone,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (!verification) {
      return NextResponse.json({ 
        error: 'No verification request found for this phone number' 
      }, { status: 404 });
    }
    
    // Check if code has expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.json({ 
        error: 'Verification code has expired. Please request a new one.' 
      }, { status: 400 });
    }
    
    // Check if too many attempts
    if (verification.attempts >= 5) {
      return NextResponse.json({ 
        error: 'Too many failed attempts. Please request a new code.' 
      }, { status: 400 });
    }
    
    // Verify code
    if (verification.code !== code) {
      // Increment attempts
      await prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { attempts: verification.attempts + 1 },
      });
      
      return NextResponse.json({ 
        error: 'Invalid verification code' 
      }, { status: 400 });
    }
    
    // Mark verification as complete
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });
    
    // Update user with phone number and device fingerprint
    const updateData: any = {
      phone: normalizedPhone,
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
    };
    
    // Add device fingerprint if provided
    if (deviceFingerprint) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { deviceFingerprints: true },
      });
      
      const existingFingerprints = user?.deviceFingerprints || [];
      if (!existingFingerprints.includes(deviceFingerprint)) {
        updateData.deviceFingerprints = [...existingFingerprints, deviceFingerprint];
      }
    }
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Phone number verified successfully' 
    });
    
  } catch (error) {
    console.error('Error verifying phone:', error);
    return NextResponse.json({ 
      error: 'Failed to verify phone number' 
    }, { status: 500 });
  }
}
