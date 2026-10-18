# DineDirect — Complete UI Design System & Platform Template Specification

> **Purpose of this Document:**  
> This specification provides an exhaustive, blueprint-level breakdown of the **DineDirect** application. It captures the exact design palette, color tokens, typography, component hierarchies, layout architectures, domain schemas, and end-to-end user workflows.  
> **Use this document to feed into any AI coding assistant** to replicate this exact UI template for another food, hospitality, e-commerce, or service marketplace platform with minimal modifications.

---

## 1. Executive Summary & Platform Identity

### 1.1 What is DineDirect?
**DineDirect** is a modern, restaurant-first dine-in and food ordering platform designed to eliminate third-party commission fees while digitizing the entire in-restaurant and delivery dining experience.

### 1.2 Core Value Proposition
- **Contactless Table Ordering:** Diners scan a table-specific QR code to launch an instant digital menu pre-linked to their table number (zero app installation required).
- **Real-Time Kitchen Sync:** Table orders sync immediately to an interactive Kitchen Display System (KDS) / Kanban board for kitchen staff.
- **Unified Multi-Fulfillment:** Seamlessly handles **Dine-In** (table service), **Takeaway** (counter pick-up), and **Doorstep Delivery** (with interactive GPS map pin-dropping).
- **Zero Marketplace Commission:** Empower restaurant owners with their own brand identity, dynamic menu control, custom table QR code generation, and direct payment collection (UPI, Card, Cash).

### 1.3 Target Personas
1. **Diners / Customers:** Mobile-first users who want quick browsing, instant dietary filtering (Veg/Non-Veg), transparent prices, fast table ordering, and real-time status updates.
2. **Restaurant Owners & Kitchen Staff:** Tablet and desktop users needing live order dispatching (Kanban status management), instant menu item toggles (mark items out-of-stock), coupon campaigns, and printable QR tent card generation.

---

## 2. Design System & Color Palette

The design aesthetic is clean, warm, modern SaaS meets vibrant culinary appetite appeal. It relies on a high-energy **Electric Flame / Brand Orange** primary color paired with crisp white surfaces, soft neutral slate backgrounds, and sharp typography.

### 2.1 Primary Brand Palette
| Token Name | Hex Code | RGB | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Main** | `#E85D04` / `#ea580c` | `rgb(234, 88, 12)` | Primary CTA buttons, active tabs, icon highlights, key links |
| **Primary Light** | `#F48C06` / `#fb923c` | `rgb(251, 146, 60)` | Hover gradients, subtle accents, secondary progress indicators |
| **Primary Dark** | `#D00000` / `#c2410c` | `rgb(194, 65, 12)` | Active button clicks, high-emphasis alert chips, deep contrasts |
| **Primary Subtle Bg** | `rgba(234, 88, 12, 0.08)` | `rgba(234, 88, 12, 0.08)` | Active sidebar pill backgrounds, badge backgrounds, chip tint |
| **Primary Glow Shadow** | `0 4px 12px rgba(232, 93, 4, 0.25)` | — | Primary button hover elevation, floating action badges |

### 2.2 Neutrals & Slate Hierarchy
| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Dark Heading / Primary Text** | `#0f172a` / `#1D2A44` | Main page titles (`h1`, `h2`), restaurant names, card headers |
| **Body Text / Slate 700** | `#334155` | General descriptive text, order item titles, table headers |
| **Muted Text / Slate 600** | `#475569` | Inactive nav links, secondary descriptions, metadata labels |
| **Subtle Label / Slate 500** | `#64748b` | Timestamps, placeholder texts, breadcrumbs, helper captions |
| **Border / Slate 200** | `#e2e8f0` | Card borders, table dividers, input default borders |
| **Divider / Slate 100** | `#f1f5f9` | Section dividers, header bottom borders, list separators |
| **Card / Canvas Light / Slate 50**| `#f8fafc` | Input backgrounds, disabled cards, skeleton placeholders |
| **Global Background** | `#F8F9FA` | Page body background (soft off-white to prevent eye strain) |
| **Surface White** | `#FFFFFF` | Cards, modals, drawers, navbar, dropdown menus |

