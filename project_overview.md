# Project Overview: reactnative-wallet-app

This document provides a high-level summary of the `reactnative-wallet-app-main` repository based on the initial scan.

## 1. Top-Level Structure
The project is split into two primary directories:
- **`backend/`**: A Node.js API backend.
- **`mobile/`**: A React Native frontend built with Expo.

---

## 2. Backend (`/backend`)
The backend is a lightweight Node.js server to handle API requests (like transactions) and database interactions.

### Tech Stack
- **Framework**: Express.js
- **Database**: Neon Serverless Postgres (`@neondatabase/serverless`)
- **Caching & Rate Limiting**: Upstash Redis (`@upstash/redis`, `@upstash/ratelimit`)
- **Background Jobs**: Node Cron (`cron`)

### Architecture
- **Entry point**: `src/server.js` initializes the Express app, sets up middleware like rate limiting and CORS, and connects to the database.
- **Routes**: API endpoints are organized under `src/routes/` (e.g., `/api/transactions`).
- **Middleware**: Custom middleware is in `src/middleware/` (e.g., `rateLimiter.js`).
- **Config**: Database setup and cron jobs are in `src/config/`.

---

## 3. Mobile App (`/mobile`)
The mobile app is built using React Native and Expo, utilizing modern file-based routing and a robust authentication provider.

### Tech Stack
- **Framework**: React Native with Expo (SDK 53)
- **Routing**: Expo Router (file-based routing within the `/app` directory)
- **Authentication**: Clerk for Expo (`@clerk/clerk-expo`)
- **Styling / Icons**: Custom components and Expo Vector Icons.

### Architecture
- **Routing Layout**: The `app/` folder uses group routing with `(auth)` for unauthenticated screens (login/signup) and `(root)` for the main authenticated app experience.
- **Components**: Reusable UI elements are kept in the `components/` directory.
- **Hooks & Constants**: Custom React hooks are in `hooks/` and overarching constants are in `constants/`.

---

## Conclusion
This is a modern full-stack mobile application. The frontend uses Expo with file-based routing and Clerk for authentication. The backend is an Express server connected to a serverless Neon database, protected by Upstash rate limiting, and includes cron jobs for scheduled tasks.
