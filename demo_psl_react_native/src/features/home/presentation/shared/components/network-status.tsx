// Access mode and server status under the network name. Swift: NetworkContent.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import type { HomeViewModel } from '../hooks/use-home-screen'

export function NetworkStatus({ vm }: { vm: HomeViewModel }) {
  const status = vm.serverOnline ? 'Online' : 'Offline'
  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <Ionicons name="wifi" size={18} color={colors.primary} />
        <Text style={styles.text}>{vm.accessLabel}</Text>
      </View>
      <Pressable
        onPress={vm.toggleTooltip}
        accessibilityRole="button"
        accessibilityLabel={`Server ${status}`}
        style={styles.item}
        hitSlop={8}
      >
        <Ionicons name="ellipse" size={12} color={vm.serverOnline ? '#1E9E5A' : colors.danger} />
        <Text style={styles.text}>{status}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 30 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  text: { color: colors.primary, fontSize: 16 },
})
