import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { addHours } from 'date-fns';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { DateTimeField } from '@/components/ui/date-time-field';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useProfile } from '@/lib/hooks/useProfile';
import type { ListingInput } from '@/lib/api/listings';
import { getCurrentLocation } from '@/lib/utils/location';
import { uploadImage } from '@/lib/utils/uploadImage';
import type { Listing, ListingCategory } from '@/types/database';

const CATEGORY_OPTIONS: { value: ListingCategory; label: string }[] = [
  { value: 'main', label: 'Main' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'snack', label: 'Snack' },
  { value: 'other', label: 'Other' },
];

const listingFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.string().refine((v) => Number(v) > 0, 'Enter a price greater than 0'),
  quantity: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, 'Must be at least 1'),
  pickupLocation: z.string().min(1, 'Pickup location is required'),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

interface ListingFormProps {
  initialListing?: Listing;
  onSubmit: (input: ListingInput) => Promise<void>;
  submitLabel: string;
  submitting: boolean;
}

export function ListingForm({ initialListing, onSubmit, submitLabel, submitting }: ListingFormProps) {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const theme = useTheme();

  const [photoUrl, setPhotoUrl] = useState<string | null>(initialListing?.photo_url ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [category, setCategory] = useState<ListingCategory>(initialListing?.category ?? 'main');
  const [pickupStart, setPickupStart] = useState(
    initialListing ? new Date(initialListing.pickup_start) : addHours(new Date(), 2)
  );
  const [pickupEnd, setPickupEnd] = useState(
    initialListing ? new Date(initialListing.pickup_end) : addHours(new Date(), 3)
  );
  const [pickupLat, setPickupLat] = useState<number | null>(initialListing?.pickup_lat ?? profile?.pickup_lat ?? null);
  const [pickupLng, setPickupLng] = useState<number | null>(initialListing?.pickup_lng ?? profile?.pickup_lng ?? null);
  const [locating, setLocating] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: initialListing?.title ?? '',
      description: initialListing?.description ?? '',
      price: initialListing ? (initialListing.price_cents / 100).toFixed(2) : '',
      quantity: initialListing ? String(initialListing.quantity_available) : '1',
      pickupLocation: initialListing?.pickup_location ?? profile?.pickup_address ?? '',
    },
  });

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !session) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadImage('listing-photos', session.user.id, result.assets[0].uri);
      setPhotoUrl(url);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function useCurrentLocation() {
    setLocating(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setValue('pickupLocation', location.address);
        setPickupLat(location.lat);
        setPickupLng(location.lng);
      }
    } finally {
      setLocating(false);
    }
  }

  function submit(values: ListingFormValues) {
    const input: ListingInput = {
      title: values.title,
      description: values.description || null,
      photoUrl,
      priceCents: Math.round(Number(values.price) * 100),
      quantityAvailable: Number(values.quantity),
      category,
      pickupStart: pickupStart.toISOString(),
      pickupEnd: pickupEnd.toISOString(),
      pickupLocation: values.pickupLocation,
      pickupLat,
      pickupLng,
    };
    return onSubmit(input);
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={pickPhoto} style={[styles.photoPicker, { backgroundColor: theme.backgroundElement }]}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} />
        ) : (
          <ThemedText themeColor="textSecondary">{uploadingPhoto ? 'Uploading…' : 'Add a photo'}</ThemedText>
        )}
      </Pressable>

      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <TextField label="Title" value={field.value} onChangeText={field.onChange} error={errors.title?.message} />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField label="Description" value={field.value} onChangeText={field.onChange} multiline numberOfLines={3} />
        )}
      />

      <View style={styles.row}>
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <View style={styles.rowItem}>
              <TextField
                label="Price ($)"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="decimal-pad"
                error={errors.price?.message}
              />
            </View>
          )}
        />
        <Controller
          control={control}
          name="quantity"
          render={({ field }) => (
            <View style={styles.rowItem}>
              <TextField
                label="Quantity available"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="number-pad"
                error={errors.quantity?.message}
              />
            </View>
          )}
        />
      </View>

      <ThemedText type="smallBold">Category</ThemedText>
      <View style={styles.categoryRow}>
        {CATEGORY_OPTIONS.map((option) => {
          const active = option.value === category;
          return (
            <Pressable
              key={option.value}
              onPress={() => setCategory(option.value)}
              style={[styles.categoryChip, { backgroundColor: active ? '#3c87f7' : theme.backgroundElement }]}>
              <ThemedText type="small" style={{ color: active ? '#ffffff' : theme.text }}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <DateTimeField label="Pickup starts" value={pickupStart} onChange={setPickupStart} minimumDate={new Date()} />
      <DateTimeField label="Pickup ends" value={pickupEnd} onChange={setPickupEnd} minimumDate={pickupStart} />

      <Controller
        control={control}
        name="pickupLocation"
        render={({ field }) => (
          <TextField
            label="Pickup location"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.pickupLocation?.message}
          />
        )}
      />
      <Button title="Use current location" variant="secondary" loading={locating} onPress={useCurrentLocation} />

      <View style={styles.submitButton}>
        <Button title={submitLabel} onPress={handleSubmit(submit)} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 14,
  },
  photoPicker: {
    height: 160,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  submitButton: {
    marginTop: 8,
  },
});
