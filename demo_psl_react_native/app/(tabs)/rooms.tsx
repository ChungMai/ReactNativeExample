// SCREEN 1 – Rooms list: custom header (safe area), search, sort, 2-column grid.
import { router } from 'expo-router'
import { useState } from 'react'
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IconButton } from '../../src/components/IconButton'
import { RoomCard } from '../../src/components/RoomCard'
import { SortBar } from '../../src/components/SortBar'
import { useSortedRooms } from '../../src/hooks/useSortedRooms'
import { colors } from '../../src/theme'
import type { SortDir, SortKey } from '../../src/types'

export default function RoomsScreen() {
  const insets = useSafeAreaInsets()
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('alphabetical')
  const [dir, setDir] = useState<SortDir>('asc')
  const rooms = useSortedRooms(query, sortKey, dir)

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.side} />
        <Text style={styles.title}>Rooms</Text>
        <View style={[styles.side, styles.actions]}>
          <IconButton icon="search" label="Search rooms" onPress={() => {
            setSearching(s => !s)
            setQuery('')
          }} />
          <IconButton icon="add" label="Add room" onPress={() => router.push('/room/new')} />
        </View>
      </View>

      {searching && (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search rooms"
          autoFocus
          style={styles.search}
        />
      )}

      <View style={styles.toolbar}>
        <SortBar
          sortKey={sortKey}
          dir={dir}
          onChangeKey={setSortKey}
          onToggleDir={() => setDir(d => (d === 'asc' ? 'desc' : 'asc'))}
        />
      </View>

      <FlatList
        data={rooms}
        keyExtractor={item => item.room.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => <RoomCard {...item} />}
        ListEmptyComponent={<Text style={styles.empty}>No rooms found</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  side: { width: 92 },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: colors.text },
  search: {
    marginHorizontal: 16, marginTop: 12, padding: 10, borderRadius: 10,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  toolbar: { paddingHorizontal: 16, paddingTop: 12, zIndex: 10 },
  grid: { padding: 16, gap: 12 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
})