### 2.3 Semantic & Kitchen Order Status Colors
| Status / Semantic | Main Hex | Bg Tint Hex | Border Hex | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **PLACED (New)** | `#ea580c` | `#fff7ed` | `#fed7aa` | Incoming order awaiting kitchen acceptance |
| **ACCEPTED** | `#0284c7` | `#f0f9ff` | `#bae6fd` | Order acknowledged by kitchen |
| **PREPARING (Cooking)** | `#7c3aed` | `#f5f3ff` | `#ddd6fe` | Dish is actively being cooked in kitchen |
| **READY (Pickup)** | `#16a34a` | `#f0fdf4` | `#bbf7d0` | Food is plated, ready for table runner or guest pickup |
| **OUT_FOR_DELIVERY** | `#0d9488` | `#f0fdfa` | `#99f6e4` | Order is with delivery rider / en route |
| **DELIVERED (Completed)**| `#334155` | `#f8fafc` | `#e2e8f0` | Order successfully served or delivered |
| **REJECTED** | `#e11d48` | `#fff1f2` | `#fecdd3` | Kitchen cannot fulfill order |
| **CANCELLED** | `#64748b` | `#f1f5f9` | `#cbd5e1` | Order cancelled by guest/admin |

### 2.4 Food Dietary Signatures (Standard Indian Restaurant Norm)
- **Pure Veg Indicator:** `#16a34a` (Forest Green). Represented by a small square border with a centered solid circle:
  ```css
  border: 1.5px solid #16a34a; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;
  /* inner dot: 7px diameter #16a34a */
  ```
- **Non-Veg Indicator:** `#dc2626` (Crimson Red). Represented by a square border with a centered solid triangle:
  ```css
  border: 1.5px solid #dc2626; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;
  /* inner triangle / dot: 7px #dc2626 */
  ```

---

## 3. Typography & Shape System

### 3.1 Typography
- **Primary Font Family:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Headings (`h1`, `h2`, `h3`, `h4`):**
  - Font weight: `700` or `800`
  - Letter spacing: `-0.02em` to `-0.03em` (compact, sleek modern editorial feel)
- **Subtitles & Section Labels:**
  - Font weight: `600` or `700`
  - Letter spacing: `-0.01em`
- **Body Text:**
  - Font weight: `400` (Regular), `500` (Medium)
  - Line height: `1.5`
- **Button & Actions:**
  - Font weight: `600` or `700`
  - Text transform: `none` (no forced uppercase except for micro-tags/badges)
  - Letter spacing: `0.01em`

### 3.2 Border Radii System
- **Micro Badges / Chips:** `8px` (`borderRadius: 8`)
- **Buttons & TextFields:** `10px` (`borderRadius: 10`)
- **Containers / Small Cards:** `12px` (`borderRadius: 12`)
- **Standard Cards / Dish Cards:** `16px` (`borderRadius: 16`)
- **Modals / Dialogs / Drawers:** `16px` to `20px`

### 3.3 Shadow & Elevation Tokens
- **Card Resting:** `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid rgba(0, 0, 0, 0.06);`
- **Card Interactive Hover:**
  ```css
  transform: translateY(-3px);
  border-color: #ea580c;
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.07);
  transition: all 0.2s ease-in-out;
  ```
- **Primary Button Hover:** `box-shadow: 0 4px 12px rgba(232, 93, 4, 0.25);`
- **Floating Bar / Sticky Bar:** `box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);`

---

## 4. Theme Configuration (Ready-to-Use Material UI Definition)

```typescript
// src/theme/theme.ts
'use client'

import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#E85D04',
      light: '#F48C06',
      dark: '#D00000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2B2D42',
      light: '#4A4E69',
      dark: '#1D1E2C',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2A9D8F',
      light: '#52B788',
      dark: '#1B4332',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D2A44',
      secondary: '#6C757D',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          padding: '8px 20px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(232, 93, 4, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
})
```

---

## 5. UI Template Architecture & Page Blueprints

