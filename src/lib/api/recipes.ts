import { supabase } from '@/lib/supabase';
import type { Recipe, RecipeIngredient, RecipeStep } from '@/types/database';

export type RecipeWithIngredients = Recipe & { recipe_ingredients: RecipeIngredient[] };

export interface IngredientInput {
  name: string;
  quantity: number | null;
  unit: string | null;
}

export interface RecipeInput {
  title: string;
  description: string | null;
  photoUrl: string | null;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  steps: RecipeStep[];
  tags: string[] | null;
  ingredients: IngredientInput[];
}

export async function fetchRecipes(userId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchRecipe(id: string): Promise<RecipeWithIngredients> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*)')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'recipe_ingredients', ascending: true })
    .single();
  if (error) throw error;
  return data as RecipeWithIngredients;
}

async function replaceIngredients(recipeId: string, ingredients: IngredientInput[]) {
  const { error: deleteError } = await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
  if (deleteError) throw deleteError;

  if (ingredients.length === 0) return;

  const { error: insertError } = await supabase.from('recipe_ingredients').insert(
    ingredients.map((ingredient, index) => ({
      recipe_id: recipeId,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      sort_order: index,
    }))
  );
  if (insertError) throw insertError;
}

export async function createRecipe(userId: string, input: RecipeInput): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      photo_url: input.photoUrl,
      servings: input.servings,
      prep_minutes: input.prepMinutes,
      cook_minutes: input.cookMinutes,
      steps: input.steps,
      tags: input.tags,
    })
    .select('*')
    .single();
  if (error) throw error;

  await replaceIngredients(data.id, input.ingredients);
  return data;
}

export async function updateRecipe(id: string, input: RecipeInput): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .update({
      title: input.title,
      description: input.description,
      photo_url: input.photoUrl,
      servings: input.servings,
      prep_minutes: input.prepMinutes,
      cook_minutes: input.cookMinutes,
      steps: input.steps,
      tags: input.tags,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;

  await replaceIngredients(id, input.ingredients);
  return data;
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}
