
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { moderateContent } from '@/lib/content-moderation';
import { 
  getAuthorFeed, 
  getPostThread, 
  generateBlueskyWebUrl,
  AuthorFeedResponse 
} from '@/lib/bluesky-public-api';

// ========================================
// CONFIGURATION - Bluesky Handles to Fetch
// ========================================
// These handles are fetched via PUBLIC unauthenticated API (no auth required)
// Organized by source type for content aggregation
// Note: If any handle returns HTTP 400, remove it immediately

const BLUESKY_HANDLES_TO_FETCH = [
  // ===== CORE / ANCHOR SOURCES =====
  // Mainstream news outlets - authoritative civic/political coverage
  'npr.org',                     // NPR - National Public Radio
  'politico.com',                // Politico - Political news and analysis
  'bbcnewsnight.bsky.social',    // BBC Newsnight - In-depth political coverage
  'usatoday.com',                // USA Today - National news
  'thehill.com',                 // The Hill - Congressional and political news
  
  // ===== PERSPECTIVE / INVESTIGATIVE (NON-ANCHOR) =====
  // Investigative journalism and perspective-driven reporting
  'motherjones.com',             // Mother Jones - Investigative journalism
  'rawstory.com',                // Raw Story - Progressive news and commentary
  'gijn.org',                    // Global Investigative Journalism Network
];

// Feed configuration
const FEED_NAME = 'civic-timeline';
const AUTHOR_FEED_LIMIT = 30; // Posts per handle per fetch
const CACHE_TTL_FEED = 120;  // 2 minutes (tunable: 60-180s)
const CACHE_TTL_THREAD = 600; // 10 minutes (tunable: 10-30 min)

// STRICT Political/Civic keywords - posts MUST contain at least one
const CIVIC_KEYWORDS = [
  // Core Political Terms
  'politics', 'political', 'policy', 'policies', 'legislation', 'legislative',
  'government', 'governance', 'federal', 'state policy', 'local policy',
  'public policy', 'bipartisan', 'partisan',
  
  // Institutions
  'congress', 'senate', 'house of representatives', 'house', 'senator',
  'representative', 'congressman', 'congresswoman', 'legislator',
  'parliament', 'parliamentary',
  
  // Elections & Voting
  'election', 'elections', 'electoral', 'vote', 'voting', 'voter',
  'ballot', 'primary', 'caucus', 'campaign', 'candidate',
  'ballot initiative', 'referendum', 'polling', 'turnout',
  
  // Democracy & Civic Participation
  'democracy', 'democratic', 'republic', 'civic', 'civic engagement',
  'civil discourse', 'public discourse', 'town hall', 'town meeting',
  'constituents', 'representation', 'public hearing',
  
  // Constitution & Law
  'constitution', 'constitutional', 'amendment', 'bill of rights',
  'civil liberties', 'rights', 'legal', 'law', 'regulation',
  
  // Political Parties & Ideology
  'democrat', 'democratic party', 'republican', 'republican party',
  'progressive', 'conservative', 'liberal', 'moderate',
  'left-wing', 'right-wing', 'centrist',
  
  // Judiciary
  'supreme court', 'scotus', 'court', 'courts', 'judicial', 'judiciary',
  'justice', 'judge', 'ruling', 'verdict', 'legal ruling',
  
  // Policy Areas - Healthcare
  'healthcare', 'health care', 'medicaid', 'medicare', 'obamacare', 'aca',
  'insurance', 'medical policy', 'reproductive rights', 'abortion policy',
  'prescription drug', 'pharmaceutical policy',
  
  // Policy Areas - Economy
  'economy', 'economic policy', 'budget', 'deficit', 'surplus',
  'tax policy', 'taxation', 'fiscal policy', 'monetary policy',
  'inflation policy', 'employment policy', 'wages policy', 'trade policy',
  'tariff', 'sanctions', 'economic reform',
  
  // Policy Areas - Immigration
  'immigration', 'immigration policy', 'border policy', 'asylum',
  'refugee policy', 'citizenship', 'visa policy', 'deportation',
  'immigration reform',
  
  // Policy Areas - Environment
  'climate policy', 'environmental policy', 'energy policy',
  'renewable energy policy', 'carbon policy', 'emissions',
  'epa', 'environmental regulation', 'climate legislation',
  
  // Policy Areas - Education
  'education policy', 'school policy', 'student loan', 'student debt',
  'education reform', 'curriculum policy', 'teacher policy',
  'school board', 'education funding',
  
  // Policy Areas - Foreign Policy
  'foreign policy', 'diplomacy', 'diplomatic', 'treaty', 'nato',
  'defense policy', 'military policy', 'national security',
  'international relations', 'foreign aid',
  
  // Policy Areas - Civil Rights
  'civil rights', 'voting rights', 'discrimination policy',
  'equality', 'justice reform', 'police reform', 'criminal justice',
  'racial justice', 'lgbtq rights', 'lgbtq policy',
  
  // Policy Areas - Veterans
  'veteran policy', 'veterans affairs', 'va', 'veteran benefits',
  'gi bill', 'military service',
  
  // Policy Areas - Housing
  'housing policy', 'homelessness', 'affordable housing',
  'zoning', 'urban policy', 'shelter policy',
  
  // Legislative Process
  'bill', 'introduced bill', 'passed', 'vetoed', 'override',
  'committee', 'hearing', 'markup', 'floor vote', 'cloture',
  'filibuster', 'amendment', 'resolution',
  
  // Political Commentary
  'political commentary', 'political analysis', 'policy debate',
  'debate', 'discussion', 'dialogue', 'compromise', 'negotiation',
  'agreement', 'common ground', 'across the aisle',
  
  // Media & Information
  'fact check', 'misinformation', 'disinformation',
  'media literacy', 'political news', 'press conference',
  
  // Local Government
  'city council', 'mayor', 'local government', 'municipal',
  'county', 'township', 'public safety policy', 'infrastructure policy'
];

