import { Stack } from 'expo-router';

export default function RecipesStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Recipes' }} />
      <Stack.Screen name="new" options={{ title: 'New Recipe', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Recipe' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Recipe' }} />
    </Stack>
  );
}
