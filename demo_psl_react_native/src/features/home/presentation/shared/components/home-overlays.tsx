// Floating things above the content: "+" / "more" menu, server tooltip and one-line notices.
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import type { HomeViewModel } from '../hooks/use-home-screen'

/** Render it inside the area below the header. */
export function HomeOverlays({ vm }: { vm: HomeViewModel }) {
  return (
    <>
      {vm.menu || vm.tooltip ? (
        // tapping anywhere else closes
        <Pressable onPress={vm.closeOverlays} accessibilityLabel="Close menu" style={StyleSheet.absoluteFill} />
      ) : null}
      {vm.menu ? (
        <View style={styles.menu} accessibilityRole="menu">
          {vm.menuActions.map(action => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              disabled={action.disabled}
              accessibilityRole="menuitem"
              accessibilityLabel={action.label}
              accessibilityState={{ disabled: !!action.disabled }}
              style={styles.menuItem}
            >
              <Text style={[styles.menuText, action.disabled && { color: colors.muted }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {vm.tooltip ? (
        <View style={styles.tooltip}>
          <Text style={styles.light}>{vm.tooltip}</Text>
        </View>
      ) : null}
      {vm.notice ? (
        <Pressable onPress={vm.dismissNotice} style={styles.notice}>
          <Text accessibilityRole="alert" style={styles.light}>{vm.notice}</Text>
        </Pressable>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute', top: 4, right: 16, minWidth: 220, backgroundColor: colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, paddingVertical: 4, elevation: 6,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  menuText: { color: colors.text, fontSize: 15 },
  tooltip: { position: 'absolute', top: 4, left: 16, right: 16, maxWidth: 330, backgroundColor: '#303030', borderRadius: 16, padding: 20 },
  notice: { position: 'absolute', bottom: 16, alignSelf: 'center', maxWidth: '92%', backgroundColor: '#303030', borderRadius: 12, padding: 14 },
  light: { color: '#fff', fontSize: 14 },
})
