import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL     = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const PRIZES = [
  { text: '1 Ladoo',   weight: 40 },
  { text: '2 Ladoos',  weight: 20 },
  { text: 'Try Again', weight: 30 },
  { text: '3 Ladoos',  weight: 10 }
];