// HOBBY/LIFESTYLE EXCLUSION KEYWORDS - automatic rejection
const HOBBY_LIFESTYLE_EXCLUSIONS = [
  // Nature & Gardening
  'flower', 'flowers', 'plant', 'plants', 'garden', 'gardening',
  'planting', 'botanical', 'flora', 'bloom', 'blooming',
  
  // Photography & Art
  'photography', 'photo', 'picture', 'camera', 'lens', 'shot',
  'photographer', 'photoshoot', 'selfie',
  'drawing', 'art', 'artwork', 'illustration', 'sketch', 'painting',
  'canvas', 'artist', 'artistic',
  
  // Pets & Animals
  'dog', 'dogs', 'puppy', 'puppies', 'cat', 'cats', 'kitten', 'kittens',
  'pet', 'pets', 'animal', 'animals', 'bird', 'fish', 'hamster',
  'rabbit', 'guinea pig', 'ferret', 'reptile',
  
  // Tech & Gaming (non-policy)
  'computer', 'tech support', 'coding', 'programming', 'game', 'gaming',
  'gamer', 'video game', 'console', 'pc gaming', 'minecraft',
  'fortnite', 'playstation', 'xbox', 'nintendo',
  
  // Creative Writing
  'writing prompt', 'fiction', 'poem', 'poetry', 'short story',
  'fanfic', 'fanfiction', 'creative writing',
  
  // Entertainment & Humor
  'meme', 'memes', 'joke', 'jokes', 'humor', 'funny', 'lol',
  'comedy', 'comedian',
  
  // Crafts & Hobbies
  'hobby', 'hobbies', 'sewing', 'crafting', 'craft', 'crochet',
  'knitting', 'knit', 'cosplay', 'diy', 'handmade',
  'woodworking', 'pottery', 'ceramics',
  
  // Food & Cooking
  'food', 'recipe', 'recipes', 'cooking', 'baking', 'bake',
  'delicious', 'yummy', 'tasty', 'meal', 'dinner', 'lunch',
  'breakfast', 'cuisine', 'chef',
  
  // Personal Updates
  'my day', 'personal update', 'daily life', 'morning routine',
  'good morning', 'goodnight', 'having fun', 'weekend vibes',
  
  // Sports & Fitness (non-policy)
  'workout', 'gym', 'fitness', 'exercise', 'training',
  'sports team', 'soccer', 'football game', 'basketball game',
  'baseball game', 'hockey game',
  
  // Fashion & Beauty
  'fashion', 'outfit', 'style', 'makeup', 'beauty', 'skincare',
  'hair', 'nails', 'clothing', 'accessories',
  
  // Travel (non-policy)
  'vacation', 'holiday', 'trip', 'traveling', 'tourist',
  'sightseeing', 'beach day', 'resort',
  
  // Music & Entertainment (non-policy)
  'concert', 'band', 'musician', 'album', 'song', 'lyrics',
  'playlist', 'music video',
  
  // General Lifestyle
  'lifestyle', 'life hack', 'self care', 'wellness',
  'meditation', 'yoga', 'zen', 'mindfulness'
];

