// iOS-style segmented control, generic over the option type.
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

type Props<T extends string> = {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map(o => {
        const selected = o === value
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.item, selected && styles.selected]}
          >
            <Text style={[styles.text, selected && { fontWeight: '600' }]}>{o}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: '#E4E4EA', borderRadius: 9, padding: 2 },
  item: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 7 },
  selected: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  text: { fontSize: 13, color: colors.text },
})
