/**
 * Crypto utility for encrypting sensitive data before sending to backend
 * Uses AES-256-GCM encryption for AWS credentials
 */

// Get encryption key from environment variable
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-32-char-encryption-key';

/**
 * Convert string to Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Convert Uint8Array to Base64 string
 */
function uint8ArrayToBase64(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(arr)));
}

/**
 * Convert Base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/**
 * Derive a cryptographic key from the encryption key string
 */
async function deriveKey(keyString: string): Promise<CryptoKey> {
  // Ensure key is exactly 32 bytes (256 bits)
  const keyBytes = stringToUint8Array(keyString.padEnd(32, '0').substring(0, 32));

  return await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - Data to encrypt (will be JSON stringified if object)
 * @returns Base64 encoded encrypted data with IV prepended
 */
export async function encryptData(data: any): Promise<string> {
  try {
    // Convert data to string if it's an object
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const dataBytes = stringToUint8Array(dataString);

    // Generate a random 12-byte IV (96 bits is recommended for GCM)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Derive the encryption key
    const key = await deriveKey(ENCRYPTION_KEY);

    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBytes
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Return as Base64
    return uint8ArrayToBase64(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Encrypt AWS credentials object
 * @param credentials - AWS credentials object with accessKeyId and secretAccessKey
 * @returns Encrypted credentials as Base64 string
 */
export async function encryptAWSCredentials(credentials: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
}): Promise<string> {
  return await encryptData(credentials);
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedBase64 - Base64 encoded encrypted data with IV prepended
 * @returns Decrypted data as string
 */
export async function decryptData(encryptedBase64: string): Promise<string> {
  try {
    // Convert from Base64
    const combined = base64ToUint8Array(encryptedBase64);

    // Extract IV (first 12 bytes) and ciphertext (rest including auth tag)
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    // Derive the encryption key
    const key = await deriveKey(ENCRYPTION_KEY);

    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    // Convert decrypted bytes to string
    const decryptedString = new TextDecoder().decode(decryptedData);
    return decryptedString;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Decrypt AWS credentials received from backend
 * @param encryptedCredentials - Encrypted Base64 string
 * @returns Decrypted credentials object
 */
export async function decryptAWSCredentials(encryptedCredentials: string): Promise<{
  access_key_id: string;
  secret_access_key: string;
  region: string;
  environment?: string;
}> {
  const decryptedString = await decryptData(encryptedCredentials);
  const credentials = JSON.parse(decryptedString);

  // Validate required fields
  if (!credentials.access_key_id || !credentials.secret_access_key || !credentials.region) {
    throw new Error('Missing required credential fields');
  }

  return credentials;
}

/**
 * Check if crypto is available in the browser
 */
export function isCryptoAvailable(): boolean {
  return !!(window.crypto && window.crypto.subtle);
}
