// WEB – Home: favourite rooms in a responsive grid. Same view model as mobile (useHomeScreen).
import { StyleSheet, Text, View } from 'react-native'
import { CardGrid } from '../../../../../shared/components/card-grid'
import { PageHeader } from '../../../../../shared/components/page-header'
import { colors } from '../../../../../shared/theme'
import { RoomCard } from '../../../../rooms'
import { useHomeScreen } from '../../shared/hooks/use-home-screen'

export default function HomeScreen() {
  const vm = useHomeScreen()

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Favourite rooms" />
      {vm.favourites.length === 0 ? (
        <Text style={styles.empty}>Open a room and choose “Add to Favourites” to see it here</Text>
      ) : (
        <CardGrid>
          {vm.favourites.map(room => (
            <RoomCard key={room.id} room={room} onPress={() => vm.openRoom(room.id)} />
          ))}
        </CardGrid>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
})
