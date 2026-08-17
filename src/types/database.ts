// Hand-written to match supabase/migrations/0001_init.sql.
// Once a real Supabase project is running the migrations, regenerate this file with:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type ListingCategory = 'main' | 'dessert' | 'bakery' | 'snack' | 'other';
export type ListingStatus = 'active' | 'paused' | 'sold_out' | 'archived';
export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled';

export interface RecipeStep {
  order: number;
  text: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          is_seller: boolean;
          seller_bio: string | null;
          pickup_address: string | null;
          pickup_lat: number | null;
          pickup_lng: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          photo_url: string | null;
          servings: number;
          prep_minutes: number | null;
          cook_minutes: number | null;
          steps: RecipeStep[];
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['recipes']['Row']> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['recipes']['Row']>;
        Relationships: [];
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          name: string;
          quantity: number | null;
          unit: string | null;
          sort_order: number;
        };
        Insert: Partial<Database['public']['Tables']['recipe_ingredients']['Row']> & {
          recipe_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['recipe_ingredients']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'recipe_ingredients_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      meal_plan_entries: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          plan_date: string;
          meal_slot: MealSlot;
          servings_planned: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['meal_plan_entries']['Row']> & {
          user_id: string;
          recipe_id: string;
          plan_date: string;
          meal_slot: MealSlot;
        };
        Update: Partial<Database['public']['Tables']['meal_plan_entries']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'meal_plan_entries_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      listings: {
        Row: {
          id: string;
          cook_id: string;
          title: string;
          description: string | null;
          photo_url: string | null;
          price_cents: number;
          quantity_available: number;
          category: ListingCategory;
          pickup_start: string;
          pickup_end: string;
          pickup_location: string;
          pickup_lat: number | null;
          pickup_lng: number | null;
          status: ListingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['listings']['Row']> & {
          cook_id: string;
          title: string;
          price_cents: number;
          pickup_start: string;
          pickup_end: string;
          pickup_location: string;
        };
        Update: Partial<Database['public']['Tables']['listings']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'listings_cook_id_fkey';
            columns: ['cook_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          cook_id: string;
          total_price_cents: number;
          status: OrderStatus;
          cook_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, never>; // orders are only created via the place_order() RPC
        Update: Partial<Pick<Database['public']['Tables']['orders']['Row'], 'status' | 'cook_note'>>;
        Relationships: [
          {
            foreignKeyName: 'orders_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_cook_id_fkey';
            columns: ['cook_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          listing_id: string;
          quantity: number;
          unit_price_cents: number;
          subtotal_cents: number;
        };
        Insert: Record<string, never>; // inserted only by the place_order() RPC
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      place_order: {
        Args: { p_cook_id: string; p_items: { listing_id: string; quantity: number }[] };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row'];
export type MealPlanEntry = Database['public']['Tables']['meal_plan_entries']['Row'];
export type Listing = Database['public']['Tables']['listings']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
