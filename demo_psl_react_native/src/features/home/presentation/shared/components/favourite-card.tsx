// A square card. Swift: AccessoryGridCollectionViewCell.
import Ionicons from '@expo/vector-icons/Ionicons'
import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import type { CardDisplay } from '../models/home-display'

type Props = {
  card: CardDisplay
  size: number
  onPress: (card: CardDisplay) => void
  onOpenDetail: (card: CardDisplay) => void
  /** Web and desktop: a visible button, because a long press is not discoverable with a mouse. */
  detailButton?: boolean
}

export const FavouriteCard = memo(function FavouriteCard({ card, size, onPress, onOpenDetail, detailButton }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <Pressable
        onPress={() => onPress(card)}
        onLongPress={() => onOpenDetail(card)}
        accessibilityRole="button"
        accessibilityLabel={card.accessibilityLabel}
        accessibilityActions={[{ name: 'details', label: 'Details' }]}
        onAccessibilityAction={() => onOpenDetail(card)}
        style={({ pressed }) => [styles.card, card.isOn || card.stateLabel === null ? styles.on : styles.off, pressed && { opacity: 0.8 }]}
      >
        {card.coverSource ? <Image source={card.coverSource} style={styles.cover} /> : null}
        <View style={styles.top}>
          <View style={styles.icon}>
            <Ionicons name={card.icon} size={22} color={card.isOn ? colors.primary : colors.muted} />
          </View>
          {card.stateLabel ? (
            <Text style={[styles.badge, card.isOn && styles.badgeOn]}>{card.stateLabel}</Text>
          ) : null}
        </View>
        <View style={styles.titleBox}>
          <Text numberOfLines={3} style={styles.title}>{card.title}</Text>
        </View>
      </Pressable>
      {detailButton ? (
        <Pressable
          onPress={() => onOpenDetail(card)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${card.title}`}
          hitSlop={6}
          style={styles.detail}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </Pressable>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 10, overflow: 'hidden', justifyContent: 'space-between' },
  on: { backgroundColor: colors.card },
  off: { backgroundColor: colors.border },
  cover: { position: 'absolute', width: '100%', height: '100%' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 10 },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: colors.card, color: colors.text, borderRadius: 4, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 2 },
  badgeOn: { backgroundColor: '#9EC2EB' },
  titleBox: { backgroundColor: 'rgba(255,255,255,0.85)', padding: 10, paddingRight: 28 },
  title: { fontSize: 16, fontWeight: '700', color: '#000' },
  detail: { position: 'absolute', right: 6, bottom: 8 },
})
