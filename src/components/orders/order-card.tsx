import { format } from 'date-fns';
import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/ui/status-badge';
import { useTheme } from '@/hooks/use-theme';
import type { OrderWithDetails } from '@/lib/api/orders';

interface OrderCardProps {
  order: OrderWithDetails;
  perspective: 'buying' | 'selling';
}

export function OrderCard({ order, perspective }: OrderCardProps) {
  const theme = useTheme();
  const firstItem = order.order_items[0];
  const otherCount = order.order_items.length - 1;
  const counterparty = perspective === 'buying' ? order.cook.full_name : order.buyer.full_name;

  return (
    <Card style={styles.card}>
      {firstItem?.listings.photo_url ? (
        <Image source={{ uri: firstItem.listings.photo_url }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, { backgroundColor: theme.backgroundSelected }]} />
      )}
      <View style={styles.text}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {firstItem?.listings.title ?? 'Order'}
          {otherCount > 0 ? ` +${otherCount} more` : ''}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {perspective === 'buying' ? `From ${counterparty ?? 'a home cook'}` : `For ${counterparty ?? 'a buyer'}`}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {format(new Date(order.created_at), 'MMM d, h:mm a')} · ${(order.total_price_cents / 100).toFixed(2)}
        </ThemedText>
        <OrderStatusBadge status={order.status} />
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
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  text: {
    flex: 1,
    gap: 4,
  },
});
