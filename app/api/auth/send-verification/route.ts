
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateVerificationCode, sendVerificationCode } from '@/lib/twilio';
import { isPhoneBanned } from '@/lib/device-fingerprint';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { phone } = await req.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if phone number format is valid (basic check)
    if (!/^\+?[1-9]\d{1,14}$/.test(normalizedPhone)) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Please include country code (e.g., +1 for US)' 
      }, { status: 400 });
    }
    
    // Check if phone is banned
    const phoneBanned = await isPhoneBanned(normalizedPhone, prisma);
    if (phoneBanned) {
      return NextResponse.json({ 
        error: 'This phone number is not eligible for registration' 
      }, { status: 403 });
    }
    
    // Check if phone is already in use by another user
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });
    
    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({ 
        error: 'This phone number is already in use' 
      }, { status: 400 });
    }
    
    // Delete any existing verification codes for this phone
    await prisma.phoneVerification.deleteMany({
      where: { phone: normalizedPhone },
    });
    
    // Generate verification code
    const code = generateVerificationCode();
    
    // Save verification code to database
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.phoneVerification.create({
      data: {
        phone: normalizedPhone,
        code,
        expiresAt,
      },
    });
    
    // Send SMS
    const sent = await sendVerificationCode(normalizedPhone, code);
    
    if (!sent) {
      return NextResponse.json({ 
        error: 'Failed to send verification code. Please try again.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Verification code sent successfully' 
    });
    
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json({ 
      error: 'Failed to send verification code' 
    }, { status: 500 });
  }
}
