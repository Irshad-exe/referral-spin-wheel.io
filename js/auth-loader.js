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
        // We don't need to dynamically load admin-auth.js here
        // as it's already included in the HTML with type="module"
    };
    document.head.appendChild(script);
} else {
    console.log('Supabase already loaded');
    // No need to load admin-auth.js again
}