// Sort direction button + a small dropdown for the sort key.
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../shared/theme'
import type { SortDir, SortKey } from '../../domain/room-sorting'
import { SORT_LABELS } from './sort-labels'

type Props = {
  sortKey: SortKey
  dir: SortDir
  onChangeKey: (k: SortKey) => void
  onToggleDir: () => void
}

export function SortBar({ sortKey, dir, onChangeKey, onToggleDir }: Props) {
  const [open, setOpen] = useState(false)
  const keys = Object.keys(SORT_LABELS) as SortKey[]

  return (
    <View style={styles.row}>
      <Pressable onPress={onToggleDir} accessibilityLabel={`Sort ${dir === 'asc' ? 'ascending' : 'descending'}`}
        style={styles.box}>
        <Ionicons name={dir === 'asc' ? 'arrow-down' : 'arrow-up'} size={16} color={colors.primary} />
      </Pressable>

      <View>
        <Pressable onPress={() => setOpen(o => !o)} accessibilityRole="button" style={[styles.box, styles.dropdown]}>
          <Text style={styles.dropText} numberOfLines={1}>{SORT_LABELS[sortKey]}</Text>
          <Ionicons name="caret-down" size={12} color={colors.primary} />
        </Pressable>
        {open && (
          <View style={styles.menu}>
            {keys.map(k => (
              <Pressable key={k} onPress={() => { onChangeKey(k); setOpen(false) }} style={styles.menuItem}>
                <Text style={{ color: k === sortKey ? colors.primary : colors.text }}>{SORT_LABELS[k]}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, zIndex: 10 },
  box: {
    height: 32, minWidth: 32, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1,
    borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  dropdown: { flexDirection: 'row', gap: 6, width: 140, justifyContent: 'space-between' },
  dropText: { fontSize: 13, color: colors.primary },
  menu: {
    position: 'absolute', top: 36, left: 0, width: 160, backgroundColor: '#fff', borderRadius: 8,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 6, paddingVertical: 4,
  },
  menuItem: { paddingHorizontal: 12, paddingVertical: 10 },
})
