# LakshInvestment Referral System

A web application for managing client referrals for LakshInvestment.

## Authentication System

The application uses a centralized authentication middleware system that:

1. Automatically checks authentication on every page
2. Redirects unauthenticated users to the login page
3. Restricts admin pages to admin users only
4. Provides consistent authentication across all pages

## Project Structure

- `components/` - Reusable HTML components
- `css/` - Stylesheets
- `js/` - JavaScript files
  - `auth-middleware.js` - Centralized authentication middleware
  - `admin.js` - Admin dashboard functionality
  - `config.js` - Configuration settings
  - `main.js` - Main application logic
- `*.html` - HTML pages

## GitHub Pages Deployment Notes

When deploying to GitHub Pages, ensure the following:

1. All pages use the centralized auth-middleware.js for authentication
2. Avoid using aggregate functions like count() in Supabase queries
3. Test authentication flow after deployment

## Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the development server with `npm start`

## Troubleshooting

If authentication issues occur:

1. Check browser console for errors
2. Verify Supabase session is being properly maintained
3. Ensure Row Level Security (RLS) policies in Supabase allow proper access
4. Check that auth-middleware.js is loaded before any page scripts