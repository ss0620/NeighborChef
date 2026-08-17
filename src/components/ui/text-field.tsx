import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label ? <ThemedText type="smallBold">{label}</ThemedText> : null}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: error ? '#e5484d' : 'transparent' },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <ThemedText type="small" style={{ color: '#e5484d' }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
