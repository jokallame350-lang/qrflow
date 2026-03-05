import { createClient } from '@supabase/supabase-js';

function initSupabase() {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || typeof url !== 'string' || url.trim() === '') {
        url = 'https://placeholder.supabase.co';
    }

    if (!key || typeof key !== 'string' || key.trim() === '') {
        key = 'placeholder-key';
    }

    return createClient(url, key);
}

export const supabase = initSupabase();
