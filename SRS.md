# Software Requirements Specification (SRS)
## Bayans Cafe Digital Menu Application
### Version 1.0 | Powered by Digital Hujra

---

## 1. Project Overview

| Field | Detail |
|---|---|
| **App Name** | Bayans Cafe Digital Menu |
| **Client** | Bayans Cafe, Batkhela |
| **Developer** | Digital Hujra |
| **Platform** | iOS & Android (React Native Expo) |
| **Admin Panel** | Web (Next.js) |
| **Backend** | Laravel REST API |
| **Database** | MySQL |
| **Notifications** | Firebase Cloud Messaging |
| **Storage** | Cloud Storage (Cloudinary / AWS S3) |
| **Version** | 1.0.0 |
| **Date** | June 2026 |

---

## 2. Business Objectives

- Replace paper menus with a premium digital experience
- Enable dine-in and delivery ordering from a mobile device
- Provide real-time order tracking to customers
- Give staff a powerful admin panel to manage everything
- Build a white-label SaaS foundation reusable for other restaurants

---

## 3. Stakeholders

| Role | Responsibility |
|---|---|
| Restaurant Owner | Business decisions, branding |
| Kitchen Staff | Receive & prepare orders |
| Delivery Staff | Mark orders as On The Way / Delivered |
| Admin Staff | Manage products, categories, prices |
| Customer | Browse menu, place orders, track delivery |
| Digital Hujra | Development, hosting, maintenance |

---

## 4. Functional Requirements

### 4.1 Mobile App (Customer Facing)

#### 4.1.1 Menu Screen
- Display restaurant logo and brand name
- Show food categories horizontally (tab bar)
- Display food items as large cards with image, name, description, price
- Quantity selector (+/-) on each card
- Add to Cart button per item
- Floating Cart button showing item count and total
- Dark mode support
- Smooth category switching animation

#### 4.1.2 Cart & Checkout
- Cart drawer/modal with all selected items
- Edit quantity or remove items from cart
- Order type selection: Dine-In or Delivery
- Customer input:
  - Full Name (required)
  - Mobile Number (required, validation)
  - Table Number (if Dine-In)
  - Delivery Address (if Delivery)
- Order summary with subtotal
- "Place Order" button
- Order confirmation screen with order ID

#### 4.1.3 Order Tracking Screen
- Live status timeline (6 stages)
- Progress bar indicating completion percentage
- Status icons with labels
- Estimated time display
- Push notification on each status change
- Pull-to-refresh

**Order Stages:**
1. Order Placed
2. Preparing
3. Ready
4. On The Way (Delivery only)
5. Delivered / Served
6. Received (Customer confirms)

### 4.2 Admin Panel (Next.js Web)

#### 4.2.1 Dashboard
- Today's orders count
- Revenue summary
- Active orders list
- Quick status update buttons

#### 4.2.2 Product Management
- Add / Edit / Delete products
- Upload product images (cloud storage)
- Set name, description, price, category
- Toggle product availability (in stock / out of stock)

#### 4.2.3 Category Management
- Add / Edit / Delete categories
- Set category icon/image
- Reorder categories

#### 4.2.4 Order Management
- Live order list (auto-refresh)
- View order details (items, customer info)
- Update order status (dropdown/buttons)
- Filter orders by status, date, type

#### 4.2.5 Settings
- Restaurant name, logo, address
- Operating hours
- Delivery radius / availability toggle

---

## 5. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Performance | App loads in < 2s on 4G |
| Offline Support | Menu cached locally |
| Security | JWT Auth, HTTPS, Input Sanitization |
| Scalability | Multi-restaurant (SaaS) ready |
| Availability | 99.9% uptime |
| Notifications | < 5 second delivery |
| Image Loading | Lazy load + CDN |

---

## 6. Database Design

### Tables

#### restaurants
```sql
id, name, logo_url, address, phone, theme_color, is_active, created_at
```

#### categories
```sql
id, restaurant_id, name, icon, sort_order, is_active
```

#### products
```sql
id, restaurant_id, category_id, name, description, price, image_url, is_available, sort_order, created_at
```

