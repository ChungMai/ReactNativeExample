// "Add to Favourites": one list with a checkbox per object. Same UI on every device.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Stack } from 'expo-router'
import type { ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { ReadableWidth } from '../../../../../shared/components/readable-width'
import { colors } from '../../../../../shared/theme'
import { useAddFavouritesScreen } from '../hooks/use-add-favourites-screen'

export default function AddFavouritesScreen() {
  const vm = useAddFavouritesScreen()

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={vm.save} accessibilityRole="button" accessibilityLabel="Save" hitSlop={8}>
              <Text style={styles.save}>Save</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <ReadableWidth>
          {vm.error ? <Text accessibilityRole="alert" style={styles.error}>{vm.error}</Text> : null}
          {vm.groups.map(group => (
            <OptionGroup key={group.kind} title={group.title}>
              {group.options.map(option => (
                <Pressable
                  key={option.id}
                  onPress={() => vm.toggle(group.kind, option.id)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={option.name}
                  accessibilityState={{ checked: option.selected }}
                  aria-checked={option.selected}
                  style={styles.row}
                >
                  <Text style={styles.name}>{option.name}</Text>
                  <Ionicons
                    name={option.selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={option.selected ? colors.primary : colors.muted}
                  />
                </Pressable>
              ))}
            </OptionGroup>
          ))}
        </ReadableWidth>
      </ScrollView>
    </>
  )
}

function OptionGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Text role="heading" style={styles.title}>{title}</Text>
      {children}
    </>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  save: { color: colors.primary, fontWeight: '600', fontSize: 16, paddingHorizontal: 8 },
  error: { color: colors.danger, marginBottom: 8 },
  title: { fontSize: 13, color: colors.muted, textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14,
    backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  name: { color: colors.text, fontSize: 16, flex: 1 },
})
