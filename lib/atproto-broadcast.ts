
/**
 * AT Protocol Broadcasting & Sync Utilities
 * Centralized Broadcasting: All posts broadcast through platform account
 * 
 * Handles posting BtA content to Bluesky via centralized platform broadcaster
 * Updated: 2026-01-02 - Centralized broadcasting with author attribution
 */

import { BskyAgent, RichText } from '@atproto/api';
import { prisma } from '@/lib/db';
import { decryptToken } from '@/lib/bluesky-token-encryption';

// Session cache to avoid re-authenticating on every broadcast
// Maps identifier (email/handle) to cached agent and expiry
const agentCache = new Map<string, { agent: BskyAgent; expiry: number }>();
const SESSION_LIFETIME = 60 * 60 * 1000; // 1 hour in milliseconds

// Platform broadcaster account identifier
const PLATFORM_BROADCASTER_EMAIL = 'bta-social.sharing@bridgingtheaisle.com';

/**
 * Get authenticated agent for the platform broadcaster account
 * This centralized account handles all Bluesky posts for the platform
 */
export async function getPlatformBroadcasterAgent(): Promise<{
  agent: BskyAgent;
  handle: string;
  error?: string;
}> {
  try {
    // Fetch the platform broadcaster account
    const broadcasterAccount = await prisma.user.findUnique({
      where: { email: PLATFORM_BROADCASTER_EMAIL },
      select: {
        id: true,
        email: true,
        atprotoHandle: true,
        atprotoDid: true,
        atprotoEmail: true,
        blueskyEncryptedToken: true,
        blueskyTokenExpiry: true,
        atprotoBroadcastEnabled: true,
      },
    });

    if (!broadcasterAccount) {
      return {
        agent: new BskyAgent({ service: 'https://bsky.social' }),
        handle: '',
        error: 'Platform broadcaster account not found. Please contact support.',
      };
    }

    if (!broadcasterAccount.atprotoBroadcastEnabled || !broadcasterAccount.blueskyEncryptedToken) {
      return {
        agent: new BskyAgent({ service: 'https://bsky.social' }),
        handle: broadcasterAccount.atprotoHandle || '',
        error: 'Platform broadcaster account not connected to Bluesky. Please contact administrator.',
      };
    }

    // Check if we have a cached session
    const cacheKey = broadcasterAccount.email;
    const cached = agentCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      console.log(`✓ Using cached Bluesky session for platform broadcaster`);
      return {
        agent: cached.agent,
        handle: broadcasterAccount.atprotoHandle || '',
      };
    }

    // Decrypt the stored access token
    const accessToken = decryptToken(broadcasterAccount.blueskyEncryptedToken);

    // Create agent with stored token
    const agent = new BskyAgent({ service: 'https://bsky.social' });

    // Resume session with stored token
    await agent.resumeSession({
      accessJwt: accessToken,
      refreshJwt: '', // Not using refresh token
      did: broadcasterAccount.atprotoDid || '',
      handle: broadcasterAccount.atprotoHandle || '',
      active: true,
    });

    // Cache the agent
    agentCache.set(cacheKey, {
      agent,
      expiry: Date.now() + SESSION_LIFETIME,
    });

    console.log(`✓ Authenticated platform broadcaster @${broadcasterAccount.atprotoHandle}`);

    return {
      agent,
      handle: broadcasterAccount.atprotoHandle || '',
    };
  } catch (error: any) {
    console.error('[Platform Broadcaster] Authentication failed:', error);
    return {
      agent: new BskyAgent({ service: 'https://bsky.social' }),
      handle: '',
      error: error?.message || 'Failed to authenticate platform broadcaster',
    };
  }
}

/**
 * Get or create an authenticated Bluesky agent with session caching and retry logic
 * This reduces authentication calls and improves reliability
 */
