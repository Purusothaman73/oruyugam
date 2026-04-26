import { createClient } from '@supabase/supabase-js';

// These will be populated by the user via the UI
let supabaseUrl = '';
let supabaseKey = '';

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
};

export const setSupabaseConfig = (url: string, key: string) => {
  supabaseUrl = url;
  supabaseKey = key;
};
