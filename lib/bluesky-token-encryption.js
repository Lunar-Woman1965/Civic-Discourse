"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureCompare = exports.isEncryptedToken = exports.decryptToken = exports.encryptToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
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
function getEncryptionKey() {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error('NEXTAUTH_SECRET is not defined in environment variables');
    }
    // Use a fixed salt derived from the secret itself for deterministic key generation
    const salt = crypto_1.default.createHash('sha256').update(secret).digest();
    return crypto_1.default.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}
/**
 * Encrypts a Bluesky access token for secure storage
 *
 * @param token - The plain text Bluesky access token (app password or session token)
 * @returns Encrypted token string in format: salt:iv:encrypted:tag
 */
function encryptToken(token) {
    if (!token) {
        throw new Error('Token cannot be empty');
    }
    try {
        const key = getEncryptionKey();
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(token, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        // Combine all parts: iv:encrypted:tag
        return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    }
    catch (error) {
        throw new Error(`Token encryption failed: ${error.message}`);
    }
}
exports.encryptToken = encryptToken;
/**
 * Decrypts a Bluesky access token from storage
 *
 * @param encryptedToken - Encrypted token string in format: iv:encrypted:tag
 * @returns Decrypted plain text token
 */
function decryptToken(encryptedToken) {
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
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        throw new Error(`Token decryption failed: ${error.message}`);
    }
}
exports.decryptToken = decryptToken;
/**
 * Validates if a token string is properly encrypted
 *
 * @param token - Token string to validate
 * @returns true if token appears to be encrypted
 */
function isEncryptedToken(token) {
    if (!token)
        return false;
    const parts = token.split(':');
    return parts.length === 3 && parts.every(part => /^[0-9a-f]+$/.test(part));
}
exports.isEncryptedToken = isEncryptedToken;
/**
 * Securely compares two strings in constant time to prevent timing attacks
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
function secureCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return crypto_1.default.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
exports.secureCompare = secureCompare;
