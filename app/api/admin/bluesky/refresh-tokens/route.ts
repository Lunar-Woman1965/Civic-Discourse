/**
 * Admin API: Force Bluesky Token Refresh
 * 
 * Allows administrators to manually trigger token refresh for all users
 * or specific users with Bluesky connections.
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { refreshAllBlueskyTokens, refreshBlueskyToken } from '@/lib/bluesky-token-refresh';

/**
 * POST /api/admin/bluesky/refresh-tokens
 * 
 * Manually trigger token refresh
 * Optional body: { userId?: string, allUsers?: boolean }
 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    
    const body = await request.json().catch(() => ({}));
    const { userId, allUsers = false } = body;

    if (userId) {
      // Refresh specific user's token
      const result = await refreshBlueskyToken(userId);
      
      return NextResponse.json({
        success: result.success,
        message: result.success
          ? `Token refreshed successfully for user ${userId} (method: ${result.method})`
          : `Failed to refresh token: ${result.error}`,
        tokenExpiry: result.tokenExpiry,
        handle: result.handle,
        method: result.method,
      });
    } else {
      // Refresh tokens for all users or just Platform Founder
      const onlyPlatformFounder = !allUsers;
      const summary = await refreshAllBlueskyTokens(onlyPlatformFounder);
      
      const scope = allUsers ? 'all users' : 'Platform Founder';
      
      return NextResponse.json({
        success: summary.failed === 0,
        message: `Refreshed ${summary.refreshed} token(s) for ${scope}, skipped ${summary.skipped}, failed ${summary.failed}`,
        summary,
        scope,
      });
    }
  } catch (error: any) {
    console.error('[Admin] Token refresh error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh tokens' },
      { status: 500 }
    );
  }
}
