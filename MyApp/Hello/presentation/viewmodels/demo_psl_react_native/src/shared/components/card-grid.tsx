// Scrollable page whose children wrap onto as many columns as fit the window ("regular width" UIs).
import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { GRID_GAP, PAGE_PADDING } from '../layout'

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.grid}>{children}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { padding: PAGE_PADDING },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
})
