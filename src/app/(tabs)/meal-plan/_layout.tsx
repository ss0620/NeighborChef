import { Stack } from 'expo-router';

export default function MealPlanStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Meal Plan' }} />
      <Stack.Screen name="add-recipe" options={{ title: 'Add to Meal Plan', presentation: 'modal' }} />
      <Stack.Screen name="shopping-list" options={{ title: 'Shopping List' }} />
    </Stack>
  );
}