#### orders
```sql
id, restaurant_id, order_number, customer_name, customer_phone,
order_type (dine_in|delivery), table_number, delivery_address,
status (placed|preparing|ready|on_the_way|delivered|received),
subtotal, total, notes, created_at, updated_at
```

#### order_items
```sql
id, order_id, product_id, product_name, price, quantity, subtotal
```

#### admins
```sql
id, restaurant_id, name, email, password, role, created_at
```

---

## 7. API Structure

**Base URL:** `https://api.bayan scafe.com/api/v1`

### Public Endpoints
```
GET    /restaurants/{id}           - Restaurant info
GET    /restaurants/{id}/categories - Categories list
GET    /restaurants/{id}/products  - All products
GET    /products?category_id=X     - Products by category
POST   /orders                     - Place order
GET    /orders/{order_number}      - Track order (by order number)
```

### Admin Endpoints (JWT Protected)
```
POST   /auth/login
POST   /auth/logout
GET    /admin/orders               - All orders
PATCH  /admin/orders/{id}/status  - Update status
POST   /admin/products             - Create product
PUT    /admin/products/{id}        - Update product
DELETE /admin/products/{id}        - Delete product
POST   /admin/categories           - Create category
PUT    /admin/categories/{id}      - Update category
POST   /admin/upload               - Upload image
GET    /admin/dashboard            - Stats summary
```

---

## 8. Technology Stack

### Mobile App
| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 51) |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| HTTP | Axios |
| UI Library | Custom Components + Reanimated 3 |
| Notifications | Expo Notifications + Firebase |
| Storage | AsyncStorage |
| Icons | Expo Vector Icons |

### Admin Panel
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| State | React Query (TanStack) |
| Auth | NextAuth.js |
| Charts | Recharts |
| Image Upload | react-dropzone |

### Backend
| Layer | Technology |
|---|---|
| Framework | Laravel 11 |
| Auth | Laravel Sanctum (JWT) |
| Database | MySQL 8 |
| Cache | Redis |
| Queue | Laravel Queues (Notifications) |
| Storage | Cloudinary |
| Push | Firebase Admin SDK |

---

## 9. App Screens List

### Mobile
1. Splash Screen
2. Menu Screen (Main)
3. Cart Drawer
4. Checkout Screen
5. Order Confirmation Screen
6. Order Tracking Screen

### Admin Panel
1. Login Page
2. Dashboard
3. Orders List
4. Order Detail
5. Products List
6. Add/Edit Product
7. Categories
8. Settings

---

## 10. Development Roadmap

| Phase | Task | Duration |
|---|---|---|
| Phase 1 | SRS + Architecture + DB Design | Week 1 |
| Phase 2 | Laravel API (Core) | Week 2 |
| Phase 3 | React Native App (UI + Logic) | Week 3-4 |
| Phase 4 | Next.js Admin Panel | Week 5 |
| Phase 5 | Firebase Notifications | Week 6 |
| Phase 6 | Testing + Bug Fixes | Week 7 |
| Phase 7 | Deployment + Launch | Week 8 |

---

## 11. Deployment Plan

### Mobile App
- Build with `expo build` / EAS Build
- Submit to Google Play Store
- Submit to Apple App Store
- OTA updates via Expo

### Admin Panel
- Deploy on Vercel (Next.js)
- Custom domain: `admin.bayan scafe.com`

### Backend API
- Deploy on VPS (DigitalOcean / AWS EC2)
- Nginx + PHP-FPM
- SSL via Let's Encrypt
- Domain: `api.bayan scafe.com`

### Database
- MySQL on managed DB (PlanetScale / RDS)
- Automated backups daily

---

## 12. Branding

- Primary Color: `#D4A017` (Gold)
- Secondary: `#1A1A2E` (Dark Navy)
- Accent: `#E8F5E9` (Light Green)
- Font: Poppins (headings) + Inter (body)
- Logo: Bayans Cafe (provided by client)
- Footer: "Powered by Digital Hujra"

---

## 13. White-Label SaaS Notes

The application is architected for multi-restaurant use:
- All data is scoped by `restaurant_id`
- Theme colors stored per restaurant in DB
- Logo/branding loaded dynamically
- Admin panel supports multiple restaurant accounts
- Future: Subscription billing per restaurant

---

*Document prepared by Digital Hujra — © 2026*
