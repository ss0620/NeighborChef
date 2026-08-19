import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { RecipeCard } from '@/components/recipes/recipe-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useRecipes } from '@/lib/hooks/useRecipes';

export default function RecipesScreen() {
  const { data: recipes, isLoading, isRefetching, refetch } = useRecipes();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!recipes) return [];
    const query = search.trim().toLowerCase();
    if (!query) return recipes;
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query) || recipe.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [recipes, search]);

  if (isLoading) return <ScreenLoading />;

  return (
    <Screen>
      <View style={styles.searchRow}>
        <TextField placeholder="Search recipes or tags" value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <Link href={`/(tabs)/recipes/${item.id}`} asChild>
            <Pressable>
              <RecipeCard recipe={item} />
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <EmptyState
            title={search ? 'No matches' : 'No recipes yet'}
            subtitle={search ? 'Try a different search.' : 'Tap + to add your first recipe.'}
          />
        }
      />

      <Link href="/(tabs)/recipes/new" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  list: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3c87f7',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
