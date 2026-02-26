"use strict";
/**
 * AT Protocol Identity Management Library
 * Phase 1: Foundation & Identity
 *
 * Handles DID (Decentralized Identifier) validation, handle parsing,
 * and account verification for Bluesky/AT Protocol integration.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtprotoProfileUrl = exports.hasAtprotoIdentity = exports.extractHandle = exports.formatHandleForDisplay = exports.verifyDidHandleMatch = exports.resolveHandleToDid = exports.normalizeHandle = exports.isValidDid = exports.isValidAtprotoHandle = exports.createAtprotoAgent = void 0;
const api_1 = require("@atproto/api");
/**
 * Initialize AT Protocol agent for identity operations
 */
function createAtprotoAgent() {
    const agent = new api_1.BskyAgent({
        service: 'https://bsky.social',
    });
    return agent;
}
exports.createAtprotoAgent = createAtprotoAgent;
/**
 * Validate AT Protocol handle format
 * Valid formats:
 * - user.bsky.social
 * - subdomain.domain.tld
 * - custom-domain.com
 */
function isValidAtprotoHandle(handle) {
    if (!handle || typeof handle !== 'string') {
        return false;
    }
    // Remove @ prefix if present
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    // Must contain at least one dot
    if (!cleanHandle.includes('.')) {
        return false;
    }
    // Basic format validation
    const handleRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return handleRegex.test(cleanHandle);
}
exports.isValidAtprotoHandle = isValidAtprotoHandle;
/**
 * Validate DID (Decentralized Identifier) format
 * Valid format: did:plc:xxxxxxxxxxxxxxxxxxxxxxxxxx
 */
function isValidDid(did) {
    if (!did || typeof did !== 'string') {
        return false;
    }
    // DID format: did:plc: followed by 24+ characters
    const didRegex = /^did:plc:[a-z2-7]{24,}$/;
    return didRegex.test(did);
}
exports.isValidDid = isValidDid;
/**
 * Normalize handle format (remove @ prefix, lowercase)
 */
function normalizeHandle(handle) {
    if (!handle)
        return '';
    const cleaned = handle.startsWith('@') ? handle.slice(1) : handle;
    return cleaned.toLowerCase().trim();
}
exports.normalizeHandle = normalizeHandle;
/**
 * Resolve handle to DID using AT Protocol
 * Verifies that the handle exists and returns the associated DID
 */
async function resolveHandleToDid(handle) {
    try {
        const normalizedHandle = normalizeHandle(handle);
        if (!isValidAtprotoHandle(normalizedHandle)) {
            return {
                success: false,
                error: 'Invalid handle format',
            };
        }
        const agent = createAtprotoAgent();
        // Resolve the handle to get profile info
        const response = await agent.resolveHandle({ handle: normalizedHandle });
        if (!response.success || !response.data?.did) {
            return {
                success: false,
                error: 'Handle not found on AT Protocol network',
            };
        }
        // Get profile information
        try {
            const profileResponse = await agent.getProfile({ actor: response.data.did });
            return {
                success: true,
                did: response.data.did,
                displayName: profileResponse.data?.displayName || normalizedHandle,
            };
        }
        catch (profileError) {
            // If profile fetch fails, still return the DID
            return {
                success: true,
                did: response.data.did,
                displayName: normalizedHandle,
            };
        }
    }
    catch (error) {
        console.error('Error resolving handle:', error);
        return {
            success: false,
            error: error?.message || 'Failed to resolve handle',
        };
    }
}
exports.resolveHandleToDid = resolveHandleToDid;
/**
 * Verify that a DID corresponds to the expected handle
 * Used to prevent account takeover attacks
 */
async function verifyDidHandleMatch(did, expectedHandle) {
    try {
        if (!isValidDid(did)) {
            return false;
        }
        const normalizedHandle = normalizeHandle(expectedHandle);
        const agent = createAtprotoAgent();
        // Get profile by DID and check if handle matches
        const profile = await agent.getProfile({ actor: did });
        if (!profile.success || !profile.data?.handle) {
            return false;
        }
        const actualHandle = normalizeHandle(profile.data.handle);
        return actualHandle === normalizedHandle;
    }
    catch (error) {
        console.error('Error verifying DID/handle match:', error);
        return false;
    }
}
exports.verifyDidHandleMatch = verifyDidHandleMatch;
/**
 * Format handle for display (add @ prefix)
 */
function formatHandleForDisplay(handle) {
    if (!handle)
        return '';
    const normalized = normalizeHandle(handle);
    return `@${normalized}`;
}
exports.formatHandleForDisplay = formatHandleForDisplay;
/**
 * Extract handle from various input formats
 * Handles URLs, @mentions, plain handles
 */
function extractHandle(input) {
    if (!input)
        return null;
    // Remove whitespace
    const cleaned = input.trim();
    // If it's a Bluesky URL, extract handle
    const urlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?bsky\.app\/profile\/([^\/\s]+)/);
    if (urlMatch && urlMatch[1]) {
        return normalizeHandle(urlMatch[1]);
    }
    // If it starts with @, remove it
    if (cleaned.startsWith('@')) {
        return normalizeHandle(cleaned.slice(1));
    }
    // Otherwise, normalize as-is
    return normalizeHandle(cleaned);
}
exports.extractHandle = extractHandle;
/**
 * Check if user has AT Protocol identity linked
 */
function hasAtprotoIdentity(user) {
    return !!(user.atprotoHandle && user.atprotoDid);
}
exports.hasAtprotoIdentity = hasAtprotoIdentity;
/**
 * Get AT Protocol profile URL for a handle
 */
function getAtprotoProfileUrl(handle) {
    const normalized = normalizeHandle(handle);
    return `https://bsky.app/profile/${normalized}`;
}
exports.getAtprotoProfileUrl = getAtprotoProfileUrl;
