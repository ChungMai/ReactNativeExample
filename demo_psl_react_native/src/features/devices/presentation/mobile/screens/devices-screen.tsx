// Devices tab: every device with its switch.
import { ScrollView, StyleSheet, Switch } from 'react-native'
import { Row } from '../../../../../shared/components/row'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import { useDevicesScreen } from '../../shared/hooks/use-devices-screen'

export default function DevicesScreen() {
  const vm = useDevicesScreen()

  if (vm.status === 'loading') return <LoadingView label="Loading devices" />
  if (vm.status === 'error') return <ErrorView message={vm.errorMessage ?? ''} onRetry={vm.retry} />

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingVertical: 16, gap: StyleSheet.hairlineWidth }}>
      {vm.devices.map(d => (
        <Row key={d.id} label={d.title} right={<Switch value={d.isOn} onValueChange={() => vm.toggle(d.id)} />} />
      ))}
    </ScrollView>
  )
}
