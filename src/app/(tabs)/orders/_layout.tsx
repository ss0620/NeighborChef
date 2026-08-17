import { Stack } from 'expo-router';

export default function OrdersStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Orders' }} />
      <Stack.Screen name="[id]" options={{ title: 'Order' }} />
    </Stack>
  );
}
