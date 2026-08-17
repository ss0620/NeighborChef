import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { AggregatedIngredient } from '@/lib/utils/units';

export function ShoppingListRow({ item }: { item: AggregatedIngredient }) {
  const [checked, setChecked] = useState(false);
  const theme = useTheme();

  return (
    <Pressable onPress={() => setChecked((c) => !c)} style={styles.row}>
      <View
        style={[
          styles.checkbox,
          { borderColor: theme.textSecondary, backgroundColor: checked ? '#3c87f7' : 'transparent' },
        ]}
      />
      <ThemedText style={[styles.label, checked && styles.checkedLabel]} themeColor={checked ? 'textSecondary' : 'text'}>
        {item.quantity != null ? `${trimNumber(item.quantity)} ${item.unit ?? ''} ` : ''}
        {item.name}
      </ThemedText>
    </Pressable>
  );
}

function trimNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
  },
  label: {
    flex: 1,
  },
  checkedLabel: {
    textDecorationLine: 'line-through',
  },
});
