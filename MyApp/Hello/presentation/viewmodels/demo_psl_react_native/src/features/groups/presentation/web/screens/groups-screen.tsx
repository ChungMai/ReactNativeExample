// WEB – Groups: the add form sits in the page header, groups are listed as a table.
// Same view model as mobile (useGroupsScreen).
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { PageHeader } from '../../../../../shared/components/page-header'
import { colors } from '../../../../../shared/theme'
import { useGroupsScreen } from '../../shared/hooks/use-groups-screen'

export default function GroupsScreen() {
  const { groups, name, canAdd, setName, addGroup, removeGroup } = useGroupsScreen()

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Groups">
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={addGroup}
          placeholder="Group name"
          accessibilityLabel="Group name"
          style={styles.input}
        />
        <Pressable
          onPress={addGroup}
          disabled={!canAdd}
          accessibilityRole="button"
          style={[styles.add, !canAdd && { opacity: 0.5 }]}
        >
          <Text style={styles.addText}>Add group</Text>
        </Pressable>
      </PageHeader>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.table}>
          {groups.length === 0 ? (
            <Text style={styles.empty}>No groups yet</Text>
          ) : (
            groups.map(g => (
              <View key={g.id} style={styles.row}>
                <Text style={styles.name}>{g.name}</Text>
                <Pressable onPress={() => removeGroup(g.id)} accessibilityRole="button" accessibilityLabel={`Delete ${g.name}`}>
                  <Text style={styles.delete}>Delete</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    width: 240, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, color: colors.text,
  },
  add: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, backgroundColor: colors.primary, cursor: 'pointer' },
  addText: { color: '#fff', fontWeight: '600' },
  content: { padding: 24, alignItems: 'center' },
  table: {
    width: '100%', maxWidth: 760, backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  name: { fontSize: 15, color: colors.text },
  delete: { color: colors.danger, fontWeight: '600', cursor: 'pointer' },
  empty: { color: colors.muted, textAlign: 'center', padding: 24 },
})
