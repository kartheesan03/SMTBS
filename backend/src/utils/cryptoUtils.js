const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.FIELD_ENCRYPTION_KEY || 'smtbms_default_encryption_key_32b';

// Ensure key is exactly 32 bytes for AES-256
const KEY = Buffer.from(SECRET_KEY.padEnd(32, '0').slice(0, 32));
const IV_LENGTH = 16;

/**
 * Encrypts a plain text string.
 * @param {string} text - The value to encrypt.
 * @returns {string} - Encrypted value as "iv:encrypted" hex string, or null if input is null/undefined.
 */
const encrypt = (text) => {
    if (text === null || text === undefined) return null;
    const str = String(text);
    // Skip if already encrypted (has iv:encrypted format)
    if (/^[0-9a-f]{32}:[0-9a-f]+$/i.test(str)) return str;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
        const encrypted = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (err) {
        console.error('[Crypto] Encrypt error:', err.message);
        return text;
    }
};

/**
 * Decrypts an encrypted string back to plain text.
 * @param {string} hash - The "iv:encrypted" hex string.
 * @returns {string} - Decrypted plain text, or the original value if not encrypted.
 */
const decrypt = (hash) => {
    if (hash === null || hash === undefined) return null;
    const str = String(hash);
    // Only decrypt if it matches our format
    if (!/^[0-9a-f]{32}:[0-9a-f]+$/i.test(str)) return str;
    try {
        const [ivHex, encryptedHex] = str.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        // If decryption fails (e.g., old plain text data), return original
        return hash;
    }
};

module.exports = { encrypt, decrypt };
