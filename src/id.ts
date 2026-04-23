const AUTO_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const AUTO_ID_LENGTH = 20;
// Largest multiple of AUTO_ID_CHARS.length that fits in a byte.
// Bytes at or above this value are discarded so the modulo below is unbiased.
const MAX_MULTIPLE = Math.floor(256 / AUTO_ID_CHARS.length) * AUTO_ID_CHARS.length;
// Over-allocate to amortize rejected bytes: acceptance rate is ~97% (248/256),
// so 2× AUTO_ID_LENGTH almost always fills the ID in a single iteration.
const RANDOM_BYTES_PER_ITERATION = AUTO_ID_LENGTH * 2;

/**
 * Generates a random ID matching Firestore's auto-generated document ID format.
 * 20 characters from [A-Za-z0-9], with rejection sampling to avoid modulo bias.
 * Ported from `@firebase/firestore`'s `AutoId.newId()`.
 */
export const generateDocumentId = (): string => {
  let id = '';

  while (id.length < AUTO_ID_LENGTH) {
    const bytes = new Uint8Array(RANDOM_BYTES_PER_ITERATION);
    crypto.getRandomValues(bytes);

    for (let i = 0; i < bytes.length && id.length < AUTO_ID_LENGTH; i++) {
      const byte = bytes[i]!;
      if (byte < MAX_MULTIPLE) {
        id += AUTO_ID_CHARS.charAt(byte % AUTO_ID_CHARS.length);
      }
    }
  }

  return id;
};
