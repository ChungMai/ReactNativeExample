// Grid card: cover image, name on a light overlay, and an On/Off badge.
import { router } from 'expo-router'
import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { COVERS } from '../data/covers'
import type { RoomCardData } from '../hooks/useSortedRooms'
import { colors } from '../theme'

export const RoomCard = memo(function RoomCard({ room, power }: RoomCardData) {
  return (
    <Pressable
      onPress={() => router.push(`/room/${room.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${room.name}${power === 'empty' ? '' : ', ' + power}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <Image source={COVERS[room.cover]} style={StyleSheet.absoluteFill} resizeMode="cover" />
      {power !== 'empty' && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{power === 'on' ? 'On' : 'Off'}</Text>
        </View>
      )}
      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
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
