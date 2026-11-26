// The menu itself: a grouped list of tappable rows. Every device shows the same list;
// mobile/, desktop/ and web/ only differ in what surrounds it (native header or page header).
import Ionicons from '@expo/vector-icons/Ionicons'
import { Fragment } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import { useMoreScreen } from '../hooks/use-more-screen'

export function MoreList() {
  const { items } = useMoreScreen()

  return (
    <View style={styles.group}>
      {items.map((item, i) => (
        <Fragment key={item.id}>
          {i > 0 && <View style={styles.separator} />}
          <Pressable
            onPress={item.open}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.texts}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </Fragment>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  group: { borderRadius: 14, overflow: 'hidden', backgroundColor: colors.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 16 },
})
