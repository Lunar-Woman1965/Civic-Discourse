
import crypto from 'crypto';

/**
 * Token Encryption Utility for Bluesky Access Tokens
 * 
 * Uses AES-256-GCM encryption to securely store user Bluesky tokens in the database.
 * The encryption key is derived from NEXTAUTH_SECRET to ensure consistency and security.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derives an encryption key from the NEXTAUTH_SECRET
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables');
  }
  
  // Use a fixed salt derived from the secret itself for deterministic key generation
  const salt = crypto.createHash('sha256').update(secret).digest();
  return crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts a Bluesky access token for secure storage
 * 
 * @param token - The plain text Bluesky access token (app password or session token)
 * @returns Encrypted token string in format: salt:iv:encrypted:tag
 */
export function encryptToken(token: string): string {
  if (!token) {
    throw new Error('Token cannot be empty');
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    // Combine all parts: iv:encrypted:tag
    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  } catch (error: any) {
    throw new Error(`Token encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts a Bluesky access token from storage
 * 
 * @param encryptedToken - Encrypted token string in format: iv:encrypted:tag
 * @returns Decrypted plain text token
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) {
    throw new Error('Encrypted token cannot be empty');
  }

  try {
    const parts = encryptedToken.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }

    const [ivHex, encryptedHex, tagHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = encryptedHex;
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: any) {
    throw new Error(`Token decryption failed: ${error.message}`);
  }
}

/**
 * Validates if a token string is properly encrypted
 * 
 * @param token - Token string to validate
 * @returns true if token appears to be encrypted
 */
export function isEncryptedToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split(':');
  return parts.length === 3 && parts.every(part => /^[0-9a-f]+$/.test(part));
}

/**
 * Securely compares two strings in constant time to prevent timing attacks
 * 
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
