// DESKTOP – Groups (iPad, Mac): the add field is the first row of an inset grouped list.
// Same view model as mobile and web (useGroupsScreen).
import { Fragment } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { PageHeader } from '../../../../../shared/components/page-header'
import { ReadableWidth } from '../../../../../shared/components/readable-width'
import { PAGE_PADDING } from '../../../../../shared/layout'
import { colors } from '../../../../../shared/theme'
import { useGroupsScreen } from '../../shared/hooks/use-groups-screen'

export default function GroupsScreen() {
  const { groups, name, canAdd, setName, addGroup, removeGroup } = useGroupsScreen()

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Groups" />
      <ReadableWidth maxWidth={680}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.group}>
            <View style={styles.row}>
              <TextInput
                value={name}
                onChangeText={setName}
                onSubmitEditing={addGroup}
                placeholder="New group name"
                placeholderTextColor={colors.muted}
                accessibilityLabel="Group name"
                style={styles.input}
              />
              <Pressable onPress={addGroup} disabled={!canAdd} accessibilityRole="button" style={!canAdd && { opacity: 0.4 }}>
                <Text style={styles.add}>Add</Text>
              </Pressable>
            </View>
            {groups.map(g => (
              <Fragment key={g.id}>
                <View style={styles.separator} />
                <View style={styles.row}>
                  <Text style={styles.name}>{g.name}</Text>
                  <Pressable onPress={() => removeGroup(g.id)} accessibilityRole="button" accessibilityLabel={`Delete ${g.name}`}>
                    <Text style={styles.delete}>Delete</Text>
                  </Pressable>
                </View>
              </Fragment>
            ))}
          </View>
          {groups.length === 0 && <Text style={styles.empty}>No groups yet</Text>}
        </ScrollView>
      </ReadableWidth>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { padding: PAGE_PADDING },
  group: { borderRadius: 14, overflow: 'hidden', backgroundColor: colors.card },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 16 },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 4 },
  add: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  name: { fontSize: 16, color: colors.text },
  delete: { color: colors.danger, fontWeight: '600' },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 24 },
})
