import { PrismaClient } from '@prisma/client';
import { BskyAgent } from '@atproto/api';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Encryption utilities (must match bluesky-token-encryption.ts)
const ENCRYPTION_KEY = process.env.BLUESKY_TOKEN_ENCRYPTION_KEY || 'default-key-please-change-in-production-32chars!!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function encryptToken(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

async function connectBroadcasterToBluesky() {
  const broadcasterEmail = 'bta-social.sharing@bridgingtheaisle.com';
  const identifier = 'bta-broadcast.bsky.social';  // Correct Bluesky handle
  const appPassword = '7shc-yibm-3zsc-3esn';  // Latest app password
  
  console.log('🔍 Finding platform broadcaster account...');
  
  const broadcaster = await prisma.user.findUnique({
    where: { email: broadcasterEmail },
    select: {
      id: true,
      email: true,
      username: true,
      isAdmin: true,
      role: true
    }
  });
  
  if (!broadcaster) {
    console.error('❌ Platform broadcaster account not found!');
    process.exit(1);
  }
  
  console.log('✅ Found broadcaster account:', {
    id: broadcaster.id,
    email: broadcaster.email,
    username: broadcaster.username,
    role: broadcaster.role
  });
  
  // Step 1: Authenticate with Bluesky
  console.log('\n🔐 Authenticating with Bluesky...');
  const agent = new BskyAgent({ service: 'https://bsky.social' });
  
  let loginResult;
  try {
    loginResult = await agent.login({
      identifier,
      password: appPassword,
    });
    console.log('✅ Successfully authenticated with Bluesky!');
  } catch (authError: any) {
    console.error('❌ Authentication failed:', authError.message);
    process.exit(1);
  }
  
  // Step 2: Extract credentials
  const handle = loginResult.data.handle;
  const did = loginResult.data.did;
  const accessToken = loginResult.data.accessJwt;
  const refreshToken = loginResult.data.refreshJwt;
  
  console.log('\n📋 Bluesky Account Details:');
  console.log('   Handle:', handle);
  console.log('   DID:', did);
  
  // Step 3: Encrypt tokens
  console.log('\n🔒 Encrypting tokens...');
  const encryptedAccessToken = encryptToken(accessToken);
  const encryptedRefreshToken = encryptToken(refreshToken);
  
  // Step 4: Calculate token expiry (Bluesky access tokens expire in 2 hours)
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 2);
  
  // Step 5: Update the user with Bluesky credentials
  console.log('💾 Storing Bluesky credentials in database...');
  await prisma.user.update({
    where: { id: broadcaster.id },
    data: {
      atprotoHandle: handle,
      atprotoDid: did,
      atprotoEmail: identifier,
      blueskyEncryptedToken: encryptedAccessToken,
      blueskyEncryptedRefreshToken: encryptedRefreshToken,
      blueskyTokenExpiry: tokenExpiry,
      blueskyConnectedAt: new Date(),
      atprotoBroadcastEnabled: true,
      atprotoLinkedAt: new Date(),
      lastActive: new Date()
    }
  });
  
  console.log('\n✅ Successfully connected platform broadcaster to Bluesky!');
  console.log('\n📋 Final Connection Details:');
  console.log('   Email:', identifier);
  console.log('   Handle:', handle);
  console.log('   DID:', did);
  console.log('   Broadcasting: ENABLED');
  console.log('   Token Expiry:', tokenExpiry.toISOString());
  console.log('\n🎉 Centralized broadcasting is now ready!');
  
  await prisma.$disconnect();
}

connectBroadcasterToBluesky().catch(console.error);
