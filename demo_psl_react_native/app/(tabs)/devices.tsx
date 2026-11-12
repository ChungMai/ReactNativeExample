// Devices tab: every device with its switch.
import { ScrollView, StyleSheet, Switch } from 'react-native'
import { Row } from '../../src/components/Row'
import { useRoomsDispatch, useRoomsState } from '../../src/store/rooms'

export default function Devices() {
  const { devices } = useRoomsState()
  const dispatch = useRoomsDispatch()
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingVertical: 16, gap: StyleSheet.hairlineWidth }}>
      {Object.values(devices).map(d => (
        <Row key={d.id} label={d.name}
          right={<Switch value={d.on} onValueChange={() => dispatch({ type: 'toggleDevice', id: d.id })} />} />
      ))}
    </ScrollView>
  )
}
