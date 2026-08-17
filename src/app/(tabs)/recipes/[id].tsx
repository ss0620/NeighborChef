import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useTheme } from '@/hooks/use-theme';
import { useDeleteRecipe, useRecipe } from '@/lib/hooks/useRecipes';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipe, isLoading } = useRecipe(id);
  const deleteRecipe = useDeleteRecipe();
  const theme = useTheme();
  const [deleting, setDeleting] = useState(false);

  if (isLoading || !recipe) return <ScreenLoading />;

  function confirmDelete() {
    Alert.alert('Delete recipe?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          await deleteRecipe.mutateAsync(id);
          router.replace('/(tabs)/recipes');
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {recipe.photo_url ? (
          <Image source={{ uri: recipe.photo_url }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, { backgroundColor: theme.backgroundElement }]} />
        )}

        <ThemedText type="title" style={styles.title}>
          {recipe.title}
        </ThemedText>
        {recipe.description ? <ThemedText themeColor="textSecondary">{recipe.description}</ThemedText> : null}

        <View style={styles.metaRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {recipe.servings} servings
          </ThemedText>
          {recipe.prep_minutes ? (
            <ThemedText type="small" themeColor="textSecondary">
              Prep {recipe.prep_minutes}m
            </ThemedText>
          ) : null}
          {recipe.cook_minutes ? (
            <ThemedText type="small" themeColor="textSecondary">
              Cook {recipe.cook_minutes}m
            </ThemedText>
          ) : null}
        </View>

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Ingredients
        </ThemedText>
        {recipe.recipe_ingredients.map((ingredient) => (
          <ThemedText key={ingredient.id}>
            {ingredient.quantity ? `${ingredient.quantity} ` : ''}
            {ingredient.unit ? `${ingredient.unit} ` : ''}
            {ingredient.name}
          </ThemedText>
        ))}

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Steps
        </ThemedText>
        {recipe.steps.map((step) => (
          <View key={step.order} style={styles.stepRow}>
            <ThemedText style={styles.stepNumber}>{step.order + 1}.</ThemedText>
            <ThemedText style={styles.stepText}>{step.text}</ThemedText>
          </View>
        ))}

        <Link
          href={{ pathname: '/(tabs)/meal-plan/add-recipe', params: { recipeId: id } }}
          asChild>
          <Button title="Add to Meal Plan" />
        </Link>

        <View style={styles.actions}>
          <Link href={`/(tabs)/recipes/${id}/edit`} asChild>
            <Button title="Edit" variant="secondary" />
          </Link>
          <Button title="Delete" variant="destructive" onPress={confirmDelete} loading={deleting} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 12,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  sectionTitle: {
    marginTop: 12,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepNumber: {
    width: 22,
  },
  stepText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
