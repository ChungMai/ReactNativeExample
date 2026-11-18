// WEB – Room detail, following the "Bedroom – Web" design: top bar with back + breadcrumb + menu,
// hero card (cover + status pill + title), pill tabs, and two-column cards for Manage.
// It uses the SAME view model as the mobile screen (useRoomDetailScreen): only the UI is different.
import Ionicons from '@expo/vector-icons/Ionicons'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRoomDetailScreen } from '../../shared/hooks/use-room-detail-screen'

const ACCENT = '#1D4ED8'
const INK = '#111827'
const MUTED = '#4B5563'
const LINE = '#E5E7EB'
const PAGE_BG = '#F4F5F7'
const MAX_WIDTH = 1120

const TABS = ['Manage', 'Devices', 'Presets'] as const
type Tab = (typeof TABS)[number]

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const vm = useRoomDetailScreen(id)
  const [tab, setTab] = useState<Tab>('Manage')
  const [menuOpen, setMenuOpen] = useState(false)

  if (!vm.detail) {
    return (
      <View style={styles.page}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.notFound}>Room not found</Text>
      </View>
    )
  }
  const room = vm.detail

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <View style={[styles.topBarInner, { zIndex: 20 }]}>
          <SquareButton icon="chevron-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/rooms'))} />
          <View style={styles.breadcrumb} accessibilityRole="navigation" aria-label="Breadcrumb">
            <Pressable onPress={() => router.navigate('/home')}><Text style={styles.crumb}>Home</Text></Pressable>
            <Text style={styles.crumb}>/</Text>
            <Pressable onPress={() => router.navigate('/rooms')}><Text style={styles.crumb}>Rooms</Text></Pressable>
            <Text style={styles.crumb}>/</Text>
            <Text style={styles.crumbCurrent} numberOfLines={1}>{room.title}</Text>
          </View>
          <View>
            <SquareButton icon="ellipsis-vertical" label="More options" onPress={() => setMenuOpen(o => !o)} />
            {menuOpen && (
              <View style={styles.menu}>
                <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); vm.editRoom() }}>
                  <Ionicons name="create-outline" size={18} color={INK} />
                  <Text style={{ color: INK }}>Edit room</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); vm.deleteRoom() }}>
                  <Ionicons name="trash-outline" size={18} color="#D93025" />
                  <Text style={{ color: '#D93025' }}>Delete room</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.main}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroCover}>
              <Ionicons name="bed-outline" size={96} color="#6D28D9" />
            </View>
            <View style={styles.heroBody}>
              <View style={[styles.pill, { backgroundColor: room.isOn ? '#E7F6EC' : '#F3F4F6' }]}>
                <View style={[styles.dot, { backgroundColor: room.isOn ? '#166534' : '#374151' }]} />
                <Text style={[styles.pillText, { color: room.isOn ? '#166534' : '#374151' }]}>
                  {room.isOn ? 'Room is on' : 'Room is off'}
                </Text>
              </View>
              <Text role="heading" aria-level={1} style={styles.heroTitle}>{room.title}</Text>
              <Text style={styles.heroSub}>Manage power, devices and presets for this room.</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs} accessibilityRole="tablist">
            {TABS.map(t => {
              const selected = t === tab
              return (
                <Pressable
                  key={t}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  onPress={() => setTab(t)}
                  style={[styles.tab, selected && styles.tabSelected]}
                >
                  <Text style={[styles.tabText, { color: selected ? INK : MUTED }]}>{t}</Text>
                </Pressable>
              )
            })}
          </View>

          {tab === 'Manage' && (
            <View style={styles.grid}>
              <Card>
                <View style={styles.cardHeader}>
                  <Text role="heading" aria-level={2} style={styles.cardTitle}>Control your room</Text>
                  <View style={styles.ghostIcon}><Ionicons name="information-circle-outline" size={20} color={MUTED} /></View>
                </View>
                <View style={styles.row}>
                  <View style={[styles.rowIcon, { backgroundColor: room.isOn ? '#E8EEFD' : '#F3F4F6' }]}>
                    <Ionicons name="power" size={24} color={room.isOn ? ACCENT : MUTED} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{room.switchLabel}</Text>
                    <Text style={styles.rowSub}>Turn all devices in this room on or off</Text>
                  </View>
                  <ToggleSwitch
                    value={room.isOn}
                    disabled={!room.canSwitch}
                    onValueChange={vm.setPower}
                    label={room.switchLabel}
                    />
                </View>
              </Card>

              <Card>
                <Text role="heading" aria-level={2} style={[styles.cardTitle, { lineHeight: 44 }]}>Quick access</Text>
                <Pressable onPress={vm.toggleFavourite} accessibilityRole="button" style={styles.row}>
                  <View style={[styles.rowIcon, { backgroundColor: '#FDECEC' }]}>
                    <Ionicons name={room.isFavourite ? 'heart' : 'heart-outline'} size={24} color="#C0262D" />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{room.isFavourite ? 'Added to Favourites' : 'Add to Favourites'}</Text>
                    <Text style={styles.rowSub}>
                      {room.isFavourite ? `${room.title} appears on your home dashboard` : `Pin ${room.title} to your home dashboard`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={MUTED} />
                </Pressable>
              </Card>
            </View>
          )}

          {tab === 'Devices' && (
            room.devices.length === 0 ? (
              <EmptyCard title="No devices in this room yet" text="Add lights, plugs or sensors to control them here." />
            ) : (
              <Card>
                {room.devices.map(d => (
                  <View key={d.id} style={styles.row}>
                    <View style={[styles.rowIcon, { backgroundColor: d.isOn ? '#E8EEFD' : '#F3F4F6' }]}>
                      <Ionicons name="bulb-outline" size={24} color={d.isOn ? ACCENT : MUTED} />
                    </View>
                    <View style={styles.rowText}><Text style={styles.rowTitle}>{d.title}</Text></View>
                    <ToggleSwitch
                      value={d.isOn}
                      onValueChange={() => vm.toggleDevice(d.id)}
                      label={d.title}
                      />
                  </View>
                ))}
              </Card>
            )
          )}

          {tab === 'Presets' && (
            <EmptyCard title="No presets yet" text="Save a combination of device settings to apply it in one tap." />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

// 48x27 pill with a 23px white thumb, as in the design (RN's Switch draws a teal thumb on web).
function ToggleSwitch({ value, onValueChange, disabled, label }: {
  value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean; label: string
}) {
  return (
    <Pressable
      role="switch"
      aria-checked={value}
      aria-label={label}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.switchTrack, { backgroundColor: value ? ACCENT : '#9CA3AF', justifyContent: value ? 'flex-end' : 'flex-start' }, disabled && { opacity: 0.5 }]}
    >
      <View style={styles.switchThumb} />
    </Pressable>
  )
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.empty}>
      <Text role="heading" aria-level={2} style={styles.cardTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  )
}

