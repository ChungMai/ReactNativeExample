// A square card for a room or a device, the same look as the favourite cards on Home, and its grid.
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { IconName } from '../navigation/shared/nav-items'
import { colors } from '../theme'

type Props = {
  title: string
  icon: IconName
  size: number
  /** undefined: has no power state, so there is no badge. */
  isOn?: boolean
  /** Shown as the badge instead of On/Off; the card is drawn as off. */
  note?: string
  /** Without it the card is not a button. */
  onPress?: () => void
}

export function ObjectCard({ title, icon, size, isOn, note, onPress }: Props) {
  const state = note ?? (isOn === undefined ? null : isOn ? 'On' : 'Off')
  const on = !note && isOn === true
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessible
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={state ? `${title}, ${state.toLowerCase()}` : title}
      style={({ pressed }) => [
        styles.card,
        { width: size, height: size },
        (note || isOn === false) && styles.off,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.top}>
        <View style={styles.icon}>
          <Ionicons name={icon} size={22} color={on ? colors.primary : colors.muted} />
        </View>
        {state ? <Text style={[styles.badge, on && styles.badgeOn]}>{state}</Text> : null}
      </View>
      <View style={styles.titleBox}>
        <Text numberOfLines={3} style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  )
}

const MARGIN = 16
const GAP = 12
const MIN_CARD = 150
const MAX_CARD = 220

/** At least two cards per row; more when they fit. */
export function cardSizeFor(width: number) {
  const columns = Math.max(2, Math.floor((width + GAP) / (MIN_CARD + GAP)))
  return Math.min(MAX_CARD, Math.floor((width - GAP * (columns - 1)) / columns))
}

export function ObjectCardGrid({ children }: { children: (size: number) => ReactNode }) {
  // measured, not the window: a sidebar may take part of it
  const [width, setWidth] = useState(0)
  return (
    <View testID="card-grid" style={styles.grid} onLayout={e => setWidth(e.nativeEvent.layout.width - MARGIN * 2)}>
      {width > 0 ? children(cardSizeFor(width)) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: MARGIN, gap: GAP },
  card: { borderRadius: 10, overflow: 'hidden', justifyContent: 'space-between', backgroundColor: colors.card },
  off: { backgroundColor: colors.border },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 10 },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: colors.card, color: colors.text, borderRadius: 4, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 2 },
  badgeOn: { backgroundColor: '#9EC2EB' },
  titleBox: { backgroundColor: 'rgba(255,255,255,0.85)', padding: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#000' },
})
