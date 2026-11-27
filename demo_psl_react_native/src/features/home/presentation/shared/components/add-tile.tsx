// Swift: WhiteAddItemCollectionViewCell.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet, Text } from 'react-native'
import { colors } from '../../../../../shared/theme'

type Props = { title: string; disabled: boolean; size: number; onPress: () => void }

export function AddTile({ title, disabled, size, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      style={[styles.tile, { width: size, height: size }, disabled && styles.disabled]}
    >
      <Ionicons name="add-circle-outline" size={55} color="#fff" />
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tile: { borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: 5 },
  disabled: { backgroundColor: '#BDBDBD' },
  title: { color: '#fff', fontSize: 13 },
})
