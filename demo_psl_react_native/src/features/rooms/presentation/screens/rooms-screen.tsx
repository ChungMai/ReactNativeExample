// SCREEN 1 – Rooms list: custom header (safe area), search, sort, 2-column grid.
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IconButton } from '../../../../shared/components/icon-button'
import { ErrorView, LoadingView } from '../../../../shared/components/state-views'
import { colors } from '../../../../shared/theme'
import { RoomCard } from '../components/room-card'
import { SortBar } from '../components/sort-bar'
import { useRoomsScreen } from '../hooks/use-rooms-screen'

export default function RoomsScreen() {
  const insets = useSafeAreaInsets()
  const vm = useRoomsScreen()

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.side} />
        <Text style={styles.title}>Rooms</Text>
        <View style={[styles.side, styles.actions]}>
          <IconButton icon="search" label="Search rooms" onPress={vm.toggleSearch} />
          <IconButton icon="add" label="Add room" onPress={vm.openNewRoom} />
        </View>
      </View>

      {vm.searching && (
        <TextInput
          value={vm.query}
          onChangeText={vm.setQuery}
          placeholder="Search rooms"
          autoFocus
          style={styles.search}
        />
      )}

      <View style={styles.toolbar}>
        <SortBar sortKey={vm.sortKey} dir={vm.dir} onChangeKey={vm.setSortKey} onToggleDir={vm.toggleDir} />
      </View>

      {vm.status === 'loading' ? (
        <LoadingView label="Loading rooms" />
      ) : vm.status === 'error' ? (
        <ErrorView message={vm.errorMessage ?? ''} onRetry={vm.retry} />
      ) : (
        <FlatList
          data={vm.cards}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <RoomCard room={item} onPress={() => vm.openRoom(item.id)} />}
          ListEmptyComponent={<Text style={styles.empty}>No rooms found</Text>}
        />
      )}
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
