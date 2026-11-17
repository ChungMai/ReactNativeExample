// Title with optional actions on the right, for the "regular width" UIs (web, iPad, Mac).
// Phones use the native header instead.
import { useContext, type ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { PAGE_PADDING } from '../layout'
import { colors } from '../theme'

type Props = { title: string; children?: ReactNode }

export function PageHeader({ title, children }: Props) {
  // Keeps the header below the iPad status bar. Zero on web and when no provider exists (tests).
  const top = useContext(SafeAreaInsetsContext)?.top ?? 0

  return (
    <View style={[styles.header, { paddingTop: 16 + top }]}>
      <Text role="heading" aria-level={1} style={styles.title}>{title}</Text>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    paddingHorizontal: PAGE_PADDING, paddingBottom: 16, backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
})
