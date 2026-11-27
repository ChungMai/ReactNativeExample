// The "regular width" Home used by web, iPad and Mac: page header and wrapping grids.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { IconButton } from '../../../../../shared/components/icon-button'
import { PageHeader } from '../../../../../shared/components/page-header'
import { GRID_GAP, PAGE_PADDING } from '../../../../../shared/layout'
import { colors } from '../../../../../shared/theme'
import type { HomeViewModel } from '../hooks/use-home-screen'
import type { CardDisplay } from '../models/home-display'
import { AddTile } from './add-tile'
import { FavouriteCard } from './favourite-card'
import { HomeOverlays } from './home-overlays'
import { NetworkStatus } from './network-status'
import { SummaryStrip } from './summary-strip'

const CARD = 180

export function HomeWide({ vm }: { vm: HomeViewModel }) {
  const grid = (cards: CardDisplay[]) => (
    <View style={styles.grid}>
      {cards.map(card => (
        <FavouriteCard key={card.key} card={card} size={CARD} onPress={vm.activate} onOpenDetail={vm.openDetail} detailButton />
      ))}
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title={vm.networkName}>
        <Pressable onPress={vm.openNetworks} accessibilityRole="button" accessibilityLabel="Change network" hitSlop={8}>
          <Ionicons name="chevron-down" size={20} color={colors.primary} />
        </Pressable>
        <NetworkStatus vm={vm} />
        <IconButton icon="refresh" label="Refresh" onPress={vm.refresh} variant="plain" />
        {vm.canAdd ? <IconButton icon="add" label="Add" onPress={() => vm.toggleMenu('add')} /> : null}
        <IconButton icon="ellipsis-horizontal" label="More options" onPress={() => vm.toggleMenu('more')} variant="plain" />
      </PageHeader>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <SummaryStrip items={vm.summary} inset={0} />
          {vm.layout === 'custom'
            ? grid(vm.gridCards)
            : vm.sections.map(section => (
                <View key={section.kind} style={styles.section}>
                  <Text role="heading" aria-level={2} style={styles.sectionTitle}>{section.title}</Text>
                  {grid(section.cards)}
                </View>
              ))}
          {vm.emptyTile ? <AddTile {...vm.emptyTile} size={CARD} /> : null}
        </ScrollView>
        <HomeOverlays vm={vm} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: PAGE_PADDING, paddingBottom: PAGE_PADDING, paddingTop: 4, gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  section: { gap: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 17, color: colors.text },
})
