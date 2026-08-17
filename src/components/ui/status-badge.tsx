import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ListingStatus, OrderStatus } from '@/types/database';

const ORDER_COLORS: Record<OrderStatus, string> = {
  pending: '#f5a623',
  confirmed: '#3c87f7',
  ready: '#12b76a',
  picked_up: '#6b7280',
  cancelled: '#e5484d',
};

const LISTING_COLORS: Record<ListingStatus, string> = {
  active: '#12b76a',
  paused: '#f5a623',
  sold_out: '#6b7280',
  archived: '#e5484d',
};

const ORDER_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  ready: 'Ready for pickup',
  picked_up: 'Picked up',
  cancelled: 'Cancelled',
};

const LISTING_LABELS: Record<ListingStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  sold_out: 'Sold out',
  archived: 'Archived',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: ORDER_COLORS[status] + '22' }]}>
      <ThemedText type="small" style={{ color: ORDER_COLORS[status] }}>
        {ORDER_LABELS[status]}
      </ThemedText>
    </View>
  );
}

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: LISTING_COLORS[status] + '22' }]}>
      <ThemedText type="small" style={{ color: LISTING_COLORS[status] }}>
        {LISTING_LABELS[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
