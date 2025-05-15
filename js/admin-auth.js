// Admin Authentication Utilities
const SUPABASE_URL = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucXh3Y21uY3l0b2x6dHZ2cHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg0MjMsImV4cCI6MjA2MjM4NDQyM30.2Ad2Wv3YC9DwxOG82JBF21BGvkS6gbIFOpPXLCWkdso';

// Initialize Supabase client
let supabase = null;

// Function to wait for Supabase to be loaded
async function waitForSupabase() {
    return new Promise((resolve) => {
        if (window.supabase) {
            resolve();
        } else {
            const checkSupabase = setInterval(() => {
                if (window.supabase) {
                    clearInterval(checkSupabase);
                    resolve();
                }
            }, 100);
        }
    });
}

// Initialize Supabase client
async function initializeSupabase() {
    await waitForSupabase();
    console.log('Supabase loaded, initializing client...');
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
    console.log('Supabase client initialized');
    return supabase;
}

// Function to get the initialized client
async function getSupabaseClient() {
    if (!supabase) {
        console.log('Supabase client not initialized, initializing now...');
        await initializeSupabase();
    }
    return supabase;
}

console.log('Admin Auth Script Loaded'); // Debug log

// Check if user is admin
async function isUserAdmin(userId) {
    try {
        console.log('Checking admin status for user:', userId);
        const supabaseClient = await getSupabaseClient();
        
        // First check if the user exists in admin_users table
        const { data: adminData, error: adminError } = await supabaseClient
            .from('admin_users')
            .select('*')
            .eq('id', userId)
            .single();

        if (adminError) {
            console.error('Error checking admin_users table:', adminError);
            return false;
        }

        console.log('Admin check result:', !!adminData);
        return !!adminData;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        console.log('Starting sign in process...');
        
        // Ensure Supabase is initialized
        const supabaseClient = await getSupabaseClient();
        console.log('Supabase client ready for sign in');
        
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError) {
            console.error('Auth error:', authError);
            throw authError;
        }

        console.log('Auth successful, checking admin status...');
        // Check if user is admin
        const isAdmin = await isUserAdmin(authData.user.id);
        console.log('Admin check result:', isAdmin);

        if (!isAdmin) {
            console.log('User is not an admin, signing out...');
            await supabaseClient.auth.signOut();
            throw new Error('Access denied. Admin privileges required.');
        }

        // Store the session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) {
            console.error('Error getting session:', sessionError);
            throw sessionError;
        }

        console.log('Sign in successful for admin user');
        return { 
            success: true, 
            user: authData.user,
            session: session
        };
    } catch (error) {
        console.error('Sign in error:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to sign in. Please check your credentials.'
        };
    }
}

// Check if user is signed in and is admin
async function checkAuth() {
    try {
        console.log('Checking authentication status...');
        const supabaseClient = await getSupabaseClient();
        
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error('Error getting session:', error);
            return { isAuthenticated: false };
        }

        if (!session) {
            console.log('No active session found');
            return { isAuthenticated: false };
        }

        console.log('Session found, checking admin status...');
        const isAdmin = await isUserAdmin(session.user.id);
        console.log('Admin check result:', isAdmin);

        return { 
            isAuthenticated: true, 
            isAdmin: isAdmin,
            user: session.user,
            session: session
        };
    } catch (error) {
        console.error('Auth check error:', error);
        return { isAuthenticated: false };
    }
}

// Function to check and print session status
async function checkSessionStatus() {
    console.log('Checking session status...'); // Debug log
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session check response:', { session, error }); // Debug log
        
        if (error) {
            console.error('Session check error:', error);
            return;
        }

        if (!session) {
            console.log('No active session found');
            return;
        }

        // Get user details
        const { user } = session;
        console.log('User found:', user); // Debug log
        const isAdmin = await isUserAdmin(user.id);
        console.log('Admin check result:', isAdmin); // Debug log

        // Print session details
        console.log('=== Session Status ===');
        console.log('User ID:', user.id);
        console.log('Email:', user.email);
        console.log('Admin Status:', isAdmin ? 'Yes' : 'No');
        console.log('Session Expires:', new Date(session.expires_at * 1000).toLocaleString());
        console.log('===================');

        return {
            userId: user.id,
            email: user.email,
            isAdmin,
            expiresAt: session.expires_at
        };
    } catch (error) {
        console.error('Error checking session status:', error);
        return null;
    }
}

