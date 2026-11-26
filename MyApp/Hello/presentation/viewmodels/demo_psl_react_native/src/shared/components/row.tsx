// A settings-style row: label on the left, any control on the right.
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

type Props = { label: string; right?: ReactNode; disabled?: boolean }

export function Row({ label, right, disabled }: Props) {
  return (
    <View style={[styles.row, disabled && styles.disabled]}>
      <Text style={[styles.label, disabled && { color: colors.muted }]}>{label}</Text>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card,
  },
  disabled: { backgroundColor: '#E9E9EE' },
  label: { fontSize: 15, color: colors.text },
})
