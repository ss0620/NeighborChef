import { router } from 'expo-router';

import { RecipeForm } from '@/components/recipes/recipe-form';
import { Screen } from '@/components/ui/screen';
import { useCreateRecipe } from '@/lib/hooks/useRecipes';

export default function NewRecipeScreen() {
  const createRecipe = useCreateRecipe();

  return (
    <Screen>
      <RecipeForm
        submitLabel="Create Recipe"
        submitting={createRecipe.isPending}
        onSubmit={async (input) => {
          const recipe = await createRecipe.mutateAsync(input);
          router.replace(`/(tabs)/recipes/${recipe.id}`);
        }}
      />
    </Screen>
  );
}
