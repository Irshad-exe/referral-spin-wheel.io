# LakshInvestment Referral System

A web application for managing client referrals for LakshInvestment.

## GitHub Pages Deployment Notes

When deploying to GitHub Pages, ensure the following:

1. Update all script paths to use absolute URLs with the GitHub Pages base URL
2. Ensure Supabase is properly initialized before use with the `supabase-init.js` script
3. Include the Supabase initialization script before any scripts that use Supabase
4. Test database connections after deployment

## Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the development server with `npm start`

## Project Structure

- `components/` - Reusable HTML components
- `css/` - Stylesheets
- `js/` - JavaScript files
  - `admin.js` - Admin dashboard functionality
  - `admin-auth.js` - Admin authentication
  - `config.js` - Configuration settings
  - `main.js` - Main application logic
  - `supabase-init.js` - Supabase initialization script
- `*.html` - HTML pages

## Troubleshooting

If client fetching stops working after deployment:

1. Check browser console for errors
2. Verify Supabase initialization is happening before data fetching
3. Ensure all paths are updated to use the correct GitHub Pages URL
4. Check CORS settings in Supabase dashboard