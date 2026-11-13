// Bottom tabs. Only "Rooms" is fully built; the others are simple screens.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import type { ComponentProps } from 'react'
import { colors } from '../../src/shared/theme'

type IconName = ComponentProps<typeof Ionicons>['name']
function TabIcon({ name, color, size }: { name: IconName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />
}
const icon = (name: IconName) =>
  function renderTabIcon({ color, size }: { color: unknown; size: number }) {
    return <TabIcon name={name} color={color as string} size={size} />
  }

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
