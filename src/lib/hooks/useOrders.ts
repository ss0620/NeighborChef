import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchOrder,
  fetchOrdersAsBuyer,
  fetchOrdersAsCook,
  placeOrder,
  updateOrderStatus,
  type PlaceOrderItem,
} from '@/lib/api/orders';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { OrderStatus } from '@/types/database';

export function useOrdersAsBuyer() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ['orders', 'buying', userId],
    queryFn: () => fetchOrdersAsBuyer(userId as string),
    enabled: !!userId,
  });
}

export function useOrdersAsCook() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ['orders', 'selling', userId],
    queryFn: () => fetchOrdersAsCook(userId as string),
    enabled: !!userId,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id as string),
    enabled: !!id,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cookId, items }: { cookId: string; items: PlaceOrderItem[] }) => placeOrder(cookId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, cookNote }: { id: string; status: OrderStatus; cookNote?: string }) =>
      updateOrderStatus(id, status, cookNote),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}
