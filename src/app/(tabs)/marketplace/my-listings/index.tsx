import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';

import { ListingCard } from '@/components/marketplace/listing-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useDeleteListing, useMyListings, useSetListingStatus } from '@/lib/hooks/useListings';
import type { Listing } from '@/types/database';
import type { ListingWithCook } from '@/lib/api/listings';
import { useProfile } from '@/lib/hooks/useProfile';

export default function MyListingsScreen() {
  const { data: listings, isLoading, isRefetching, refetch } = useMyListings();
  const { data: profile } = useProfile();
  const setStatus = useSetListingStatus();
  const deleteListing = useDeleteListing();

  if (isLoading || !profile) return <ScreenLoading />;

  function toWithCook(listing: Listing): ListingWithCook {
    return { ...listing, profiles: { id: profile!.id, full_name: profile!.full_name, avatar_url: profile!.avatar_url } };
  }

  function confirmManage(listing: Listing) {
    const options: { text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }[] = [
      { text: 'Cancel', style: 'cancel' },
    ];
    if (listing.status === 'active') {
      options.push({ text: 'Pause', onPress: () => setStatus.mutate({ id: listing.id, status: 'paused' }) });
    } else if (listing.status === 'paused') {
      options.push({ text: 'Reactivate', onPress: () => setStatus.mutate({ id: listing.id, status: 'active' }) });
    }
    options.push({ text: 'Archive', onPress: () => setStatus.mutate({ id: listing.id, status: 'archived' }) });
    options.push({
      text: 'Delete',
      style: 'destructive',
      onPress: () => deleteListing.mutate(listing.id),
    });
    Alert.alert(listing.title, 'Manage this listing', options);
  }

  return (
    <Screen>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <Link href={`/(tabs)/marketplace/my-listings/${item.id}/edit`} asChild>
            <Pressable onLongPress={() => confirmManage(item)}>
              <ListingCard listing={toWithCook(item)} showStatus />
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <EmptyState title="No listings yet" subtitle="Tap + to list your first dish for sale." />
        }
      />

      <Link href="/(tabs)/marketplace/my-listings/new" asChild>
        <Pressable style={[styles.fab, { backgroundColor: '#3c87f7' }]}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
