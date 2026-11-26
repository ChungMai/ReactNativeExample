// Round icon button (blue by default), used in headers.
import Ionicons from '@expo/vector-icons/Ionicons'
import type { ComponentProps } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { colors } from '../theme'

type IconName = ComponentProps<typeof Ionicons>['name']
type Props = { icon: IconName; label: string; onPress: () => void; variant?: 'filled' | 'plain' }

export function IconButton({ icon, label, onPress, variant = 'filled' }: Props) {
  const filled = variant === 'filled'
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.btn,
        filled ? { backgroundColor: colors.primary } : styles.plain,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name={icon} size={20} color={filled ? '#fff' : colors.text} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  plain: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
})
