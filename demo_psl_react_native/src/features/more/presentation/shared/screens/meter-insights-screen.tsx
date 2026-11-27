// Energy used by one meter, hour by hour. Swift: PSLChartViewUsageViewController. Energy meters only.
import { Stack } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { container } from '../../../../../di/container'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import { colors } from '../../../../../shared/theme'
import type { EnergyDay } from '../../../domain/energy'
import type { MoreObject } from '../../../domain/more-sections'
import { EnergyBars } from '../components/energy-bars'

/** Loads when `load` changes; a late answer to an earlier request is ignored. */
function useLoaded<T>(load: (() => Promise<T>) | undefined) {
  const [result, setResult] = useState<{ load: unknown; data?: T; error?: string }>()
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!load) return
    let stale = false
    load().then(
      data => { if (!stale) setResult({ load, data }) },
      e => { if (!stale) setResult({ load, error: userMessage(toAppError(e)) }) },
    )
    return () => { stale = true }
  }, [load, attempt])
  const current = result?.load === load ? result : undefined
  return { data: current?.data, error: current?.error, retry: () => setAttempt(a => a + 1) }
}

const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export default function MeterInsightsScreen() {
  const { meterInsights } = container
  const [meterId, setMeterId] = useState<string | null>(null)
  const [back, setBack] = useState(0)

  const loadMeters = useCallback((): Promise<MoreObject[]> => meterInsights.meters(), [meterInsights])
  const meters = useLoaded(loadMeters)
  const selected = meterId ?? meters.data?.[0]?.id
  const loadDay = useCallback((): Promise<EnergyDay> => meterInsights.day(selected as string, daysAgo(back)), [meterInsights, selected, back])
  const day = useLoaded(selected ? loadDay : undefined)

  const title = <Stack.Screen options={{ title: 'Meter Insights' }} />
  if (meters.error) return <>{title}<ErrorView message={meters.error} onRetry={meters.retry} /></>
  if (!meters.data) return <>{title}<LoadingView label="Loading meters" /></>
  if (meters.data.length === 0) return <>{title}<Text style={styles.note}>There are no energy meters in this network.</Text></>

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {title}
      <View style={styles.chips}>
        {meters.data.map(m => (
          <Pressable
            key={m.id}
            onPress={() => setMeterId(m.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: m.id === selected }}
            style={[styles.chip, m.id === selected && styles.chipOn]}
          >
            <Text style={m.id === selected ? styles.chipTextOn : styles.chipText}>{m.name}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.dates}>
        <Pressable onPress={() => setBack(b => b + 1)} accessibilityRole="button" accessibilityLabel="Previous day">
          <Text style={styles.link}>‹ Earlier</Text>
        </Pressable>
        <Text style={styles.date}>{daysAgo(back).toDateString()}</Text>
        <Pressable onPress={() => setBack(b => Math.max(0, b - 1))} disabled={back === 0} accessibilityRole="button" accessibilityLabel="Next day">
          <Text style={[styles.link, back === 0 && { color: colors.muted }]}>Later ›</Text>
        </Pressable>
      </View>

      {day.error ? <ErrorView message={day.error} onRetry={day.retry} />
        : !day.data ? <LoadingView label="Loading energy" />
        : (
          <>
            <Text style={styles.total}>{day.data.total === undefined ? '--' : day.data.total.toFixed(2)} kWh</Text>
            <Text style={styles.note}>Energy used on this day</Text>
            {day.data.hours.length === 0
              ? <Text style={styles.note}>No data for this day.</Text>
              : <EnergyBars key={`${selected}-${back}`} day={day.data} />}
          </>
        )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingVertical: 12, gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color: colors.text },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  dates: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  date: { color: colors.text, fontWeight: '600' },
  link: { color: colors.primary, fontWeight: '600' },
  total: { paddingHorizontal: 16, fontSize: 32, fontWeight: '600', color: colors.text },
  note: { paddingHorizontal: 16, color: colors.muted },
})
