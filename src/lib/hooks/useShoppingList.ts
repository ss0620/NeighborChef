import { useQuery } from '@tanstack/react-query';

import { computeShoppingList } from '@/lib/api/shoppingList';
import { useAuth } from '@/lib/auth/AuthProvider';
import { toDateKey } from '@/lib/utils/dates';

export function useShoppingList(weekStart: Date) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const startDate = toDateKey(weekStart);
  const endDate = toDateKey(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));

  return useQuery({
    queryKey: ['shopping-list', userId, startDate],
    queryFn: () => computeShoppingList(userId as string, startDate, endDate),
    enabled: !!userId,
  });
}
