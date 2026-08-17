import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface DateTimeFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}

export function DateTimeField({ label, value, onChange, minimumDate }: DateTimeFieldProps) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  // iOS: inline compact picker is fine to always render. Android: the native
  // picker is a dialog that must be triggered and dismissed explicitly.
  const isIOS = Platform.OS === 'ios';

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {isIOS ? (
        <DateTimePicker
          value={value}
          mode="datetime"
          minimumDate={minimumDate}
          onChange={(_, date) => date && onChange(date)}
        />
      ) : (
        <>
          <Pressable
            onPress={() => setShowPicker(true)}
            style={[styles.androidButton, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText>{format(value, "EEE MMM d 'at' h:mm a")}</ThemedText>
          </Pressable>
          {showPicker ? (
            <DateTimePicker
              value={value}
              mode="datetime"
              minimumDate={minimumDate}
              onChange={(event, date) => {
                setShowPicker(false);
                if (event.type === 'set' && date) onChange(date);
              }}
            />
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  androidButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
