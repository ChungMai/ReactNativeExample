import { FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import { useGroupsScreen } from '../../shared/hooks/use-groups-screen'

export default function GroupsScreen() {
  const { groups, name, canAdd, setName, addGroup, removeGroup } = useGroupsScreen()

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={addGroup}
          placeholder="Tên nhóm"
          placeholderTextColor={colors.muted}
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: colors.text,
          }}
        />
        <Pressable
          onPress={addGroup}
          disabled={!canAdd}
          style={{
            backgroundColor: colors.primary,
            opacity: canAdd ? 1 : 0.5,
            borderRadius: 8,
            paddingHorizontal: 16,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Thêm</Text>
        </Pressable>
      </View>

      <FlatList
        data={groups}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 32 }}>Chưa có nhóm nào</Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.card,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 12,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>{item.name}</Text>
            <Pressable onPress={() => removeGroup(item.id)}>
              <Text style={{ color: colors.danger, fontWeight: '600' }}>Xoá</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  )
}