The app features a dual-experience architecture:
1. **The Customer Experience (Consumer App):** Focuses on instant menu discovery, table QR ordering, lightning-fast cart, and live order tracking.
2. **The Restaurant Owner Portal (Merchant App):** Focuses on live kitchen order processing (Kanban), menu & inventory control, table QR code printing, and revenue metrics.

---

### 5.1 Customer Experience Layout Architecture

```
+-----------------------------------------------------------------------------------------+
| Top Navbar / Customer Header (Sticky)                                                   |
| [Brand Logo: DineDirect]   [ Search Dishes or Restaurants... ]   [Veg Switch]   [Cart (2)] |
+-----------------------+---------------------------------------------+-------------------+
| Desktop Left Nav      | Central Dynamic Feed Area                   | Right Cart Drawer |
| (Width: 220px fixed)  |                                             | (Width: 360px)    |
|                       |  - Banner / Story Carousel                  |                   |
|  - Home               |  - Restaurant Avatar Quick Filter           | - Table Selector  |
|  - Search             |  - Category Tabs (All, Starters, Mains...)  | - Item Qty (+ / -)|
|  - Orders             |  - Dish Grid / Restaurant Grid              | - Coupon Input    |
|  - Offers             |  - Infinite Scroll Sentinel                 | - Price Breakdown |
|  - Profile            |                                             | - [Checkout CTA]  |
|  - More               |                                             |                   |
|                       |                                             |                   |
| [User Avatar / Login] |                                             |                   |
+-----------------------+---------------------------------------------+-------------------+
```

#### Detailed Customer Components:

1. **Top Header (`customer-header.tsx`):**
   - Left: Mobile hamburger menu icon (toggles left navigation drawer on mobile).
   - Center: High-visibility search trigger bar (clicking navigates to `/search?focus=true` with search icon).
   - Right: Active Cart badge counter icon button and notification triggers.
   - Sticky with background `#FFFFFF` and bottom border `1px solid #f1f5f9`.

2. **Left Navigation Sidebar (`customer-sidebar.tsx`):**
   - Brand block: 38x38px orange icon box with `<RestaurantMenuIcon />` and "DineDirect" bold logo text.
   - Nav list: Vertical pill buttons with active state highlighting (`rgba(234, 88, 12, 0.08)` background, `#ea580c` icon and bold text).
   - Bottom Profile tile: If authenticated, displays initials avatar + username + role badge + logout button. If guest, displays prominent "Sign In" button.

3. **Dish Card Component (`dish-card.tsx`):**
   - **Image Top (160px height):** Rounded 16px container with image hover zoom (`scale(1.05)`). Overlaid with Veg/Non-Veg icon tag and prep time pill (`20 mins`).
   - **Body:** Dish Title (font weight 700, Slate 900), restaurant brand tag, short description (truncated to 2 lines).
   - **Footer Action:**
     - Left: Formatted price (e.g. `₹249`).
     - Right: If quantity in cart is 0: Pill button `"ADD +"`.
     - If quantity > 0: High-contrast orange stepper block with `[-]` `[Quantity]` `[+]` for instant inline increment/decrement.
     - Out of stock / Closed state: Greyed out with overlay badge `"STORE CLOSED"` or `"OUT OF STOCK"`.

4. **Cart Sidebar & Drawer (`cart-sidebar.tsx`):**
   - Header with active restaurant name and table number selector pill.
   - Table Number selector dropdown populated dynamically from the restaurant's QR tables database.
   - Scrollable items list with thumbnail, name, unit price, and direct `+` / `-` / delete controls.
   - Coupon voucher input with instant validation feedback ("FLAT50 applied - ₹50 saved!").
   - Detailed Bill Breakdown:
     - Item Subtotal
     - Delivery / Packaging Fee (if applicable)
     - Applied Discount (in green `#16a34a`)
     - Grand Total
   - Primary CTA: Big full-width button `"Proceed to Checkout →"` linking directly to `/checkout`.

