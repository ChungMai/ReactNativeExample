// The groups in collapsible sections of cards. Swift: GroupsMainViewController.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { ObjectCard, ObjectCardGrid } from '../../../../../shared/components/object-card'
import { ErrorView, LoadingView } from '../../../../../shared/components/state-views'
import { colors } from '../../../../../shared/theme'
import { useGroupsScreen } from '../hooks/use-groups-screen'

export function GroupsScreen() {
  const vm = useGroupsScreen()

  if (!vm.loaded) return <LoadingView label="Loading groups" />
  if (vm.error && !vm.hasGroups) return <ErrorView message={vm.error} onRetry={vm.refresh} />

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}
    >
      {vm.serverOnline ? null : <Text role="alert" style={styles.offline}>Offline. Showing the last known groups.</Text>}
      <View style={styles.toolbar}>
        <TextInput
          value={vm.search}
          onChangeText={vm.setSearch}
          placeholder="Search groups"
          accessibilityLabel="Search groups"
          autoCorrect={false}
          style={styles.search}
        />
        <Pressable onPress={vm.toggleSort} accessibilityRole="button" accessibilityLabel="Change sort order" style={styles.button}>
          <Text style={styles.link}>{vm.ascending ? 'A-Z' : 'Z-A'}</Text>
        </Pressable>
        <Pressable onPress={vm.refresh} accessibilityRole="button" accessibilityLabel="Reload groups" style={styles.button}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </Pressable>
      </View>
      <Text style={styles.note}>Read only.</Text>

      {vm.sections.length === 0
        ? <Text style={styles.note}>{vm.hasGroups ? 'No group matches your search.' : 'There are no groups yet.'}</Text>
        : vm.sections.map(section => (
          <View key={section.category} style={styles.section}>
            <Pressable
              onPress={() => vm.toggleSection(section.category)}
              accessibilityRole="button"
              accessibilityState={{ expanded: section.isExpanded }}
              style={styles.header}
            >
              <Text style={styles.title}>{`${section.category} (${section.count})`}</Text>
              <Ionicons name={section.isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
            </Pressable>
            {section.isExpanded ? (
              <ObjectCardGrid>
                {size => section.groups.map(g => (
                  <ObjectCard key={g.id} title={g.name} icon="aperture" size={size} isOn={g.isOn} />
                ))}
              </ObjectCardGrid>
            ) : null}
          </View>
        ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingVertical: 12, gap: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  search: { flex: 1, backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, color: colors.text },
  button: { padding: 8 },
  link: { color: colors.primary, fontWeight: '600' },
  note: { paddingHorizontal: 16, color: colors.muted },
  offline: { paddingHorizontal: 16, color: colors.text },
  section: { gap: 6 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.card,
  },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
})
