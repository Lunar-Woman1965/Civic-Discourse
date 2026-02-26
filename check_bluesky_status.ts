import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkBlueskyStatus() {
  console.log('=== BLUESKY INTEGRATION STATUS CHECK ===\n');
  
  // Check platform founder's connection status
  const founder = await prisma.user.findFirst({
    where: { role: 'PLATFORM_FOUNDER' },
    select: {
      email: true,
      atprotoHandle: true,
      atprotoDid: true,
      blueskyConnectedAt: true,
      blueskyTokenExpiry: true,
      blueskyAutoPost: true,
      blueskyEncryptedToken: true
    }
  });
  
  if (!founder) {
    console.log('❌ Platform Founder not found');
    await prisma.$disconnect();
    return;
  }
  
  console.log('Platform Founder Status:');
  console.log(`  Email: ${founder.email}`);
  console.log(`  Bluesky Handle: ${founder.atprotoHandle || '(not set)'}`);
  console.log(`  Has Encrypted Token: ${!!founder.blueskyEncryptedToken}`);
  console.log(`  Connected At: ${founder.blueskyConnectedAt || '(never)'}`);
  console.log(`  Token Expiry: ${founder.blueskyTokenExpiry || '(not set)'}`);
  console.log(`  Auto-Post Enabled: ${founder.blueskyAutoPost}`);
  
  if (founder.blueskyTokenExpiry) {
    const now = new Date();
    const expiry = new Date(founder.blueskyTokenExpiry);
    const isExpired = now > expiry;
    const timeUntilExpiry = expiry.getTime() - now.getTime();
    const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
    const minutesUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log(`  Token Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
    if (!isExpired) {
      console.log(`  Time Until Expiry: ${hoursUntilExpiry}h ${minutesUntilExpiry}m`);
    } else {
      console.log(`  Expired: ${Math.abs(hoursUntilExpiry)}h ${Math.abs(minutesUntilExpiry)}m ago`);
    }
  }
  
  // Check feed state
  console.log('\n=== FEED STATE ===');
  const feedState = await prisma.feedState.findUnique({
    where: { feedName: 'civic-timeline' }
  });
  
  if (feedState) {
    console.log(`Last Fetch Attempt: ${feedState.lastFetchedAt}`);
    console.log(`Total Fetched (All Time): ${feedState.totalFetched}`);
    console.log(`Total Approved (All Time): ${feedState.totalApproved}`);
    console.log(`Error Count: ${feedState.errorCount}`);
    console.log(`Last Error: ${feedState.lastError || '(none)'}`);
  } else {
    console.log('No feed state found');
  }
  
  // Check recent external content
  console.log('\n=== RECENT EXTERNAL CONTENT ===');
  const recentCount = await prisma.externalContent.count({
    where: {
      platform: 'bluesky',
      importedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    }
  });
  console.log(`Posts imported in last 24 hours: ${recentCount}`);
  
  const lastPost = await prisma.externalContent.findFirst({
    where: { platform: 'bluesky' },
    orderBy: { importedAt: 'desc' },
    select: { importedAt: true, content: true }
  });
  
  if (lastPost) {
    console.log(`Last imported post: ${lastPost.importedAt}`);
    console.log(`Content preview: ${lastPost.content.substring(0, 100)}...`);
  } else {
    console.log('No posts found in database');
  }
  
  await prisma.$disconnect();
}

checkBlueskyStatus().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
