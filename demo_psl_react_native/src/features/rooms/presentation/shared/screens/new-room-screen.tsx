// SCREEN 3 – New Room: header Save button, cover picker, controlled input,
// and an "Add Device" tile that opens a device picker.
import { Stack } from 'expo-router'
import { Pressable, ScrollView, Text } from 'react-native'
import { ReadableWidth } from '../../../../../shared/components/readable-width'
import { formStyles, RoomForm } from '../components/room-form'
import { useNewRoomScreen } from '../hooks/use-new-room-screen'

export default function NewRoomScreen() {
  const vm = useNewRoomScreen()

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
        <RoomForm form={vm} />
      </ScrollView>
    </ReadableWidth>
  )
}
