// Home tab: favourite rooms (derived from state).
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { RoomCard } from '../../src/components/RoomCard'
import { powerOf, useRoomsState } from '../../src/store/rooms'
import { colors } from '../../src/theme'

export default function Home() {
  const { rooms, devices } = useRoomsState()
  const favourites = rooms
    .filter(r => r.favourite)
    .map(room => ({ room, power: powerOf(room.deviceIds.map(id => devices[id])) }))

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.h}>Favourite rooms</Text>
      <FlatList
        data={favourites}
        keyExtractor={i => i.room.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => <RoomCard {...item} />}
        ListEmptyComponent={<Text style={styles.empty}>Tap ♡ on a room to add it here</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  h: { fontSize: 20, fontWeight: '700', padding: 16, paddingBottom: 0, color: colors.text },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 32 },
})
