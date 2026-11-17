// Grid card: cover image, name on a light overlay, and an On/Off badge.
import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import type { RoomCardProps } from '../../shared/components/room-card-props'

export const RoomCard = memo(function RoomCard({ room, onPress }: RoomCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={room.accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
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
    flex: 1, maxWidth: '48.5%', aspectRatio: 1.1, borderRadius: 12, overflow: 'hidden',
    backgroundColor: colors.card, justifyContent: 'flex-end',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  badge: {
    position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.text },
  footer: { backgroundColor: 'rgba(255,255,255,0.85)', padding: 12 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
})
