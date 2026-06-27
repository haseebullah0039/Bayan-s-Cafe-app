# Deployment Guide — Bayans Cafe Digital Menu
### Powered by Digital Hujra

---

## 1. Prerequisites

| Service | Purpose | Recommended |
|---|---|---|
| VPS | Laravel API hosting | DigitalOcean $12/mo Droplet |
| Database | MySQL | PlanetScale (free tier) or RDS |
| Admin Panel | Next.js hosting | Vercel (free) |
| Image Storage | Product images | Cloudinary (free 25GB) |
| Push Notifications | Firebase | Firebase (free) |
| App Distribution | Mobile | Google Play + App Store |
| SSL | HTTPS | Let's Encrypt (free) |

---

## 2. Backend (Laravel API)

### Server Setup
```bash
# On Ubuntu 22.04 VPS
apt update && apt install -y nginx php8.3-fpm php8.3-mysql composer unzip git

# Clone and install
git clone <your-repo> /var/www/api
cd /var/www/api
composer install --optimize-autoloader --no-dev
cp .env.example .env
php artisan key:generate
```

### Environment Variables
```env
APP_ENV=production
APP_URL=https://api.bayanscafe.com

DB_HOST=your-db-host
DB_DATABASE=bayans_cafe
DB_USERNAME=root
DB_PASSWORD=your-secure-password

FIREBASE_SERVER_KEY=your-firebase-server-key

CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Run Migrations & Seed
```bash
php artisan migrate --force
php artisan db:seed --class=RestaurantSeeder
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.bayanscafe.com;
    root /var/www/api/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

```bash
# Enable HTTPS
certbot --nginx -d api.bayanscafe.com
```

---

## 3. Admin Panel (Next.js on Vercel)

```bash
cd admin-panel
npm install
npm run build
vercel deploy --prod
```

**Vercel Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.bayanscafe.com/api/v1
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://admin.bayanscafe.com
```

---

## 4. Mobile App (Expo EAS Build)

### Setup EAS
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Build for Android
```bash
cd mobile-app
eas build --platform android --profile production
```

### Build for iOS
```bash
eas build --platform ios --profile production
```

### Submit to Stores
```bash
eas submit --platform android
eas submit --platform ios
```

### Environment Variables (mobile-app/.env)
```
EXPO_PUBLIC_API_URL=https://api.bayanscafe.com/api/v1
```

---

## 5. Firebase Setup

1. Create project at console.firebase.google.com
2. Enable Cloud Messaging (FCM)
3. Download `google-services.json` → place in `mobile-app/`
4. Download `GoogleService-Info.plist` → place in `mobile-app/`
5. Copy **Server Key** → add to Laravel `.env` as `FIREBASE_SERVER_KEY`

---

## 6. Cloudinary Setup

1. Create account at cloudinary.com
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Add to Laravel `.env`

---

## 7. Domain Setup

| Subdomain | Purpose | DNS Record |
|---|---|---|
| `api.bayanscafe.com` | Laravel API | A → VPS IP |
| `admin.bayanscafe.com` | Admin Panel | CNAME → vercel |

---

## 8. Post-Deployment Checklist

- [ ] Test API endpoints with Postman
- [ ] Create first admin account via `php artisan tinker`
- [ ] Add restaurant record to DB
- [ ] Add categories (Burgers, Pizza, etc.)
- [ ] Add at least 5 products with images
- [ ] Test order flow end-to-end
- [ ] Verify push notifications work
- [ ] Test on both Android and iOS
- [ ] Submit to stores

---

## 9. Create First Admin
```bash
php artisan tinker
> App\Models\Admin::create([
>     'restaurant_id' => 1,
>     'name' => 'Bayans Admin',
>     'email' => 'admin@bayanscafe.com',
>     'password' => bcrypt('your-password'),
>     'role' => 'super_admin',
> ]);
```

---

*Deployment Guide — Digital Hujra © 2026*
