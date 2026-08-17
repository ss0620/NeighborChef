import { supabase } from '@/lib/supabase';
import type { Listing, Order, OrderItem, OrderStatus, Profile } from '@/types/database';

export type OrderItemWithListing = OrderItem & { listings: Pick<Listing, 'id' | 'title' | 'photo_url'> };

export type OrderWithDetails = Order & {
  order_items: OrderItemWithListing[];
  buyer: Pick<Profile, 'id' | 'full_name'>;
  cook: Pick<Profile, 'id' | 'full_name'>;
};

const ORDER_SELECT =
  '*, order_items(*, listings(id, title, photo_url)), buyer:profiles!orders_buyer_id_fkey(id, full_name), cook:profiles!orders_cook_id_fkey(id, full_name)';

export async function fetchOrdersAsBuyer(userId: string): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as OrderWithDetails[];
}

export async function fetchOrdersAsCook(userId: string): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('cook_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as OrderWithDetails[];
}

export async function fetchOrder(id: string): Promise<OrderWithDetails> {
  const { data, error } = await supabase.from('orders').select(ORDER_SELECT).eq('id', id).single();
  if (error) throw error;
  return data as unknown as OrderWithDetails;
}

export interface PlaceOrderItem {
  listingId: string;
  quantity: number;
}

/** Places one order for a single cook's items. Callers group cart lines by cook and call this once per group. */
export async function placeOrder(cookId: string, items: PlaceOrderItem[]): Promise<string> {
  const { data, error } = await supabase.rpc('place_order', {
    p_cook_id: cookId,
    p_items: items.map((item) => ({ listing_id: item.listingId, quantity: item.quantity })),
  });
  if (error) throw error;
  return data as string;
}

export async function updateOrderStatus(id: string, status: OrderStatus, cookNote?: string): Promise<Order> {
  const updates: { status: OrderStatus; cook_note?: string } = { status };
  if (cookNote !== undefined) updates.cook_note = cookNote;

  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}