// PROFANITY & UNCIVIL LANGUAGE - automatic rejection
const UNCIVIL_KEYWORDS = [
  'hate', 'stupid', 'idiot', 'moron', 'trash', 'garbage', 'scum',
  'destroy', 'enemy', 'traitor', 'brainwashed', 'sheep',
  'dumbass', 'dumb ass', 'loser', 'losers', 'pathetic', 'worthless'
];

/**
 * Check if content contains hobby/lifestyle keywords (EXCLUSION FILTER)
 * Returns true if ANY hobby/lifestyle keyword is found
 */
function containsHobbyLifestyleContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  return HOBBY_LIFESTYLE_EXCLUSIONS.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * Check if content contains uncivil language (using advanced moderation)
 * Returns true if profanity, insults, slurs, or harassment detected
 */
function containsUncivilLanguage(text: string): boolean {
  // Use the robust content moderation system
  const moderationResult = moderateContent(text);
  
  // Reject if any violation detected (profanity, threats, disrespect, etc.)
  if (moderationResult.isViolation) {
    return true;
  }
  
  // Also check basic uncivil keywords
  const lowerText = text.toLowerCase();
  return UNCIVIL_KEYWORDS.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * Check if content contains political/civic keywords (INCLUSION FILTER)
 * Returns true if AT LEAST ONE civic/political keyword is found
 */
function containsPoliticalCivicContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  return CIVIC_KEYWORDS.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * Calculate a basic civility score based on keyword presence
 * Score: 0-100 (higher is more civil)
 */
function calculateCivilityScore(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 50; // Start neutral
  
  // Boost for positive civic engagement keywords
  const civicMatches = CIVIC_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  ).length;
  score += Math.min(civicMatches * 5, 30); // Max +30 for civic keywords
  
  // Penalize for negative/uncivil keywords
  const negativeMatches = UNCIVIL_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  ).length;
  score -= negativeMatches * 15; // -15 per negative keyword
  
  // Check for content moderation violations
  const moderationResult = moderateContent(text);
  if (moderationResult.isViolation) {
    // Deduct based on severity
    if (moderationResult.severity === 'severe') {
      score -= 50;
    } else if (moderationResult.severity === 'moderate') {
      score -= 30;
    } else {
      score -= 15;
    }
  }
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Extract safety labels from ATProto post
 */
function extractSafetyLabels(post: any): string[] {
  const labels: string[] = [];
  
  // Check post labels
  if (post.post.labels && Array.isArray(post.post.labels)) {
    for (const label of post.post.labels) {
      if (label.val) {
        labels.push(label.val);
      }
    }
  }
  
  // Check author labels
  if (post.post.author?.labels && Array.isArray(post.post.author.labels)) {
    for (const label of post.post.author.labels) {
      if (label.val) {
        labels.push(`author:${label.val}`);
      }
    }
  }
  
  return labels;
}

