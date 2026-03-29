import * as Sentry from '@sentry/react-native';
import { Slot } from 'expo-router';
import SafeScreen from "@/components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { requestNotificationPermissions } from '../lib/notifications';
import { useEffect } from 'react';

// Initialize Sentry for production crash reporting
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  // Disable in development to avoid noise
  enabled: !__DEV__,
  tracesSampleRate: 0.2,
});

const queryClient = new QueryClient();

function RootLayout() {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <SafeScreen>
            <Slot />
          </SafeScreen>
          <StatusBar style="auto" />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
