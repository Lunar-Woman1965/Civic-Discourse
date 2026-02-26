
/**
 * AT Protocol Identity Management Library
 * Phase 1: Foundation & Identity
 * 
 * Handles DID (Decentralized Identifier) validation, handle parsing,
 * and account verification for Bluesky/AT Protocol integration.
 */

import { BskyAgent } from '@atproto/api';

/**
 * Initialize AT Protocol agent for identity operations
 */
export function createAtprotoAgent(): BskyAgent {
  const agent = new BskyAgent({
    service: 'https://bsky.social',
  });
  return agent;
}

/**
 * Validate AT Protocol handle format
 * Valid formats:
 * - user.bsky.social
 * - subdomain.domain.tld
 * - custom-domain.com
 */
export function isValidAtprotoHandle(handle: string): boolean {
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

/**
 * Validate DID (Decentralized Identifier) format
 * Valid format: did:plc:xxxxxxxxxxxxxxxxxxxxxxxxxx
 */
export function isValidDid(did: string): boolean {
  if (!did || typeof did !== 'string') {
    return false;
  }

  // DID format: did:plc: followed by 24+ characters
  const didRegex = /^did:plc:[a-z2-7]{24,}$/;
  
  return didRegex.test(did);
}

/**
 * Normalize handle format (remove @ prefix, lowercase)
 */
export function normalizeHandle(handle: string): string {
  if (!handle) return '';
  
  const cleaned = handle.startsWith('@') ? handle.slice(1) : handle;
  return cleaned.toLowerCase().trim();
}

/**
 * Resolve handle to DID using AT Protocol
 * Verifies that the handle exists and returns the associated DID
 */
export async function resolveHandleToDid(handle: string): Promise<{
  success: boolean;
  did?: string;
  displayName?: string;
  error?: string;
}> {
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
    } catch (profileError) {
      // If profile fetch fails, still return the DID
      return {
        success: true,
        did: response.data.did,
        displayName: normalizedHandle,
      };
    }
  } catch (error: any) {
    console.error('Error resolving handle:', error);
    return {
      success: false,
      error: error?.message || 'Failed to resolve handle',
    };
  }
}

/**
 * Verify that a DID corresponds to the expected handle
 * Used to prevent account takeover attacks
 */
export async function verifyDidHandleMatch(
  did: string,
  expectedHandle: string
): Promise<boolean> {
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
  } catch (error) {
    console.error('Error verifying DID/handle match:', error);
    return false;
  }
}

/**
 * Format handle for display (add @ prefix)
 */
export function formatHandleForDisplay(handle: string): string {
  if (!handle) return '';
  const normalized = normalizeHandle(handle);
  return `@${normalized}`;
}

/**
 * Extract handle from various input formats
 * Handles URLs, @mentions, plain handles
 */
export function extractHandle(input: string): string | null {
  if (!input) return null;

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

/**
 * Check if user has AT Protocol identity linked
 */
export function hasAtprotoIdentity(user: {
  atprotoHandle?: string | null;
  atprotoDid?: string | null;
}): boolean {
  return !!(user.atprotoHandle && user.atprotoDid);
}

/**
 * Get AT Protocol profile URL for a handle
 */
export function getAtprotoProfileUrl(handle: string): string {
  const normalized = normalizeHandle(handle);
  return `https://bsky.app/profile/${normalized}`;
}
