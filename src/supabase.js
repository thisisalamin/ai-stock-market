import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://obcmnsjuydouaiizjcyp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iY21uc2p1eWRvdWFpaXpqY3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNTMzNjcsImV4cCI6MjA1NzgyOTM2N30.kMh8w3VDoq0LkTBTAG4PShoRgZGA3pMGQF25ytbdSgw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
