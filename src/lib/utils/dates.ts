import { addDays, addWeeks, format, isSameDay, startOfWeek } from 'date-fns';

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function shiftWeek(weekStart: Date, delta: number): Date {
  return addWeeks(weekStart, delta);
}

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDayLabel(date: Date): string {
  return format(date, 'EEE d');
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  return `${format(weekStart, 'MMM d')} – ${format(end, 'MMM d')}`;
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
