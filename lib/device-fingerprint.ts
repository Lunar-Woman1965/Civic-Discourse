
let fpPromise: Promise<any> | null = null;

// Initialize FingerprintJS (client-side only)
export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Device fingerprinting can only be used on the client side');
  }
  
  if (!fpPromise) {
    // Dynamic import to avoid server-side bundling issues
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
    fpPromise = FingerprintJS.default.load();
  }
  
  const fp = await fpPromise;
  const result = await fp.get();
  
  return result.visitorId;
}

// Server-side function to check if device is banned
export async function isDeviceBanned(fingerprint: string, prisma: any): Promise<boolean> {
  try {
    const banned = await prisma.bannedIdentifier.findUnique({
      where: {
        type_value: {
          type: 'device_fingerprint',
          value: fingerprint,
        },
      },
    });
    
    return !!banned;
  } catch (error) {
    console.error('Error checking device ban status:', error);
    return false;
  }
}

// Server-side function to check if phone is banned
export async function isPhoneBanned(phone: string, prisma: any): Promise<boolean> {
  try {
    const banned = await prisma.bannedIdentifier.findUnique({
      where: {
        type_value: {
          type: 'phone',
          value: phone,
        },
      },
    });
    
    return !!banned;
  } catch (error) {
    console.error('Error checking phone ban status:', error);
    return false;
  }
}
