import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addMealPlanEntry,
  fetchWeekEntries,
  removeMealPlanEntry,
  type UpsertMealPlanEntryInput,
} from '@/lib/api/mealPlan';
import { useAuth } from '@/lib/auth/AuthProvider';
import { toDateKey } from '@/lib/utils/dates';

export function useWeekEntries(weekStart: Date) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const startDate = toDateKey(weekStart);
  const endDate = toDateKey(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));

  return useQuery({
    queryKey: ['meal-plan-entries', userId, startDate],
    queryFn: () => fetchWeekEntries(userId as string, startDate, endDate),
    enabled: !!userId,
  });
}

export function useAddMealPlanEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertMealPlanEntryInput) => addMealPlanEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan-entries'] });
    },
  });
}

export function useRemoveMealPlanEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeMealPlanEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan-entries'] });
    },
  });
}
