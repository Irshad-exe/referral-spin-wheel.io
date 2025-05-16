// js/auth.js - Updated version
const SUPABASE_URL = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucXh3Y21uY3l0b2x6dHZ2cHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg0MjMsImV4cCI6MjA2MjM4NDQyM30.2Ad2Wv3YC9DwxOG82JBF21BGvkS6gbIFOpPXLCWkdso';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Define base URL for GitHub Pages
const BASE_URL = "https://irshad-exe.github.io/referral-spin-wheel.io";

// Define routes with BASE_URL
const ROUTES = {
    HOME: `${BASE_URL}/index.html`,
    LOGIN: `${BASE_URL}/login.html`,
    DASHBOARD: `${BASE_URL}/dashboard.html`,
    CLIENTS: `${BASE_URL}/clients.html`,
    REFERRALS: `${BASE_URL}/referrals.html`,
    SPIN: `${BASE_URL}/spin.html`
};

// Check if user is authenticated and is admin
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
            return { authenticated: false };
        }
        
        // Check if user is admin - first check if table exists
        try {
            // Try a simpler approach - check if the user's email is in the allowed admin emails
            // This avoids potential issues with the admin_users table
            const adminEmails = ['admin@lakshinvestment.com', 'rajtanna@lakshinvestment.in']; // Add your admin emails here
            const isAdmin = adminEmails.includes(session.user.email.toLowerCase());
            
            return { 
                authenticated: true, 
                isAdmin: isAdmin,
                user: session.user
            };
        } catch (adminError) {
            console.error('Error checking admin status:', adminError);
            return { authenticated: true, isAdmin: false, user: session.user };
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return { authenticated: false, error };
    }
}

// Redirect if not authenticated
async function requireAuth() {
    const { authenticated, isAdmin } = await checkAuth();
    
    if (!authenticated) {
        window.location.href = ROUTES.LOGIN;
        return false;
    }
    
    if (!isAdmin) {
        alert('You do not have admin privileges.');
        window.location.href = ROUTES.LOGIN;
        return false;
    }
    
    return true;
}

// Login function
async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            return { success: false, error: error.message };
        }
        
        // Check if user is admin using the simplified approach
        const adminEmails = ['rajtanna@lakshinvestment.in']; // Add your admin emails here
        const isAdmin = adminEmails.includes(data.user.email.toLowerCase());
        
        if (!isAdmin) {
            await supabase.auth.signOut();
            return { success: false, error: 'Access denied. Admin privileges required.' };
        }
        
        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message || 'An error occurred during login' };
    }
}

// Logout function
async function logout() {
    await supabase.auth.signOut();
    window.location.href = ROUTES.HOME;
}

// Generate spin URL with BASE_URL
function generateSpinUrl(token) {
    return `${BASE_URL}/spin.html?token=${token}`;
}

// Export functions and constants
window.auth = {
    checkAuth,
    requireAuth,
    login,
    logout,
    supabase,
    BASE_URL,
    ROUTES,
    generateSpinUrl
};