import { ROUTES, PUBLIC_PAGES, navigateTo, setRedirectUrl, getRedirectUrl, clearRedirectUrl } from './routes.js';

// Add session check to auth middleware
async function authMiddleware() {
    console.log('Auth middleware running...'); // Debug log
    // Get current page path
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath); // Debug log
    
    // Skip auth check for public pages
    if (PUBLIC_PAGES.includes(currentPath)) {
        console.log('Public page detected, skipping auth check'); // Debug log
        return;
    }

    try {
        // Check authentication status
        const { isAuthenticated, isAdmin, session } = await checkAuth();
        console.log('Auth check result:', { isAuthenticated, isAdmin }); // Debug log

        // If not authenticated or not admin, redirect to login
        if (!isAuthenticated || !isAdmin) {
            console.log('User not authenticated or not admin, redirecting to login'); // Debug log
            // Store the attempted URL to redirect back after login
            setRedirectUrl(currentPath);
            navigateTo(ROUTES.LOGIN);
            return;
        }

        // If we have a session, store it
        if (session) {
            console.log('Storing session...');
            localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        }
    } catch (error) {
        console.error('Error in auth middleware:', error);
        navigateTo(ROUTES.LOGIN);
    }
}

// Initialize auth middleware
console.log('Setting up auth middleware...'); // Debug log
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, running auth middleware...'); // Debug log
    authMiddleware();
});

// Listen for auth state changes
supabase?.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session); // Debug log
    if (event === 'SIGNED_OUT') {
        navigateTo(ROUTES.LOGIN);
    } else if (event === 'SIGNED_IN') {
        const { isAdmin } = await checkAuth();
        if (!isAdmin) {
            await supabase.auth.signOut();
            navigateTo(ROUTES.LOGIN);
        } else {
            // Redirect to stored URL or default to dashboard
            const redirectUrl = getRedirectUrl();
            clearRedirectUrl();
            navigateTo(redirectUrl);
        }
    }
});

// Add global navigation protection
window.addEventListener('click', async (e) => {
    // Check if the clicked element is a link
    const link = e.target.closest('a');
    if (link && link.href) {
        const url = new URL(link.href);
        const currentPath = url.pathname;
        
        // Skip for public pages
        if (PUBLIC_PAGES.includes(currentPath)) {
            return;
        }

        // Check authentication before navigation
        const { isAuthenticated, isAdmin } = await checkAuth();
        if (!isAuthenticated || !isAdmin) {
            e.preventDefault();
            setRedirectUrl(currentPath);
            navigateTo(ROUTES.LOGIN);
        }
    }
});

// Add history state change protection
window.addEventListener('popstate', async () => {
    const currentPath = window.location.pathname;
    
    if (!PUBLIC_PAGES.includes(currentPath)) {
        const { isAuthenticated, isAdmin } = await checkAuth();
        if (!isAuthenticated || !isAdmin) {
            navigateTo(ROUTES.LOGIN);
        }
    }
});

// Initialize middleware
export async function initializeMiddleware() {
    // Add auth check to protected routes
    const protectedRoutes = [
        '/dashboard.html',
        '/admin.html',
        '/admin-dashboard.html'
    ];

    // Check if current path is protected
    const currentPath = window.location.pathname;
    if (protectedRoutes.includes(currentPath)) {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            return false;
        }
    }

    return true;
}

// Sign out function
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

// Export all functions and variables at the end
export { 
    getSupabaseClient,
    signIn,
    checkAuth,
    isUserAdmin,
    authMiddleware,
    checkSessionStatus,
    supabase,
    initializeMiddleware,
    signOut
};
