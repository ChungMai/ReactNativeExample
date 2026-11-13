import { toDeviceDisplay } from '@/features/devices/presentation/mappers/device-display-mapper'

it('maps a device to what the UI needs', () => {
  expect(toDeviceDisplay({ id: 'd1', name: 'Lamp', kind: 'light', on: true })).toEqual({
    id: 'd1', title: 'Lamp', isOn: true,
  })
})
