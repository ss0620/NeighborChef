import { format } from 'date-fns';
import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ListingStatusBadge } from '@/components/ui/status-badge';
import { useTheme } from '@/hooks/use-theme';
import type { ListingWithCook } from '@/lib/api/listings';

interface ListingCardProps {
  listing: ListingWithCook;
  distanceMiles?: number;
  showStatus?: boolean;
}

export function ListingCard({ listing, distanceMiles, showStatus }: ListingCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      {listing.photo_url ? (
        <Image source={{ uri: listing.photo_url }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, { backgroundColor: theme.backgroundSelected }]} />
      )}
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
            {listing.title}
          </ThemedText>
          <ThemedText type="smallBold">${(listing.price_cents / 100).toFixed(2)}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {listing.profiles.full_name ?? 'A home cook'}
          {distanceMiles != null ? ` · ${distanceMiles.toFixed(1)} mi` : ''}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Pickup {format(new Date(listing.pickup_start), 'EEE h:mm a')}
        </ThemedText>
        {showStatus ? <ListingStatusBadge status={listing.status} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
  },
});
