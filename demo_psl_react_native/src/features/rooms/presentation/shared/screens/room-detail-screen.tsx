// Room detail: cover image, segmented control and the Manage / Devices / Presets tabs. Read only.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { ReadableWidth } from '../../../../../shared/components/readable-width'
import { Row } from '../../../../../shared/components/row'
import { SegmentedControl } from '../../../../../shared/components/segmented-control'
import { colors } from '../../../../../shared/theme'
import { useRoomDetailScreen } from '../hooks/use-room-detail-screen'

const TABS = ['Manage', 'Devices', 'Presets'] as const
type Tab = (typeof TABS)[number]

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const vm = useRoomDetailScreen(id)
  const [tab, setTab] = useState<Tab>('Manage')

  if (!vm.detail) return <Text style={{ padding: 16 }}>{vm.missingText}</Text>
  const room = vm.detail

  return (
    <ReadableWidth>
      <View style={{ flex: 1 }}>
        <Stack.Screen options={{ title: room.title }} />

        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Image source={room.coverSource} style={styles.cover} resizeMode="cover" />
          <View style={styles.segment}>
            <SegmentedControl options={TABS} value={tab} onChange={setTab} />
          </View>

          {tab === 'Manage' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Control your room</Text>
                <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
              </View>
              <Row label={room.switchLabel} right={<Switch value={room.isOn} disabled />} />
              <Text style={styles.empty}>Read only.</Text>
            </View>
          )}

          {tab === 'Devices' && (
            <View style={{ gap: StyleSheet.hairlineWidth, marginTop: 8 }}>
              {room.devices.length === 0 && <Text style={styles.empty}>{room.devicesMessage ?? 'No devices in this room yet'}</Text>}
              {room.devices.map(d => (
                <Row key={d.id} label={d.title}
                  right={d.note ? <Text style={{ color: colors.muted }}>{d.note}</Text>
                    : d.hasSwitch ? <Switch value={d.isOn} disabled accessibilityLabel={d.title} /> : null} />
              ))}
            </View>
          )}

          {tab === 'Presets' && (room.presets?.length
            ? <View style={{ gap: StyleSheet.hairlineWidth, marginTop: 8 }}>{room.presets.map(preset => <Row key={preset.id} label={preset.name} />)}</View>
            : <Text style={styles.empty}>{room.devicesMessage ?? 'No presets yet'}</Text>)}
        </ScrollView>
      </View>
    </ReadableWidth>
  )
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 200 },
  segment: { padding: 12, backgroundColor: colors.card },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },
  sectionTitle: { fontSize: 14, color: colors.text },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 32 },
})
