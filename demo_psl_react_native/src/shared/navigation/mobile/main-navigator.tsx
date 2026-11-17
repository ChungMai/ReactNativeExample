// MOBILE: a bottom tab bar.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import { colors } from '../../theme'
import { navItems, type IconName } from '../shared/nav-items'

const icon = (name: IconName) =>
  function renderTabIcon({ color, size }: { color: unknown; size: number }) {
    return <Ionicons name={name} size={size} color={color as string} />
  }

export function MainNavigator() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        headerTitleAlign: 'center',
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      {navItems.map(item => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{ title: item.title, headerShown: item.header, tabBarIcon: icon(item.icon) }}
        />
      ))}
    </Tabs>
  )
}
