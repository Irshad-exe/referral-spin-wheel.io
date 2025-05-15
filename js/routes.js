// Base URLs
const BASE_URL = window.location.origin;
const FRONTEND_URL = 'https://irshad-exe.github.io/referral-spin-wheel.io';

// Route paths
const ROUTES = {
    HOME: '/',
    LOGIN: '/login.html',
    DASHBOARD: '/dashboard.html',
    ADMIN_DASHBOARD: '/admin-dashboard.html',
    ADMIN: '/admin.html',
    VERIFY_TOKEN: '/verify-token.html',
    SPIN: '/spin.html'
};

// Public pages that don't require authentication
const PUBLIC_PAGES = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.SPIN
];

// Navigation functions
function navigateTo(path) {
    window.location.href = path;
}

function getRedirectUrl() {
    return sessionStorage.getItem('redirectAfterLogin') || ROUTES.DASHBOARD;
}

function setRedirectUrl(path) {
    sessionStorage.setItem('redirectAfterLogin', path);
}

function clearRedirectUrl() {
    sessionStorage.removeItem('redirectAfterLogin');
}

// Export configuration
export {
    BASE_URL,
    FRONTEND_URL,
    ROUTES,
    PUBLIC_PAGES,
    navigateTo,
    getRedirectUrl,
    setRedirectUrl,
    clearRedirectUrl
}; 