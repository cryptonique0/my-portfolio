/**
 * Supabase Database Client Configuration
 * Handles connection to PostgreSQL database with real-time capabilities
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  logger.warn('Missing Supabase environment variables - using placeholder values for development');
  logger.warn('For production, set: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Supabase client for API requests (with Row Level Security)
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key', 
  {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Supabase admin client (bypasses RLS - use carefully)
 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseServiceKey || 'placeholder-service-key', 
  {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Health check for Supabase connection
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('count()', { count: 'exact' }).limit(1);
    
    if (error) {
      logger.error('Supabase health check failed:', error);
      return false;
    }
    
    logger.info('✅ Supabase connection established');
    return true;
  } catch (error) {
    logger.error('Supabase health check error:', error);
    return false;
  }
}

/**
 * Initialize Supabase (call once on app startup)
 */
export async function initializeSupabase(): Promise<void> {
  const isHealthy = await checkSupabaseHealth();
  
  if (!isHealthy) {
    logger.warn('Supabase health check failed - continuing anyway');
  }
}

export default supabase;
