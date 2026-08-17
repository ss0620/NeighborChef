import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/database';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const theme = useTheme();
  const totalMinutes = (recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0);

  return (
    <Card style={styles.card}>
      {recipe.photo_url ? (
        <Image source={{ uri: recipe.photo_url }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, { backgroundColor: theme.backgroundSelected }]} />
      )}
      <View style={styles.text}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {recipe.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {totalMinutes > 0 ? `${totalMinutes} min · ` : ''}
          {recipe.servings} servings
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  text: {
    flex: 1,
    gap: 4,
  },
});
