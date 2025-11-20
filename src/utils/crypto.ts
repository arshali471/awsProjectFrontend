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
 * @returns Encrypted string in format "iv:encrypted:authTag" (matching backend format)
 */
export async function encryptData(data: any): Promise<string> {
  try {
    // Convert data to string if it's an object
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const dataBytes = stringToUint8Array(dataString);

    // Generate a random 12-byte IV (96 bits is recommended for GCM)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Derive the encryption key using PBKDF2 to match backend
    const keyBytes = stringToUint8Array(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    const salt = stringToUint8Array('aws-credentials-salt');

    // Import password as key material
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive key using PBKDF2 (matching backend's deriveKey function)
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBytes
    );

    // In GCM mode, the encrypted result contains ciphertext + auth tag (last 16 bytes)
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const ciphertext = encryptedArray.slice(0, -16);
    const authTag = encryptedArray.slice(-16);

    // Convert to Base64 and return in backend format: "iv:encrypted:authTag"
    const ivBase64 = uint8ArrayToBase64(iv);
    const encryptedBase64 = uint8ArrayToBase64(ciphertext);
    const authTagBase64 = uint8ArrayToBase64(authTag);

    return `${ivBase64}:${encryptedBase64}:${authTagBase64}`;
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
 * @param encryptedData - Encrypted string in format "iv:encrypted:authTag" (from backend)
 * @returns Decrypted data as string
 */
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    // Backend format: "iv:encrypted:authTag" (all Base64 encoded)
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format - expected "iv:encrypted:authTag"');
    }

    const [ivBase64, encryptedBase64, authTagBase64] = parts;

    // Convert from Base64
    const iv = base64ToUint8Array(ivBase64);
    const encrypted = base64ToUint8Array(encryptedBase64);
    const authTag = base64ToUint8Array(authTagBase64);

    // Combine encrypted data and auth tag for Web Crypto API
    // Web Crypto expects ciphertext with auth tag appended
    const ciphertext = new Uint8Array(encrypted.length + authTag.length);
    ciphertext.set(encrypted, 0);
    ciphertext.set(authTag, encrypted.length);

    // Derive the encryption key using PBKDF2 to match backend
    const keyBytes = stringToUint8Array(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    const salt = stringToUint8Array('aws-credentials-salt');

    // Import password as key material
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive key using PBKDF2 (matching backend's deriveKey function)
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

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
