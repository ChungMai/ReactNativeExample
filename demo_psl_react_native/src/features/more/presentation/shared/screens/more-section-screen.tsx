// One page of the More menu: cards or rows with search, or the energy chart. Read only.
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useState, useSyncExternalStore } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { container } from '../../../../../di/container'
import { ObjectCard, ObjectCardGrid } from '../../../../../shared/components/object-card'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import { colors } from '../../../../../shared/theme'
import { findSection, type MoreSection } from '../../../domain/more-sections'
import MeterInsightsScreen from './meter-insights-screen'

export default function MoreSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>()
  const found = findSection(section)
  if (!found) return <Text style={styles.note}>Page not found</Text>
  if (found.layout === 'chart') return <MeterInsightsScreen />
  return <SectionList section={found} />
}

function SectionList({ section }: { section: MoreSection }) {
  const lists = container.moreLists
  const list = useSyncExternalStore(lists.subscribe, lists.get)[section.id]
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      await lists.refresh(section.id)
      setError(null)
    } catch (e) {
      setError(userMessage(toAppError(e)))
    }
  }, [lists, section.id])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const objects = list?.objects ?? []
  const text = search.trim().toLowerCase()
  const shown = objects.filter(o => o.name.toLowerCase().includes(text))
  const name = section.title.toLowerCase()

  return (
    <>
      <Stack.Screen options={{ title: section.title }} />
      {!list ? <LoadingView label={`Loading ${name}`} />
        : error && objects.length === 0 ? <ErrorView message={error} onRetry={refresh} />
        : (
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          >
            {list.serverOnline ? null : <Text role="alert" style={styles.note}>Offline. Showing the last known data.</Text>}
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`Search ${name}`}
              accessibilityLabel={`Search ${name}`}
              autoCorrect={false}
              style={styles.search}
            />
            <Text style={styles.note}>Read only.</Text>
            {shown.length === 0 ? <Text style={styles.note}>{objects.length ? 'Nothing matches your search.' : `There are no ${name} yet.`}</Text> : (
              section.layout === 'rows' ? (
                <View style={styles.rows}>
                  {shown.map(o => (
                    <View key={o.id} style={styles.row}>
                      <Text style={styles.name}>{o.name}</Text>
                      {o.detail ? <Text selectable style={styles.detail}>{o.detail}</Text> : null}
                    </View>
                  ))}
                </View>
              ) : (
                <ObjectCardGrid>
                  {size => shown.map(o => (
                    <ObjectCard key={o.id} title={o.name} icon={section.icon} size={size} isOn={o.isOn} note={o.note} />
                  ))}
                </ObjectCardGrid>
              )
            )}
          </ScrollView>
        )}
    </>
  )
}

const styles = StyleSheet.create({
  content: { paddingVertical: 12, gap: 10 },
  search: { marginHorizontal: 16, backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, color: colors.text },
  note: { paddingHorizontal: 16, color: colors.muted },
  rows: { gap: StyleSheet.hairlineWidth },
  row: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 12, gap: 2 },
  name: { fontSize: 16, color: colors.text },
  detail: { fontSize: 13, color: colors.muted },
})
