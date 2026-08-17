import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { supabase } from '@/lib/supabase';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSignUp() {
    setError(null);
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      // Email confirmation is required before a session is issued.
      setConfirmationSent(true);
    }
  }

  if (confirmationSent) {
    return (
      <Screen style={styles.container}>
        <ThemedText type="subtitle">Check your email</ThemedText>
        <ThemedText themeColor="textSecondary">
          We sent a confirmation link to {email}. Confirm your email, then sign in.
        </ThemedText>
        <Link href="/(auth)/sign-in" asChild>
          <Button title="Back to Sign In" variant="secondary" />
        </Link>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.form}>
        <ThemedText type="title">Create Account</ThemedText>

        <TextField label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" />
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
          autoComplete="password-new"
        />
        {error ? (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <Button
          title="Sign Up"
          onPress={handleSignUp}
          loading={loading}
          disabled={!email || !password || !fullName}
        />

        <Link href="/(auth)/sign-in" asChild>
          <ThemedText type="link" style={styles.link}>
            Already have an account? Sign in
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
    gap: 16,
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
