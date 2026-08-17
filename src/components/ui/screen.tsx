import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView, type ThemedViewProps } from '@/components/themed-view';

export function Screen({ style, ...rest }: ThemedViewProps) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={[styles.flex, style]} edges={['top', 'left', 'right']} {...rest} />
    </ThemedView>
  );
}

export function ScreenLoading() {
  return (
    <ThemedView style={[styles.flex, styles.center]}>
      <ActivityIndicator />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
