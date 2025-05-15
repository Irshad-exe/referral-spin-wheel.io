// Auth Loader Script
console.log('Auth loader script loaded');

// Load Supabase if not already loaded
if (!window.supabase) {
    console.log('Loading Supabase...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => {
        console.log('Supabase script loaded');
        // Load admin auth after Supabase is loaded
        const authScript = document.createElement('script');
        authScript.src = '/js/admin-auth.js';
        authScript.type = 'module';
        document.head.appendChild(authScript);
    };
    document.head.appendChild(script);
} else {
    console.log('Supabase already loaded');
    // Load admin auth if Supabase is already loaded
    const authScript = document.createElement('script');
    authScript.src = '/js/admin-auth.js';
    authScript.type = 'module';
    document.head.appendChild(authScript);
} 