export async function getOrCreateAuthenticatedAgent(
  identifier: string,
  appPassword: string
): Promise<BskyAgent> {
  // Check if we have a valid cached session for this identifier
  const cached = agentCache.get(identifier);
  if (cached && Date.now() < cached.expiry) {
    console.log(`✓ Using cached Bluesky session for ${identifier}`);
    return cached.agent;
  }

  // Create new agent and authenticate with retry logic
  const agent = new BskyAgent({
    service: 'https://bsky.social',
  });

  let lastError: any;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await agent.login({
        identifier,
        password: appPassword,
      });

      // Success! Cache the agent and set expiry
      agentCache.set(identifier, {
        agent,
        expiry: Date.now() + SESSION_LIFETIME,
      });

      console.log(`✓ Authenticated with Bluesky as ${identifier} (attempt ${attempt}/3)`);
      return agent;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || '';
      
      console.error(`Authentication attempt ${attempt}/3 failed:`, errorMessage);

      // Don't retry on certain errors
      if (
        errorMessage.includes('Invalid identifier or password') ||
        errorMessage.includes('Account requires email confirmation')
      ) {
        break; // No point retrying with wrong credentials
      }

      // Wait before retrying (exponential backoff)
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // All attempts failed - provide helpful error message
  const errorMessage = lastError?.message || '';
  
  if (errorMessage.includes('Invalid identifier or password')) {
    throw new Error(
      'Invalid Bluesky app password. Please check:\n' +
      '1. Generate a NEW app password in Bluesky Settings > Privacy & Security > App Passwords\n' +
      '2. Copy it immediately (it\'s only shown once)\n' +
      '3. Use the app password, NOT your main account password\n' +
      `4. Confirm your identifier is: ${identifier}`
    );
  } else if (errorMessage.includes('Account requires email confirmation')) {
    throw new Error('Your Bluesky account needs email verification first');
  } else if (errorMessage.includes('rate limit')) {
    throw new Error('Too many login attempts. Please wait a few minutes');
  } else {
    throw new Error(`Bluesky authentication failed after 3 attempts: ${errorMessage}`);
  }
}

/**
 * Create authenticated Bluesky agent for a user
 * @deprecated Use getOrCreateAuthenticatedAgent instead for better reliability
 * Requires user to have valid AT Protocol credentials
 */
export async function createAuthenticatedAgent(
  handle: string,
  appPassword: string
): Promise<BskyAgent> {
  // Redirect to the cached version
  return getOrCreateAuthenticatedAgent(handle, appPassword);
}

/**
 * Broadcast a BtA post to Bluesky
 * Automatically truncates content while preserving ALL URLs intact
 * Returns the URI and CID of the created Bluesky post
 */
export async function broadcastPostToBluesky(params: {
  agent: BskyAgent;
  content: string;
  btaPostUrl: string;
  authorName?: string;
  authorUsername?: string;
}): Promise<{
  success: boolean;
  uri?: string;
  cid?: string;
  error?: string;
  wasTruncated?: boolean;
}> {
  try {
    const { agent, content, btaPostUrl, authorName, authorUsername } = params;

    // Create author attribution
    const authorAttribution = authorName 
      ? `Posted by ${authorName}${authorUsername ? ` (@${authorUsername})` : ''}`
      : 'Posted by BTA user';

    // Calculate available space for content
    // Format: "[content]\n\n[author]\n🌉 via Bridging the Aisle\n[url]"
    const footer = `\n\n${authorAttribution}\n🌉 via Bridging the Aisle\n${btaPostUrl}`;
    const maxContentLength = 300 - footer.length;

    // Format and truncate content to fit within available space
    let formattedContent = content.trim();
    if (formattedContent.length > maxContentLength) {
      formattedContent = formattedContent.substring(0, maxContentLength - 3) + '...';
    }
    
    // Prepare the complete post text with author attribution
    const postText = `${formattedContent}${footer}`;

    // Double-check length (should never exceed now)
    if (postText.length > 300) {
      console.error(`[Bluesky Broadcast] Content still exceeds limit after formatting: ${postText.length} chars`);
      return {
        success: false,
        error: `Internal error: Content exceeds 300 characters even after truncation (${postText.length} chars). Please contact support.`,
      };
    }

    // Create rich text with proper facets (detects URLs and mentions)
    const rt = new RichText({ text: postText });
    await rt.detectFacets(agent);

    // Create the post
    const response = await agent.post({
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    });

    if (!response || !response.uri || !response.cid) {
      return {
        success: false,
        error: 'Failed to create Bluesky post - no URI/CID returned',
      };
    }

    console.log(`✓ Successfully broadcast post with author attribution: ${authorName || 'Unknown'}`);

    return {
      success: true,
      uri: response.uri,
      cid: response.cid,
      wasTruncated: formattedContent.length < content.length,
    };
  } catch (error: any) {
    console.error('Error broadcasting to Bluesky:', error);
    
    // Handle specific Bluesky API errors
    if (error?.message?.includes('must not be longer than 300 graphemes')) {
      return {
        success: false,
        error: 'Post exceeds Bluesky\'s 300 character limit. This should not happen - please contact support.',
      };
    }
    
    return {
      success: false,
      error: error?.message || 'Failed to broadcast to Bluesky',
    };
  }
}

