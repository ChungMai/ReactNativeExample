// The rooms of the real network as a grid of cards; a card opens the room detail screen.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ObjectCard, ObjectCardGrid } from '../../../../../shared/components/object-card'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import { colors } from '../../../../../shared/theme'
import type { ServerRoomList } from '../../../data/server-room-list'
import { useServerRoomsScreen } from '../hooks/use-server-rooms-screen'

export function ServerRoomsScreen({ list }: { list: ServerRoomList }) {
  const vm = useServerRoomsScreen(list)
  const insets = useSafeAreaInsets()

  if (!vm.loaded) return <LoadingView label="Loading rooms" />
  if (vm.error && !vm.hasRooms) return <ErrorView message={vm.error} onRetry={vm.refresh} />

  return (
    // the Rooms tab has no navigation header, so clear the status bar here
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}
    >
      <Text role="heading" style={styles.heading}>Rooms</Text>
      {vm.serverOnline ? null : <Text role="alert" style={styles.note}>Offline. Showing the last known rooms.</Text>}
      <View style={styles.toolbar}>
        <TextInput
          value={vm.search}
          onChangeText={vm.setSearch}
          placeholder="Search rooms"
          accessibilityLabel="Search rooms"
          autoCorrect={false}
          style={styles.search}
        />
        <Pressable onPress={vm.toggleSort} accessibilityRole="button" accessibilityLabel="Change sort order" style={styles.button}>
          <Text style={styles.link}>{vm.ascending ? 'A-Z' : 'Z-A'}</Text>
        </Pressable>
        <Pressable onPress={vm.refresh} accessibilityRole="button" accessibilityLabel="Reload rooms" style={styles.button}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </Pressable>
      </View>
      <Text style={styles.note}>Real rooms, read only.</Text>

      {vm.rooms.length === 0
        ? <Text style={styles.note}>{vm.hasRooms ? 'No room matches your search.' : 'There are no rooms yet.'}</Text>
        : (
          <ObjectCardGrid>
            {size => vm.rooms.map(room => (
              <ObjectCard key={room.id} title={room.name} icon="cube" size={size} isOn={room.isOn} onPress={() => vm.openRoom(room.id)} />
            ))}
          </ObjectCardGrid>
        )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingBottom: 16, gap: 10 },
  heading: { fontSize: 28, fontWeight: '600', color: colors.text, paddingHorizontal: 16 },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  search: { flex: 1, backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, color: colors.text },
  button: { padding: 8 },
  link: { color: colors.primary, fontWeight: '600' },
  note: { paddingHorizontal: 16, paddingVertical: 4, color: colors.muted },
})
