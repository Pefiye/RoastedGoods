# RoastedGoods

**RoastedGoods** is a modern, full-stack coffee shop and e-commerce web application. Built with SvelteKit and Supabase, it provides a seamless shopping experience for customers and a management system for administrators and cashiers.

## Features

- **Role-Based Access Control (RBAC):** Three distinct user roles with secure, protected routes.
  - **Admin:** Complete access to manage products, view sales dashboards, and handle user accounts.
  - **Cashier:** Dedicated real-time interface for receiving, processing, and fulfilling customer orders.
  - **Customer:** Can browse the menu, filter items, add to cart, and securely checkout.
- **Dynamic Menu & Fast Filtering:** Server-side paginated menu capable of efficiently handling large datasets (8,000+ products) with robust database-level categorization.
- **Real-Time Order Tracking:** Utilizes Supabase Realtime WebSockets to update the cashier dashboard instantly when new orders are placed.
- **Secure Authentication:** Seamless integration with Supabase SSR Auth, including Google OAuth support.
- **Payment Gateway Integration:** Integrated with Midtrans for secure, reliable checkout and payment processing via webhook callbacks.
- **Polished UI/UX:** Built with Svelte 5, leveraging `$state()` runes and `{@render}` snippets. Features custom SCSS styling, smooth number animations (Odometer), and a non-intrusive custom Toast notification system.

## Tech Stack

- **Frontend:** SvelteKit (Svelte 5)
- **Styling:** SCSS & Bootstrap
- **Backend:** SvelteKit & Node
- **Database:** Supabase (PostgreSQL, Auth, Realtime)
- **Payment Gateway:** Midtrans
- **Build Tool:** Vite
