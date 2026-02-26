
/**
 * AT Protocol Domain Verification Endpoint
 * 
 * This endpoint is required by the AT Protocol (Bluesky) for domain verification.
 * It returns the DID (Decentralized Identifier) associated with the domain owner.
 * 
 * Spec: https://atproto.com/specs/handle#dns-txt-method
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Find the primary user account that owns this domain
    // In this case, we'll return the DID of the platform founder
    const user = await prisma.user.findFirst({
      where: {
        atprotoDid: {
          not: null,
        },
        role: 'PLATFORM_FOUNDER',
      },
      select: {
        atprotoDid: true,
        atprotoHandle: true,
        email: true,
      },
    });

    if (!user || !user.atprotoDid) {
      // If no platform founder with DID, try to find any user with linked account
      const anyUser = await prisma.user.findFirst({
        where: {
          atprotoDid: {
            not: null,
          },
        },
        select: {
          atprotoDid: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (!anyUser || !anyUser.atprotoDid) {
        return new NextResponse('No DID configured for this domain', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }

      return new NextResponse(anyUser.atprotoDid, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    console.log(`Serving DID for domain verification: ${user.atprotoDid} (${user.email})`);

    // Return the DID in plain text format as required by AT Protocol
    return new NextResponse(user.atprotoDid, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving atproto-did:', error);
    return new NextResponse('Internal server error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
