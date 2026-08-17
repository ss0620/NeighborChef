import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const { session } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const theme = useTheme();

  if (isLoading || !profile) return <ScreenLoading />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="person" size={32} color={theme.textSecondary} />
          </View>
          <View>
            <ThemedText type="subtitle">{profile.full_name || 'Add your name'}</ThemedText>
            <ThemedText themeColor="textSecondary">{session?.user.email}</ThemedText>
          </View>
        </View>

        <Link href="/(tabs)/profile/edit" asChild>
          <Button title="Edit Profile" variant="secondary" />
        </Link>

        <Card style={styles.sellerCard}>
          <View style={styles.sellerRow}>
            <View style={styles.sellerTextCol}>
              <ThemedText type="smallBold">Seller Mode</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Turn this on to list dishes for sale in the Marketplace.
              </ThemedText>
            </View>
            <Switch
              value={profile.is_seller}
              onValueChange={(value) => updateProfile.mutate({ is_seller: value })}
            />
          </View>
        </Card>

        <Button title="Sign Out" variant="destructive" onPress={() => supabase.auth.signOut()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerCard: {
    marginTop: 8,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sellerTextCol: {
    flex: 1,
    gap: 4,
  },
});
