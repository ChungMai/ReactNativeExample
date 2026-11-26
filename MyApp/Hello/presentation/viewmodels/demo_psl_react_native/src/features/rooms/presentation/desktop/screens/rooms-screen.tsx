// DESKTOP – Rooms (iPad, Mac): large title, rounded search field with a magnifier, round "+" button,
// sort bar and a grid that fills the space next to the sidebar.
// Same view model as mobile and web (useRoomsScreen): only the UI is different.
import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { CardGrid } from '../../../../../shared/components/card-grid'
import { IconButton } from '../../../../../shared/components/icon-button'
import { PageHeader } from '../../../../../shared/components/page-header'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import { PAGE_PADDING } from '../../../../../shared/layout'
import { colors } from '../../../../../shared/theme'
import { SortBar } from '../../shared/components/sort-bar'
import { useRoomsScreen } from '../../shared/hooks/use-rooms-screen'
import { RoomCard } from '../components/room-card'

export default function RoomsScreen() {
  const vm = useRoomsScreen()

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Rooms">
        <View style={styles.search}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            value={vm.query}
            onChangeText={vm.setQuery}
            placeholder="Search rooms"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Search rooms"
            style={styles.searchInput}
          />
        </View>
        <IconButton icon="add" label="Add room" onPress={vm.openNewRoom} />
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
    width: 260, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 40,
    borderRadius: 20, backgroundColor: colors.bg,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  toolbar: { paddingHorizontal: PAGE_PADDING, paddingTop: 16, zIndex: 10 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
})
