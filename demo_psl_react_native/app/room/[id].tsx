// SCREEN 2 – Room detail: dynamic route, header button with a menu,
// cover image, segmented control and the Manage / Devices / Presets tabs.
import Ionicons from '@expo/vector-icons/Ionicons'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { IconButton } from '../../src/components/IconButton'
import { Row } from '../../src/components/Row'
import { SegmentedControl } from '../../src/components/SegmentedControl'
import { COVERS } from '../../src/data/covers'
import { useRoom, useRoomsDispatch } from '../../src/store/rooms'
import { colors } from '../../src/theme'

const TABS = ['Manage', 'Devices', 'Presets'] as const
type Tab = (typeof TABS)[number]

export default function RoomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const data = useRoom(id)
  const dispatch = useRoomsDispatch()
  const [tab, setTab] = useState<Tab>('Manage')
  const [menuOpen, setMenuOpen] = useState(false)

  if (!data) return <Text style={{ padding: 16 }}>Room not found</Text>
  const { room, devices, power } = data

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: room.name,
          headerRight: () => (
            <IconButton icon="ellipsis-vertical" label="Room options" onPress={() => setMenuOpen(o => !o)} />
          ),
        }}
      />

      {menuOpen && (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={() => {
            setMenuOpen(false)
            dispatch({ type: 'removeRoom', id: room.id })
            router.back()
          }}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={{ color: colors.danger }}>Delete room</Text>
          </Pressable>
        </View>
      )}

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Image source={COVERS[room.cover]} style={styles.cover} resizeMode="cover" />
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
              label={power === 'on' ? 'Switch On' : 'Switch Off'}
              disabled={power === 'empty'}
              right={
                <Switch
                  value={power === 'on'}
                  disabled={power === 'empty'}
                  onValueChange={on => dispatch({ type: 'setRoomPower', id: room.id, on })}
                />
              }
            />
            <View style={{ height: 24 }} />
            <Pressable onPress={() => dispatch({ type: 'toggleFavourite', id: room.id })}>
              <Row
                label={room.favourite ? 'Remove from Favourites' : 'Add to Favourites'}
                right={<Ionicons name={room.favourite ? 'heart' : 'heart-outline'} size={22} color={colors.primary} />}
              />
            </Pressable>
          </View>
        )}

        {tab === 'Devices' && (
          <View style={{ gap: StyleSheet.hairlineWidth, marginTop: 8 }}>
            {devices.length === 0 && <Text style={styles.empty}>No devices in this room yet</Text>}
            {devices.map(d => (
              <Row key={d.id} label={d.name}
                right={<Switch value={d.on} onValueChange={() => dispatch({ type: 'toggleDevice', id: d.id })} />} />
            ))}
          </View>
        )}

        {tab === 'Presets' && <Text style={styles.empty}>No presets yet</Text>}
      </ScrollView>
    </View>
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
