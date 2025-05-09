# Ladoo Referral System

A free, no-login referral spin-wheel reward system for advisory firms. Built with Supabase and static hosting.

## Features

- One-time use spin wheel for referrals
- Admin dashboard to track client ladoo counts
- WhatsApp integration for sharing spin links
- Automatic notification when clients reach 3 ladoos
- No user login required - security via single-use tokens

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Run the SQL commands from `schema.sql` in the Supabase SQL editor
3. Get your project URL and anon key from Project Settings > API
4. Update `js/config.js` with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'your-project-url';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

### 2. Local Development

1. Clone this repository
2. Open the files in a local web server (e.g., using VS Code's Live Server extension)
3. Test the functionality locally

### 3. Deployment

#### Option 1: Netlify

1. Create a new site on [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `.` (root directory)

#### Option 2: GitHub Pages

1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select your main branch as the source
4. Your site will be available at `https://yourusername.github.io/repository-name`

## Usage

### Admin Workflow

1. Access `admin.html` to add new referrals
2. Select the referring client and enter new client details
3. Generate a spin link
4. Share the link via WhatsApp or copy to clipboard

### Client Experience

1. Client receives spin link via WhatsApp
2. Clicks link to access `spin.html`
3. Spins the wheel once to win ladoos
4. System automatically tracks ladoo count

### Monitoring

1. Access `dashboard.html` to view all clients
2. Monitor ladoo counts and eligible clients
3. View detailed referral history for each client

## Security

- Each spin link is single-use
- No user authentication required
- Row Level Security (RLS) policies protect data
- Tokens are UUID-based and unique

## Customization

- Modify prize weights in `js/config.js`
- Update colors and styles in `css/styles.css`
- Add additional features through Supabase Edge Functions

## Support

For issues or questions, please open a GitHub issue in this repository.

## License

MIT License - feel free to use and modify for your needs. 