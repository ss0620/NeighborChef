import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.center}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  center: {
    textAlign: 'center',
  },
});
