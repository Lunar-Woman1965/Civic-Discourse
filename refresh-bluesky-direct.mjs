/**
 * Direct Bluesky Token Refresh Script (Pure JavaScript)
 * Uses Prisma and @atproto/api directly
 */

import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;
import atprotoPkg from '@atproto/api';
const { BskyAgent } = atprotoPkg;
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LOG_DIR = '/home/ubuntu/bridgingtheaisle/logs';
const LOG_FILE = path.join(LOG_DIR, 'token-refresh.log');
const MAX_LOG_LINES = 100;

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(level, message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logLine = `${timestamp} | ${level.padEnd(7)} | ${message}\n`;
  
  console.log(logLine.trim());
  
  try {
    fs.appendFileSync(LOG_FILE, logLine);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

function trimLogFile() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length > MAX_LOG_LINES) {
        const trimmed = lines.slice(-MAX_LOG_LINES).join('\n') + '\n';
        fs.writeFileSync(LOG_FILE, trimmed);
      }
    }
  } catch (error) {
    log('ERROR', `Failed to trim log file: ${error}`);
  }
}

// Token encryption/decryption functions
function getEncryptionKey() {
  const key = Buffer.from(process.env.BLUESKY_TOKEN_ENCRYPTION_KEY || '', 'hex');
  if (key.length !== 32) {
    throw new Error('Invalid encryption key');
  }
  return key;
}

function decryptToken(encryptedData) {
  try {
    const key = getEncryptionKey();
    const parts = encryptedData.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted data format');
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

function encryptToken(token) {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(token);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

function needsTokenRefresh(tokenExpiry) {
  if (!tokenExpiry) return true;
  const REFRESH_BUFFER_MS = 15 * 60 * 1000;
  return new Date(tokenExpiry).getTime() - Date.now() < REFRESH_BUFFER_MS;
}

async function refreshUserToken(user) {
  try {
    if (!user.blueskyEncryptedRefreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const refreshToken = decryptToken(user.blueskyEncryptedRefreshToken);
    
    const agent = new BskyAgent({ service: 'https://bsky.social' });
    
    // Use the refresh token to get new tokens
    const response = await agent.com.atproto.server.refreshSession(
      {},
      { headers: { authorization: `Bearer ${refreshToken}` } }
    );

    if (!response.success) {
      return { success: false, error: 'Token refresh failed' };
    }

    const { accessJwt, refreshJwt } = response.data;
    
    // Decode JWT to get expiry
    const payload = JSON.parse(Buffer.from(accessJwt.split('.')[1], 'base64').toString());
    const expiresAt = new Date(payload.exp * 1000);

    // Update database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        blueskyEncryptedToken: encryptToken(accessJwt),
        blueskyEncryptedRefreshToken: encryptToken(refreshJwt),
        blueskyTokenExpiry: expiresAt,
      },
    });

    return { success: true, expiresAt };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function refreshAllBlueskyTokens() {
  const summary = {
    total: 0,
    refreshed: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  try {
    const users = await prisma.user.findMany({
      where: {
        blueskyConnectedAt: { not: null },
        blueskyEncryptedToken: { not: null },
      },
    });

    summary.total = users.length;
    log('INFO', `Found ${users.length} Bluesky-connected users`);

    for (const user of users) {
      try {
        if (!needsTokenRefresh(user.blueskyTokenExpiry)) {
          log('INFO', `Skipping ${user.username} - token still valid`);
          summary.skipped++;
          continue;
        }

        log('INFO', `Refreshing token for ${user.username}...`);
        const result = await refreshUserToken(user);

        if (result.success) {
          log('INFO', `✅ Refreshed token for ${user.username}`);
          summary.refreshed++;
        } else {
          log('WARNING', `❌ Failed to refresh token for ${user.username}: ${result.error}`);
          summary.failed++;
          summary.errors.push(`${user.username}: ${result.error}`);
        }
      } catch (error) {
        log('ERROR', `Error processing ${user.username}: ${error.message}`);
        summary.failed++;
        summary.errors.push(`${user.username}: ${error.message}`);
      }
    }
  } catch (error) {
    log('ERROR', `Database error: ${error.message}`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  return summary;
}

async function main() {
  try {
    log('INFO', '='.repeat(60));
    log('INFO', 'Bluesky Token Auto-Refresh Task Started');
    log('INFO', '='.repeat(60));
    
    const summary = await refreshAllBlueskyTokens();
    
    log('INFO', `✅ Token refresh completed`);
    log('INFO', `   Total: ${summary.total}`);
    log('INFO', `   Refreshed: ${summary.refreshed}`);
    log('INFO', `   Skipped: ${summary.skipped}`);
    log('INFO', `   Failed: ${summary.failed}`);
    
    if (summary.errors.length > 0) {
      for (const error of summary.errors) {
        log('WARNING', `   Error: ${error}`);
      }
    }
    
    if (summary.failed === 0) {
      log('INFO', '✅ Task completed successfully');
    } else {
      log('WARNING', '⚠️ Task completed with errors');
    }
    
    trimLogFile();
    
    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    log('ERROR', `🛑 Fatal error: ${error.message || error}`);
    console.error(error);
    trimLogFile();
    process.exit(1);
  }
}

main();
