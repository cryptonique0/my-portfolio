import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Token Generation and Validation
 */
class CSRFProtection {
  private tokenStore = new Map<string, { token: string; expiry: number }>();

  generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour

    this.tokenStore.set(sessionId, { token, expiry });
    
    // Cleanup expired tokens
    this.cleanup();

    return token;
  }

  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokenStore.get(sessionId);
    
    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expiry) {
      this.tokenStore.delete(sessionId);
      return false;
    }

    return stored.token === token;
  }

  private cleanup() {
    const now = Date.now();
    for (const [sessionId, data] of this.tokenStore.entries()) {
      if (now > data.expiry) {
        this.tokenStore.delete(sessionId);
      }
    }
  }
}

const csrfProtection = new CSRFProtection();

/**
 * Middleware to add CSRF token to response
 */
export const addCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.ip || 'default';
  const token = csrfProtection.generateToken(sessionId);
  
  res.setHeader('X-CSRF-Token', token);
  res.locals.csrfToken = token;
  
  next();
};

/**
 * Middleware to validate CSRF token
 */
export const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const sessionId = req.ip || 'default';
  const token = req.headers['x-csrf-token'] as string;

  if (!token || !csrfProtection.validateToken(sessionId, token)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
    });
  }

  next();
};

/**
 * Advanced security headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.basescan.org https://base-mainnet.g.alchemy.com"
  );
  
  // Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  next();
};

/**
 * Rate limiting per IP with different tiers
 */
export const createAdvancedRateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();

    const record = requests.get(identifier);

    if (!record || now > record.resetTime) {
      requests.set(identifier, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return next();
    }

    if (record.count >= options.maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    record.count++;
    
    if (!options.skipSuccessfulRequests || res.statusCode >= 400) {
      requests.set(identifier, record);
    }

    next();
  };
};

/**
 * API Key validation middleware
 */
export const validateAPIKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validKeys = (process.env.API_KEYS || '').split(',');

  if (!apiKey || !validKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
    });
  }

  next();
};

/**
 * IP Whitelist middleware
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip;

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    next();
  };
};

/**
 * Request signature validation
 */
export const validateRequestSignature = (secret: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

    if (!signature || !timestamp) {
      return res.status(401).json({
        success: false,
        error: 'Missing signature or timestamp',
      });
    }

    // Check timestamp (reject requests older than 5 minutes)
    const requestTime = parseInt(timestamp, 10);
    const now = Date.now();
    if (now - requestTime > 300000) {
      return res.status(401).json({
        success: false,
        error: 'Request expired',
      });
    }

    // Validate signature
    const payload = JSON.stringify(req.body) + timestamp;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature',
      });
    }

    next();
  };
};
