// "2 Devices are switched on". Swift: HomeActiveItemsCollectionViewCell.
import Ionicons from '@expo/vector-icons/Ionicons'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import type { SummaryDisplay } from '../models/home-display'

export function SummaryStrip({ items, inset }: { items: SummaryDisplay[]; inset: number }) {
  if (items.length === 0) return null
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, { paddingHorizontal: inset }]}>
      {items.map(item => (
        <View key={item.kind} style={styles.item} accessible accessibilityLabel={`${item.title} ${item.subtitle}`}>
          <Ionicons name={item.icon} size={24} color={colors.primary} />
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: { gap: 16, paddingVertical: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 128 },
  title: { fontSize: 16, color: colors.text },
  subtitle: { fontSize: 11, color: colors.muted },
})
