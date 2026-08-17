import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfile';
import { getCurrentLocation } from '@/lib/utils/location';
import { uploadImage } from '@/lib/utils/uploadImage';

export default function EditProfileScreen() {
  const { session } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const theme = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [sellerBio, setSellerBio] = useState(profile?.seller_bio ?? '');
  const [pickupAddress, setPickupAddress] = useState(profile?.pickup_address ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pickupLat, setPickupLat] = useState<number | null>(profile?.pickup_lat ?? null);
  const [pickupLng, setPickupLng] = useState<number | null>(profile?.pickup_lng ?? null);

  if (isLoading || !profile) return <ScreenLoading />;

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !session) return;

    setUploading(true);
    try {
      const publicUrl = await uploadImage('avatars', session.user.id, result.assets[0].uri);
      setAvatarUrl(publicUrl);
    } finally {
      setUploading(false);
    }
  }

  async function useCurrentLocation() {
    setLocating(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setPickupAddress(location.address);
        setPickupLat(location.lat);
        setPickupLng(location.lng);
      }
    } finally {
      setLocating(false);
    }
  }

  async function handleSave() {
    await updateProfile.mutateAsync({
      full_name: fullName,
      seller_bio: sellerBio,
      pickup_address: pickupAddress,
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      avatar_url: avatarUrl,
    });
    router.back();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={pickAvatar} style={styles.avatarPicker}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]} />
          )}
          <ThemedText type="link" style={{ color: '#3c87f7' }}>
            {uploading ? 'Uploading…' : 'Change photo'}
          </ThemedText>
        </Pressable>

        <TextField label="Full name" value={fullName} onChangeText={setFullName} />

        <TextField
          label="Seller bio"
          value={sellerBio}
          onChangeText={setSellerBio}
          multiline
          numberOfLines={3}
          placeholder="Tell buyers a bit about your cooking"
        />

        <View style={styles.locationRow}>
          <View style={styles.locationField}>
            <TextField
              label="Default pickup address"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder="Used to prefill new listings"
            />
          </View>
        </View>
        <Button title="Use current location" variant="secondary" loading={locating} onPress={useCurrentLocation} />

        <Button title="Save" onPress={handleSave} loading={updateProfile.isPending} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 16,
  },
  avatarPicker: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  locationRow: {
    flexDirection: 'row',
  },
  locationField: {
    flex: 1,
  },
});