5. **Multi-Fulfillment Checkout Flow (`/checkout`):**
   - Three fulfillment tab pills:
     - **Dine-In:** Pre-selects or allows picking Table Number.
     - **Takeaway:** Counter pickup instructions and prep timing estimate.
     - **Delivery:** Renders interactive Leaflet OpenStreetMap with a draggable pin + "Use Current GPS Location" button + delivery address form.
   - Payment Mode Selection:
     - Cash on Delivery / Pay at Counter
     - Instant UPI (Google Pay, PhonePe, Paytm QR)
     - Credit / Debit Card
   - Success state redirects to Live Order Ticket (`/orders`).

---

### 5.2 Restaurant Owner Experience Layout Architecture

The Owner Portal lives under `/owner/*` and gives restaurateurs full operational independence.

```
+-----------------------------------------------------------------------------------------+
| Owner Top Bar:  [DineDirect Owner]   [Live Status: OPEN/CLOSED Switch]   [Sound Bell]    |
+-----------------------------------------------------------------------------------------+
| Tab Bar / Subnav:  [Dashboard]   [Live Orders (Kanban)]   [Menu]   [QR Studio]   [Deals]|
+-----------------------------------------------------------------------------------------+
```

#### Detailed Owner Modules:

1. **Owner Dashboard (`/owner/dashboard`):**
   - Restaurant status toggle: Instant switch between **"Open for Orders"** (green) and **"Temporarily Closed"** (red).
   - Key Operational Metrics: Total orders today, Gross sales (₹), Average ticket size, Active table occupancy.
   - Quick Nav Tiles:
     - 🛎️ **Live Orders:** Instant jump to Kitchen Kanban board.
     - 📋 **Menu & Items:** Add dish, toggle stock availability, organize categories.
     - 🖨️ **Table QR Codes:** Generate, preview, and download custom table standees.
     - 🏷️ **Discounts & Coupons:** Configure promotional discount codes.

2. **Live Kitchen Kanban Board (`/owner/orders`):**
   - 5 structured workflow columns:
     1. **Incoming / New (PLACED & ACCEPTED):** Orange badge with elapsed timer (e.g. "2 mins ago"). Audio chime rings when new order lands.
     2. **Preparing (PREPARING):** Purple badge. Shows itemized dish checklist with quantities and customer special cooking notes.
     3. **Ready for Pickup (READY):** Green badge. Alerts table runner or customer that food is plated.
     4. **Out for Delivery (OUT_FOR_DELIVERY):** Teal badge. For doorstep delivery orders with rider status.
     5. **Delivered / Done (DELIVERED):** Archived completed orders.
   - Fast Action Buttons on cards: One-click status advance (e.g., `"Accept & Prepare 🍳"` -> `"Mark as Ready 🛎️"` -> `"Mark as Delivered ✅"`).
   - Printable Kitchen Order Ticket (KOT): Dialog formatted for standard 80mm thermal receipt printers.

3. **Menu Management Studio (`/owner/menu`):**
   - Left/Top: Category Tabs with sort order (`Starters`, `Main Course`, `Desserts`, `Beverages`). Add Category modal.
   - Dish Card grid: Cards displaying item image, price, veg/non-veg tag, and two vital toggles:
     - **In Stock / Out of Stock switch:** Instantly hides/shows dish to customers.
     - **Edit Dish Modal:** Name, price, description, prep time, category selector, image upload/URL.

4. **Table QR Code Generator & Studio (`/owner/qr`):**
   - Table Number & Label input (e.g., Table 1, Table 2, Rooftop Table 5, Patio 10).
   - Real-time QR SVG renderer with brand color picker (`Brand Orange #ea580c`, `Obsidian Slate #0f172a`, etc.).
   - Printable Table Tent Card template preview with:
     - Restaurant logo and name
     - "Scan to View Menu & Order" instructions
     - High-resolution scannable QR code linking to `/restaurant/[id]?table=[number]&qrId=[id]`
     - Download buttons for SVG and PNG.
   - Scan Analytics: Track scan count per table.

5. **Coupons & Promotions Engine (`/owner/coupons`):**
   - Create coupon codes (e.g., `FIRST50`, `WEEKEND20`).
   - Discount type: `PERCENTAGE` (with max discount cap) or `FLAT` amount.
   - Minimum order value threshold and expiry date scheduler.

---

