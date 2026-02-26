import { PrismaClient } from '@prisma/client';
import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== AUTHENTICATION DIAGNOSTIC ===\n');
  
  // 1. Check database for Platform Founder
  const founder = await prisma.user.findFirst({
    where: { role: 'PLATFORM_FOUNDER' },
    select: {
      email: true,
      atprotoEmail: true,
      atprotoHandle: true,
      atprotoDid: true
    }
  });
  
  console.log('1. Platform Founder in Database:');
  console.log('   Email:', founder?.email);
  console.log('   AT Proto Email:', founder?.atprotoEmail);
  console.log('   AT Proto Handle:', founder?.atprotoHandle);
  console.log('   AT Proto DID:', founder?.atprotoDid);
  
  // 2. Check environment variable
  const appPassword = process.env.BLUESKY_APP_PASSWORD;
  console.log('\n2. Environment Variable:');
  console.log('   BLUESKY_APP_PASSWORD:', appPassword ? `${appPassword.substring(0, 4)}-****-****-****` : 'NOT SET');
  console.log('   Format valid:', appPassword ? /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/.test(appPassword) : false);
  
  // 3. Test authentication
  if (founder && appPassword) {
    console.log('\n3. Testing Authentication:');
    const identifier = founder.atprotoEmail || founder.atprotoHandle || '';
    console.log('   Identifier:', identifier);
    console.log('   Service: https://bsky.social');
    
    const agent = new BskyAgent({ service: 'https://bsky.social' });
    
    try {
      console.log('   Attempting login...');
      await agent.login({
        identifier,
        password: appPassword
      });
      
      console.log('   ✅ SUCCESS!');
      console.log('   Session DID:', agent.session?.did);
      console.log('   Session Handle:', agent.session?.handle);
    } catch (error: any) {
      console.log('   ❌ FAILED!');
      console.log('   Error:', error?.message || 'Unknown error');
      console.log('   Status:', error?.status || 'Unknown');
      console.log('   Error code:', error?.error || 'Unknown');
    }
  }
  
  await prisma.$disconnect();
  console.log('\n=================================\n');
}

main().catch(console.error);
