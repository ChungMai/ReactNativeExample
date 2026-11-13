// Home tab: favourite rooms.
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../shared/theme'
import { RoomCard } from '../../../rooms'
import { useHomeScreen } from '../hooks/use-home-screen'

export default function HomeScreen() {
  const vm = useHomeScreen()

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.h}>Favourite rooms</Text>
      <FlatList
        data={vm.favourites}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => <RoomCard room={item} onPress={() => vm.openRoom(item.id)} />}
        ListEmptyComponent={<Text style={styles.empty}>Tap ♡ on a room to add it here</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  h: { fontSize: 20, fontWeight: '700', padding: 16, paddingBottom: 0, color: colors.text },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 32 },
})