/**
 * Fetch replies to a Bluesky post
 * Returns array of reply objects
 */
export async function fetchBlueskyReplies(params: {
  agent: BskyAgent;
  postUri: string;
}): Promise<{
  success: boolean;
  replies?: Array<{
    uri: string;
    cid: string;
    text: string;
    authorHandle: string;
    authorDisplayName: string;
    createdAt: string;
  }>;
  error?: string;
}> {
  try {
    const { agent, postUri } = params;

    // Get the post thread to fetch replies
    const response = await agent.getPostThread({
      uri: postUri,
      depth: 1, // Only immediate replies
    });

    if (!response.success || !response.data.thread) {
      return {
        success: false,
        error: 'Failed to fetch thread',
      };
    }

    const thread: any = response.data.thread;

    // Extract replies from thread
    const replies: Array<{
      uri: string;
      cid: string;
      text: string;
      authorHandle: string;
      authorDisplayName: string;
      createdAt: string;
    }> = [];

    if (thread && thread.replies && Array.isArray(thread.replies)) {
      for (const reply of thread.replies) {
        if (reply && reply.post) {
          replies.push({
            uri: reply.post.uri,
            cid: reply.post.cid,
            text: reply.post.record?.text || '',
            authorHandle: reply.post.author.handle,
            authorDisplayName: reply.post.author.displayName || reply.post.author.handle,
            createdAt: reply.post.record?.createdAt || new Date().toISOString(),
          });
        }
      }
    }

    return {
      success: true,
      replies,
    };
  } catch (error: any) {
    console.error('Error fetching Bluesky replies:', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch replies',
    };
  }
}

/**
 * Format BtA post content for Bluesky with intelligent URL preservation
 * NEVER truncates URLs - only truncates text portions to fit within limit
 * @param content - The post content to format
 * @param btaPostUrl - The URL to be included in attribution
 * @param maxLength - Maximum total length including attribution (default 300)
 * @returns Formatted content that won't exceed maxLength when attribution is added
 */
