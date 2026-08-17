import { supabase } from '@/lib/supabase';
import type { MealPlanEntry, MealSlot, Recipe } from '@/types/database';

export type MealPlanEntryWithRecipe = MealPlanEntry & {
  recipes: Pick<Recipe, 'id' | 'title' | 'photo_url' | 'servings'>;
};

export async function fetchWeekEntries(
  userId: string,
  startDate: string,
  endDate: string
): Promise<MealPlanEntryWithRecipe[]> {
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .select('*, recipes(id, title, photo_url, servings)')
    .eq('user_id', userId)
    .gte('plan_date', startDate)
    .lte('plan_date', endDate);
  if (error) throw error;
  return data as MealPlanEntryWithRecipe[];
}

export interface UpsertMealPlanEntryInput {
  userId: string;
  recipeId: string;
  planDate: string;
  mealSlot: MealSlot;
  servingsPlanned: number;
}

export async function addMealPlanEntry(input: UpsertMealPlanEntryInput): Promise<MealPlanEntry> {
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .insert({
      user_id: input.userId,
      recipe_id: input.recipeId,
      plan_date: input.planDate,
      meal_slot: input.mealSlot,
      servings_planned: input.servingsPlanned,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function removeMealPlanEntry(id: string): Promise<void> {
  const { error } = await supabase.from('meal_plan_entries').delete().eq('id', id);
  if (error) throw error;
}
