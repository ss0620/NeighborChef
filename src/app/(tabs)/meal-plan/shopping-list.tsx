import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { WeekPicker } from '@/components/meal-plan/week-picker';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useShoppingList } from '@/lib/hooks/useShoppingList';
import { getWeekStart, shiftWeek } from '@/lib/utils/dates';
import { ShoppingListRow } from '@/components/meal-plan/shopping-list-row';

export default function ShoppingListScreen() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { data: items, isLoading, isRefetching, refetch } = useShoppingList(weekStart);

  return (
    <Screen>
      <WeekPicker
        weekStart={weekStart}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onPrevWeek={() => setWeekStart((current) => shiftWeek(current, -1))}
        onNextWeek={() => setWeekStart((current) => shiftWeek(current, 1))}
      />

      <View style={styles.header}>
        <ThemedText type="subtitle">Shopping List</ThemedText>
        <ThemedText themeColor="textSecondary">Aggregated from this week&apos;s meal plan.</ThemedText>
      </View>

      {isLoading ? (
        <ScreenLoading />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          renderItem={({ item }) => <ShoppingListRow item={item} />}
          ListEmptyComponent={
            <EmptyState title="Nothing to buy yet" subtitle="Add recipes to this week's meal plan first." />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 4,
  },
  list: {
    padding: 20,
    gap: 4,
    flexGrow: 1,
  },
});
