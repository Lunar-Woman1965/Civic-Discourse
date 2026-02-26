/**
 * Bluesky Public API Utility
 * 
 * This module provides unauthenticated read-only access to Bluesky via the public AppView host.
 * No authentication is required for these endpoints.
 * 
 * Reference: https://docs.bsky.app/docs/api/app-bsky-feed-get-author-feed
 */

import { AppBskyFeedDefs } from '@atproto/api';

const PUBLIC_API_HOST = 'https://public.api.bsky.app';

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Generic cache helper
 */
function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
}

/**
 * Author Feed Response Type
 */
export interface AuthorFeedResponse {
  feed: Array<{
    post: {
      uri: string; // AT-URI (at://did/app.bsky.feed.post/rkey)
      cid: string;
      author: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
      };
      record: {
        text: string;
        createdAt: string;
        [key: string]: any;
      };
      labels?: Array<{ val: string }>;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
  cursor?: string;
}

/**
 * Thread Response Type
 */
export interface ThreadResponse {
  thread: {
    post: {
      uri: string;
      cid: string;
      author: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
      };
      record: {
        text: string;
        createdAt: string;
        [key: string]: any;
      };
      labels?: Array<{ val: string }>;
      [key: string]: any;
    };
    parent?: any; // Parent posts in thread
    replies?: Array<any>; // Reply posts in thread
    [key: string]: any;
  };
}

/**
 * Fetch author feed (public, no auth required)
 * 
 * @param actor - Handle (e.g., 'user.bsky.social') or DID
 * @param options - Optional parameters
 * @returns Author feed data
 */
export async function getAuthorFeed(
  actor: string,
  options: {
    limit?: number;
    cursor?: string;
    cacheTTL?: number; // Cache time-to-live in seconds (default: 120)
  } = {}
): Promise<AuthorFeedResponse> {
  const { limit = 30, cursor, cacheTTL = 120 } = options;
  
  // Build cache key
  const cacheKey = `author-feed:${actor}:${limit}:${cursor || 'start'}`;
  
  // Check cache
  const cached = getCached<AuthorFeedResponse>(cacheKey);
  if (cached) {
    console.log(`[Bluesky Public API] Cache hit for author feed: ${actor}`);
    return cached;
  }
  
  // Build URL
  const url = new URL(`${PUBLIC_API_HOST}/xrpc/app.bsky.feed.getAuthorFeed`);
  url.searchParams.set('actor', actor);
  url.searchParams.set('limit', limit.toString());
  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }
  
  console.log(`[Bluesky Public API] Fetching author feed: ${actor}`);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data: AuthorFeedResponse = await response.json();
    
    // Cache the result
    setCache(cacheKey, data, cacheTTL);
    
    console.log(`[Bluesky Public API] Fetched ${data.feed.length} posts from ${actor}`);
    
    return data;
  } catch (error) {
    console.error(`[Bluesky Public API] Failed to fetch author feed for ${actor}:`, error);
    throw error;
  }
}

/**
 * Fetch post thread (public, no auth required)
 * 
 * @param uri - AT-URI of the post (e.g., 'at://did:plc:xxx/app.bsky.feed.post/yyy')
 * @param options - Optional parameters
 * @returns Thread data
 */
export async function getPostThread(
  uri: string,
  options: {
    depth?: number; // How deep to fetch replies (default: 2)
    parentHeight?: number; // How many parent posts to include (default: 1)
    cacheTTL?: number; // Cache time-to-live in seconds (default: 600 = 10 min)
  } = {}
): Promise<ThreadResponse> {
  const { depth = 2, parentHeight = 1, cacheTTL = 600 } = options;
  
  // Build cache key
  const cacheKey = `thread:${uri}:${depth}:${parentHeight}`;
  
  // Check cache
  const cached = getCached<ThreadResponse>(cacheKey);
  if (cached) {
    console.log(`[Bluesky Public API] Cache hit for thread: ${uri}`);
    return cached;
  }
  
  // Build URL
  const url = new URL(`${PUBLIC_API_HOST}/xrpc/app.bsky.feed.getPostThread`);
  url.searchParams.set('uri', uri);
  url.searchParams.set('depth', depth.toString());
  url.searchParams.set('parentHeight', parentHeight.toString());
  
  console.log(`[Bluesky Public API] Fetching thread: ${uri}`);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data: ThreadResponse = await response.json();
    
    // Cache the result
    setCache(cacheKey, data, cacheTTL);
    
    console.log(`[Bluesky Public API] Fetched thread for: ${uri}`);
    
    return data;
  } catch (error) {
    console.error(`[Bluesky Public API] Failed to fetch thread for ${uri}:`, error);
    throw error;
  }
}

/**
 * Generate a web URL for viewing a post on Bluesky
 * 
 * @param post - Post object with uri and author info
 * @returns Web URL (e.g., 'https://bsky.app/profile/user.bsky.social/post/abc123')
 */
export function generateBlueskyWebUrl(post: {
  uri: string; // AT-URI
  author: { handle?: string; did: string };
}): string {
  // Extract rkey from AT-URI
  // Format: at://{did}/app.bsky.feed.post/{rkey}
  const uriParts = post.uri.split('/');
  const rkey = uriParts[uriParts.length - 1];
  
  // Prefer handle, fallback to DID
  const identifier = post.author.handle || post.author.did;
  
  return `https://bsky.app/profile/${identifier}/post/${rkey}`;
}

/**
 * Extract rkey from AT-URI
 * 
 * @param uri - AT-URI (e.g., 'at://did:plc:xxx/app.bsky.feed.post/yyy')
 * @returns rkey (e.g., 'yyy')
 */
export function extractRkey(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1];
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
  console.log('[Bluesky Public API] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: Array<{ key: string; expiresIn: number }> } {
  const now = Date.now();
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    expiresIn: Math.max(0, entry.expiresAt - now)
  }));
  
  return {
    size: cache.size,
    entries
  };
}
