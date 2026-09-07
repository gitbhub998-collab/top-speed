import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey);

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase environment variables are not fully configured.');
}

export const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseAnonKey || 'placeholder-key', {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { 'x-test': 'true' } },
});

export const supabaseAdmin = createClient(supabaseUrl || 'https://example.supabase.co', supabaseServiceRoleKey || 'placeholder-key', {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { 'x-test': 'true' } },
});
