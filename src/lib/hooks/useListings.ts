import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createListing,
  deleteListing,
  fetchActiveListings,
  fetchListing,
  fetchMyListings,
  setListingStatus,
  updateListing,
  type BrowseFilters,
  type ListingInput,
} from '@/lib/api/listings';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Listing } from '@/types/database';

export function useActiveListings(filters: BrowseFilters) {
  return useQuery({
    queryKey: ['listings', 'active', filters],
    queryFn: () => fetchActiveListings(filters),
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id as string),
    enabled: !!id,
  });
}

export function useMyListings() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['listings', 'mine', userId],
    queryFn: () => fetchMyListings(userId as string),
    enabled: !!userId,
  });
}

export function useCreateListing() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ListingInput) => createListing(userId as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListing(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ListingInput>) => updateListing(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
    },
  });
}

export function useSetListingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Listing['status'] }) => setListingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
