// WEB – Devices: title + "x of y devices on", bulk / add buttons, All/On/Off filter with counts,
// search box and a flat list (icon | name | status | switch).
// Same view model as mobile (useDevicesScreen).
import Ionicons from '@expo/vector-icons/Ionicons'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import type { DeviceKind } from '../../../domain/entities/device'
import { useDevicesScreen } from '../../shared/hooks/use-devices-screen'

const INK = '#111111'
const MUTED = '#6B7280'
const LINE = '#EEEEEE'
const TEAL = '#0F6B5C'
const TEAL_SOFT = '#DDEBE8'

type Filter = 'All' | 'On' | 'Off'
const FILTERS: Filter[] = ['All', 'On', 'Off']

const ICONS: Record<DeviceKind, React.ComponentProps<typeof Ionicons>['name']> = {
  light: 'bulb-outline',
  plug: 'power-outline',
  fan: 'aperture-outline',
  blind: 'menu-outline',
}

export default function DevicesScreen() {
  const vm = useDevicesScreen()
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')

  const onCount = vm.devices.filter(d => d.isOn).length
  const counts: Record<Filter, number> = { All: vm.devices.length, On: onCount, Off: vm.devices.length - onCount }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return vm.devices.filter(d =>
      (filter === 'All' || (filter === 'On') === d.isOn) && (!q || d.title.toLowerCase().includes(q)))
  }, [vm.devices, filter, query])

  return (
    <View style={styles.page}>
      {vm.status === 'loading' ? (
        <LoadingView label="Loading devices" />
      ) : vm.status === 'error' ? (
        <ErrorView message={vm.errorMessage ?? ''} onRetry={vm.retry} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inner}>
            <View style={styles.titleRow}>
              <View>
                <Text role="heading" aria-level={1} style={styles.title}>Devices</Text>
                <Text style={styles.subtitle}>{onCount} of {vm.devices.length} devices on</Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => vm.setAllPower(false)} accessibilityRole="button" style={styles.outlineBtn}>
                  <Text style={styles.outlineText}>Turn all off</Text>
                </Pressable>
                <Pressable accessibilityRole="button" style={styles.darkBtn}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.darkText}>Add device</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.toolbar}>
              <View style={styles.segments} accessibilityRole="tablist">
                {FILTERS.map(f => {
                  const selected = f === filter
                  return (
                    <Pressable key={f} accessibilityRole="tab" accessibilityState={{ selected }}
                      onPress={() => setFilter(f)} style={[styles.segment, selected && styles.segmentSelected]}>
                      <Text style={[styles.segmentText, selected && { fontWeight: '600' }]}>{f} ({counts[f]})</Text>
                    </Pressable>
                  )
                })}
              </View>
              <View style={styles.search}>
                <Ionicons name="search-outline" size={18} color={MUTED} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search devices"
                  accessibilityLabel="Search devices"
                  placeholderTextColor={MUTED}
                  style={styles.searchInput}
                />
              </View>
            </View>

            <View style={styles.list}>
              {shown.length === 0 && <Text style={styles.empty}>No devices found</Text>}
              {shown.map(d => (
                <View key={d.id} style={styles.row}>
                  <View style={[styles.icon, d.isOn && { backgroundColor: TEAL_SOFT }]}>
                    <Ionicons name={ICONS[d.kind]} size={20} color={d.isOn ? TEAL : '#4B5563'} />
                  </View>
                  <Text style={styles.name}>{d.title}</Text>
                  <Text style={[styles.status, d.isOn && { color: TEAL, fontWeight: '700' }]}>{d.isOn ? 'On' : 'Off'}</Text>
                  <Pressable
                    role="switch"
                    aria-checked={d.isOn}
                    aria-label={`Power ${d.title}`}
                    onPress={() => vm.toggle(d.id)}
                    style={[styles.track, { backgroundColor: d.isOn ? TEAL : '#D1D1D6', justifyContent: d.isOn ? 'flex-end' : 'flex-start' }]}
                  >
                    <View style={styles.thumb} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

// The mockup screenshot is scaled down (~0.6x), so sizes here are its values scaled back up.
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  inner: { width: '100%', maxWidth: 840, gap: 28 },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' },
  title: { fontSize: 30, fontWeight: '700', color: INK },
  subtitle: { fontSize: 14, color: INK, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 12, paddingTop: 6 },
  outlineBtn: { paddingHorizontal: 18, height: 40, justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#fff', cursor: 'pointer' },
  outlineText: { fontSize: 14, fontWeight: '600', color: INK },
  darkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, height: 40, borderRadius: 8, backgroundColor: INK, cursor: 'pointer' },
  darkText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  segments: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, padding: 3 },
  segment: { paddingHorizontal: 16, height: 34, justifyContent: 'center', borderRadius: 6, cursor: 'pointer' },
  segmentSelected: { backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.12)' },
  segmentText: { fontSize: 13, color: INK },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 10, width: 260, height: 40, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, backgroundColor: '#fff',
  },
  searchInput: { flex: 1, fontSize: 14, color: INK, padding: 0, outlineStyle: 'none' } as object,

  list: { borderTopWidth: 1, borderColor: LINE },
  row: { flexDirection: 'row', alignItems: 'center', height: 64, gap: 16, borderBottomWidth: 1, borderColor: LINE },
  icon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#F3F3F3', alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontSize: 15, fontWeight: '500', color: INK },
  status: { fontSize: 13, color: INK, marginRight: 20 },
  track: { width: 44, height: 26, borderRadius: 999, padding: 2, flexDirection: 'row', alignItems: 'center', cursor: 'pointer' },
  thumb: { width: 22, height: 22, borderRadius: 999, backgroundColor: '#fff' },
  empty: { textAlign: 'center', color: MUTED, paddingVertical: 32, fontSize: 14 },
})
