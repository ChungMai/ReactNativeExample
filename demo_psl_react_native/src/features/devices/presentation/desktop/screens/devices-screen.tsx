// DESKTOP – Devices (iPad, Mac): an inset grouped list like iPadOS Settings, centred and capped in width.
// Same view model as mobile and web (useDevicesScreen).
import { Fragment } from 'react'
import { ScrollView, StyleSheet, Switch, View } from 'react-native'
import { PageHeader } from '../../../../../shared/components/page-header'
import { ReadableWidth } from '../../../../../shared/components/readable-width'
import { Row } from '../../../../../shared/components/row'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import { PAGE_PADDING } from '../../../../../shared/layout'
import { colors } from '../../../../../shared/theme'
import { useDevicesScreen } from '../../shared/hooks/use-devices-screen'

export default function DevicesScreen() {
  const vm = useDevicesScreen()

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Devices" />
      {vm.status === 'loading' ? (
        <LoadingView label="Loading devices" />
      ) : vm.status === 'error' ? (
        <ErrorView message={vm.errorMessage ?? ''} onRetry={vm.retry} />
      ) : (
        <ReadableWidth maxWidth={680}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.group}>
              {vm.devices.map((d, i) => (
                <Fragment key={d.id}>
                  {i > 0 && <View style={styles.separator} />}
                  <Row
                    label={d.title}
                    right={<Switch value={d.isOn} onValueChange={() => vm.toggle(d.id)} accessibilityLabel={`Power ${d.title}`} />}
                  />
                </Fragment>
              ))}
            </View>
          </ScrollView>
        </ReadableWidth>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  content: { padding: PAGE_PADDING },
  group: { borderRadius: 14, overflow: 'hidden', backgroundColor: colors.card },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 16 },
})
