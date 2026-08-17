import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createRecipe,
  deleteRecipe,
  fetchRecipe,
  fetchRecipes,
  updateRecipe,
  type RecipeInput,
} from '@/lib/api/recipes';
import { useAuth } from '@/lib/auth/AuthProvider';

export function useRecipes() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['recipes', userId],
    queryFn: () => fetchRecipes(userId as string),
    enabled: !!userId,
  });
}

export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => fetchRecipe(id as string),
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecipeInput) => createRecipe(userId as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', userId] });
    },
  });
}

export function useUpdateRecipe(id: string) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecipeInput) => updateRecipe(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', userId] });
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
    },
  });
}

export function useDeleteRecipe() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', userId] });
    },
  });
}
