// Loading and error states shared by every list screen.
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

export function LoadingView({ label = 'Loading' }: { label?: string }) {
  return (
    <View style={styles.center} accessible accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.primary} />
    </View>
  )
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      {/* the alert is on the text only, so the Retry button stays reachable on its own */}
      <Text style={styles.message} accessibilityRole="alert">{message}</Text>
      <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Retry" style={styles.retry}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  message: { color: colors.text, textAlign: 'center' },
  retry: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18 },
  retryText: { color: '#fff', fontWeight: '600' },
})