export function formatContentForBluesky(
  content: string,
  btaPostUrl?: string,
  maxLength: number = 300
): string {
  // Remove HTML tags if any
  let cleanContent = content.replace(/<[^>]*>/g, '').trim();

  // Calculate attribution length
  // Format: "\n\n🌉 Posted via Bridging the Aisle\n{URL}"
  const attributionText = btaPostUrl 
    ? `\n\n🌉 Posted via Bridging the Aisle\n${btaPostUrl}`
    : '\n\n🌉 Posted via Bridging the Aisle';
  const attributionLength = attributionText.length;

  // Calculate max content length (leave room for attribution)
  const maxContentLength = maxLength - attributionLength;

  // If content fits, return as-is
  if (cleanContent.length <= maxContentLength) {
    return cleanContent;
  }

  // Content is too long - need to truncate intelligently
  // Improved URL regex to capture full URLs including query params, fragments, etc.
  const urlRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi;
  const urls = cleanContent.match(urlRegex) || [];
  
  // Remove duplicate URLs
  const uniqueUrls = Array.from(new Set(urls));
  
  if (uniqueUrls.length === 0) {
    // No URLs - simple truncation with word boundary preservation
    if (maxContentLength <= 3) {
      return '...';
    }
    const truncated = cleanContent.substring(0, maxContentLength - 3);
    // Try to end at a word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxContentLength * 0.7) {
      return truncated.substring(0, lastSpace).trim() + '...';
    }
    return truncated.trim() + '...';
  }

  // Calculate total URL length (with spaces between them)
  const totalUrlLength = uniqueUrls.reduce((sum, url) => sum + url.length, 0);
  const urlSpaces = Math.max(0, uniqueUrls.length - 1); // Spaces between URLs
  
  // Calculate space available for text
  const ellipsisLength = 3;
  const minTextBuffer = 5; // Minimum text to keep if possible
  const spaceForText = maxContentLength - totalUrlLength - urlSpaces - ellipsisLength;

  // Edge case: URLs alone exceed limit
  if (spaceForText < minTextBuffer) {
    // Keep only URLs, no text
    // If even URLs don't fit, keep as many as possible
    let result = '';
    for (const url of uniqueUrls) {
      if ((result + url).length <= maxContentLength) {
        result += (result ? ' ' : '') + url;
      } else {
        break;
      }
    }
    return result || uniqueUrls[0].substring(0, maxContentLength); // Fallback to first URL truncated
  }

  // Extract text segments between/around URLs
  const parts: Array<{ type: 'text' | 'url'; content: string; originalIndex: number }> = [];
  let searchIndex = 0;
  
  // Find all URLs and text segments
  for (const url of uniqueUrls) {
    const urlIndex = cleanContent.indexOf(url, searchIndex);
    if (urlIndex === -1) continue;
    
    // Add text before URL (if any)
    if (urlIndex > searchIndex) {
      const textBefore = cleanContent.substring(searchIndex, urlIndex).trim();
      if (textBefore) {
        parts.push({
          type: 'text',
          content: textBefore,
          originalIndex: searchIndex
        });
      }
    }
    
    // Add URL
    parts.push({
      type: 'url',
      content: url,
      originalIndex: urlIndex
    });
    
    searchIndex = urlIndex + url.length;
  }
  
  // Add remaining text after last URL
  if (searchIndex < cleanContent.length) {
    const textAfter = cleanContent.substring(searchIndex).trim();
    if (textAfter) {
      parts.push({
        type: 'text',
        content: textAfter,
        originalIndex: searchIndex
      });
    }
  }

  // Collect text segments for truncation
  const textParts = parts.filter(p => p.type === 'text');
  const totalTextLength = textParts.reduce((sum, p) => sum + p.content.length, 0);

  // Truncate text if needed
  if (totalTextLength > spaceForText) {
    // Strategy: Prioritize beginning of post, truncate end
    let remainingSpace = spaceForText;
    
    for (const part of textParts) {
      if (remainingSpace <= 0) {
        part.content = '';
        continue;
      }
      
      if (part.content.length <= remainingSpace) {
        remainingSpace -= part.content.length;
      } else {
        // Truncate this segment
        const truncated = part.content.substring(0, remainingSpace);
        // Try to end at word boundary
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > truncated.length * 0.7) {
          part.content = truncated.substring(0, lastSpace).trim();
        } else {
          part.content = truncated.trim();
        }
        remainingSpace = 0;
      }
    }
  }

  // Reassemble content maintaining order
  const resultParts = parts
    .filter(p => p.content.length > 0)
    .map(p => p.content);

  let result = resultParts.join(' ').trim();

  // Add ellipsis if we truncated
  if (result.length < cleanContent.length && !result.endsWith('...')) {
    // Find position for ellipsis (before first URL if text was truncated before it)
    const firstUrlInResult = uniqueUrls.find(url => result.includes(url));
    if (firstUrlInResult) {
      const urlPos = result.indexOf(firstUrlInResult);
      if (urlPos > 0 && !result.substring(0, urlPos).trim().endsWith('...')) {
        const beforeUrl = result.substring(0, urlPos).trim();
        const afterUrl = result.substring(urlPos);
        result = beforeUrl + '... ' + afterUrl;
      } else if (urlPos === 0) {
        // URL is at the start, add ellipsis at the end if there's room
        result = result + ' ...';
      }
    } else {
      // No URL in result or all URLs removed
      result = result + '...';
    }
  }

  // Final safety check
  if (result.length > maxContentLength) {
    // This shouldn't happen, but if it does, do a hard truncation
    console.warn('Truncation logic failed, applying hard limit');
    result = result.substring(0, maxContentLength - 3) + '...';
  }

  return result;
}

