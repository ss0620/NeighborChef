import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) setError(signInError.message);
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.form}>
        <ThemedText type="title">HomeCooks</ThemedText>
        <ThemedText themeColor="textSecondary">Sign in to plan meals and browse the marketplace.</ThemedText>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        {error ? (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <Button title="Sign In" onPress={handleSignIn} loading={loading} disabled={!email || !password} />

        <Link href="/(auth)/sign-up" asChild>
          <ThemedText type="link" style={styles.link}>
            Don&apos;t have an account? Sign up
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  form: {
    gap: 16,
  },
  error: {
    color: '#e5484d',
  },
  link: {
    textAlign: 'center',
    marginTop: 8,
  },
});
