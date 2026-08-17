import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { RecipeCard } from '@/components/recipes/recipe-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useAddMealPlanEntry } from '@/lib/hooks/useMealPlan';
import { useRecipe, useRecipes } from '@/lib/hooks/useRecipes';
import { MEAL_SLOTS, toDateKey } from '@/lib/utils/dates';
import type { MealSlot } from '@/types/database';

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function AddRecipeToPlanScreen() {
  const rawParams = useLocalSearchParams<{ date?: string; mealSlot?: MealSlot; recipeId?: string }>();
  const params = { ...rawParams, date: rawParams.date ?? toDateKey(new Date()) };
  const theme = useTheme();
  const addEntry = useAddMealPlanEntry();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | undefined>(params.recipeId);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>(params.mealSlot ?? 'dinner');
  const [servings, setServings] = useState(1);
  const [search, setSearch] = useState('');

  const { data: recipes, isLoading: recipesLoading } = useRecipes();
  const { data: presetRecipe } = useRecipe(params.recipeId);

  // Adjust servings during render when the preset recipe finishes loading
  // (React's recommended alternative to syncing this via useEffect).
  const [servingsInitializedFor, setServingsInitializedFor] = useState<string | undefined>(undefined);
  if (presetRecipe && servingsInitializedFor !== presetRecipe.id) {
    setServingsInitializedFor(presetRecipe.id);
    setServings(presetRecipe.servings);
  }

  const filteredRecipes = (recipes ?? []).filter((recipe) =>
    recipe.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  async function handleSubmit(userId: string) {
    if (!selectedRecipeId) return;
    await addEntry.mutateAsync({
      userId,
      recipeId: selectedRecipeId,
      planDate: params.date,
      mealSlot: selectedSlot,
      servingsPlanned: servings,
    });
    router.back();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="smallBold">Meal</ThemedText>
        <View style={styles.slotRow}>
          {MEAL_SLOTS.map((slot) => (
            <Pressable
              key={slot}
              onPress={() => setSelectedSlot(slot)}
              style={[
                styles.slotChip,
                { backgroundColor: selectedSlot === slot ? '#3c87f7' : theme.backgroundElement },
              ]}>
              <ThemedText type="small" style={{ color: selectedSlot === slot ? '#ffffff' : theme.text }}>
                {SLOT_LABELS[slot]}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {params.recipeId ? (
          presetRecipe ? (
            <RecipeCard recipe={presetRecipe} />
          ) : (
            <ScreenLoading />
          )
        ) : (
          <>
            <ThemedText type="smallBold">Recipe</ThemedText>
            <TextField placeholder="Search your recipes" value={search} onChangeText={setSearch} />
            {recipesLoading ? (
              <ScreenLoading />
            ) : (
              <View style={styles.recipeList}>
                {filteredRecipes.map((recipe) => (
                  <Pressable
                    key={recipe.id}
                    onPress={() => {
                      setSelectedRecipeId(recipe.id);
                      setServings(recipe.servings);
                    }}
                    style={[
                      styles.recipeRow,
                      selectedRecipeId === recipe.id && { borderColor: '#3c87f7', borderWidth: 2 },
                    ]}>
                    <RecipeCard recipe={recipe} />
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        <ThemedText type="smallBold">Servings</ThemedText>
        <View style={styles.servingsRow}>
          <Pressable
            onPress={() => setServings((s) => Math.max(1, s - 1))}
            style={[styles.stepperButton, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">−</ThemedText>
          </Pressable>
          <ThemedText type="smallBold">{servings}</ThemedText>
          <Pressable
            onPress={() => setServings((s) => s + 1)}
            style={[styles.stepperButton, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">+</ThemedText>
          </Pressable>
        </View>

        <AddRecipeSubmitButton
          disabled={!selectedRecipeId}
          loading={addEntry.isPending}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </Screen>
  );
}

function AddRecipeSubmitButton({
  disabled,
  loading,
  onSubmit,
}: {
  disabled: boolean;
  loading: boolean;
  onSubmit: (userId: string) => void;
}) {
  const { session } = useAuth();
  return (
    <Button
      title="Add to Meal Plan"
      disabled={disabled || !session}
      loading={loading}
      onPress={() => session && onSubmit(session.user.id)}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 12,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  slotChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  recipeList: {
    gap: 8,
  },
  recipeRow: {
    borderRadius: 14,
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
