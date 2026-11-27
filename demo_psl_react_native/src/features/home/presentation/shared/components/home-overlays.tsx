// Floating things above the content: the server tooltip and one-line notices.
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { HomeViewModel } from '../hooks/use-home-screen'

/** Render it inside the area below the header. */
export function HomeOverlays({ vm }: { vm: HomeViewModel }) {
  return (
    <>
      {vm.tooltip ? (
        <>
          {/* tapping anywhere else closes */}
          <Pressable onPress={vm.closeOverlays} accessibilityLabel="Close message" style={StyleSheet.absoluteFill} />
          <View style={styles.tooltip}>
            <Text style={styles.light}>{vm.tooltip}</Text>
          </View>
        </>
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
  tooltip: { position: 'absolute', top: 4, left: 16, right: 16, maxWidth: 330, backgroundColor: '#303030', borderRadius: 16, padding: 20 },
  notice: { position: 'absolute', bottom: 16, alignSelf: 'center', maxWidth: '92%', backgroundColor: '#303030', borderRadius: 12, padding: 14 },
  light: { color: '#fff', fontSize: 14 },
})