/**
 * Validate if user can broadcast to Bluesky
 * Checks if they have linked account and broadcast enabled
 */
export function canUserBroadcast(user: {
  atprotoHandle?: string | null;
  atprotoDid?: string | null;
  atprotoBroadcastEnabled?: boolean;
}): boolean {
  return !!(
    user.atprotoHandle &&
    user.atprotoDid &&
    user.atprotoBroadcastEnabled
  );
}

/**
 * Validate if post can be broadcasted
 * Checks privacy and content rules
 */
export function canPostBeBroadcasted(post: {
  groupId?: string | null;
  isAnonymous?: boolean;
  isApproved?: boolean;
}): boolean {
  // Don't broadcast:
  // - Group posts (privacy concern)
  // - Anonymous posts (identity mismatch)
  // - Unapproved posts (moderation)
  return !post.groupId && !post.isAnonymous && post.isApproved !== false;
}

/**
 * Generate BtA post URL for attribution
 */
export function generateBtaPostUrl(postId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bridgingtheaisle.com';
  return `${baseUrl}/dashboard?post=${postId}`;
}

/**
 * Parse Bluesky URI to extract components
 */
export function parseAtprotoUri(uri: string): {
  did: string;
  collection: string;
  rkey: string;
} | null {
  try {
    // Format: at://did:plc:xxx/app.bsky.feed.post/xxx
    const match = uri.match(/^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (!match) return null;

    return {
      did: match[1],
      collection: match[2],
      rkey: match[3],
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if reply already exists in BtA
 * Prevents duplicate imports
 */
export function replyExists(
  existingReplies: Array<{ atprotoUri?: string | null }>,
  newReplyUri: string
): boolean {
  return existingReplies.some((reply) => reply.atprotoUri === newReplyUri);
}


// ============================================================================
// PHASE 4: RICH MEDIA & ENGAGEMENT SYNC
// ============================================================================

/**
 * Broadcast a BtA post to Bluesky with rich media support (Phase 4)
 * Supports embedding images in the post
 */
export async function broadcastPostWithMedia(params: {
  agent: BskyAgent;
  content: string;
  btaPostUrl: string;
  imageUrl?: string;
}): Promise<{
  success: boolean;
  uri?: string;
  cid?: string;
  hasMedia?: boolean;
  error?: string;
}> {
  try {
    const { agent, content, btaPostUrl, imageUrl } = params;

    // Prepare the post text with attribution
    const postText = `${content}\n\n🌉 Posted via Bridging the Aisle\n${btaPostUrl}`;

    // Validate length BEFORE attempting to post
    if (postText.length > 300) {
      return {
        success: false,
        error: `Post text is ${postText.length} characters, exceeds Bluesky's 300 character limit. Please use formatContentForBluesky() to truncate content first.`,
      };
    }

    // Create rich text with proper facets
    const rt = new RichText({ text: postText });
    await rt.detectFacets(agent);

    // Prepare the post record
    const record: any = {
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };

    // If image URL provided, upload and embed it
    if (imageUrl) {
      try {
        // Fetch the image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image');
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const imageUint8Array = new Uint8Array(imageBuffer);

        // Upload image to Bluesky
        const uploadResponse = await agent.uploadBlob(imageUint8Array, {
          encoding: imageResponse.headers.get('content-type') || 'image/jpeg',
        });

        if (uploadResponse.success && uploadResponse.data) {
          // Add image embed to post
          record.embed = {
            $type: 'app.bsky.embed.images',
            images: [
              {
                alt: 'Image from Bridging the Aisle post',
                image: uploadResponse.data.blob,
              },
            ],
          };
        }
      } catch (imageError: any) {
        console.error('Error uploading image to Bluesky:', imageError);
        // Continue without image if upload fails
      }
    }

    // Create the post
    const response = await agent.post(record);

    if (!response || !response.uri || !response.cid) {
      return {
        success: false,
        error: 'Failed to create Bluesky post - no URI/CID returned',
      };
    }

    return {
      success: true,
      uri: response.uri,
      cid: response.cid,
      hasMedia: !!imageUrl && !!record.embed,
    };
  } catch (error: any) {
    console.error('Error broadcasting with media to Bluesky:', error);
    return {
      success: false,
      error: error?.message || 'Failed to broadcast to Bluesky',
    };
  }
}

/**
 * Fetch engagement metrics from Bluesky post (Phase 4)
 * Returns likes, reposts, and reply counts
 */
export async function fetchBlueskyEngagement(params: {
  agent: BskyAgent;
  postUri: string;
}): Promise<{
  success: boolean;
  engagement?: {
    likeCount: number;
    repostCount: number;
    replyCount: number;
  };
  error?: string;
}> {
  try {
    const { agent, postUri } = params;

    // Get post details including engagement metrics
    const response = await agent.getPostThread({
      uri: postUri,
      depth: 0, // Don't need replies, just the post
    });

    if (!response.success || !response.data.thread) {
      return {
        success: false,
        error: 'Failed to fetch post engagement',
      };
    }

    const thread: any = response.data.thread;
    const post = thread.post;

    if (!post) {
      return {
        success: false,
        error: 'Post not found in thread',
      };
    }

    return {
      success: true,
      engagement: {
        likeCount: post.likeCount || 0,
        repostCount: post.repostCount || 0,
        replyCount: post.replyCount || 0,
      },
    };
  } catch (error: any) {
    console.error('Error fetching Bluesky engagement:', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch engagement metrics',
    };
  }
}

/**
 * Check if user has automatic broadcasting enabled (Phase 4)
 */
export function shouldAutoBroadcast(user: {
  atprotoHandle?: string | null;
  atprotoDid?: string | null;
  atprotoBroadcastEnabled?: boolean;
  atprotoAutoBroadcast?: boolean;
}): boolean {
  return !!(
    user.atprotoHandle &&
    user.atprotoDid &&
    user.atprotoBroadcastEnabled &&
    user.atprotoAutoBroadcast
  );
}

/**
 * Reply to a Bluesky post from BtA (Phase 4)
 * Allows users to respond to Bluesky comments directly from BtA
 */
export async function replyToBlueskyPost(params: {
  agent: BskyAgent;
  parentUri: string;
  parentCid: string;
  content: string;
  btaCommentUrl: string;
}): Promise<{
  success: boolean;
  uri?: string;
  cid?: string;
  error?: string;
}> {
  try {
    const { agent, parentUri, parentCid, content, btaCommentUrl } = params;

    // Parse parent URI to get root details
    const parsed = parseAtprotoUri(parentUri);
    if (!parsed) {
      return {
        success: false,
        error: 'Invalid parent URI',
      };
    }

    // Prepare reply text with attribution
    const replyText = `${content}\n\n🌉 Replied via Bridging the Aisle\n${btaCommentUrl}`;

    // Create rich text
    const rt = new RichText({ text: replyText });
    await rt.detectFacets(agent);

    // Create the reply
    const response = await agent.post({
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
      reply: {
        root: {
          uri: parentUri,
          cid: parentCid,
        },
        parent: {
          uri: parentUri,
          cid: parentCid,
        },
      },
    });

    if (!response || !response.uri || !response.cid) {
      return {
        success: false,
        error: 'Failed to create reply - no URI/CID returned',
      };
    }

    return {
      success: true,
      uri: response.uri,
      cid: response.cid,
    };
  } catch (error: any) {
    console.error('Error replying to Bluesky post:', error);
    return {
      success: false,
      error: error?.message || 'Failed to reply to Bluesky',
    };
  }
}

/**
 * Get image URL from BtA post for broadcasting (Phase 4)
 */
export function extractImageFromPost(post: {
  imageUrl?: string | null;
}): string | undefined {
  return post.imageUrl || undefined;
}

/**
 * Check if enough time has passed since last engagement sync (Phase 4)
 * Prevents excessive API calls - sync at most once per 5 minutes
 */
export function shouldSyncEngagement(
  lastSyncedAt?: Date | null,
  minIntervalMinutes: number = 5
): boolean {
  if (!lastSyncedAt) return true;

  const now = new Date();
  const timeSinceSync = now.getTime() - new Date(lastSyncedAt).getTime();
  const minIntervalMs = minIntervalMinutes * 60 * 1000;

  return timeSinceSync >= minIntervalMs;
}