function SquareButton({ icon, label, onPress }: { icon: 'chevron-back' | 'ellipsis-vertical'; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.squareBtn}>
      <Ionicons name={icon} size={20} color={INK} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: PAGE_BG },
  notFound: { padding: 24, color: MUTED },

  topBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: LINE, zIndex: 20 },
  topBarInner: {
    width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  squareBtn: {
    width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  breadcrumb: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  crumb: { fontSize: 14, color: MUTED, cursor: 'pointer' },
  crumbCurrent: { fontSize: 14, color: INK, fontWeight: '600', flexShrink: 1 },
  menu: {
    position: 'absolute', top: 50, right: 0, minWidth: 160, backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: LINE, paddingVertical: 4, zIndex: 30,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, cursor: 'pointer' },

  scrollContent: { flexGrow: 1 },
  main: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 64, gap: 28 },

  hero: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, borderRadius: 20, overflow: 'hidden',
    flexDirection: 'row', flexWrap: 'wrap',
  },
  heroCover: { flexGrow: 1, flexShrink: 1, flexBasis: 320, minHeight: 220, backgroundColor: '#EDE7F6', alignItems: 'center', justifyContent: 'center' },
  heroBody: { flexGrow: 999, flexShrink: 1, flexBasis: 420, padding: 32, justifyContent: 'center', gap: 16, minWidth: 0 },
  pill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  dot: { width: 8, height: 8, borderRadius: 999 },
  pillText: { fontSize: 13, fontWeight: '600' },
  heroTitle: { fontSize: 40, lineHeight: 44, fontWeight: '700', letterSpacing: -0.8, color: INK },
  heroSub: { fontSize: 16, lineHeight: 24, color: MUTED, maxWidth: 520 },

  tabs: {
    flexDirection: 'row', gap: 4, padding: 4, backgroundColor: '#E9EBEF', borderRadius: 14, alignSelf: 'flex-start', maxWidth: '100%',
  },
  tab: { minHeight: 44, paddingHorizontal: 22, borderRadius: 10, justifyContent: 'center', cursor: 'pointer' },
  tabSelected: { backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,24,39,0.12)' },
  tabText: { fontSize: 15, fontWeight: '600' },

  switchTrack: { width: 48, height: 27, borderRadius: 999, padding: 2, flexDirection: 'row', alignItems: 'center', cursor: 'pointer' },
  switchThumb: { width: 23, height: 23, borderRadius: 999, backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  card: {
    flexGrow: 1, flexShrink: 1, flexBasis: 320, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE,
    borderRadius: 20, padding: 24, gap: 20,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: INK },
  ghostIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 16, cursor: 'pointer' },
  rowIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 4, minWidth: 0 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: INK },
  rowSub: { fontSize: 14, color: MUTED },

  empty: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderStyle: 'dashed', borderColor: '#C7CBD3', borderRadius: 20,
    paddingVertical: 56, paddingHorizontal: 24, alignItems: 'center', gap: 12,
  },
  emptyText: { fontSize: 15, color: MUTED, textAlign: 'center' },
})
