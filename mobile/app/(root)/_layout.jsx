import { useUser } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/stack';
import PageLoader from "../../components/PageLoader";

export default function Layout() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <PageLoader />;      // tiny UX bump
  if (!isSignedIn) return <Redirect href={"/sign-in"} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}