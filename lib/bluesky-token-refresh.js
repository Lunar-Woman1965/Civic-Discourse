"use strict";
/**
 * Bluesky Token Auto-Refresh System
 *
 * This module provides automatic token refresh functionality to maintain
 * persistent Bluesky authentication without user intervention.
 *
 * Key Features:
 * - Automatic token refresh using refresh tokens (no app password needed)
 * - Refresh tokens valid for ~90 days vs access tokens (~2 hours)
 * - Graceful fallback to app password if refresh token expired
 * - Rate limit handling
 * - Logging for diagnostics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAllBlueskyTokens = exports.refreshBlueskyToken = exports.needsTokenRefresh = void 0;
const client_1 = require("@prisma/client");
const api_1 = require("@atproto/api");
const bluesky_token_encryption_1 = require("./bluesky-token-encryption");
const atproto_identity_1 = require("./atproto-identity");
const prisma = new client_1.PrismaClient();
// Refresh tokens 15 minutes before they expire
const REFRESH_BUFFER_MS = 15 * 60 * 1000;
/**
 * Check if a token needs refresh based on expiry time
 */
function needsTokenRefresh(tokenExpiry) {
    if (!tokenExpiry)
        return true;
    const now = new Date();
    const expiryTime = new Date(tokenExpiry);
    const timeUntilExpiry = expiryTime.getTime() - now.getTime();
    // Refresh if expired or within 15 minutes of expiry
    return timeUntilExpiry <= REFRESH_BUFFER_MS;
}
exports.needsTokenRefresh = needsTokenRefresh;
/**
 * Refresh Bluesky access token for a user
 *
 * Strategy:
 * 1. Try to use stored refresh token (preferred - works for all users)
 * 2. Fall back to app password if refresh token missing/expired
 * 3. For Platform Founder, can use env variable as final fallback
 *
 * @param userId - User ID to refresh token for
 * @param appPassword - Optional app password (only needed if refresh token expired)
 * @returns Success status and new token expiry
 */
