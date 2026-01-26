import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

/**
 * Validate and sanitize wallet address
 */
export const sanitizeAddress = (address: string): string | null => {
  // Base/Ethereum address format: 0x followed by 40 hex characters
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  // Stacks address format: SP or ST followed by alphanumeric
  const stacksAddressRegex = /^(SP|ST)[0-9A-Z]+$/;

  if (ethAddressRegex.test(address) || stacksAddressRegex.test(address)) {
    return address;
  }

  return null;
};

/**
 * Validate URL
 */
export const isValidURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Sanitize user input for display
 */
export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Rate limit helper for client-side
 */
export class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(time => now - time < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * Secure localStorage wrapper
 */
export class SecureStorage {
  private prefix = 'bitart_';

  setItem(key: string, value: any, encrypt = false): void {
    try {
      const data = JSON.stringify(value);
      const storageKey = this.prefix + key;
      
      if (encrypt && typeof window !== 'undefined') {
        // Simple obfuscation (in production, use proper encryption)
        const encoded = btoa(data);
        localStorage.setItem(storageKey, encoded);
      } else {
        localStorage.setItem(storageKey, data);
      }
    } catch (error) {
      console.error('SecureStorage: Failed to save item', error);
    }
  }

  getItem<T>(key: string, decrypt = false): T | null {
    try {
      const storageKey = this.prefix + key;
      const data = localStorage.getItem(storageKey);
      
      if (!data) return null;
      
      if (decrypt && typeof window !== 'undefined') {
        const decoded = atob(data);
        return JSON.parse(decoded);
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('SecureStorage: Failed to retrieve item', error);
      return null;
    }
  }

  removeItem(key: string): void {
    const storageKey = this.prefix + key;
    localStorage.removeItem(storageKey);
  }

  clear(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const secureStorage = new SecureStorage();
