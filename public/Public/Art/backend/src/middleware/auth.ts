/**
 * Auth Middleware
 * - Supabase JWT verification
 * - App JWT verification
 * - Role-based access control (RBAC)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { getConfig } from '../config/env';

const config = getConfig();

export interface AuthUser {
  id: string;
  email?: string;
  wallet_address?: string;
  role?: 'user' | 'creator' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser | null;
    }
  }
}

function getTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}

export async function requireSupabaseAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: 'Missing Authorization token' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });

    req.authUser = {
      id: data.user.id,
      email: data.user.email || undefined,
      role: (data.user.user_metadata?.role as any) || undefined,
    };

    next();
  } catch (err) {
    logger.error('Supabase auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAppJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: 'Missing Authorization token' });

    const payload = jwt.verify(token, config.jwtSecret) as any;

    req.authUser = {
      id: payload.sub,
      email: payload.email,
      wallet_address: payload.wallet_address,
      role: payload.role,
    };

    next();
  } catch (err) {
    logger.warn('App JWT invalid:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: Array<'user' | 'creator' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (!user.role || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = getTokenFromHeader(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    req.authUser = {
      id: payload.sub,
      email: payload.email,
      wallet_address: payload.wallet_address,
      role: payload.role,
    };
  } catch {
    req.authUser = null;
  }
  next();
}

// Alias for backward compatibility
export const authenticateToken = requireAppJWT;
