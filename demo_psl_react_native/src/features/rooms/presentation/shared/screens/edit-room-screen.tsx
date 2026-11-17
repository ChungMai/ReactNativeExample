// SCREEN 4 – Edit Room: same form as New Room, pre-filled; updates name, cover and devices.
import { Stack, useLocalSearchParams } from 'expo-router'
import { Pressable, ScrollView, Text } from 'react-native'
import { ReadableWidth } from '../../../../../shared/components/readable-width'
import { formStyles, RoomForm } from '../components/room-form'
import { useEditRoomScreen } from '../hooks/use-edit-room-screen'

export default function EditRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const vm = useEditRoomScreen(id)

  if (!vm.found) return <Text style={{ padding: 16 }}>Room not found</Text>

  return (
    <ReadableWidth>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
        <Stack.Screen
          options={{
            headerRight: () => (
              <Pressable onPress={vm.save} disabled={!vm.canSave} accessibilityRole="button"
                style={[formStyles.save, !vm.canSave && { opacity: 0.4 }]}>
                <Text style={formStyles.saveText}>Save</Text>
              </Pressable>
            ),
          }}
        />
        <RoomForm form={vm} showPreview />
      </ScrollView>
    </ReadableWidth>
  )
}
