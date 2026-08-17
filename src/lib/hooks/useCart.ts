import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchListingsByIds, type ListingWithCook } from '@/lib/api/listings';
import { useCartStore } from '@/lib/store/cartStore';

export interface CartGroup {
  cookId: string;
  cookName: string;
  items: { listing: ListingWithCook; quantity: number }[];
  subtotalCents: number;
}

export function useCartListings() {
  const lines = useCartStore((state) => state.lines);
  const ids = useMemo(() => lines.map((line) => line.listingId).sort(), [lines]);

  const query = useQuery({
    queryKey: ['cart-listings', ids.join(',')],
    queryFn: () => fetchListingsByIds(ids),
    enabled: ids.length > 0,
  });

  const groups = useMemo<CartGroup[]>(() => {
    if (!query.data) return [];
    const byCook = new Map<string, CartGroup>();

    for (const line of lines) {
      const listing = query.data.find((item) => item.id === line.listingId);
      if (!listing) continue; // listing was deleted/archived since being added to cart

      const existing = byCook.get(listing.cook_id);
      const subtotal = listing.price_cents * line.quantity;
      if (existing) {
        existing.items.push({ listing, quantity: line.quantity });
        existing.subtotalCents += subtotal;
      } else {
        byCook.set(listing.cook_id, {
          cookId: listing.cook_id,
          cookName: listing.profiles.full_name ?? 'A home cook',
          items: [{ listing, quantity: line.quantity }],
          subtotalCents: subtotal,
        });
      }
    }

    return Array.from(byCook.values());
  }, [query.data, lines]);

  return { groups, isLoading: ids.length > 0 && query.isLoading, lineCount: lines.length };
}
