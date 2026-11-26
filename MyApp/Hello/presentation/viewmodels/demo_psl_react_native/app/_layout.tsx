// Root layout: a Stack holds the tabs,
// the room detail screen and the "New Room" screen.
import { Stack } from 'expo-router'
import { AppShell } from '../src/shared/navigation'
import { colors } from '../src/shared/theme'

// AppShell adds the left menu on web and nothing on mobile (mobile uses the bottom tabs).
export default function RootLayout() {
  return (
    <AppShell>
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
        <Stack.Screen name="room/edit/[id]" options={{ title: 'Edit Room' }} />
        <Stack.Screen name="room/[id]" options={{ title: 'Room' }} />
        <Stack.Screen name="hooks-demo" options={{ title: 'Hooks Demo' }} />
      </Stack>
    </AppShell>
  )
}
