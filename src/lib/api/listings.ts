import { supabase } from '@/lib/supabase';
import type { Listing, ListingCategory, Profile } from '@/types/database';

export type ListingWithCook = Listing & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
};

export interface BrowseFilters {
  search?: string;
  category?: ListingCategory;
}

export async function fetchActiveListings(filters: BrowseFilters = {}): Promise<ListingWithCook[]> {
  let query = supabase
    .from('listings')
    .select('*, profiles(id, full_name, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ListingWithCook[];
}

export async function fetchListing(id: string): Promise<ListingWithCook> {
  const { data, error } = await supabase
    .from('listings')
    .select('*, profiles(id, full_name, avatar_url)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ListingWithCook;
}

export async function fetchListingsByIds(ids: string[]): Promise<ListingWithCook[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('listings')
    .select('*, profiles(id, full_name, avatar_url)')
    .in('id', ids);
  if (error) throw error;
  return data as ListingWithCook[];
}

export async function fetchMyListings(cookId: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('cook_id', cookId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export interface ListingInput {
  title: string;
  description: string | null;
  photoUrl: string | null;
  priceCents: number;
  quantityAvailable: number;
  category: ListingCategory;
  pickupStart: string;
  pickupEnd: string;
  pickupLocation: string;
  pickupLat: number | null;
  pickupLng: number | null;
}

export async function createListing(cookId: string, input: ListingInput): Promise<Listing> {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      cook_id: cookId,
      title: input.title,
      description: input.description,
      photo_url: input.photoUrl,
      price_cents: input.priceCents,
      quantity_available: input.quantityAvailable,
      category: input.category,
      pickup_start: input.pickupStart,
      pickup_end: input.pickupEnd,
      pickup_location: input.pickupLocation,
      pickup_lat: input.pickupLat,
      pickup_lng: input.pickupLng,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateListing(id: string, input: Partial<ListingInput>): Promise<Listing> {
  const updates: Partial<Listing> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.photoUrl !== undefined) updates.photo_url = input.photoUrl;
  if (input.priceCents !== undefined) updates.price_cents = input.priceCents;
  if (input.quantityAvailable !== undefined) updates.quantity_available = input.quantityAvailable;
  if (input.category !== undefined) updates.category = input.category;
  if (input.pickupStart !== undefined) updates.pickup_start = input.pickupStart;
  if (input.pickupEnd !== undefined) updates.pickup_end = input.pickupEnd;
  if (input.pickupLocation !== undefined) updates.pickup_location = input.pickupLocation;
  if (input.pickupLat !== undefined) updates.pickup_lat = input.pickupLat;
  if (input.pickupLng !== undefined) updates.pickup_lng = input.pickupLng;

  const { data, error } = await supabase.from('listings').update(updates).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function setListingStatus(id: string, status: Listing['status']): Promise<Listing> {
  const { data, error } = await supabase.from('listings').update({ status }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}
