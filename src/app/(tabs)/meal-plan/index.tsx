import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { MealSlotRow } from '@/components/meal-plan/meal-slot-row';
import { WeekPicker } from '@/components/meal-plan/week-picker';
import { ThemedText } from '@/components/themed-text';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useRemoveMealPlanEntry, useWeekEntries } from '@/lib/hooks/useMealPlan';
import { MEAL_SLOTS, getWeekStart, shiftWeek, toDateKey } from '@/lib/utils/dates';
import type { MealSlot } from '@/types/database';

export default function MealPlanScreen() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { data: entries, isLoading, isRefetching, refetch } = useWeekEntries(weekStart);
  const removeEntry = useRemoveMealPlanEntry();

  const selectedKey = toDateKey(selectedDate);
  const entriesByDate = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const entry of entries ?? []) {
      const list = map.get(entry.plan_date) ?? [];
      list.push(entry);
      map.set(entry.plan_date, list);
    }
    return map;
  }, [entries]);

  const entriesForSelectedDay = entriesByDate.get(selectedKey) ?? [];

  function entriesForSlot(slot: MealSlot) {
    return (entriesForSelectedDay ?? []).filter((entry) => entry.meal_slot === slot);
  }

  if (isLoading) return <ScreenLoading />;

  return (
    <Screen>
      <WeekPicker
        weekStart={weekStart}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onPrevWeek={() => setWeekStart((current) => shiftWeek(current, -1))}
        onNextWeek={() => setWeekStart((current) => shiftWeek(current, 1))}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        {MEAL_SLOTS.map((slot) => (
          <MealSlotRow
            key={slot}
            slot={slot}
            entries={entriesForSlot(slot)}
            onAdd={() =>
              router.push({
                pathname: '/(tabs)/meal-plan/add-recipe',
                params: { date: selectedKey, mealSlot: slot },
              })
            }
            onRemove={(entryId) => removeEntry.mutate(entryId)}
          />
        ))}
      </ScrollView>

      <Link href="/(tabs)/meal-plan/shopping-list" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="cart-outline" size={22} color="#ffffff" />
          <ThemedText type="smallBold" style={styles.fabText}>
            Shopping List
          </ThemedText>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: '#3c87f7',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: '#ffffff',
  },
});
