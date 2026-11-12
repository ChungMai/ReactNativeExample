// Bottom tabs. Only "Rooms" is fully built; the others are simple screens.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import type { ComponentProps } from 'react'
import { colors } from '../../src/theme'

type IconName = ComponentProps<typeof Ionicons>['name']
const icon = (name: IconName) =>
  ({ color, size }: { color: unknown; size: number }) =>
    <Ionicons name={name} size={size} color={color as string} />

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        headerTitleAlign: 'center',
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="devices" options={{ title: 'Devices', tabBarIcon: icon('bulb') }} />
      <Tabs.Screen name="rooms" options={{ title: 'Rooms', headerShown: false, tabBarIcon: icon('cube') }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups', tabBarIcon: icon('aperture') }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: icon('ellipsis-horizontal') }} />
    </Tabs>
  )
}
