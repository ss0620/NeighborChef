import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/ui/status-badge';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useOrder, useUpdateOrderStatus } from '@/lib/hooks/useOrders';
import type { OrderStatus } from '@/types/database';

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'ready', 'picked_up'];

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: 'Confirm Order',
  confirmed: 'Mark Ready for Pickup',
  ready: 'Mark Picked Up',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { data: order, isLoading } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const theme = useTheme();
  const [note, setNote] = useState('');

  if (isLoading || !order) return <ScreenLoading />;

  const isCook = session?.user.id === order.cook_id;
  const isBuyer = session?.user.id === order.buyer_id;
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  function confirmCancel() {
    Alert.alert('Cancel order?', 'The cook will be notified.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: () => updateStatus.mutate({ id, status: 'cancelled' }) },
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle">Order</ThemedText>
          <OrderStatusBadge status={order.status} />
        </View>

        <View>
          <ThemedText type="smallBold">{isCook ? 'Buyer' : 'Cook'}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {isCook ? order.buyer.full_name ?? 'A buyer' : order.cook.full_name ?? 'A home cook'}
          </ThemedText>
        </View>

        <View>
          <ThemedText type="smallBold">Items</ThemedText>
          {order.order_items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              {item.listings.photo_url ? (
                <Image source={{ uri: item.listings.photo_url }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, { backgroundColor: theme.backgroundElement }]} />
              )}
              <ThemedText style={styles.itemTitle} numberOfLines={1}>
                {item.listings.title} × {item.quantity}
              </ThemedText>
              <ThemedText themeColor="textSecondary">${(item.subtotal_cents / 100).toFixed(2)}</ThemedText>
            </View>
          ))}
          <ThemedText type="smallBold" style={styles.total}>
            Total: ${(order.total_price_cents / 100).toFixed(2)}
          </ThemedText>
        </View>

        <View>
          <ThemedText type="smallBold">Placed</ThemedText>
          <ThemedText themeColor="textSecondary">{format(new Date(order.created_at), 'MMM d, h:mm a')}</ThemedText>
        </View>

        {order.cook_note ? (
          <View>
            <ThemedText type="smallBold">Note from the cook</ThemedText>
            <ThemedText themeColor="textSecondary">{order.cook_note}</ThemedText>
          </View>
        ) : null}

        {isCook && order.status !== 'cancelled' && order.status !== 'picked_up' ? (
          <View style={styles.cookActions}>
            <TextField
              label="Note for buyer (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Ready early, meet by the front door"
            />
            {note ? (
              <Button
                title="Save Note"
                variant="secondary"
                onPress={() =>
                  updateStatus.mutate(
                    { id, status: order.status, cookNote: note },
                    { onSuccess: () => setNote('') }
                  )
                }
                loading={updateStatus.isPending}
              />
            ) : null}
            {nextStatus ? (
              <Button
                title={NEXT_STATUS_LABEL[order.status] ?? 'Advance'}
                onPress={() => updateStatus.mutate({ id, status: nextStatus })}
                loading={updateStatus.isPending}
              />
            ) : null}
          </View>
        ) : null}

        {isBuyer && order.status === 'pending' ? (
          <Button title="Cancel Order" variant="destructive" onPress={confirmCancel} loading={updateStatus.isPending} />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  itemTitle: {
    flex: 1,
  },
  total: {
    marginTop: 8,
    textAlign: 'right',
  },
  cookActions: {
    gap: 10,
  },
});
