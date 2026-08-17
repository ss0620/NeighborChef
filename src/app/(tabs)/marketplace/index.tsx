import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { FilterBar } from '@/components/marketplace/filter-bar';
import { ListingCard } from '@/components/marketplace/listing-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { useProfile } from '@/lib/hooks/useProfile';
import { useActiveListings } from '@/lib/hooks/useListings';
import { useCartStore } from '@/lib/store/cartStore';
import { haversineMiles } from '@/lib/utils/distance';
import { getCurrentLocation } from '@/lib/utils/location';
import type { ListingCategory } from '@/types/database';

export default function MarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ListingCategory | undefined>(undefined);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { data: profile } = useProfile();
  const {
    data: listings,
    isLoading,
    isRefetching,
    refetch,
  } = useActiveListings({ search: search || undefined, category });

  useEffect(() => {
    getCurrentLocation().then((location) => {
      if (location) setMyLocation({ lat: location.lat, lng: location.lng });
    });
  }, []);

  const sorted = useMemo(() => {
    if (!listings) return [];
    if (!myLocation) return listings;
    return [...listings].sort((a, b) => {
      const distanceA = a.pickup_lat != null && a.pickup_lng != null
        ? haversineMiles(myLocation.lat, myLocation.lng, a.pickup_lat, a.pickup_lng)
        : Infinity;
      const distanceB = b.pickup_lat != null && b.pickup_lng != null
        ? haversineMiles(myLocation.lat, myLocation.lng, b.pickup_lat, b.pickup_lng)
        : Infinity;
      return distanceA - distanceB;
    });
  }, [listings, myLocation]);

  const cartCount = useCartStore((state) => state.lines.reduce((sum, line) => sum + line.quantity, 0));

  return (
    <Screen>
      <View style={styles.topRow}>
        <View style={styles.searchField}>
          <TextField placeholder="Search dishes" value={search} onChangeText={setSearch} />
        </View>
        <Link href="/(tabs)/marketplace/cart" asChild>
          <Pressable style={styles.myListingsButton}>
            <Ionicons name="cart-outline" size={22} color="#3c87f7" />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <ThemedText type="small" style={styles.cartBadgeText}>
                  {cartCount}
                </ThemedText>
              </View>
            ) : null}
          </Pressable>
        </Link>
        {profile?.is_seller ? (
          <Link href="/(tabs)/marketplace/my-listings" asChild>
            <Pressable style={styles.myListingsButton}>
              <Ionicons name="albums-outline" size={22} color="#3c87f7" />
            </Pressable>
          </Link>
        ) : null}
      </View>

      <FilterBar selected={category} onSelect={setCategory} />

      {isLoading ? (
        <ScreenLoading />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          renderItem={({ item }) => {
            const distance =
              myLocation && item.pickup_lat != null && item.pickup_lng != null
                ? haversineMiles(myLocation.lat, myLocation.lng, item.pickup_lat, item.pickup_lng)
                : undefined;
            return (
              <Link href={`/(tabs)/marketplace/${item.id}`} asChild>
                <Pressable>
                  <ListingCard listing={item} distanceMiles={distance} />
                </Pressable>
              </Link>
            );
          }}
          ListEmptyComponent={
            <EmptyState title="No dishes nearby yet" subtitle="Check back soon, or turn on seller mode to list your own." />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchField: {
    flex: 1,
  },
  myListingsButton: {
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#e5484d',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    lineHeight: 12,
  },
  list: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
});
