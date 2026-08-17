import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useTheme } from '@/hooks/use-theme';
import { useListing } from '@/lib/hooks/useListings';
import { useCartStore } from '@/lib/store/cartStore';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading } = useListing(id);
  const theme = useTheme();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading || !listing) return <ScreenLoading />;

  const maxQuantity = listing.quantity_available;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {listing.photo_url ? (
          <Image source={{ uri: listing.photo_url }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, { backgroundColor: theme.backgroundElement }]} />
        )}

        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.title}>
            {listing.title}
          </ThemedText>
          <ThemedText type="subtitle">${(listing.price_cents / 100).toFixed(2)}</ThemedText>
        </View>

        <ThemedText themeColor="textSecondary">By {listing.profiles.full_name ?? 'A home cook'}</ThemedText>
        {listing.description ? <ThemedText>{listing.description}</ThemedText> : null}

        <View style={styles.metaBlock}>
          <ThemedText type="smallBold">Pickup window</ThemedText>
          <ThemedText themeColor="textSecondary">
            {format(new Date(listing.pickup_start), 'EEE MMM d, h:mm a')} –{' '}
            {format(new Date(listing.pickup_end), 'h:mm a')}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{listing.pickup_location}</ThemedText>
        </View>

        <ThemedText type="small" themeColor="textSecondary">
          {maxQuantity} available
        </ThemedText>

        {maxQuantity > 0 ? (
          <>
            <View style={styles.stepperRow}>
              <Pressable
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={[styles.stepperButton, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="smallBold">−</ThemedText>
              </Pressable>
              <ThemedText type="smallBold">{quantity}</ThemedText>
              <Pressable
                onPress={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                style={[styles.stepperButton, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="smallBold">+</ThemedText>
              </Pressable>
            </View>

            <Button
              title={added ? 'Added to Cart ✓' : 'Add to Cart'}
              onPress={() => {
                addItem(listing.id, quantity);
                setAdded(true);
              }}
            />
          </>
        ) : (
          <ThemedText style={styles.soldOut}>Sold out</ThemedText>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 12,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 26,
    lineHeight: 30,
  },
  metaBlock: {
    gap: 4,
    marginTop: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOut: {
    color: '#e5484d',
  },
});
