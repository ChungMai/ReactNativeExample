// The left menu used by every "regular width" UI: web, iPad and Mac.
// Regular window: icon + label. Compact window (a narrow browser): icons only.
import Ionicons from '@expo/vector-icons/Ionicons'
import { router, usePathname } from 'expo-router'
import { useContext } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { useSizeClass } from '../../hooks/use-size-class'
import { SIDEBAR_WIDTH } from '../../layout'
import { colors } from '../../theme'
import { isActive, navItems } from './nav-items'

export function Sidebar() {
  const pathname = usePathname()
  const compact = useSizeClass() === 'compact'
  const top = useContext(SafeAreaInsetsContext)?.top ?? 0 // below the iPad status bar; 0 on web

  return (
    <View
      role="navigation"
      aria-label="Main menu"
      style={[styles.sidebar, { paddingTop: 20 + top }, compact && styles.sidebarCompact]}
    >
      {!compact && <Text style={styles.brand}>Smart Rooms</Text>}
      {navItems.map(item => {
        const active = isActive(item, pathname)
        return (
          <Pressable
            key={item.name}
            onPress={() => router.navigate(item.href)}
            accessibilityRole="link"
            accessibilityLabel={item.title}
            accessibilityState={{ selected: active }}
            style={[styles.item, compact && styles.itemCompact, active && styles.itemActive]}
          >
            <Ionicons name={item.icon} size={20} color={active ? colors.primary : colors.text} />
            {!compact && <Text style={[styles.label, active && styles.labelActive]}>{item.title}</Text>}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH, paddingBottom: 20, paddingHorizontal: 12, gap: 4,
    backgroundColor: colors.card, borderRightWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  sidebarCompact: { width: 64, paddingHorizontal: 8, alignItems: 'center' },
  brand: { fontSize: 18, fontWeight: '700', color: colors.text, paddingHorizontal: 12, paddingBottom: 16 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 12,
    borderRadius: 10, cursor: 'pointer',
  },
  itemCompact: { width: 44, height: 44, justifyContent: 'center', paddingHorizontal: 0, paddingVertical: 0 },
  itemActive: { backgroundColor: colors.primarySoft },
  label: { fontSize: 15, color: colors.text },
  labelActive: { color: colors.primary, fontWeight: '600' },
})
