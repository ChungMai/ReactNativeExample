// WEB – Rooms: page header with an always-visible search box and a labelled "New room" button,
// sort bar, and a responsive grid of fixed-size cards.
// It uses the SAME view model as the mobile screen (useRoomsScreen): only the UI is different.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { CardGrid } from '../../../../../shared/components/card-grid'
import { PageHeader } from '../../../../../shared/components/page-header'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import { colors } from '../../../../../shared/theme'
import { RoomCard } from '../components/room-card'
import { SortBar } from '../../shared/components/sort-bar'
import { useRoomsScreen } from '../../shared/hooks/use-rooms-screen'

export default function RoomsScreen() {
  const vm = useRoomsScreen()

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Rooms">
        <TextInput
          value={vm.query}
          onChangeText={vm.setQuery}
          placeholder="Search rooms"
          accessibilityLabel="Search rooms"
          style={styles.search}
        />
        <Pressable onPress={vm.openNewRoom} accessibilityRole="button" accessibilityLabel="Add room" style={styles.add}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addText}>New room</Text>
        </Pressable>
      </PageHeader>

      <View style={styles.toolbar}>
        <SortBar sortKey={vm.sortKey} dir={vm.dir} onChangeKey={vm.setSortKey} onToggleDir={vm.toggleDir} />
      </View>

      {vm.status === 'loading' ? (
        <LoadingView label="Loading rooms" />
      ) : vm.status === 'error' ? (
        <ErrorView message={vm.errorMessage ?? ''} onRetry={vm.retry} />
      ) : vm.cards.length === 0 ? (
        <Text style={styles.empty}>No rooms found</Text>
      ) : (
        <CardGrid>
          {vm.cards.map(room => (
            <RoomCard key={room.id} room={room} onPress={() => vm.openRoom(room.id)} />
          ))}
        </CardGrid>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  search: {
    width: 260, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, color: colors.text,
  },
  add: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 8, backgroundColor: colors.primary, cursor: 'pointer',
  },
  addText: { color: '#fff', fontWeight: '600' },
  toolbar: { paddingHorizontal: 24, paddingTop: 16, zIndex: 10 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
})
