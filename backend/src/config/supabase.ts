import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import winston from 'winston'

dotenv.config()

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const supabaseUrl = process.env.SUPABASE_URL?.trim() || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim() || ''

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig = 
  supabaseUrl && supabaseUrl.length > 0 &&
  supabaseServiceRoleKey && supabaseServiceRoleKey.length > 0 &&
  supabaseAnonKey && supabaseAnonKey.length > 0 &&
  supabaseUrl.includes('.supabase.co');

let supabaseAdmin: any = null;
let supabase: any = null;

if (hasValidSupabaseConfig) {
  try {
    // Admin client for server-side operations (bypasses RLS)
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Regular client for user operations (respects RLS)
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    logger.info('Supabase connected successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Supabase error';
    logger.warn('Supabase connection failed, continuing with limited functionality:', { error: errorMessage });
  }
} else {
  logger.warn('Supabase configuration missing or invalid, running in offline mode');
}

// Export with null checks
export { supabaseAdmin, supabase, supabaseUrl, supabaseAnonKey, hasValidSupabaseConfig } 