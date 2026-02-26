/**
 * Emergency Script: Inject Bluesky Token Directly
 * 
 * This script authenticates with Bluesky from the server side and stores
 * the encrypted token directly in the database, bypassing frontend rate limits.
 */

import { PrismaClient } from '@prisma/client';
import { BskyAgent } from '@atproto/api';
import { encryptToken } from './lib/bluesky-token-encryption';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function injectBlueskyToken() {
  console.log('=== BLUESKY TOKEN INJECTION SCRIPT ===\n');
  console.log('Timestamp:', new Date().toISOString());
  console.log('');

  try {
    // Get Platform Founder
    const founder = await prisma.user.findFirst({
      where: { role: 'PLATFORM_FOUNDER' },
      select: {
        id: true,
        email: true,
        atprotoHandle: true,
        atprotoDid: true,
        atprotoEmail: true,
      }
    });

    if (!founder) {
      console.error('❌ Platform Founder not found in database');
      process.exit(1);
    }

    console.log('📊 USER DATA:');
    console.log('  Email:', founder.email);
    console.log('  Bluesky Auth Email:', founder.atprotoEmail);
    console.log('  Bluesky Handle:', founder.atprotoHandle);
    console.log('  Bluesky DID:', founder.atprotoDid);
    console.log('');

    // Get credentials from environment
    const identifier = founder.atprotoEmail || founder.atprotoHandle || 'moon_crest_woman@aol.com';
    const appPassword = process.env.BLUESKY_APP_PASSWORD;

    if (!appPassword) {
      console.error('❌ BLUESKY_APP_PASSWORD not found in environment');
      process.exit(1);
    }

    console.log('🔐 AUTHENTICATION:');
    console.log('  Identifier:', identifier);
    console.log('  Password Length:', appPassword.length);
    console.log('  Password Format Valid:', /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/.test(appPassword));
    console.log('');

    // Authenticate with Bluesky
    console.log('🚀 Authenticating with Bluesky...');
    const agent = new BskyAgent({ service: 'https://bsky.social' });
    
    const loginResult = await agent.login({
      identifier,
      password: appPassword,
    });

    console.log('✅ Authentication successful!');
    console.log('  DID:', loginResult.data.did);
    console.log('  Handle:', loginResult.data.handle);
    console.log('  Email:', loginResult.data.email || 'Not provided');
    console.log('');

    // Encrypt the access token
    console.log('🔒 Encrypting access token...');
    const encryptedToken = encryptToken(loginResult.data.accessJwt);
    console.log('  Token encrypted: YES');
    console.log('  Encrypted length:', encryptedToken.length);
    console.log('');

    // Calculate token expiry (2 hours from now)
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 2);

    // Update database
    console.log('💾 Updating database...');
    await prisma.user.update({
      where: { id: founder.id },
      data: {
        blueskyEncryptedToken: encryptedToken,
        blueskyTokenExpiry: tokenExpiry,
        blueskyConnectedAt: new Date(),
        atprotoHandle: loginResult.data.handle,
        atprotoDid: loginResult.data.did,
      }
    });

    console.log('✅ Database updated successfully!');
    console.log('');
    console.log('📋 CONNECTION STATUS:');
    console.log('  Token Stored: YES');
    console.log('  Token Expires:', tokenExpiry.toISOString());
    console.log('  Handle:', loginResult.data.handle);
    console.log('  DID:', loginResult.data.did);
    console.log('');
    console.log('🎉 SUCCESS! Your Bluesky account is now connected.');
    console.log('');
    console.log('NEXT STEPS:');
    console.log('1. Refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)');
    console.log('2. Go to https://bridgingtheaisle.com/atproto-settings');
    console.log('3. You should see "Connected" status');
    console.log('4. Create a test post and click "Share to Bluesky" (no password needed!)');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    
    if (error.message?.includes('rate') || error.status === 429) {
      console.error('🚫 DIAGNOSIS: Bluesky rate limit still active');
      console.error('   Wait another 30-60 minutes before running this script again.');
    } else if (error.status === 401) {
      console.error('🚫 DIAGNOSIS: Authentication failed');
      console.error('   The app password may be invalid or the account may have issues.');
    } else {
      console.error('🚫 DIAGNOSIS: Unexpected error');
      console.error('   Details:', error);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

injectBlueskyToken();
