// The network list. Same UI on every device, centred and capped in width on big screens.
// Swift swipes a row for Delete / Leave; here a "..." button opens the same actions.
import Ionicons from '@expo/vector-icons/Ionicons'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { IconButton } from '../../../../../shared/components/icon-button'
import { LoadingView } from '../../../../../shared/components/state-views'
import { colors } from '../../../../../shared/theme'
import { DialogView } from '../components/dialog-view'
import { useNetworkListScreen } from '../hooks/use-network-list-screen'

export default function NetworkListScreen() {
  const vm = useNetworkListScreen()
  const status = vm.serverOnline ? 'Online' : 'Offline'

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.column}>
        <View style={styles.top}>
          <Pressable onPress={vm.showServerStatus} accessibilityRole="button" accessibilityLabel={`Server ${status}`} style={styles.status} hitSlop={8}>
            <Ionicons name="ellipse" size={12} color={vm.serverOnline ? '#1E9E5A' : colors.danger} />
            <Text style={styles.statusText}>{status}</Text>
          </Pressable>
          {vm.busy ? <ActivityIndicator color={colors.primary} /> : null}
          <IconButton icon="log-out-outline" label="Log out" onPress={vm.logout} variant="plain" />
        </View>

        {vm.loading ? (
          <LoadingView label="Loading networks" />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text role="heading" style={styles.title}>Choose the network you want to use.</Text>
            {vm.empty ? <Text style={styles.empty}>No networks found.</Text> : null}

            {vm.joined.length > 0 ? <Text role="heading" style={styles.section}>Joined Networks</Text> : null}
            {vm.joined.map(network => (
              <View key={network.id} style={styles.card}>
                <View style={styles.row}>
                  <Pressable
                    onPress={network.onPress}
                    accessibilityRole="button"
                    accessibilityLabel={`${network.name}, ${network.modeLabel}`}
                    style={styles.main}
                  >
                    <Text numberOfLines={1} style={styles.name}>{network.name}</Text>
                    {network.troubleshoot
                      ? <Ionicons name="warning" size={20} color={colors.danger} />
                      : <Text style={styles.mode}>{network.modeLabel}</Text>}
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={network.onToggleActions}
                    accessibilityRole="button"
                    accessibilityLabel={`Actions for ${network.name}`}
                    accessibilityState={{ expanded: network.expanded }}
                    style={styles.more}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.muted} />
                  </Pressable>
                </View>
                {network.expanded ? (
                  <View style={styles.actions}>
                    {network.actions.map(action => (
                      // Not `disabled`: pressing a greyed action explains why, as in the Swift app.
                      <Pressable key={action.title} onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label}>
                        <Text style={[styles.action, !action.enabled && { color: colors.muted }]}>{action.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}

            {vm.nearby.length > 0 ? <Text role="heading" style={styles.section}>Nearby Networks</Text> : null}
            {vm.nearby.map(network => (
              <Pressable
                key={network.id}
                onPress={network.onPress}
                accessibilityRole="button"
                accessibilityLabel={`${network.name}, ${network.statusLabel}`}
                style={[styles.card, styles.main, { flex: 0 }, network.dimmed && { backgroundColor: colors.border }]}
              >
                <Text numberOfLines={1} style={styles.name}>{network.name}</Text>
                <Text style={[styles.mode, (network.dimmed || network.statusLabel === 'PENDING') && { color: colors.muted }]}>
                  {network.statusLabel}
                </Text>
                <Ionicons name="lock-closed" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <Pressable
          onPress={vm.createNetwork}
          accessibilityRole="button"
          accessibilityLabel="Create a new network"
          style={[styles.create, !vm.serverOnline && { backgroundColor: '#BDBDBD' }]}
        >
          <Text style={styles.createText}>Create a new network</Text>
        </Pressable>
      </View>
      <DialogView dialog={vm.dialog} input={vm.input} onType={vm.type} onClose={vm.closeDialog} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: 560, padding: 16, gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusText: { color: colors.primary, fontSize: 15 },
  content: { gap: 10 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 },
  section: { fontSize: 15, fontWeight: '600', color: colors.muted, marginTop: 8 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 24 },
  card: { backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center' },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 60, paddingHorizontal: 15 },
  name: { flex: 1, fontSize: 16, color: colors.text },
  mode: { fontSize: 14, fontWeight: '700', color: colors.primary },
  more: { paddingHorizontal: 12, alignSelf: 'stretch', justifyContent: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24, padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  action: { color: colors.danger, fontWeight: '600' },
  create: { height: 48, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  createText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
