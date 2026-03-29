# Architectural & Feature Suggestions for the Wallet Application

Based on an analysis of the React Native (mobile) and Express/Prisma (backend) codebase, here are some key suggestions for improving the app's performance, stability, and future scalability:

### 1. 🔔 Push Notifications for Budget Alerts
The budgets screen already tracks spending percentages ("Nearing limit" / "Budget exceeded"). Integrate **[Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)** to proactively alert users when they hit 75% or 90% of a category budget, rather than requiring them to open the Budgets tab to check.

### 2. 📊 Migrate Analytics to React Query
Analytics (`analytics.jsx`) still uses raw `fetchWithAuth` + manual `useState`/`useFocusEffect`. Migrating it to `useQuery` with structured keys like `['analytics', userId, month, year]` would give you:
- Instant tab switching (cached data renders immediately)
- Automatic staleness management (no redundant re-fetches)
- Consistency with the Home tab's data layer

### 3. 🔄 Migrate Budgets & Recurring Hooks to React Query
Same story — `useBudget.js` and `useRecurring.js` still use manual `fetchWithAuth` + `useState`. Migrating them would unify your entire data layer under one framework and give every screen the same caching, deduplication, and optimistic update benefits.

### 4. 🌐 Offline Support with React Query Persist
Since the app is already on React Query, adding **[@tanstack/react-query-persist-client](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient)** with `AsyncStorage` as the persister would let users view their last-known data even without internet. Mutations would queue and retry when connectivity returns.

### 5. 🧪 End-to-End Testing with Maestro
The project already has a `.maestro` directory. Write Maestro flows to automate critical paths:
- Login → Create Transaction → Verify it appears on Home
- Delete Transaction → Verify it disappears + Analytics updates
- Budget creation and threshold checks

### 6. 🔐 Row-Level Security (RLS) on Supabase
Currently, the API relies on the Express `verifyAuth` middleware to scope data to the authenticated user. Adding **Supabase RLS policies** on the `transactions`, `budgets`, and `recurring` tables would provide a second layer of defense — even if someone bypasses the API, the database itself rejects unauthorized access.

### 7. 📱 Biometric Authentication
Since the app already uses `expo-secure-store` for encrypted token storage, adding **biometric unlock** (Face ID / fingerprint) via **[expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)** would complete the security story for a financial app. Users would authenticate biometrically before the app decrypts their session.

### 8. 🎨 Skeleton Loading Screens
Replace the simple `ActivityIndicator` spinners on Analytics, Budgets, and Recurring tabs with **skeleton placeholder screens** (shimmer effects). This makes the app feel significantly more polished and modern during initial data loads.