## 6. Complete Data Schema (Prisma / Database Blueprint)

Use this schema definition to establish the exact Postgres/Supabase tables for this application:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  RESTAURANT_OWNER
}

enum OrderStatus {
  PLACED
  ACCEPTED
  PREPARING
  READY
  OUT_FOR_DELIVERY
  DELIVERED
  REJECTED
  CANCELLED
}

enum OrderType {
  DINE_IN
  TAKEAWAY
  DELIVERY
}

enum DiscountType {
  PERCENTAGE
  FLAT
}

enum QRType {
  TABLE
  RESTAURANT
}

model User {
  id        String       @id @default(uuid())
  email     String       @unique
  password  String
  role      String       @default("CUSTOMER") // CUSTOMER | RESTAURANT_OWNER
  name      String
  phone     String?
  createdAt DateTime     @default(now())
  
  restaurants Restaurant[]
  orders      Order[]
}

model Restaurant {
  id           String         @id @default(uuid())
  ownerId      String
  name         String
  description  String
  address      String
  city         String
  phone        String
  imageUrl     String?
  cuisine      String         @default("[]") // JSON string array e.g. ["North Indian", "Chinese"]
  openingTime  String         @default("09:00")
  closingTime  String         @default("22:00")
  isOpen       Boolean        @default(true)
  isApproved   Boolean        @default(true)
  fssaiNumber  String?
  deliveryFee  Float          @default(30.0)
  minOrder     Float          @default(100.0)
  createdAt    DateTime       @default(now())

  owner        User           @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  categories   MenuCategory[]
  orders       Order[]
  qrCodes      QRCode[]
  coupons      Coupon[]
}

model MenuCategory {
  id           String     @id @default(uuid())
  restaurantId String
  name         String
  sortOrder    Int        @default(0)

  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  items        MenuItem[]
}

model MenuItem {
  id           String       @id @default(uuid())
  categoryId   String
  name         String
  description  String
  price        Float
  imageUrl     String?
  isVeg        Boolean      @default(true)
  isAvailable  Boolean      @default(true)
  prepTimeMins Int          @default(20)

  category     MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  orderItems   OrderItem[]
}

model Order {
  id           String      @id @default(uuid())
  customerId   String
  restaurantId String
  status       String      @default("PLACED") // See OrderStatus enum
  orderType    String      @default("DINE_IN") // DINE_IN | TAKEAWAY | DELIVERY
  tableNumber  String?
  subtotal     Float       @default(0.0)
  discount     Float       @default(0.0)
  totalAmount  Float
  deliveryFee  Float       @default(0.0)
  address      String
  note         String?
  paymentMode  String      @default("CASH") // CASH | UPI | CARD
  couponCode   String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  customer    User        @relation(fields: [customerId], references: [id], onDelete: Cascade)
  restaurant  Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  items       OrderItem[]
}

model OrderItem {
  id         String    @id @default(uuid())
  orderId    String
  menuItemId String?
  name       String
  price      Float
  quantity   Int

  order      Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem   MenuItem? @relation(fields: [menuItemId], references: [id], onDelete: SetNull)
}

model QRCode {
  id            String      @id @default(uuid())
  restaurantId  String
  tableNumber   String
  label         String
  code          String
  url           String
  color         String      @default("#ea580c")
  scansCount    Int         @default(0)
  qrType        String      @default("TABLE")
  createdAt     DateTime    @default(now())
  lastScannedAt DateTime?

  restaurant    Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
}

model Coupon {
  id             String      @id @default(uuid())
  restaurantId   String
  code           String
  description    String?
  discountType   String      @default("PERCENTAGE") // PERCENTAGE | FLAT
  discountValue  Float
  minOrderAmount Float       @default(0.0)
  maxDiscount    Float?
  isActive       Boolean     @default(true)
  usageCount     Int         @default(0)
  expiresAt      DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @default(now()) @updatedAt

  restaurant     Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@unique([restaurantId, code])
}

