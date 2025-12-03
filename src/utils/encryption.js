import CryptoJS from 'crypto-js';

/**
 * Encrypt data using user ID as the key
 * This provides basic encryption - data is unreadable in Firebase
 * but can be decrypted by anyone with the user ID
 */
export function encryptData(data, userId) {
  try {
    if (!data || !userId) return data;
    
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, userId).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return data; // Return original data if encryption fails
  }
}

/**
 * Decrypt data using user ID as the key
 */
export function decryptData(encryptedData, userId) {
  try {
    if (!encryptedData || !userId) return encryptedData;
    
    // If data doesn't look encrypted, return as is (for backward compatibility)
    if (!encryptedData.includes('U2FsdGVk')) {
      return encryptedData;
    }
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, userId);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      console.warn('Decryption failed - empty result');
      return encryptedData;
    }
    
    // Try to parse as JSON, if fails return as string
    try {
      return JSON.parse(jsonString);
    } catch {
      return jsonString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData; // Return encrypted data if decryption fails
  }
}

/**
 * Check if data appears to be encrypted
 */
export function isEncrypted(data) {
  if (typeof data !== 'string') return false;
  return data.includes('U2FsdGVk'); // AES encrypted data starts with this
}
