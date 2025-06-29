import { Slot } from 'expo-router';
import SafeScreen from "@/components/SafeScreen";
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants"; // ✅ Add this line

export default function RootLayout() {
  const publishableKey = Constants.expoConfig.extra.clerkPublishableKey; // ✅ Read the key

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeScreen>
        <Slot />
      </SafeScreen>
      <StatusBar style="dark" />
    </ClerkProvider>
  );
}