/**
 * Check if post has critical safety issues that should block import
 */
function hasCriticalSafetyIssues(labels: string[]): boolean {
  const criticalLabels = [
    'spam',
    'sexual',
    'porn',
    'graphic-media',
    'self-harm',
    'violence',
    'hate',
    'intolerant',
    'rude',
    'threat',
    'author:spam',
    'author:impersonation'
  ];
  
  return labels.some(label => criticalLabels.includes(label.toLowerCase()));
}

/**
 * Extract topics from post content
 */
function extractTopics(text: string): string[] {
  const lowerText = text.toLowerCase();
  const topics: string[] = [];
  
  if (lowerText.match(/\b(policy|policies|legislation|bill)\b/)) {
    topics.push('policy');
  }
  if (lowerText.match(/\b(bipartisan|compromise|agreement|unity|together|across the aisle|both parties|reach across|common ground|meet in the middle)\b/)) {
    topics.push('bipartisan');
  }
  if (lowerText.match(/\b(civic|citizen|democracy|vote|voting|engagement|show up to vote|constituents)\b/)) {
    topics.push('civic-engagement');
  }
  if (lowerText.match(/\b(congress|senate|house|representative|senator|committee hearing|markup|floor vote)\b/)) {
    topics.push('congress');
  }
  if (lowerText.match(/\b(election|campaign|ballot|primary|candidate|ballot initiative)\b/)) {
    topics.push('election');
  }
  if (lowerText.match(/\b(healthcare|medicaid|medicare|insurance|medical|health|abortion|reproductive)\b/)) {
    topics.push('healthcare');
  }
  if (lowerText.match(/\b(economy|budget|deficit|tax|taxes|inflation|jobs|employment|wages|fiscal|trade)\b/)) {
    topics.push('economy');
  }
  if (lowerText.match(/\b(supreme court|scotus|judicial|justice|court|ruling)\b/)) {
    topics.push('judiciary');
  }
  if (lowerText.match(/\b(immigration|border|asylum|refugee|citizenship|visa)\b/)) {
    topics.push('immigration');
  }
  if (lowerText.match(/\b(climate|environment|energy|renewable|carbon|pollution|epa|emissions)\b/)) {
    topics.push('environment');
  }
  if (lowerText.match(/\b(education|school|student|loan|debt|university|college|teacher|school board)\b/)) {
    topics.push('education');
  }
  if (lowerText.match(/\b(foreign policy|diplomacy|treaty|nato|defense|military|sanctions)\b/)) {
    topics.push('foreign-policy');
  }
  if (lowerText.match(/\b(civil rights|discrimination|equality|justice reform|voting rights|lgbtq|racial justice)\b/)) {
    topics.push('civil-rights');
  }
  if (lowerText.match(/\b(veteran|veterans|va|military service|gi bill)\b/)) {
    topics.push('veterans');
  }
  if (lowerText.match(/\b(homeless|homelessness|housing|shelter|affordable housing)\b/)) {
    topics.push('homelessness');
  }
  if (lowerText.match(/\b(city council|school board|mayor|town hall|local government|municipal|county|township)\b/)) {
    topics.push('local-government');
  }
  if (lowerText.match(/\b(zoning|water|public safety|infrastructure|community|district maps|public hearing)\b/)) {
    topics.push('community-issues');
  }
  if (lowerText.match(/\b(representation|democracy|voting rights|ballot initiative|constituents)\b/)) {
    topics.push('democracy');
  }
  if (lowerText.match(/\b(misinformation|disinformation|fact check|sources|media literacy|credibility|verification)\b/)) {
    topics.push('media-literacy');
  }
  if (lowerText.match(/\b(dialogue|conversation|debate|discussion|civil discourse|common ground|agree to disagree)\b/)) {
    topics.push('dialogue');
  }
  
  return topics.length > 0 ? topics : ['general-politics'];
}

