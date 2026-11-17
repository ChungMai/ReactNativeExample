// DESKTOP (iPad, Mac): the tile width comes from the window, so every row of the grid is full.
import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useGridTile } from '../../../../../shared/hooks/use-grid-tile'
import { colors } from '../../../../../shared/theme'
import type { RoomCardProps } from '../../shared/components/room-card-props'

export const RoomCard = memo(function RoomCard({ room, onPress }: RoomCardProps) {
  const width = useGridTile()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={room.accessibilityLabel}
      style={({ pressed }) => [styles.card, { width, height: width * 0.85 }, pressed && { opacity: 0.85 }]}
    >
      <Image source={room.coverSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
      {room.powerBadge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{room.powerBadge}</Text>
        </View>
      )}
      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>{room.title}</Text>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, overflow: 'hidden', backgroundColor: colors.card, justifyContent: 'flex-end',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  badge: {
    position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: colors.text },
  footer: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 14, paddingVertical: 12 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
})
