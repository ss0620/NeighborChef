import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth/AuthProvider';

export default function Index() {
  const { session } = useAuth();
  return <Redirect href={session ? '/(tabs)/recipes' : '/(auth)/sign-in'} />;
}
