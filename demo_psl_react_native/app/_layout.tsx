// Root layout: a Stack holds the tabs,
// the room detail screen and the "New Room" screen.
import { Stack } from 'expo-router'
import { colors } from '../src/shared/theme'

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackButtonDisplayMode: 'minimal',
        // SDK 58 on iOS 26 makes headers transparent (Liquid Glass) by default,
        // so content would start underneath them. Keep a solid header instead.
        headerTransparent: false,
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="room/new" options={{ title: 'New Room' }} />
      <Stack.Screen name="room/[id]" options={{ title: 'Room' }} />
    </Stack>
  )
}