async function refreshBlueskyToken(userId, appPassword) {
    try {
        // Fetch user data including encrypted tokens
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                atprotoHandle: true,
                atprotoDid: true,
                atprotoEmail: true,
                blueskyTokenExpiry: true,
                blueskyEncryptedToken: true,
                blueskyEncryptedRefreshToken: true,
                role: true,
            },
        });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const identifier = user.atprotoHandle || user.atprotoEmail || user.email;
        const agent = new api_1.BskyAgent({ service: 'https://bsky.social' });
        console.log(`[Token Refresh] Refreshing token for user ${userId} (${identifier})`);
        // STRATEGY 1: Try refresh token first (preferred for all users)
        if (user.blueskyEncryptedRefreshToken) {
            try {
                console.log(`[Token Refresh] Attempting refresh using refresh token...`);
                const decryptedRefreshToken = (0, bluesky_token_encryption_1.decryptToken)(user.blueskyEncryptedRefreshToken);
                // Resume session with existing tokens to trigger refresh
                const decryptedAccessToken = user.blueskyEncryptedToken
                    ? (0, bluesky_token_encryption_1.decryptToken)(user.blueskyEncryptedToken)
                    : '';
                await agent.resumeSession({
                    accessJwt: decryptedAccessToken,
                    refreshJwt: decryptedRefreshToken,
                    did: user.atprotoDid || '',
                    handle: user.atprotoHandle || '',
                    active: true,
                });
                // Get the refreshed session data
                const session = agent.session;
                if (!session) {
                    throw new Error('No session after refresh');
                }
                // Encrypt both new tokens
                const encryptedAccessToken = (0, bluesky_token_encryption_1.encryptToken)(session.accessJwt);
                const encryptedRefreshToken = (0, bluesky_token_encryption_1.encryptToken)(session.refreshJwt);
                // Calculate new expiry (2 hours from now)
                const tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
                // Update user record with new tokens
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        blueskyEncryptedToken: encryptedAccessToken,
                        blueskyEncryptedRefreshToken: encryptedRefreshToken,
                        blueskyTokenExpiry: tokenExpiry,
                        blueskyConnectedAt: new Date(),
                    },
                });
                console.log(`[Token Refresh] ✅ Successfully refreshed via refresh token for ${identifier}`);
                console.log(`[Token Refresh] New expiry: ${tokenExpiry.toISOString()}`);
                return {
                    success: true,
                    tokenExpiry,
                    handle: user.atprotoHandle || undefined,
                    method: 'refresh_token',
                };
            }
            catch (refreshError) {
                console.log(`[Token Refresh] ⚠️  Refresh token failed:`, refreshError.message);
                console.log(`[Token Refresh] Falling back to app password method...`);
                // Continue to app password method below
            }
        }
        // STRATEGY 2: Use app password (fallback or for initial connection)
        let password = appPassword;
        // For Platform Founder, try env variable as final fallback
        if (!password && user.role === 'PLATFORM_FOUNDER' && process.env.BLUESKY_APP_PASSWORD) {
            password = process.env.BLUESKY_APP_PASSWORD;
            console.log(`[Token Refresh] Using Platform Founder env password as fallback`);
        }
        if (!password) {
            return {
                success: false,
                error: 'Refresh token expired and no app password available. Please reconnect your Bluesky account.',
            };
        }
        // Validate app password format
        if (!/^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/i.test(password)) {
            return {
                success: false,
                error: 'Invalid app password format',
            };
        }
        try {
            console.log(`[Token Refresh] Authenticating with app password...`);
            const loginResponse = await agent.login({
                identifier,
                password,
            });
            // Encrypt BOTH access and refresh tokens
            const encryptedAccessToken = (0, bluesky_token_encryption_1.encryptToken)(loginResponse.data.accessJwt);
            const encryptedRefreshToken = (0, bluesky_token_encryption_1.encryptToken)(loginResponse.data.refreshJwt);
            // Calculate new expiry (2 hours from now)
            const tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
            // Resolve DID and handle if needed
            let handle = user.atprotoHandle;
            let did = user.atprotoDid;
            if (!handle || !did) {
                const normalized = (0, atproto_identity_1.normalizeHandle)(identifier);
                const resolved = await (0, atproto_identity_1.resolveHandleToDid)(normalized);
                if (resolved.success && resolved.did) {
                    handle = normalized;
                    did = resolved.did;
                }
            }
            // Update user record with new tokens
            await prisma.user.update({
                where: { id: userId },
                data: {
                    blueskyEncryptedToken: encryptedAccessToken,
                    blueskyEncryptedRefreshToken: encryptedRefreshToken,
                    blueskyTokenExpiry: tokenExpiry,
                    blueskyConnectedAt: new Date(),
                    atprotoHandle: handle || null,
                    atprotoDid: did || null,
                },
            });
            console.log(`[Token Refresh] ✅ Successfully refreshed via app password for ${identifier}`);
            console.log(`[Token Refresh] New expiry: ${tokenExpiry.toISOString()}`);
            return {
                success: true,
                tokenExpiry,
                handle: handle || undefined,
                method: 'app_password',
            };
        }
        catch (authError) {
            // Handle specific authentication errors
            const errorMessage = authError.message || String(authError);
            if (errorMessage.includes('Invalid identifier or password')) {
                return {
                    success: false,
                    error: 'Invalid Bluesky credentials - app password may have been revoked',
                };
            }
            if (errorMessage.includes('rate limit') || authError.status === 429) {
                console.log('[Token Refresh] ⏳ Rate limited - will retry next cycle');
                return {
                    success: false,
                    error: 'Rate limited - will retry later',
                };
            }
            if (authError.status === 401) {
                return {
                    success: false,
                    error: 'Authentication failed - credentials may be invalid',
                };
            }
            throw authError; // Re-throw unexpected errors
        }
    }
    catch (error) {
        console.error('[Token Refresh] ❌ Error:', error);
        return {
            success: false,
            error: error.message || 'Unknown error during token refresh',
        };
    }
}
exports.refreshBlueskyToken = refreshBlueskyToken;
/**
 * Refresh tokens for all users with connected Bluesky accounts
 * (Platform Founder only by default)
 *
 * @param onlyPlatformFounder - Only refresh platform founder's token
 * @returns Summary of refresh operations
 */
async function refreshAllBlueskyTokens(onlyPlatformFounder = true) {
    const summary = {
        total: 0,
        refreshed: 0,
        skipped: 0,
        failed: 0,
        errors: [],
    };
    try {
        // Find users with Bluesky connections
        const whereClause = onlyPlatformFounder
            ? { role: 'PLATFORM_FOUNDER', blueskyEncryptedToken: { not: null } }
            : { blueskyEncryptedToken: { not: null } };
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                email: true,
                atprotoHandle: true,
                blueskyTokenExpiry: true,
            },
        });
        summary.total = users.length;
        for (const user of users) {
            const needsRefresh = needsTokenRefresh(user.blueskyTokenExpiry);
            if (!needsRefresh) {
                console.log(`[Token Refresh] ⏭️  Skipping ${user.atprotoHandle || user.email} - token still valid`);
                summary.skipped++;
                continue;
            }
            console.log(`[Token Refresh] 🔄 Refreshing token for ${user.atprotoHandle || user.email}`);
            const result = await refreshBlueskyToken(user.id);
            if (result.success) {
                summary.refreshed++;
            }
            else {
                summary.failed++;
                summary.errors.push(`${user.email}: ${result.error}`);
            }
        }
        console.log('[Token Refresh] Summary:', summary);
        return summary;
    }
    catch (error) {
        console.error('[Token Refresh] Failed to refresh tokens:', error);
        summary.errors.push(error.message);
        return summary;
    }
}
exports.refreshAllBlueskyTokens = refreshAllBlueskyTokens;
