# Bayans Cafe Digital Menu App
### Powered by Digital Hujra

A premium digital menu and ordering application for **Bayans Cafe, Batkhela**.

---

## Project Structure

```
DIGITAL MENU APP/
├── SRS.md                    ← Software Requirements Specification
├── DEPLOYMENT.md             ← Full deployment guide
├── README.md                 ← This file
│
├── mobile-app/               ← React Native (Expo) Customer App
│   ├── app/
│   │   ├── _layout.tsx       ← Root layout + providers
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx   ← Tab navigation
│   │   │   ├── index.tsx     ← MENU SCREEN ⭐
│   │   │   └── tracking.tsx  ← ORDER TRACKING SCREEN ⭐
│   │   ├── checkout.tsx      ← Checkout flow
│   │   └── order-confirmation.tsx
│   ├── components/
│   │   ├── menu/             ← CategoryTabs, ProductCard
│   │   ├── cart/             ← CartDrawer
│   │   ├── tracking/         ← OrderTimeline
│   │   └── ui/               ← ThemedText, PrimaryButton
│   ├── store/                ← Zustand (cartStore, orderStore)
│   ├── services/             ← API, Notifications
│   ├── constants/            ← Colors, fonts, categories
│   └── types/                ← TypeScript interfaces
│
├── admin-panel/              ← Next.js 14 Admin Web App
│   ├── app/
│   │   ├── (auth)/login/     ← Login page
│   │   ├── dashboard/        ← Stats + live orders
│   │   ├── orders/           ← Order management
│   │   ├── products/         ← Product management
│   │   ├── categories/       ← Category management
│   │   └── settings/         ← Restaurant settings
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── orders/OrdersTable.tsx
│   │   └── products/ProductModal.tsx
│   ├── lib/api.ts            ← Axios API client
│   └── types/                ← TypeScript interfaces
│
└── laravel-api/              ← Laravel 11 REST API
    ├── routes/api.php        ← All API routes
    ├── app/
    │   ├── Models/           ← Product, Order, OrderItem, etc.
    │   ├── Http/Controllers/
    │   │   ├── Api/          ← Public endpoints
    │   │   └── Admin/        ← Protected admin endpoints
    │   └── Services/
    │       └── NotificationService.php  ← Firebase FCM
    └── database/migrations/  ← 6 migration files
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo SDK 51 |
| State Management | Zustand |
| Admin Panel | Next.js 14 + Tailwind CSS |
| API | Laravel 11 + Sanctum |
| Database | MySQL 8 |
| Push Notifications | Firebase Cloud Messaging |
| Image Storage | Cloudinary |
| Deployment | Vercel + DigitalOcean |

---

## Quick Start

### Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

### Admin Panel
```bash
cd admin-panel
npm install
npm run dev
# Open http://localhost:3000
```

### Laravel API
```bash
cd laravel-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
# API at http://localhost:8000/api/v1
```

---

## Key Features

### Customer App
- Premium dark-mode UI with gold branding
- 7 food categories with smooth tab switching
- Large product cards with images, descriptions, prices
- Quantity selector per item
- Cart drawer with live totals
- Dine-In / Delivery checkout flow
- Real-time order tracking (6 stages)
- Live progress timeline + status icons
- Firebase push notifications per status change

### Admin Panel
- Dashboard with revenue stats
- Live order list (auto-refresh every 15s)
- One-click order status updates → triggers customer notification
- Product management with image upload (Cloudinary)
- Category management
- JWT-protected routes

---

## Business Model

This application is architected as a **white-label SaaS**:
- All data is scoped by `restaurant_id`
- Theme colors and branding loaded dynamically per restaurant
- Admin panel supports multiple restaurant accounts
- Future: Add subscription billing per restaurant

---

## Branding

- Primary: `#D4A017` (Gold)
- Background: `#1A1A2E` (Dark Navy)
- Font: Poppins + Inter
- Watermark: "Powered by Digital Hujra"

---

*Built by Digital Hujra — Premium Digital Solutions*
