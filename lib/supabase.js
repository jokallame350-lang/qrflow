import { createClient } from '@supabase/supabase-js';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = (envUrl && envUrl.trim().length > 0) ? envUrl.trim() : 'https://placeholder.supabase.co';
const supabaseAnonKey = (envKey && envKey.trim().length > 0) ? envKey.trim() : 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
