// WEB – Devices: a table-style list (name | status | switch) in a centred card.
// Same view model as mobile (useDevicesScreen).
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { PageHeader } from '../../../../../shared/components/page-header'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import { colors } from '../../../../../shared/theme'
import { useDevicesScreen } from '../../shared/hooks/use-devices-screen'

export default function DevicesScreen() {
  const vm = useDevicesScreen()

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Devices" />
      {vm.status === 'loading' ? (
        <LoadingView label="Loading devices" />
      ) : vm.status === 'error' ? (
        <ErrorView message={vm.errorMessage ?? ''} onRetry={vm.retry} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.table}>
            <View style={[styles.row, styles.head]}>
              <Text style={[styles.cell, styles.headText, { flex: 1 }]}>Device</Text>
              <Text style={[styles.cell, styles.headText, styles.status]}>Status</Text>
              <Text style={[styles.cell, styles.headText, styles.control]}>Power</Text>
            </View>
            {vm.devices.map(d => (
              <View key={d.id} style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{d.title}</Text>
                <Text style={[styles.cell, styles.status, { color: d.isOn ? colors.primary : colors.muted }]}>
                  {d.isOn ? 'On' : 'Off'}
                </Text>
                <View style={styles.control}>
                  <Switch value={d.isOn} onValueChange={() => vm.toggle(d.id)} accessibilityLabel={`Power ${d.title}`} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  content: { padding: 24, alignItems: 'center' },
  table: {
    width: '100%', maxWidth: 760, backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  head: { backgroundColor: colors.bg },
  headText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  cell: { color: colors.text, fontSize: 15 },
  status: { width: 100 },
  control: { width: 80, alignItems: 'flex-end' },
})
