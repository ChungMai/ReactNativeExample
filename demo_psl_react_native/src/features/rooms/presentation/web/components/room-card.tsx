// WEB: fixed-size tile (so the grid can fit any number of columns), pointer cursor, hover highlight.
import { memo, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import type { RoomCardProps } from '../../shared/components/room-card-props'

export const RoomCard = memo(function RoomCard({ room, onPress }: RoomCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={room.accessibilityLabel}
      style={[styles.card, hovered && styles.hovered]}
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
    width: 240, aspectRatio: 1.1, borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
    backgroundColor: colors.card, justifyContent: 'flex-end',
    borderWidth: 2, borderColor: 'transparent',
  },
  hovered: { borderColor: colors.primary },
  badge: {
    position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.text },
  footer: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 12 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
})
