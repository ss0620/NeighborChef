import { Stack } from 'expo-router';

export default function MarketplaceStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Marketplace' }} />
      <Stack.Screen name="[id]" options={{ title: 'Listing' }} />
      <Stack.Screen name="cart" options={{ title: 'Cart', presentation: 'modal' }} />
      <Stack.Screen name="my-listings/index" options={{ title: 'My Listings' }} />
      <Stack.Screen name="my-listings/new" options={{ title: 'New Listing', presentation: 'modal' }} />
      <Stack.Screen name="my-listings/[id]/edit" options={{ title: 'Edit Listing' }} />
    </Stack>
  );
}
