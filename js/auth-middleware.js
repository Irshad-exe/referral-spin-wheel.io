// auth-middleware.js - Centralized authentication middleware

// Supabase configuration
const SUPABASE_URL = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucXh3Y21uY3l0b2x6dHZ2cHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg0MjMsImV4cCI6MjA2MjM4NDQyM30.2Ad2Wv3YC9DwxOG82JBF21BGvkS6gbIFOpPXLCWkdso';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Routes configuration
const BASE_URL = 'https://irshad-exe.github.io/referral-spin-wheel.io';
const ROUTES = {
    HOME: `${BASE_URL}/index.html`,
    LOGIN: `${BASE_URL}/login.html`,
    DASHBOARD: `${BASE_URL}/dashboard.html`,
    ADMIN: `${BASE_URL}/admin.html`,
    ADMIN_DASHBOARD: `${BASE_URL}/admin-dashboard.html`,
    SPIN: `${BASE_URL}/spin.html`
};

// Public pages that don't require authentication
const PUBLIC_PAGES = [
    '/index.html',
    '/login.html',
    '/spin.html',
    // Add any other public pages here
];

// Admin-only pages
const ADMIN_PAGES = [
    '/admin.html',
    '/admin-dashboard.html',
    '/dashboard.html'
    // Add any other admin pages here
];

// Navigation function
function navigateTo(route) {
    window.location.href = route;
}

// Check if current page is public
function isPublicPage() {
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/'));
    return PUBLIC_PAGES.some(page => pageName.endsWith(page));
}

// Check if current page is admin-only
function isAdminPage() {
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/'));
    return ADMIN_PAGES.some(page => pageName.endsWith(page));
}

// Check if user is admin
async function isUserAdmin(userId) {
    try {
        const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (adminError) {
            console.error('Error checking admin_users table:', adminError);
            return false;
        }

        return !!adminData;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Main authentication check
async function checkAuth() {
    try {
        // Skip auth check for public pages
        if (isPublicPage()) {
            console.log('Public page detected, skipping auth check');
            return { isPublicPage: true };
        }

        console.log('Checking authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
            return { isAuthenticated: false, error };
        }

        if (!session) {
            console.log('No active session found');
            return { isAuthenticated: false };
        }

        // For admin pages, check if user is admin
        if (isAdminPage()) {
            console.log('Admin page detected, checking admin status...');
            const isAdmin = await isUserAdmin(session.user.id);
            
            return { 
                isAuthenticated: true,
                isAdmin,
                user: session.user,
                session
            };
        }

        // For regular authenticated pages
        return { 
            isAuthenticated: true,
            user: session.user,
            session
        };
    } catch (error) {
        console.error('Auth check error:', error);
        return { isAuthenticated: false, error };
    }
}

// Main middleware function to run on every page
async function authMiddleware() {
    try {
        const authResult = await checkAuth();
        
        // If public page, no need to check auth
        if (authResult.isPublicPage) {
            return { success: true };
        }
        
        // If not authenticated, redirect to login
        if (!authResult.isAuthenticated) {
            console.log('User not authenticated, redirecting to login');
            navigateTo(ROUTES.LOGIN);
            return { success: false, reason: 'not_authenticated' };
        }
        
        // If admin page but user is not admin
        if (isAdminPage() && !authResult.isAdmin) {
            console.log('User is not admin, redirecting to login');
            await supabase.auth.signOut();
            navigateTo(ROUTES.LOGIN);
            return { success: false, reason: 'not_admin' };
        }
        
        // Authentication successful
        return { 
            success: true, 
            user: authResult.user,
            isAdmin: authResult.isAdmin
        };
    } catch (error) {
        console.error('Middleware error:', error);
        navigateTo(ROUTES.LOGIN);
        return { success: false, error };
    }
}

// Helper function to show alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Run middleware on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Running auth middleware...');
    authMiddleware().then(result => {
        if (result.success) {
            console.log('Auth middleware passed');
            // Dispatch event that pages can listen for
            document.dispatchEvent(new CustomEvent('authReady', { 
                detail: { 
                    user: result.user,
                    isAdmin: result.isAdmin
                } 
            }));
        }
    });
});

// Export functions for use in other scripts
window.authMiddleware = {
    checkAuth,
    isUserAdmin,
    navigateTo,
    ROUTES,
    supabase,
    showAlert,
    escapeHtml
};