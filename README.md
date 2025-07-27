# Project-S Fullstack E-Commerce Platform

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Frontend Logic](#frontend-logic)
  - [Routing & Authentication](#routing--authentication)
  - [State Management](#state-management)
  - [Checkout & EMI Flow](#checkout--emi-flow)
  - [Order, Cart, Wishlist](#order-cart-wishlist)
  - [Admin Panel](#admin-panel)
- [Backend Logic](#backend-logic)
  - [API Routing](#api-routing)
  - [Authentication & Session](#authentication--session)
  - [Order & EMI Processing](#order--emi-processing)
  - [Payment Integration](#payment-integration)
  - [Admin APIs](#admin-apis)
- [EMI Module](#emi-module)
  - [Frontend EMI Logic](#frontend-emi-logic)
  - [Backend EMI Logic](#backend-emi-logic)
  - [Scheduler & Auto-Payment](#scheduler--auto-payment)
- [Security](#security)
- [Dependencies](#dependencies)
- [How to Run](#how-to-run)
- [Development Notes](#development-notes)

---

## Overview

Project-S is a fullstack e-commerce platform supporting:
- User authentication (local & Google OAuth)
- Product catalog, cart, wishlist, and orders
- EMI (Equated Monthly Installment) purchase and payment flow
- Admin dashboard for managing users, products, and orders
- Razorpay payment integration
- Secure session, CSRF, and role-based access

---

## Architecture

- **Frontend:** React (with Redux Toolkit, Ant Design, Framer Motion)
- **Backend:** Node.js (Express, Mongoose, Passport, CSRF, CORS)
- **Database:** MongoDB (Mongoose ODM)
- **Payment:** Razorpay
- **Session:** Express-session (cookie-based)
- **Security:** CSRF, CORS, JWT (for password reset), Passport.js

---

## Folder Structure

```
project-s/
  backend/
    controllers/
    models/
    routes/
    config/
    utils/
    cron/
    app.js
    server.js
  frontend/
    src/
      components/
      pages/
      store/
      utils/
      services/
      App.jsx
    public/
    index.html
```

---

## Frontend Logic

### Routing & Authentication

- **Routing:** Uses `react-router-dom` for client-side routing.
- **ProtectedRoute/AdminRoute:** Custom wrappers to restrict access based on authentication and role.
- **Session Check:** On route entry, checks `/auth/check-session` to verify user session.
- **User Context:** Provides user info globally via React Context.

### State Management

- **Redux Toolkit:** Used for all major state (cart, orders, wishlist, user, admin).
- **Persisted State:** Uses `redux-persist` to keep state across reloads.
- **Async Thunks:** All API calls are handled via thunks for loading/error handling.

### Checkout & EMI Flow

- **Cart:** Users add products to cart, update quantity, remove, or clear cart.
- **Checkout:** Multi-step form (cart summary, shipping, payment, review).
- **Payment Modes:** Supports Full, COD, ONLINE, and EMI.
- **EMI Selection:** If EMI is available, user selects plan, which is sent in order payload.
- **Razorpay:** For ONLINE/EMI, order is created on backend, then Razorpay checkout is triggered.
- **Order Placement:** After payment, order is placed via Redux thunk.

### Order, Cart, Wishlist

- **Order History:** `/orders` page lists all user orders, with details and tracking.
- **Wishlist:** Users can add/remove products, and move items between cart and wishlist.
- **Cart:** Shows all items, allows quantity update, coupon application, and checkout.

### Admin Panel

- **Dashboard:** Shows stats (users, orders, products, revenue), recent orders, low stock.
- **Products:** CRUD for products, bulk import/export, JSON import, image upload.
- **Orders:** View and update order status, track payments.
- **Users:** View, edit, activate/deactivate, change role, delete users.

---

## Backend Logic

### API Routing

- **Express Routers:** Each resource (products, users, orders, cart, wishlist, emi, admin, payment) has its own router.
- **CSRF Protection:** Applied globally except for payment webhooks.
- **Session:** Express-session stores user session in cookies.

### Authentication & Session

- **Passport.js:** Handles local and Google OAuth authentication.
- **Session:** User info is stored in session after login.
- **Role-based Access:** `isAuthenticated` and `isAdmin` middleware protect routes.

### Order & EMI Processing

- **Order Creation:** On `/api/orders`, creates order from cart, verifies payment if ONLINE, creates EMI order if EMI selected.
- **EMI Order:** If EMI, creates an `EmiOrder` document with schedule, links to order.
- **Order Status:** Tracks order status (PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED).
- **Stock Update:** On order, decrements product stock; on cancel, restores stock.

### Payment Integration

- **Razorpay:** `/api/payment/create-order` creates a Razorpay order, returns order ID for frontend checkout.
- **Webhook:** `/api/payment/webhook` (no CSRF) for payment status updates (future use).
- **CSRF:** All payment and order routes are CSRF-protected except webhook.

### Admin APIs

- **Dashboard:** `/api/admin/dashboard/stats` returns stats for dashboard.
- **User Management:** CRUD, role/status update, activity stats.
- **Product Management:** CRUD, bulk import/export.
- **Order Management:** View/update all orders, update status.

---

## EMI Module

### Frontend EMI Logic

- **EmiModule:** Component for selecting EMI plan, viewing schedule, and paying installments.
- **EmiOrderPayment:** Lists all EMI orders for logged-in user, allows payment of due installments.
- **Checkout Integration:** If EMI selected, plan is included in order payload.

### Backend EMI Logic

- **EmiOrder Model:** Stores EMI schedule, user, product, monthly/total amount, status.
- **Order Controller:** On EMI order, creates EMI schedule and links to order.
- **EMI APIs:** `/api/emi/my` returns all EMI orders for user; `/api/emi/:emiOrderId/pay/:scheduleIndex` marks installment as paid.
- **Admin EMI APIs:** View/update all EMI orders, update schedule status, create/update EMI plans.

### Scheduler & Auto-Payment

- **Scheduler Script:** `backend/cron/emiScheduler.js` runs daily (via cron), auto-pays due EMIs for users with auto-payment enabled, marks overdue as LATE, applies penalties.
- **AutoPay Logic:** Finds all due EMI schedules, simulates payment, marks as PAID, updates status.
- **Penalty Logic:** Marks overdue EMIs as LATE, applies penalty.

---

## Security

- **CSRF:** All state-changing routes are CSRF-protected using `csurf` and cookies.
- **CORS:** Only allows requests from whitelisted origins.
- **Session:** Secure, HTTP-only cookies for session.
- **Password Hashing:** User passwords are hashed (see User model).
- **Role Checks:** All admin routes require `isAdmin` middleware.

---

## Dependencies

### Backend

- express, mongoose, passport, passport-local, passport-google-oauth20
- express-session, csurf, cors, cookie-parser
- razorpay, dotenv, bcrypt, jsonwebtoken

### Frontend

- react, react-dom, react-router-dom, redux, @reduxjs/toolkit, redux-persist
- antd, @ant-design/icons, axios, framer-motion, aos, lottie-react

---

## How to Run

### Backend

1. Install dependencies: `npm install`
2. Set up `.env` with MongoDB URI, session secret, Razorpay keys, etc.
3. Start server: `node server.js`
4. (Optional) Start EMI scheduler: `node backend/cron/emiScheduler.js` (schedule with cron)

### Frontend

1. Install dependencies: `npm install`
2. Set up `src/config/constants.js` with API URL and Razorpay key.
3. Start dev server: `npm run dev`

---

## Development Notes

- **API URLs:** All API endpoints are prefixed with `/api` (except `/auth`).
- **Session:** Session is required for all authenticated routes.
- **CSRF:** Frontend fetches CSRF token from `/api/csrf-token` and sends it in `X-CSRF-Token` header.
- **EMI:** Only one product per EMI order is supported in current logic.
- **Admin:** Use `/admin` routes for all admin operations.
- **Testing:** Use Postman or frontend to test all flows (auth, cart, checkout, EMI, admin).

---

## File/Module Relationships

- **Frontend**
  - `App.jsx`: Main router, wraps all pages, handles protected/admin routes.
  - `store/`: Redux slices for cart, orders, wishlist, user, admin, EMI.
  - `components/Emi/emi.jsx`: EMI plan selection and schedule.
  - `components/Emi/EmiOrderPayment.jsx`: Lists all EMI orders for user.
  - `pages/Checkout/Checkout.jsx`: Handles checkout, payment, EMI logic.
  - `pages/Account/Account.jsx`: User dashboard, includes EMI tab.
- **Backend**
  - `controllers/`: All business logic for each resource.
  - `models/`: Mongoose schemas for User, Product, Order, EmiOrder, Cart, Wishlist.
  - `routes/`: Express routers for each resource.
  - `app.js`: Main Express app, applies middleware, sets up routes.
  - `cron/emiScheduler.js`: Scheduler for EMI auto-payment and penalties.

---

## Example EMI Flow

1. **User selects EMI plan on product/checkout page.**
2. **Order is placed with EMI plan in payload.**
3. **Backend creates order and EMI schedule (`EmiOrder`).**
4. **User can view EMI schedule and pay installments from account page or `/emi/order-payment`.**
5. **Scheduler runs daily to auto-pay due EMIs and apply penalties for overdue.**
6. **Admin can view and manage all EMI orders from admin dashboard.**

---

## Questions?

For any questions, please refer to the code comments in each file, or contact the project maintainer.

```
**End of Documentation**
```
