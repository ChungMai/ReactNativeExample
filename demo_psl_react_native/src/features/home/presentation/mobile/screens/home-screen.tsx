// MOBILE – Home. Swift: HomeMainViewController (default and custom layout).
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { IconButton } from '../../../../../shared/components/icon-button'
import { colors } from '../../../../../shared/theme'
import { AddTile } from '../../shared/components/add-tile'
import { FavouriteCard } from '../../shared/components/favourite-card'
import { HomeOverlays } from '../../shared/components/home-overlays'
import { NetworkStatus } from '../../shared/components/network-status'
import { SummaryStrip } from '../../shared/components/summary-strip'
import { useHomeScreen } from '../../shared/hooks/use-home-screen'
import type { CardDisplay } from '../../shared/models/home-display'

const MARGIN = 20
const GAP = 10

export default function HomeScreen() {
  const vm = useHomeScreen()
  const { width } = useWindowDimensions()
  const size = (width - MARGIN * 2 - GAP) / 2 // two cards per row

  const card = (c: CardDisplay) => (
    <FavouriteCard key={c.key} card={c} size={size} onPress={vm.activate} onOpenDetail={vm.openDetail} />
  )
  const emptyTile = vm.emptyTile ? (
    <View style={styles.tile}>
      <AddTile {...vm.emptyTile} size={size} />
    </View>
  ) : null

  return (
    // Home draws its own header, so it has to clear the status bar itself.
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.card }}>
      <View style={styles.header}>
        <View style={styles.actions}>
          {vm.canAdd ? <IconButton icon="add" label="Add" onPress={() => vm.toggleMenu('add')} /> : null}
          <IconButton icon="ellipsis-horizontal" label="More options" onPress={() => vm.toggleMenu('more')} variant="plain" />
        </View>
        <Pressable onPress={vm.openNetworks} accessibilityRole="button" accessibilityLabel="Change network" style={styles.network}>
          <Text role="heading" numberOfLines={1} style={styles.name}>{vm.networkName}</Text>
          <Ionicons name="chevron-down" size={22} color={colors.primary} />
        </Pressable>
        <NetworkStatus vm={vm} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}
        >
          <SummaryStrip items={vm.summary} inset={MARGIN} />
          {vm.layout === 'custom' ? (
            <View style={styles.grid}>{vm.gridCards.map(card)}</View>
          ) : (
            vm.sections.map(section => (
              <View key={section.kind} style={styles.section}>
                <Text role="heading" style={styles.sectionTitle}>{section.title}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                  {section.cards.map(card)}
                </ScrollView>
              </View>
            ))
          )}
          {emptyTile}
        </ScrollView>
        <HomeOverlays vm={vm} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingBottom: 8, gap: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  network: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 32, fontWeight: '500', color: colors.text, flexShrink: 1 },
  content: { paddingBottom: MARGIN, gap: 12 },
  section: { backgroundColor: colors.bg, paddingVertical: 14, gap: 12 },
  sectionTitle: { fontSize: 17, color: colors.text, paddingHorizontal: MARGIN },
  row: { paddingHorizontal: MARGIN, gap: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: MARGIN, gap: GAP },
  tile: { paddingHorizontal: MARGIN },
})
