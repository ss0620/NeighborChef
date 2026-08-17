import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useTheme } from '@/hooks/use-theme';
import { useCartListings } from '@/lib/hooks/useCart';
import { usePlaceOrder } from '@/lib/hooks/useOrders';
import { useCartStore } from '@/lib/store/cartStore';

export default function CartScreen() {
  const { groups, isLoading, lineCount } = useCartListings();
  const placeOrder = usePlaceOrder();
  const clearCart = useCartStore((state) => state.clear);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const theme = useTheme();
  const [placing, setPlacing] = useState(false);

  if (isLoading) return <ScreenLoading />;

  if (lineCount === 0 || groups.length === 0) {
    return (
      <Screen>
        <EmptyState title="Your cart is empty" subtitle="Browse the marketplace to find dishes near you." />
      </Screen>
    );
  }

  const grandTotalCents = groups.reduce((sum, group) => sum + group.subtotalCents, 0);

  async function handlePlaceOrders() {
    setPlacing(true);
    try {
      // A cart can span multiple cooks; each cook's items become their own order
      // (checkout window/pickup location is per-cook), placed sequentially.
      for (const group of groups) {
        await placeOrder.mutateAsync({
          cookId: group.cookId,
          items: group.items.map((item) => ({ listingId: item.listing.id, quantity: item.quantity })),
        });
      }
      clearCart();
      router.replace('/(tabs)/orders');
    } catch (error) {
      Alert.alert('Could not place order', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {groups.map((group) => (
          <Card key={group.cookId} style={styles.group}>
            <ThemedText type="smallBold">{group.cookName}</ThemedText>
            {group.items.map((item) => (
              <View key={item.listing.id} style={styles.itemRow}>
                {item.listing.photo_url ? (
                  <Image source={{ uri: item.listing.photo_url }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: theme.backgroundSelected }]} />
                )}
                <View style={styles.itemInfo}>
                  <ThemedText numberOfLines={1}>{item.listing.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    ${(item.listing.price_cents / 100).toFixed(2)} each
                  </ThemedText>
                </View>
                <View style={styles.stepperRow}>
                  <ThemedButton
                    label="−"
                    onPress={() => setQuantity(item.listing.id, item.quantity - 1)}
                  />
                  <ThemedText type="smallBold">{item.quantity}</ThemedText>
                  <ThemedButton
                    label="+"
                    onPress={() =>
                      setQuantity(item.listing.id, Math.min(item.listing.quantity_available, item.quantity + 1))
                    }
                  />
                </View>
              </View>
            ))}
            <ThemedText type="smallBold" style={styles.subtotal}>
              Subtotal: ${(group.subtotalCents / 100).toFixed(2)}
            </ThemedText>
          </Card>
        ))}

        <View style={styles.totalRow}>
          <ThemedText type="subtitle">Total</ThemedText>
          <ThemedText type="subtitle">${(grandTotalCents / 100).toFixed(2)}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {groups.length > 1
            ? `This will place ${groups.length} separate orders, one per cook.`
            : 'Payment happens with the cook at pickup (mock checkout for now).'}
        </ThemedText>

        <Button title="Place Order" onPress={handlePlaceOrders} loading={placing} />
      </ScrollView>
    </Screen>
  );
}

function ThemedButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.stepperButton, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  group: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtotal: {
    alignSelf: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});
