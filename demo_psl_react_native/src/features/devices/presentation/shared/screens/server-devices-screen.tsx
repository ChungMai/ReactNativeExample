// The devices of the real network in collapsible sections. Swift: DeviceMainCollapsibleViewController.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { ObjectCard, ObjectCardGrid } from '../../../../../shared/components/object-card'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import type { IconName } from '../../../../../shared/navigation/shared/nav-items'
import { colors } from '../../../../../shared/theme'
import type { ServerDeviceList } from '../../../data/server-device-list'
import type { DeviceCategory } from '../../../domain/entities/listed-device'
import { useServerDevicesScreen } from '../hooks/use-server-devices-screen'

const ICONS: Record<DeviceCategory, IconName> = {
  Aircon: 'snow',
  Blind: 'reorder-four',
  Curtain: 'reorder-four',
  Fan: 'aperture',
  Lighting: 'bulb',
  Meter: 'speedometer',
  Sensor: 'pulse',
  Speaker: 'volume-high',
  'Switch/Plug/Socket/Relay/Button': 'power',
  TV: 'tv',
  Others: 'hardware-chip',
}

export function ServerDevicesScreen({ list }: { list: ServerDeviceList }) {
  const vm = useServerDevicesScreen(list)

  if (!vm.loaded) return <LoadingView label="Loading devices" />
  if (vm.error && !vm.hasDevices) return <ErrorView message={vm.error} onRetry={vm.refresh} />

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}
    >
      {vm.serverOnline ? null : <Text role="alert" style={styles.offline}>Offline. Showing the last known devices.</Text>}
      <View style={styles.toolbar}>
        <TextInput
          value={vm.search}
          onChangeText={vm.setSearch}
          placeholder="Search devices"
          accessibilityLabel="Search devices"
          autoCorrect={false}
          style={styles.search}
        />
        <Pressable onPress={vm.toggleSort} accessibilityRole="button" accessibilityLabel="Change sort order" style={styles.button}>
          <Text style={styles.link}>{vm.ascending ? 'A-Z' : 'Z-A'}</Text>
        </Pressable>
        <Pressable onPress={vm.refresh} accessibilityRole="button" accessibilityLabel="Reload devices" style={styles.button}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </Pressable>
      </View>
      <Text style={styles.note}>Real devices, read only.</Text>

      {vm.sections.length === 0
        ? <Text style={styles.note}>{vm.hasDevices ? 'No device matches your search.' : 'There are no devices yet.'}</Text>
        : vm.sections.map(section => (
          <View key={section.category} style={styles.section}>
            <Pressable
              onPress={() => vm.toggleSection(section.category)}
              accessibilityRole="button"
              accessibilityState={{ expanded: section.isExpanded }}
              style={styles.header}
            >
              <Text style={styles.title}>{`${section.category} (${section.count})`}</Text>
              <Ionicons name={section.isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
            </Pressable>
            {section.isExpanded ? (
              // read only: the cards show the state and cannot be pressed
              <ObjectCardGrid>
                {size => section.devices.map(d => (
                  <ObjectCard key={d.id} title={d.name} icon={ICONS[d.category]} size={size} isOn={d.isOn}
                    note={d.unreachable ? 'Unreachable' : undefined} />
                ))}
              </ObjectCardGrid>
            ) : null}
          </View>
        ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingVertical: 12, gap: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  search: { flex: 1, backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, color: colors.text },
  button: { padding: 8 },
  link: { color: colors.primary, fontWeight: '600' },
  note: { paddingHorizontal: 16, color: colors.muted },
  offline: { paddingHorizontal: 16, color: colors.text },
  section: { gap: 6 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.card,
  },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
})
