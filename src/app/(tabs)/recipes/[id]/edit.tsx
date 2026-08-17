import { router, useLocalSearchParams } from 'expo-router';

import { RecipeForm } from '@/components/recipes/recipe-form';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useRecipe, useUpdateRecipe } from '@/lib/hooks/useRecipes';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipe, isLoading } = useRecipe(id);
  const updateRecipe = useUpdateRecipe(id);

  if (isLoading || !recipe) return <ScreenLoading />;

  return (
    <Screen>
      <RecipeForm
        initialRecipe={recipe}
        submitLabel="Save Changes"
        submitting={updateRecipe.isPending}
        onSubmit={async (input) => {
          await updateRecipe.mutateAsync(input);
          router.replace(`/(tabs)/recipes/${id}`);
        }}
      />
    </Screen>
  );
}
