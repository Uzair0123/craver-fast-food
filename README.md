# 🍔 Craver Fast Food Co. — Official Web Application

> **A modern, premium fast-food restaurant web application built with clean, modular vanilla web standards.**

---

## 🌟 Project Highlights

* **🎨 Craver Design System:** Vibrant fast-food palette (Flame Red `#FF3838`, Cheddar Gold `#FFB800`, Obsidian Slate `#0F172A`).
* **🧩 Modular Component Architecture:** Strictly decoupled stylesheets, scripts, and UI modules.
* **📱 100% Mobile & Touch Optimized:** Responsive hamburger drawer, fluid typography, and sticky elevated navbar.
* **🛒 Cross-Page Cart State:** Centralized `localStorage` synchronizer ensuring live cart counters across all pages.
* **⚡ Zero Build Overhead:** 100% pure vanilla HTML5, CSS3, and modern ES6 JavaScript.

---

## 📂 Project Structure

```
fastfood-restaurant/
├── index.html              # Landing Page
├── menu.html               # Food Menu & Live Filtering (Phase 3)
├── about.html              # Brand Story & Standards (Phase 7)
├── contact.html            # Locations, Hours & Inquiries (Phase 7)
├── cart.html               # Shopping Cart (Phase 5)
│
├── assets/
│   ├── images/
│   │   ├── logo/           # Brand logos & favicons
│   │   ├── food/           # Food images
│   │   ├── banners/        # Hero promotional banners
│   │   └── icons/          # Dietary badges (Veg, Spicy)
│   └── fonts/              # Typography
│
├── css/
│   ├── variables.css       # Design tokens & color system
│   ├── reset.css           # CSS reset
│   ├── global.css          # Buttons, badges, toasts, containers
│   ├── header.css          # Navigation bar, mobile drawer, cart badge
│   ├── footer.css          # Footer, hours, newsletter
│   └── responsive.css      # Mobile & tablet breakpoints
│
├── js/
│   ├── app.js              # Application coordinator
│   ├── navigation.js       # Header scroll, mobile drawer, active links
│   ├── storage.js          # LocalStorage cart management
│   └── toast.js            # Floating notification alerts
│
├── data/
│   └── products.js         # Food data schema (Phase 3)
└── README.md
```

---

## 🚀 How to Run Locally

### Option 1: Direct File
Double-click `index.html` in your file browser.

### Option 2: Local Python Server (Recommended)
```bash
cd fastfood-restaurant
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.