/**
 * STRICT: Check if content is relevant to civic/political dialogue
 * This is the main filter that enforces political/civic content only
 * 
 * Rejection Priority:
 * 1. Hobby/lifestyle content → REJECT
 * 2. Uncivil language/profanity → REJECT
 * 3. No political/civic keywords → REJECT
 * 4. Too short → REJECT
 * 5. Low civility score → REJECT
 */
function isRelevantContent(text: string, rejectionReason: { reason: string }): boolean {
  // Priority 1: REJECT if contains hobby/lifestyle keywords
  if (containsHobbyLifestyleContent(text)) {
    rejectionReason.reason = 'hobby_lifestyle';
    return false;
  }
  
  // Priority 2: REJECT if contains profanity, insults, slurs, or hostile tone
  if (containsUncivilLanguage(text)) {
    rejectionReason.reason = 'uncivil_language';
    return false;
  }
  
  // Priority 3: REJECT if does NOT contain political/civic keywords
  if (!containsPoliticalCivicContent(text)) {
    rejectionReason.reason = 'not_political_civic';
    return false;
  }
  
  // Priority 4: REJECT if too short (spam/low quality filter)
  if (text.length < 50) {
    rejectionReason.reason = 'too_short';
    return false;
  }
  
  // Priority 5: Calculate and check civility score
  const civilityScore = calculateCivilityScore(text);
  if (civilityScore < 40) {
    rejectionReason.reason = 'low_civility_score';
    return false;
  }
  
  // PASSED all filters - this is political/civic content!
  return true;
}

// ========================================
// PUBLIC API - NO AUTHENTICATION REQUIRED
// ========================================
// This implementation uses public.api.bsky.app which does NOT require authentication
// All read operations are performed via the public AppView host

/**
 * Get or update feed state for cursor management
 */
async function getFeedState() {
  let feedState = await prisma.feedState.findUnique({
    where: { feedName: FEED_NAME }
  });
  
  if (!feedState) {
    feedState = await prisma.feedState.create({
      data: {
        feedName: FEED_NAME,
        cursor: null,
        lastFetchedAt: new Date(),
        totalFetched: 0,
        totalApproved: 0,
        isActive: true
      }
    });
  }
  
  return feedState;
}

/**
 * Update feed state after fetching (uses upsert to create if missing)
 */
async function updateFeedState(
  cursor: string | null,
  lastPostUri: string | null,
  fetchedCount: number,
  approvedCount: number,
  error: string | null = null
) {
  // Use upsert to handle cases where the record doesn't exist yet
  // (e.g., when auth fails before getFeedState() is called)
  await prisma.feedState.upsert({
    where: { feedName: FEED_NAME },
    update: {
      cursor,
      lastPostUri,
      lastFetchedAt: new Date(),
      totalFetched: { increment: fetchedCount },
      totalApproved: { increment: approvedCount },
      errorCount: error ? { increment: 1 } : 0,
      lastError: error
    },
    create: {
      feedName: FEED_NAME,
      cursor,
      lastPostUri,
      lastFetchedAt: new Date(),
      totalFetched: fetchedCount,
      totalApproved: approvedCount,
      errorCount: error ? 1 : 0,
      lastError: error,
      isActive: true
    }
  });
}

