# 🍌 SnoozMnky - Hoodie Pre-Order System

A vanilla HTML, CSS, and JavaScript pre-order system for SnoozMnky hoodies with Supabase backend integration.

## 📁 Project Structure

```
SnoozMnky/
├── index.html      # Main pre-order page
├── admin.html      # Admin dashboard
├── app.js          # Frontend logic
├── admin.js        # Admin logic
├── config.js       # Supabase configuration
├── style.css       # All styles (navy blue theme)
├── .htaccess       # Clean URL routing for Apache
├── package.json    # NPM scripts for Vite
├── vite.config.js  # Vite configuration
└── README.md       # This file
```

## 🚀 Features

- ✅ Product browsing with modal detail view
- ✅ Product details with image navigation
- ✅ Shopping cart with multiple items and sizes
- ✅ Discount code system with usage limits
- ✅ Pre-order form with Riyadh-only validation
- ✅ Admin dashboard for order management
- ✅ Product management
- ✅ Discount code management
- ✅ Settings toggle

## 🛠️ Local Development

### Prerequisites
- Node.js installed
- Supabase account and project

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

This will start Vite dev server on `http://localhost:5173`

## 📦 Deployment

### Manual Build

1. **Copy files to deployment:**
   - All HTML, JS, and CSS files from root directory
   - `.htaccess` file
   - No need to build - it's vanilla JavaScript!

2. **Upload to cPanel:**
   - Extract files to `public_html` directory
   - Ensure `.htaccess` is uploaded (for clean URLs)

### Clean URLs
The `.htaccess` file enables clean URLs:
- `/` → `index.html`
- `/admin` → `admin.html`
- `/home` → `index.html`

## ⚙️ Configuration

### Supabase Setup
Edit `config.js` with your Supabase credentials:
```javascript
const SUPABASE_URL = 'your-project-url'
const SUPABASE_KEY = 'your-anon-key'
```

### Admin Access
Default password: `2025911` (change in `config.js`)

## 📊 Database Schema

Required Supabase tables:
- `products` (with `images`, `image_url`, `price`, `name`, `description`)
- `pre_orders` (with `items`, `status`)
- `discount_codes` (with `code`, `discount_percent`, `max_uses`, `uses_count`)
- `admin_settings` (with `key`, `value`)

## 🎨 Theme

- **Primary Color:** Navy Blue (#1e3a8a)
- **Secondary Color:** White
- **Accent:** Light Blue (#60a5fa)

## 📝 License

ISC

## 👤 Author

SnoozMnky Team

