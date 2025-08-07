/**
 * UUID Generator Utility
 * Generates RFC 4122 compliant UUIDs for conversation IDs and other identifiers
 */

/**
 * Generate a random UUID v4
 * @returns {string} A valid UUID v4 string
 */
export function generateUUID() {
  // Generate random bytes
  const randomBytes = new Uint8Array(16);
  
  // Use crypto if available (React Native), otherwise use Math.random as fallback
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 16; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Set version (4) and variant bits
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // Version 4
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // Variant 10

  // Convert to hex string with dashes
  const hex = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

/**
 * Generate a conversation ID for Dr. JEG API
 * @returns {string} A valid UUID for conversation ID
 */
export function generateConversationId() {
  return generateUUID();
}

/**
 * Validate if a string is a valid UUID
 * @param {string} uuid - The UUID string to validate
 * @returns {boolean} True if valid UUID, false otherwise
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate a short unique ID (not UUID compliant, but shorter)
 * @returns {string} A short unique identifier
 */
export function generateShortId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
