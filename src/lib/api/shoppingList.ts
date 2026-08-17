import { supabase } from '@/lib/supabase';
import { aggregateIngredients, type AggregatedIngredient, type RawIngredientAmount } from '@/lib/utils/units';

interface ShoppingListRow {
  servings_planned: number;
  recipes: {
    servings: number;
    recipe_ingredients: { name: string; quantity: number | null; unit: string | null }[];
  };
}

export async function computeShoppingList(
  userId: string,
  startDate: string,
  endDate: string
): Promise<AggregatedIngredient[]> {
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .select('servings_planned, recipes(servings, recipe_ingredients(name, quantity, unit))')
    .eq('user_id', userId)
    .gte('plan_date', startDate)
    .lte('plan_date', endDate);
  if (error) throw error;

  const rows = data as unknown as ShoppingListRow[];

  const amounts: RawIngredientAmount[] = rows.flatMap((row) => {
    const recipeServings = row.recipes.servings || 1;
    const scale = row.servings_planned / recipeServings;
    return row.recipes.recipe_ingredients.map((ingredient) => ({
      name: ingredient.name,
      unit: ingredient.unit,
      quantity: ingredient.quantity,
      scale,
    }));
  });

  return aggregateIngredients(amounts);
}
