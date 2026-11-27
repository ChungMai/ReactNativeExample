// One series of hourly bars: a single hue, so no legend. Press a bar to read it; the table lists every value.
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import { hourLabel, type EnergyDay } from '../../../domain/energy'

const HEIGHT = 160
const kwh = (value: number | undefined) => (value === undefined ? 'No data' : `${value.toFixed(2)} kWh`)

export function EnergyBars({ day }: { day: EnergyDay }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [table, setTable] = useState(false)
  const max = Math.max(0, ...day.hours.map(h => h.kwh ?? 0))
  const selected = day.hours.find(h => h.time === picked)

  return (
    <View style={styles.card}>
      <Text style={styles.readout}>
        {selected ? `${hourLabel(selected.time, day.timeZone)}  ${kwh(selected.kwh)}` : `Peak hour: ${kwh(max)}`}
      </Text>
      <View style={styles.plot}>
        {day.hours.map(h => (
          // the whole column is the target, not just the bar
          <Pressable
            key={h.time}
            onPress={() => setPicked(h.time)}
            onHoverIn={() => setPicked(h.time)}
            accessibilityRole="button"
            accessibilityLabel={`${hourLabel(h.time, day.timeZone)}, ${kwh(h.kwh)}`}
            style={styles.column}
          >
            {h.kwh !== undefined && max > 0 ? (
              <View style={[styles.bar, { height: Math.max(1, (h.kwh / max) * HEIGHT) }, picked === h.time && styles.barPicked]} />
            ) : null}
          </Pressable>
        ))}
      </View>
      <View style={styles.axis}>
        <Text style={styles.muted}>{day.hours.length ? hourLabel(day.hours[0].time, day.timeZone) : ''}</Text>
        <Text style={styles.muted}>{day.hours.length ? hourLabel(day.hours[day.hours.length - 1].time, day.timeZone) : ''}</Text>
      </View>
      <Pressable onPress={() => setTable(v => !v)} accessibilityRole="button" accessibilityState={{ expanded: table }}>
        <Text style={styles.link}>{table ? 'Hide table' : 'Show table'}</Text>
      </Pressable>
      {table ? day.hours.map(h => (
        <View key={h.time} style={styles.row}>
          <Text style={styles.muted}>{hourLabel(h.time, day.timeZone)}</Text>
          <Text style={styles.value}>{kwh(h.kwh)}</Text>
        </View>
      )) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, backgroundColor: colors.card, borderRadius: 12, padding: 14, gap: 10 },
  readout: { color: colors.text, fontSize: 14 },
  plot: { height: HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 2, borderBottomWidth: 1, borderColor: colors.border },
  column: { flex: 1, height: HEIGHT, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '100%', maxWidth: 24, backgroundColor: colors.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barPicked: { opacity: 0.6 },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { color: colors.muted, fontSize: 12 },
  link: { color: colors.primary, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  value: { color: colors.text, fontSize: 13, fontVariant: ['tabular-nums'] },
})
