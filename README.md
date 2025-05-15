# LakshInvestment Admin Dashboard

A modern admin dashboard for managing clients and referrals.

## Features

- Client management
- Referral tracking
- Admin authentication
- Responsive design

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Supabase (Backend as a Service)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lakshinvestment-admin.git
cd lakshinvestment-admin
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Visit `http://localhost:8000` in your browser

## Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

The frontend is hosted on GitHub Pages. The backend is powered by Supabase.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 