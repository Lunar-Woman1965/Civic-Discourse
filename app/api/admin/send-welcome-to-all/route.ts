import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

/**
 * Temporary Admin Route: Send Welcome Emails to All Verified Users
 * Uses Resend template ID: bta-welcome
 * This route sends PRODUCTION emails (not test mode)
 */
export async function POST() {
  try {
    // Require admin authentication
    const adminResult = await requireAdmin();
    if (adminResult.error) {
      return adminResult.error;
    }
    const admin = adminResult.user;
    console.log(`[WELCOME EMAIL BATCH] Started by admin: ${admin.email}`);

    // Fetch all verified users
    const users = await prisma.user.findMany({
      where: {
        emailVerified: { not: null },
        isActive: true,
        isPermanentlyBanned: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`[WELCOME EMAIL BATCH] Found ${users.length} verified users`);

    // Track results
    const results = {
      total: users.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    const resend = getResendClient();

    // Send welcome email to each verified user using bta-welcome template
    for (const user of users) {
      try {
        console.log(`[WELCOME EMAIL] Sending to: ${user.email} (${user.name || 'No name'})`);

        const response = await resend.emails.send({
          from: 'welcome@bridgingtheaisle.com',
          to: user.email,
          subject: 'Welcome to Bridging the Aisle!',
          template: {
            id: 'bta-welcome',
          },
        } as any);

        console.log(`[WELCOME EMAIL] ✅ Sent to ${user.email} - Email ID: ${response.data?.id || 'Unknown'}`);
        results.successful++;
      } catch (error: any) {
        console.error(`[WELCOME EMAIL] ❌ Failed for ${user.email}:`, error.message || error);
        results.failed++;
        results.errors.push({
          email: user.email,
          error: error.message || 'Unknown error',
        });
      }

      // Add a small delay between sends to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[WELCOME EMAIL BATCH] Completed - Success: ${results.successful}, Failed: ${results.failed}`);

    return NextResponse.json({
      success: true,
      message: `Welcome emails sent to ${results.successful} of ${results.total} verified users`,
      results,
    });
  } catch (error: any) {
    console.error('[WELCOME EMAIL BATCH] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send welcome emails' },
      { status: error.status || 500 }
    );
  }
}