import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { ListingCategory } from '@/types/database';

const CATEGORIES: { value: ListingCategory | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'main', label: 'Mains' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'snack', label: 'Snacks' },
  { value: 'other', label: 'Other' },
];

interface FilterBarProps {
  selected: ListingCategory | undefined;
  onSelect: (category: ListingCategory | undefined) => void;
}

export function FilterBar({ selected, onSelect }: FilterBarProps) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {CATEGORIES.map((category) => {
        const active = category.value === selected;
        return (
          <Pressable
            key={category.label}
            onPress={() => onSelect(category.value)}
            style={[styles.chip, { backgroundColor: active ? '#3c87f7' : theme.backgroundElement }]}>
            <ThemedText type="small" style={{ color: active ? '#ffffff' : theme.text }}>
              {category.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
});
