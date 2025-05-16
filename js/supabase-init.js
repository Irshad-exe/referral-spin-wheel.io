// Supabase initialization script
const SUPABASE_URL = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucXh3Y21uY3l0b2x6dHZ2cHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg0MjMsImV4cCI6MjA2MjM4NDQyM30.2Ad2Wv3YC9DwxOG82JBF21BGvkS6gbIFOpPXLCWkdso';

// Wait for Supabase to be available
function initializeSupabase() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
            console.log('Supabase initialized successfully');
            resolve(supabase);
        } else {
            const maxAttempts = 10;
            let attempts = 0;
            
            const checkSupabase = setInterval(() => {
                attempts++;
                if (window.supabase) {
                    clearInterval(checkSupabase);
                    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                        auth: {
                            autoRefreshToken: true,
                            persistSession: true,
                            detectSessionInUrl: true
                        }
                    });
                    console.log('Supabase initialized after waiting');
                    resolve(supabase);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkSupabase);
                    console.error('Failed to initialize Supabase: Library not loaded');
                    reject(new Error('Supabase library not loaded after multiple attempts'));
                }
            }, 300);
        }
    });
}

// Export the initialization function
window.initializeSupabase = initializeSupabase;