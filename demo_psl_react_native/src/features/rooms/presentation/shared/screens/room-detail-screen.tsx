// SCREEN 2 – Room detail: dynamic route, header button with a menu,
// cover image, segmented control and the Manage / Devices / Presets tabs.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { IconButton } from '../../../../../shared/components/icon-button'
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
  const [menuOpen, setMenuOpen] = useState(false)

  if (!vm.detail) return <Text style={{ padding: 16 }}>Room not found</Text>
  const room = vm.detail

  return (
    <ReadableWidth>
      <View style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: room.title,
            headerRight: () => (
              <IconButton icon="ellipsis-vertical" label="Room options" onPress={() => setMenuOpen(o => !o)} />
            ),
          }}
        />

        {menuOpen && (
          <View style={styles.menu}>
            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); vm.deleteRoom() }}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={{ color: colors.danger }}>Delete room</Text>
            </Pressable>
          </View>
        )}

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
              <Row
                label={room.switchLabel}
                disabled={!room.canSwitch}
                right={<Switch value={room.isOn} disabled={!room.canSwitch} onValueChange={vm.setPower} />}
              />
              <View style={{ height: 24 }} />
              <Pressable onPress={vm.toggleFavourite}>
                <Row
                  label={room.favouriteLabel}
                  right={<Ionicons name={room.isFavourite ? 'heart' : 'heart-outline'} size={22} color={colors.primary} />}
                />
              </Pressable>
            </View>
          )}

          {tab === 'Devices' && (
            <View style={{ gap: StyleSheet.hairlineWidth, marginTop: 8 }}>
              {room.devices.length === 0 && <Text style={styles.empty}>No devices in this room yet</Text>}
              {room.devices.map(d => (
                <Row key={d.id} label={d.title}
                  right={<Switch value={d.isOn} onValueChange={() => vm.toggleDevice(d.id)} />} />
              ))}
            </View>
          )}

          {tab === 'Presets' && <Text style={styles.empty}>No presets yet</Text>}
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
  menu: {
    position: 'absolute', top: 4, right: 12, zIndex: 20, backgroundColor: '#fff', borderRadius: 10,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 8, paddingVertical: 4,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
})