model TrendingKeyword {
  id          String   @id @default(uuid())
  keyword     String   @unique
  category    String   @default("trending")
  isTrending  Boolean  @default(true)
  searchCount Int      @default(0)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 7. Master AI Prompt to Replicate or Fork this UI

> **Copy and paste the prompt below to any other AI (Claude, ChatGPT, Cursor, etc.) when you want to build a sister platform with the exact same visual identity and workflow:**

```markdown
You are an expert full-stack developer and UI/UX designer. Build a web application with the exact visual identity, layout architecture, and theme described below, adapting it to [INSERT YOUR NEW DOMAIN/INDUSTRY, e.g. "Cocktail Bar & Lounge", "Coffee Roastery", "Hotel Room Service"]:

1. BRAND DESIGN & COLOR PALETTE:
   - Primary Accent: Electric Flame Orange (#E85D04 / #ea580c), light variant (#F48C06), deep variant (#D00000). Active badge tints: rgba(234, 88, 12, 0.08).
   - Neutrals: Background default #F8F9FA, Surface cards #FFFFFF, Primary text #0f172a, Body text #334155, Muted text #64748b, Card borders #e2e8f0.
   - Statuses: PLACED (#ea580c), PREPARING (#7c3aed), READY (#16a34a), OUT_FOR_DELIVERY (#0d9488), DELIVERED (#334155).
   - Food Tags: Pure Veg (#16a34a green square with dot), Non-Veg (#dc2626 red square with triangle).
   - Shapes & Radii: 10px buttons, 16px cards, 8px badges. Hover effects: translateY(-3px) with border-color #ea580c and subtle drop shadow.

2. CUSTOMER EXPERIENCE ARCHITECTURE:
   - Sticky Header with brand logo, central search bar trigger, veg/non-veg switch, and cart badge button.
   - 3-Column Desktop / Mobile Drawer layout:
     * Left: 220px vertical pill sidebar (Home, Search, Orders, Offers, Profile, More).
     * Center: Dynamic feed with category tabs, dish cards with image, prep time, price, and instant (+ / -) cart quantity steppers.
     * Right: 360px sticky Cart drawer with dynamic Table Number selector, promo code voucher validator, bill breakdown, and Checkout CTA.
   - Checkout Flow supporting 3 modes: Dine-In (table selector), Takeaway, and Delivery (with interactive GPS map pin-drop).
   - Live Order History & Tracking page with status pills and re-order button.

3. OWNER / MERCHANT DASHBOARD:
   - Live Kitchen Kanban Board with 5 columns (New, Preparing, Ready, Out, Completed), elapsed timers, audio chime alerts, and one-click status advancement.
   - Menu Management Studio with category tabs, instant "In Stock / Out of Stock" switches, and Add/Edit Dish modals.
   - Table QR Studio to generate custom table QR codes with SVG download and printable table tent previews.
   - Restaurant Status Switch (Open / Closed toggle).

4. TECH STACK:
   - Next.js (App Router), React, TypeScript, Material UI (MUI v6) or Tailwind CSS matching the exact hex codes above, Redux Toolkit for cart state, and Prisma with Postgres.
```

---

## 8. Summary of Project Routes

| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | Landing page highlighting QR ordering, benefits, and CTA | Public |
| `/home` | Main customer browsing feed (Restaurants & Dishes view modes) | Public / Diner |
| `/restaurant/[restaurant_id]` | Restaurant detail view with category tabs, menu items, & cart | Public / Diner |
| `/search` | Search dishes and restaurants with trending chips & filters | Public / Diner |
| `/checkout` | 3-in-1 Checkout (Dine-In table, Takeaway, Delivery map) | Diner |
| `/orders` | Customer live and past order history with tracking badges | Customer |
| `/offers` | Available promo codes and instant copyable discounts | Public / Diner |
| `/more` | FAQs, how table QR works, and customer support | Public |
| `/login` & `/register` | Authentication with role selector (Customer vs Owner) | Public |
| `/owner/dashboard` | Restaurant owner command center & operational stats | Owner |
| `/owner/orders` | Live Kitchen Kanban display board with audio alerts & KOT print | Owner |
| `/owner/menu` | Menu categories & dish inventory management | Owner |
| `/owner/qr` | Table QR code generator, scan stats, & printable tent studio | Owner |
