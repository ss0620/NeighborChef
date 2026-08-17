import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { formatDayLabel, formatWeekRangeLabel, getWeekDays, isToday, toDateKey } from '@/lib/utils/dates';

interface WeekPickerProps {
  weekStart: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function WeekPicker({ weekStart, selectedDate, onSelectDate, onPrevWeek, onNextWeek }: WeekPickerProps) {
  const theme = useTheme();
  const days = getWeekDays(weekStart);
  const selectedKey = toDateKey(selectedDate);

  return (
    <View>
      <View style={styles.header}>
        <Pressable onPress={onPrevWeek} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <ThemedText type="smallBold">{formatWeekRangeLabel(weekStart)}</ThemedText>
        <Pressable onPress={onNextWeek} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {days.map((day) => {
          const key = toDateKey(day);
          const selected = key === selectedKey;
          return (
            <Pressable
              key={key}
              onPress={() => onSelectDate(day)}
              style={[
                styles.dayChip,
                { backgroundColor: selected ? '#3c87f7' : theme.backgroundElement },
              ]}>
              <ThemedText type="small" style={{ color: selected ? '#ffffff' : theme.text }}>
                {formatDayLabel(day)}
              </ThemedText>
              {isToday(day) && !selected ? <View style={styles.todayDot} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  days: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3c87f7',
    marginTop: 4,
  },
});