/**
 * GET endpoint to fetch and cache Bluesky content using feed API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const fetchThreads = searchParams.get('fetchThreads') !== 'false'; // Default true
    
    console.log('=== BLUESKY PUBLIC API FETCH START ===');
    console.log(`Force Refresh: ${forceRefresh}`);
    console.log(`Limit: ${limit}`);
    console.log(`Fetch Threads: ${fetchThreads}`);
    
    // Always return cached content first unless forceRefresh
    if (!forceRefresh) {
      const cachedContent = await prisma.externalContent.findMany({
        where: {
          platform: 'bluesky',
          isApproved: true
        },
        orderBy: {
          importedAt: 'desc'
        },
        take: limit
      });
      
      if (cachedContent.length > 0) {
        console.log(`✅ Returning ${cachedContent.length} cached posts`);
        return NextResponse.json({
          content: cachedContent,
          cached: true,
          timestamp: new Date().toISOString(),
          diagnostics: null
        });
      }
    }
    
    console.log('\n=== FETCHING FROM BLUESKY PUBLIC API ===');
    console.log(`Configured handles: ${BLUESKY_HANDLES_TO_FETCH.length}`);
    
    // Stats tracking
    let totalFetched = 0;
    let filterStats = {
      totalPosts: 0,
      hobbyLifestyle: 0,
      uncivilLanguage: 0,
      notPoliticalCivic: 0,
      tooShort: 0,
      lowCivilityScore: 0,
      safetyIssues: 0,
      alreadyExists: 0,
      approved: 0,
      threadsFetched: 0,
      threadsSkipped: 0
    };
    
    const processedPosts: any[] = [];
    const errors: string[] = [];
    
    // Fetch from each configured handle
    for (const handle of BLUESKY_HANDLES_TO_FETCH) {
      try {
        console.log(`\n📥 Fetching author feed: ${handle}`);
        
        // Fetch author feed using PUBLIC API (no auth)
        const feedResponse = await getAuthorFeed(handle, {
          limit: AUTHOR_FEED_LIMIT,
          cacheTTL: CACHE_TTL_FEED
        });
        
        console.log(`   Retrieved ${feedResponse.feed.length} posts from ${handle}`);
        totalFetched += feedResponse.feed.length;
        
        // Process each post
        for (const feedItem of feedResponse.feed) {
          try {
            const post = feedItem.post;
            const postRecord = post.record as any;
            const content = postRecord?.text || '';
            const postUri = post.uri;
            
            filterStats.totalPosts++;
            
            // Extract safety labels (if any)
            const safetyLabels: string[] = [];
            if (post.labels && Array.isArray(post.labels)) {
              for (const label of post.labels) {
                if (label.val) {
                  safetyLabels.push(label.val);
                }
              }
            }
            
            // Check for critical safety issues
            const criticalLabels = ['spam', 'sexual', 'porn', 'graphic-media', 'self-harm', 'violence', 'hate'];
            const hasSafetyIssues = safetyLabels.some(label => 
              criticalLabels.includes(label.toLowerCase())
            );
            
            if (hasSafetyIssues) {
              filterStats.safetyIssues++;
              console.log(`   ⚠️ Skipped (safety): ${safetyLabels.join(', ')}`);
              continue;
            }
            
            // Check if post already exists
            const existing = await prisma.externalContent.findFirst({
              where: {
                platform: 'bluesky',
                externalId: postUri
              }
            });
            
            if (existing) {
              filterStats.alreadyExists++;
              continue;
            }
            
            // Apply civic/political filtering
            const rejectionReason = { reason: '' };
            if (!isRelevantContent(content, rejectionReason)) {
              switch (rejectionReason.reason) {
                case 'hobby_lifestyle':
                  filterStats.hobbyLifestyle++;
                  break;
                case 'uncivil_language':
                  filterStats.uncivilLanguage++;
                  break;
                case 'not_political_civic':
                  filterStats.notPoliticalCivic++;
                  break;
                case 'too_short':
                  filterStats.tooShort++;
                  break;
                case 'low_civility_score':
                  filterStats.lowCivilityScore++;
                  break;
              }
              continue;
            }
            
            // Calculate metrics
            const civilityScore = calculateCivilityScore(content);
            const topics = extractTopics(content);
            
            // Optionally fetch thread context
            let threadContext = null;
            if (fetchThreads) {
              try {
                threadContext = await getPostThread(postUri, {
                  depth: 2,
                  parentHeight: 1,
                  cacheTTL: CACHE_TTL_THREAD
                });
                filterStats.threadsFetched++;
              } catch (threadError) {
                console.log(`   ⚠️ Thread fetch failed for ${postUri}, continuing without thread context`);
                filterStats.threadsSkipped++;
                // Continue without thread - graceful degradation
              }
            }
            
            // Generate Bluesky web URL for "View on Bluesky"
            const blueskyUrl = generateBlueskyWebUrl(post);
            
            // Store in database
            const externalContent = await prisma.externalContent.create({
              data: {
                platform: 'bluesky',
                externalId: postUri,
                authorHandle: post.author.handle,
                authorName: post.author.displayName || post.author.handle,
                authorDid: post.author.did,
                content: content,
                createdAt: new Date(postRecord.createdAt),
                importedAt: new Date(),
                isApproved: true, // Auto-approved after passing filters
                topics: topics,
                civilityScore: civilityScore,
                likeCount: 0, // Public API doesn't include engagement metrics
                replyCount: 0,
                repostCount: 0,
                isThread: !!threadContext,
                safetyLabels: safetyLabels,
                hasSafetyIssues: false,
                feedSource: `author:${handle}`, // Track which handle this came from
                indexedAt: new Date(postRecord.createdAt)
                // Note: blueskyUrl can be generated on-demand using generateBlueskyWebUrl()
              }
            });
            
            filterStats.approved++;
            processedPosts.push(externalContent);
            console.log(`   ✅ Approved: "${content.substring(0, 60)}..." (score: ${civilityScore})`);
            
          } catch (postError) {
            console.error(`   ❌ Error processing post:`, postError);
            errors.push(`Post processing error: ${postError}`);
          }
        }
        
      } catch (handleError: any) {
        const errorMsg = handleError instanceof Error ? handleError.message : String(handleError);
        console.error(`   ❌ Error fetching from ${handle}:`, errorMsg);
        errors.push(`${handle}: ${errorMsg}`);
        // Continue with next handle - graceful degradation
      }
    }
    
    // Log statistics
    console.log('\n=== FETCH COMPLETE ===');
    console.log(`Total posts fetched: ${filterStats.totalPosts}`);
    console.log(`✗ Filtered out:`);
    console.log(`  - Safety issues: ${filterStats.safetyIssues}`);
    console.log(`  - Already exists: ${filterStats.alreadyExists}`);
    console.log(`  - Hobby/lifestyle: ${filterStats.hobbyLifestyle}`);
    console.log(`  - Uncivil language: ${filterStats.uncivilLanguage}`);
    console.log(`  - Not political/civic: ${filterStats.notPoliticalCivic}`);
    console.log(`  - Too short: ${filterStats.tooShort}`);
    console.log(`  - Low civility score: ${filterStats.lowCivilityScore}`);
    console.log(`✅ Approved: ${filterStats.approved}`);
    console.log(`📊 Threads fetched: ${filterStats.threadsFetched}`);
    console.log(`⚠️ Threads skipped: ${filterStats.threadsSkipped}`);
    
    if (errors.length > 0) {
      console.log(`⚠️ Errors encountered: ${errors.length}`);
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Return results with diagnostics
    return NextResponse.json({
      content: processedPosts,
      cached: false,
      imported: filterStats.approved,
      timestamp: new Date().toISOString(),
      diagnostics: {
        handles: BLUESKY_HANDLES_TO_FETCH,
        totalFetched,
        filterStats,
        errors: errors.length > 0 ? errors : null
      }
    });
    
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('\n❌ FETCH ERROR:', errorMsg);
    console.error('[EXTERNAL CONTENT] Stack:', error?.stack);
    
    let statusCode = 500;
    let errorMessage = 'Failed to fetch Bluesky content';
    let errorDetails = errorMsg;
    
    // Determine error type
    if (error?.message?.toLowerCase().includes('rate limit') || error?.status === 429) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded';
      errorDetails = 'Please try again in 10-15 minutes';
    } else if (error?.message?.toLowerCase().includes('network') || error?.message?.toLowerCase().includes('fetch')) {
      statusCode = 503;
      errorMessage = 'Service temporarily unavailable';
      errorDetails = 'Could not connect to Bluesky. Please try again later.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails,
        timestamp: new Date().toISOString(),
        content: [],
        cached: false
      },
      { status: statusCode }
    );
  }
}
