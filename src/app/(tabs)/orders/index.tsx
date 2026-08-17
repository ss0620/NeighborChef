import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { OrderCard } from '@/components/orders/order-card';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/lib/hooks/useProfile';
import { useOrdersAsBuyer, useOrdersAsCook } from '@/lib/hooks/useOrders';

type Segment = 'buying' | 'selling';

export default function OrdersScreen() {
  const [segment, setSegment] = useState<Segment>('buying');
  const { data: profile } = useProfile();
  const buyingQuery = useOrdersAsBuyer();
  const sellingQuery = useOrdersAsCook();

  const activeQuery = segment === 'buying' ? buyingQuery : sellingQuery;

  return (
    <Screen>
      <View style={styles.segmentRow}>
        <SegmentButton label="Buying" active={segment === 'buying'} onPress={() => setSegment('buying')} />
        {profile?.is_seller ? (
          <SegmentButton label="Selling" active={segment === 'selling'} onPress={() => setSegment('selling')} />
        ) : null}
      </View>

      {activeQuery.isLoading ? (
        <ScreenLoading />
      ) : (
        <FlatList
          data={activeQuery.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={activeQuery.isRefetching} onRefresh={activeQuery.refetch} />}
          renderItem={({ item }) => (
            <Link href={`/(tabs)/orders/${item.id}`} asChild>
              <Pressable>
                <OrderCard order={item} perspective={segment} />
              </Pressable>
            </Link>
          )}
          ListEmptyComponent={
            <EmptyState
              title={segment === 'buying' ? 'No orders yet' : 'No sales yet'}
              subtitle={
                segment === 'buying'
                  ? 'Orders you place in the Marketplace will show up here.'
                  : 'Orders buyers place on your listings will show up here.'
              }
            />
          }
        />
      )}
    </Screen>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segmentButton, { backgroundColor: active ? '#3c87f7' : theme.backgroundElement }]}>
      <ThemedText type="smallBold" style={{ color: active ? '#ffffff' : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  segmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  list: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
});
