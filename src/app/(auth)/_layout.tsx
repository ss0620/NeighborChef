import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/lib/auth/AuthProvider';

export default function AuthLayout() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/(tabs)/recipes" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
