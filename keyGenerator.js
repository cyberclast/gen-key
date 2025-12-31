const crypto = require('crypto');

// Character sets for password generation
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*()_+-[]{}|;:\'",.<>?';
const BASE31 = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.toLowerCase();

/**
 * Generates a cryptographically secure key in hexadecimal format.
 * @param {number} bits - Number of bits to generate (default: 256 bits)
 * @returns {string} A hexadecimal string representing the random data
 */
function generateHexKey(bits = 256) {
    const bytes = Math.ceil(bits / 8);
    const buffer = crypto.randomBytes(bytes);
    return buffer.toString('hex');
}

/**
 * Generates a cryptographically secure key in base31 format.
 * @param {number} bits - Number of bits to generate (default: 256 bits)
 * @returns {string} A base31-encoded string representing the random data
 */
function generateBase31Key(bits = 256) {
    let base31Key = '';

    const requiredLength = Math.ceil(((bits / 5) * 32) / 31); // Each base31 character encodes *almost* (only 31/32nds of) 5 bits

    while (base31Key.length < requiredLength) {
        let byte = null;
        while (byte === null || byte.valueOf() > 30) {
            byte = crypto.randomBytes(1)[0];
        }
        base31Key += BASE31[byte];
    }
    return base31Key;
}

/**
 * Generates a cryptographically secure key in base64url format.
 * @param {number} bits - Number of bits to generate (default: 256 bits)
 * @returns {string} A base64url string representing the random data
 */
function generateBase64UrlKey(bits = 256) {
    const bytes = Math.ceil(bits / 8);
    const buffer = crypto.randomBytes(bytes);
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''); // Remove padding
}

/**
 * Generates a cryptographically secure random password with configurable character sets.
 * @param {number} length - Length of the password (default: 20)
 * @param {Object} options - Character set options
 * @param {boolean} options.uppercase - Include uppercase letters (default: true)
 * @param {boolean} options.lowercase - Include lowercase letters (default: true)
 * @param {boolean} options.numbers - Include numbers (default: true)
 * @param {boolean} options.special - Include special characters (default: true)
 * @param {string} options.specialChars - String of special characters to use (default: SPECIAL)
 * @returns {string} A random password with selected character types
 */
function generatePassword(length = 20, options = {}) {
    const { uppercase = true, lowercase = true, numbers = true, special = true, specialChars = SPECIAL } = options;

    // Validate specialChars doesn't contain letters or numbers
    if (specialChars && /[A-Za-z0-9]/.test(specialChars)) {
        throw new Error('Special characters must not contain letters (A-Z, a-z) or numbers (0-9)');
    }

    // Build character sets based on options
    const charSets = [];
    if (uppercase) {
        charSets.push(UPPERCASE);
    }
    if (lowercase) {
        charSets.push(LOWERCASE);
    }
    if (numbers) {
        charSets.push(NUMBERS);
    }
    if (special && specialChars) {
        charSets.push(specialChars);
    }

    if (charSets.length === 0) {
        throw new Error('At least one character set must be enabled');
    }

    if (length < charSets.length) {
        throw new Error(
            `Password length must be at least ${charSets.length} to guarantee all selected character types`
        );
    }

    const password = [];

    // Guarantee at least one character from each enabled set
    for (const charset of charSets) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password.push(charset[randomIndex]);
    }

    // Fill remaining characters randomly from all enabled sets combined
    const allChars = charSets.join('');
    for (let i = password.length; i < length; i++) {
        const randomIndex = crypto.randomInt(0, allChars.length);
        password.push(allChars[randomIndex]);
    }

    // Shuffle the password array using Fisher-Yates algorithm with crypto.randomInt
    for (let i = password.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
}

module.exports = {
    generateHexKey,
    generateBase31Key,
    generateBase64UrlKey,
    generatePassword,
    SPECIAL, // Export so it can be modified by configuration
};
