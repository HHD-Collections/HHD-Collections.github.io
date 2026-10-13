# HHD Collections — E-Commerce Storefront & Secure Admin Dashboard

[![Deploy HHD Collections to GitHub Pages](https://github.com/HHD-Collections/hhd-collections/actions/workflows/deploy.yml/badge.svg)](https://HHD-Collections.github.io/)

A fast, responsive, and secure luxury e-commerce platform built for **HHD Collections** with a customer storefront and administrative management dashboard.

Deployable on **GitHub Pages** (`https://HHD-Collections.github.io/`) with **Firebase** providing backend services (Authentication, Cloud Firestore, Firebase Storage, and Analytics).

---

## 1. Technology Stack & Architecture

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Champagne Gold `#C5A059`, Charcoal `#121212`, Ivory `#FDFCF9` luxury palette)
- **Routing**: React Router DOM (Static-hosting optimized HashRouter with SPA fallback)
- **State & Context**: Context API for Cart, Wishlist, Theme (Dark/Light), and Authentication
- **Forms & Validation**: React Hook Form + Zod schema validation
- **Icons**: Lucide React
- **Cloud Backend**:
  - **Firebase Authentication**: Email & password administrative authentication with custom claims & role-based access control (RBAC).
  - **Cloud Firestore**: Real-time scalable document database (`products`, `categories`, `orders`, `settings`).
  - **Firebase Storage**: Multi-image storage organized hierarchically into `products/{category}/{productId}/{fileName}`.
  - **Firebase Analytics**: Production usage and performance telemetry.
- **CI/CD**: GitHub Actions automated build and deployment to GitHub Pages.

### Architecture Flow

```
Customer Browser ──> GitHub Pages (Static React SPA) ──> Cloud Firestore + Firebase Storage
Admin Browser    ──> Firebase Auth (RBAC Guard)       ──> Admin Dashboard ──> Firestore + Storage
```

---

## 2. Directory Structure

```
HHD Collections/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── public/
│   ├── assets/
│   │   └── logo.png            # Brand logo and favicon
│   ├── products/               # 14 organized product folders with 4-6 JPEG images each
│   │   ├── prod-001/ ... prod-014/
│   ├── 404.html                # GitHub Pages SPA redirect fallback script
│   ├── robots.txt              # SEO crawler directives
│   └── sitemap.xml             # Sitemap index
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminLayout.tsx # Responsive admin sidebar & header layout
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Luxury navigation bar, announcement bar, search, badges
│   │   │   ├── Footer.tsx      # Comprehensive footer, warranty info, trust badges
│   │   │   └── CartDrawer.tsx  # Slide-over cart drawer with free shipping progress bar
│   │   └── product/
│   │       ├── ProductCard.tsx # Dual-image hover preview, badges, rating, quick add
│   │       └── ImageGallery.tsx# Interactive zoom, multiple thumbnails, carousel
│   ├── context/
│   │   ├── AuthContext.tsx     # Admin authentication & session management
│   │   ├── CartContext.tsx     # Cart state, quantities, subtotal, localStorage
│   │   ├── WishlistContext.tsx # Wishlist toggle, localStorage persistence
│   │   └── ThemeContext.tsx    # Dark and light theme toggle
│   ├── data/
│   │   ├── initialCategories.ts# Default 4 curated categories
│   │   └── initialProducts.ts  # Default 14 products with real assets, specs, PKR prices
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLoginPage.tsx      # Secure administrator login & password reset
│   │   │   ├── AdminOverviewPage.tsx   # Database-backed stats & catalog sync tool
│   │   │   ├── AdminProductsPage.tsx   # Product CRUD table, active/featured toggles
│   │   │   ├── AdminProductFormPage.tsx# MULTIPLE IMAGES UPLOADER & product editor
│   │   │   ├── AdminCategoriesPage.tsx # Category CRUD & cover image uploads
│   │   │   ├── AdminOrdersPage.tsx     # Order review & customer WhatsApp updates
│   │   │   └── AdminSettingsPage.tsx   # Settings & 1-Click Firestore Seeder
│   │   └── store/
│   │       ├── HomePage.tsx            # Hero, categories, featured grid, testimonials
│   │       ├── ShopPage.tsx            # Filters (price, category, stock), sorting, search
│   │       ├── CategoriesPage.tsx      # All collections showcase
│   │       ├── CategoryDetailPage.tsx  # Category banner & products
│   │       ├── ProductDetailPage.tsx   # Full gallery, zoom, WhatsApp order, tabs
│   │       ├── SearchResultsPage.tsx   # Search results
│   │       ├── CartPage.tsx            # Cart table, promo code, shipping calculator
│   │       ├── WishlistPage.tsx        # Saved products grid
│   │       ├── CheckoutPage.tsx        # COD checkout, Zod validation, order confirmation
│   │       ├── AboutPage.tsx           # Brand story & values
│   │       ├── ContactPage.tsx         # Contact form & WhatsApp chat
│   │       ├── PrivacyPolicyPage.tsx   # Legal & privacy standards
│   │       ├── TermsPage.tsx           # 7-day checking warranty & COD terms
│   │       └── NotFoundPage.tsx        # 404 handler
│   ├── services/
│   │   ├── firebase.ts         # Firebase SDK initialization
│   │   ├── authService.ts      # Admin auth, claims, password reset
│   │   ├── productService.ts   # Firestore product CRUD, querying, and seeding
│   │   ├── categoryService.ts  # Firestore category CRUD and seeding
│   │   ├── orderService.ts     # Orders storage, reference generator, WhatsApp links
│   │   └── storageService.ts   # Multi-image upload, compression, deletion
│   ├── utils/
│   │   ├── formatters.ts       # PKR currency formatting (Rs.), dates, slug generator
│   │   └── imageOptimizer.ts   # Client-side WebP compression & thumbnail generator
│   ├── types/
│   │   └── index.ts            # TypeScript definitions for Products, Orders, Categories
│   ├── App.tsx                 # Route declarations
│   ├── main.tsx                # React DOM entrypoint
│   └── index.css               # Tailwind CSS styles and luxury scrollbar
├── firestore.rules             # Production Firestore security rules
├── storage.rules               # Production Firebase Storage security rules
├── firestore.indexes.json      # Firestore composite indexes
├── firebase.json               # Firebase CLI configuration
├── vite.config.ts              # Vite configuration with chunk splitting & relative base
├── tailwind.config.js          # Tailwind luxury color scheme
└── package.json
```

---

## 3. Customer Website Features

1. **Homepage (`/`)**:
   - Announcement banner with Free Delivery countdown and COD notification.
   - Luxury hero banner with CTA buttons ("Explore Collections", "Browse Categories").
   - 4 Value proposition badges (Nationwide COD, 7-Day Checking Warranty, 100% Genuine, 24/7 WhatsApp Support).
   - Curated category department cards.
   - Featured products grid with hover image transitions and sale badges.
   - Limited-period promotional banner.
   - Verified customer reviews from Pakistan.
2. **Shop / All Products (`/#/shop`)**:
   - Live sidebar filtering: Category selector, maximum price range slider (PKR), In-stock only filter.
   - Live search input with instant matching across title, SKU, and tags.
   - Sort dropdown: Newest first, Price: Low to High, Price: High to Low, Name: A to Z.
3. **Categories (`/#/categories` & `/#/category/:slug`)**:
   - Visual category cover photos and product counters.
   - Filtered view of products within each specific department.
4. **Product Details (`/#/product/:slug`)**:
   - Interactive multi-image gallery with hover zoom / lens magnifier.
   - Multiple image thumbnails with primary image indicator.
   - PKR regular price, sale price, and discount percentage calculation.
   - Real-time stock status badge (In Stock / Low Stock / Out of Stock).
   - Quantity selector (+ / -) with stock limit clamping.
   - "Add to Bag", "Buy Now (COD)", and "Order Instantly on WhatsApp" buttons.
   - Tabbed specifications: Overview, Tech Specs table, Shipping & 7-Day warranty.
   - Related products carousel.
5. **Shopping Bag & Cart Drawer (`/#/cart`)**:
   - Slide-over cart drawer accessible from any page.
   - Free shipping meter (indicates remaining amount for free delivery over Rs. 3,000).
   - Promo code input with instant discount calculation (`HHDVIP` for 10% off).
6. **Checkout & Order Placement (`/#/checkout`)**:
   - Validated customer info: Full Name, Email, Phone, Address, City, Province, Instructions.
   - Supported payment methods: Cash on Delivery (COD), Direct Bank Transfer / EasyPaisa / JazzCash, or WhatsApp Direct Order.
   - Submits order to Firestore `orders` collection and generates reference number (e.g. `HHD-728192`).
   - Rich confirmation page with "Confirm on WhatsApp" button (prefilled with full order details) and "Print Receipt".

---

## 4. Admin Dashboard & Security Features

Access URL: `/#/admin` (Login: `/#/admin/login`)

### Security Implementation
- **Managed Firebase Authentication**: Passwords are never stored in plaintext or custom reversible hashes. Firebase's secure Argon2/scrypt infrastructure is utilized.
- **No Hardcoded Passwords**: The administrator's bootstrap password is never embedded into frontend bundles or repository code.
- **Granular Security Rules**: Firestore and Storage rules strictly verify `request.auth != null` and admin authorization before allowing any writes or deletions.
- **Password Reset**: Integrated password reset flow via Firebase Authentication.

### Dashboard Sections
1. **Overview Dashboard (`/#/admin`)**:
   - Real database metrics: Total products, active products, total categories, total orders received, and out-of-stock items.
   - Low stock inventory alert watch.
   - Recent products table with quick edit links.
   - **One-Click Catalog Seeder**: Button to instantly sync all 14 official products and 4 categories to Cloud Firestore.
2. **Product Management (`/#/admin/products`)**:
   - Table of all products with thumbnails, SKU, category, price, and stock.
   - One-click toggles for Published/Draft and Featured status.
   - Duplicate product action.
   - Delete product with modal confirmation.
3. **Multiple Image Manager (`/#/admin/products/new` & `edit/:id`)**:
   - Drag & drop or multi-file picker.
   - Client-side image compression & WebP optimization before upload.
   - Upload progress bar.
   - Mark any image as the Primary hero image with a gold star badge.
   - Reorder images with Left / Right controls.
   - Remove individual images and update per-image alt text.
   - Files saved in `products/{category}/{productId}/{fileName}`.
4. **Category Management (`/#/admin/categories`)**:
   - List, create, edit, and delete categories.
   - Category cover photo upload.
   - Safe deletion validation (prevents deleting categories that currently have products assigned).
5. **Orders Management (`/#/admin/orders`)**:
   - Review all customer checkout enquiries.
   - Filter by status: Pending, Confirmed, Shipped, Delivered, Cancelled.
   - View customer shipping address, items, and delivery city.
   - One-click WhatsApp message button to message the customer with updates.
6. **Store Settings (`/#/admin/settings`)**:
   - Update official WhatsApp number, support email, and store name.
   - Adjust free shipping threshold (PKR) and standard delivery charge.
   - Announcement banner text editor.

---

## 5. Step-by-Step Setup & Deployment Guide

### Step 1: Firebase Project Configuration

1. Visit the [Firebase Console](https://console.firebase.google.com/) and create a project named **hhd-collections** (or use your existing project).
2. Go to **Project Settings > General > Your apps** and add a Web app named `HHD Collections`.
3. Note your credentials. The project is already configured with:
   - `authDomain`: `hhd-collections.firebaseapp.com`
   - `projectId`: `hhd-collections`
   - `storageBucket`: `hhd-collections.firebasestorage.app`
   - `messagingSenderId`: `392638208744`
   - `appId`: `1:392638208744:web:bd0975276877fd4db6075d`
   - `measurementId`: `G-2FRHJDKJB6`

### Step 2: Configure Firebase Authentication

1. In Firebase Console, go to **Build > Authentication > Sign-in method**.
2. Click **Add provider**, select **Email/Password**, enable it, and click **Save**.
3. Go to the **Users** tab and click **Add user**:
   - Email: `admin@hhdcollections.com` (or your preferred admin email, such as `murtuza.tech.savvy@gmail.com`)
   - Password: Enter your supplied bootstrap password.
   - Click **Add user**.
4. (Optional) In the user's settings, you can enable Multi-Factor Authentication (MFA) via SMS or TOTP authenticator app.

### Step 3: Enable Cloud Firestore

1. In Firebase Console, go to **Build > Firestore Database**.
2. Click **Create database**, choose a region close to your target audience (e.g. `asia-south1`), and start in **Production mode**.
3. Go to the **Rules** tab, paste the contents of `firestore.rules`, and click **Publish**.
4. Create an `admins` collection document (optional fallback):
   - Document ID: `<your_admin_user_uid>`
   - Fields: `email: "admin@hhdcollections.com"`, `role: "super_admin"`

### Step 4: Configure Firebase Storage

1. In Firebase Console, go to **Build > Storage**.
2. Click **Get started**, choose your storage bucket location, and finish setup.
3. Go to the **Rules** tab, paste the contents of `storage.rules`, and click **Publish**.

### Step 5: Local Development & Verification

1. Clone or open the project folder in your terminal:
   ```bash
   cd "HHD Collections"
   ```
2. Verify dependencies are installed:
   ```bash
   npm install
   ```
3. Copy environment template and configure:
   ```bash
   cp .env.example .env.local
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173/` in your browser.

### Step 6: Initial Catalog Seeding

1. Open the Admin Login portal: `http://localhost:5173/#/admin/login`
2. Sign in with your administrator email and bootstrap password.
3. Once logged in, go to **Store Settings** or the **Dashboard Overview**.
4. Click the **"Seed Catalog to Firestore"** button.
5. In just a few seconds, all 14 official products and 4 categories with real specifications and PKR pricing will be synced directly to your Cloud Firestore database!

### Step 7: GitHub Pages Deployment

The repository is configured to deploy to `https://HHD-Collections.github.io/`.

1. Initialize Git and commit the project files:
   ```bash
   git init
   git add .
   git commit -m "feat: complete HHD Collections storefront and admin dashboard"
   ```
2. Add your GitHub remote:
   ```bash
   git remote add origin https://github.com/HHD-Collections/HHD-Collections.github.io.git
   git branch -M main
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings > Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
   - Go to **Settings > Secrets and variables > Actions**:
     - Add repository secret `VITE_FIREBASE_API_KEY`: Your Firebase API key.
4. The workflow in `.github/workflows/deploy.yml` will automatically build the application and deploy it to `https://HHD-Collections.github.io/`!

---

## 6. Official Catalog Included

| # | Product Name | Category | Regular Price | Sale Price |
|---|---|---|---|---|
| 1 | Kitchen Master Plastic Plate Rack With Tray | Kitchen & Dining | Rs. 2,850 | Rs. 2,350 |
| 2 | Snack & Feeding Plate With Sauce Compartment 2-in-1 | Kitchen & Dining | Rs. 950 | Rs. 750 |
| 3 | AC Cover - Indoor & Outdoor Dustproof & Waterproof | Home & Organization | Rs. 1,650 | Rs. 1,290 |
| 4 | Fruit Design Glass Sipper with Lid & Straw | Kitchen & Dining | Rs. 1,450 | Rs. 1,150 |
| 5 | Icecream Shaped Plastic Tumbler 1300ml | Kitchen & Dining | Rs. 2,200 | Rs. 1,750 |
| 6 | Kenwood Electric Chopper 6-Blade Stainless Steel Blender 3 Speed | Kitchen & Dining | Rs. 6,500 | Rs. 5,200 |
| 7 | Kids Electric Whack-a-Mole Game with Hammer, Lights & Music | Home Appliances & Toys | Rs. 3,200 | Rs. 2,650 |
| 8 | Mini Jewelry Travel Case, Small Leather Travel Organizer | Health & Beauty | Rs. 1,600 | Rs. 1,250 |
| 9 | Multi-Purpose Wall Mounted Phone Holder with Key Hanger | Home & Organization | Rs. 750 | Rs. 550 |
| 10 | Silver Stainless Steel 5-Hook Cabinet Door Back Hanger | Home & Organization | Rs. 1,100 | Rs. 850 |
| 11 | Rechargeable Electric Blackhead Remover Pore Cleaner | Health & Beauty | Rs. 2,750 | Rs. 2,150 |
| 12 | REMINGTON HAIR DRYER Stylish Professional | Health & Beauty | Rs. 4,200 | Rs. 3,450 |
| 13 | SverCrest Electric Instant Water Heater Tap & Shower | Home Appliances & Toys | Rs. 5,800 | Rs. 4,650 |
| 14 | Target Manual Hand Press Water Pump for 19L Bottle Can | Kitchen & Dining | Rs. 990 | Rs. 790 |

---

## 7. Quality Assurance & Verification Summary

- [x] **TypeScript Strict Check**: `tsc --noEmit` passed with 0 errors.
- [x] **Vite Production Compilation**: `vite build` completed successfully with fine-grained chunk splitting.
- [x] **Real Asset Bundling**: All 14 product folders and brand logo copied to `public/` and `dist/`.
- [x] **Responsive Viewports**: Mobile-first responsive layouts tested across 320px, 375px, 768px, 1024px, 1440px.
- [x] **Static Host Compatibility**: Configured for root GitHub Pages (`https://HHD-Collections.github.io/`) with `404.html` fallback.
- [x] **Multiple Image Upload**: Drag & drop, client-side WebP compression, reordering, primary selection, and organized Firebase Storage paths.
- [x] **Zero Plaintext Credentials**: No hardcoded passwords or private tokens in frontend JavaScript.
- [x] **Cash on Delivery Flow**: Built-in order placement with WhatsApp messaging integration and printable receipts.
