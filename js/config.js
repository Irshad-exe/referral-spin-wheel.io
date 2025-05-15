// Supabase Configuration
const SUPABASE_URL = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucXh3Y21uY3l0b2x6dHZ2cHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg0MjMsImV4cCI6MjA2MjM4NDQyM30.2Ad2Wv3YC9DwxOG82JBF21BGvkS6gbIFOpPXLCWkdso';

// Initialize Supabase client with proper configuration
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Export configuration
export { SUPABASE_URL, SUPABASE_ANON_KEY, supabase };

// Prize configuration for the spin wheel
const PRIZES = [
    { text: '1 Ladoo', weight: 40 },
    { text: '2 Ladoos', weight: 20 },
    { text: 'Try Again', weight: 30 },
    { text: '3 Ladoos', weight: 10 }
];

// Function to pick a weighted random prize
const pickWeightedIndex = (prizes) => {
    let total = prizes.reduce((s, p) => s + p.weight, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < prizes.length; i++) {
        if (rand < prizes[i].weight) return i;
        rand -= prizes[i].weight;
    }
    return 0;
};