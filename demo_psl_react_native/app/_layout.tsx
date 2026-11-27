// Root layout, in three steps: login → network list → the app (tabs and the screens above them).
// Moving between steps is automatic when the session or the active network changes.
// Every route file must be listed in one of the guards.
import { Stack } from 'expo-router'
import { useSession } from '../src/features/auth'
import { useActiveNetwork } from '../src/features/networks'
import { AppShell } from '../src/shared/navigation'
import { colors } from '../src/shared/theme'

// AppShell adds the left menu on web and nothing on mobile (mobile uses the bottom tabs).
export default function RootLayout() {
  const signedIn = useSession() !== undefined
  const network = useActiveNetwork()
  const inNetwork = signedIn && network !== undefined

  return (
    <AppShell showMenu={inNetwork}>
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
        <Stack.Protected guard={inNetwork}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="room/new" options={{ title: 'New Room' }} />
          <Stack.Screen name="room/edit/[id]" options={{ title: 'Edit Room' }} />
          <Stack.Screen name="room/[id]" options={{ title: 'Room' }} />
          <Stack.Screen name="favourites/add" options={{ title: 'Add to Favourites' }} />
          <Stack.Screen name="hooks-demo" options={{ title: 'Hooks Demo' }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && !inNetwork}>
          <Stack.Screen name="networks" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="select-server" options={{ title: '' }} />
        </Stack.Protected>
      </Stack>
    </AppShell>
  )
}
