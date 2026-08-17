import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { MealPlanEntryWithRecipe } from '@/lib/api/mealPlan';
import type { MealSlot } from '@/types/database';

interface MealSlotRowProps {
  slot: MealSlot;
  entries: MealPlanEntryWithRecipe[];
  onAdd: () => void;
  onRemove: (entryId: string) => void;
}

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function MealSlotRow({ slot, entries, onAdd, onRemove }: MealSlotRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {SLOT_LABELS[slot]}
      </ThemedText>

      {entries.map((entry) => (
        <View key={entry.id} style={[styles.entry, { backgroundColor: theme.backgroundElement }]}>
          {entry.recipes.photo_url ? (
            <Image source={{ uri: entry.recipes.photo_url }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, { backgroundColor: theme.backgroundSelected }]} />
          )}
          <ThemedText style={styles.entryTitle} numberOfLines={1}>
            {entry.recipes.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {entry.servings_planned} servings
          </ThemedText>
          <Pressable onPress={() => onRemove(entry.id)} hitSlop={8} style={styles.removeButton}>
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      ))}

      <Pressable onPress={onAdd} style={[styles.addButton, { borderColor: theme.backgroundElement }]}>
        <Ionicons name="add" size={16} color="#3c87f7" />
        <ThemedText type="small" style={{ color: '#3c87f7' }}>
          Add recipe
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 10,
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  entryTitle: {
    flex: 1,
  },
  removeButton: {
    padding: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
  },
});
