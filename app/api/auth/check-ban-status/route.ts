
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDeviceBanned, isPhoneBanned } from '@/lib/device-fingerprint';

export async function POST(req: NextRequest) {
  try {
    const { phone, deviceFingerprint } = await req.json();
    
    const banned: any = {
      phone: false,
      device: false,
      message: '',
    };
    
    // Check phone if provided
    if (phone) {
      const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
      banned.phone = await isPhoneBanned(normalizedPhone, prisma);
    }
    
    // Check device fingerprint if provided
    if (deviceFingerprint) {
      banned.device = await isDeviceBanned(deviceFingerprint, prisma);
    }
    
    // If either is banned, return error
    if (banned.phone || banned.device) {
      banned.message = 'This device or phone number is not eligible for registration';
      return NextResponse.json(banned, { status: 403 });
    }
    
    return NextResponse.json({ 
      banned: false,
      message: 'No ban detected' 
    });
    
  } catch (error) {
    console.error('Error checking ban status:', error);
    return NextResponse.json({ 
      error: 'Failed to check ban status' 
    }, { status: 500 });
  }
}
