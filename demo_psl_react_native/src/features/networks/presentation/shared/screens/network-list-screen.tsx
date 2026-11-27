// The network list. Same UI on every device, centred and capped in width on big screens.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
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
          <IconButton icon="log-out-outline" label="Log out" onPress={vm.logout} variant="plain" />
        </View>

        {vm.loading ? (
          <LoadingView label="Loading networks" />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text role="heading" style={styles.title}>Choose the network you want to use.</Text>
            {vm.loadError ? <Text selectable style={styles.empty}>{vm.loadError}</Text> : null}
            {vm.empty ? <Text style={styles.empty}>No networks found.</Text> : null}

            {vm.joined.length > 0 ? <Text role="heading" style={styles.section}>Joined Networks</Text> : null}
            {vm.joined.map(network => (
              <Pressable
                key={network.id}
                onPress={network.onPress}
                accessibilityRole="button"
                accessibilityLabel={network.name}
                style={[styles.card, styles.main]}
              >
                <Text numberOfLines={1} style={styles.name}>{network.name}</Text>
                <Text style={styles.mode}>Remote Access</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </Pressable>
            ))}
          </ScrollView>
        )}

      </View>
      <DialogView dialog={vm.dialog} onClose={vm.closeDialog} />
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
  main: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 60, paddingHorizontal: 15 },
  name: { flex: 1, fontSize: 16, color: colors.text },
  mode: { fontSize: 14, fontWeight: '700', color: colors.primary },
})
