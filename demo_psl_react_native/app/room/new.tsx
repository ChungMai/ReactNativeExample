// SCREEN 3 – New Room: header Save button, cover picker, controlled input,
// and an "Add Device" tile that opens a device picker.
import Ionicons from '@expo/vector-icons/Ionicons'
import { router, Stack } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { COVERS } from '../../src/data/covers'
import { useRoomsDispatch, useRoomsState } from '../../src/store/rooms'
import { colors } from '../../src/theme'

export default function NewRoom() {
  const dispatch = useRoomsDispatch()
  const { devices } = useRoomsState()
  const [name, setName] = useState('')
  const [cover, setCover] = useState(0)
  const [deviceIds, setDeviceIds] = useState<string[]>([])
  const [picking, setPicking] = useState(false)

  const canSave = name.trim().length > 0          // derived, not state

  function save() {
    dispatch({ type: 'addRoom', room: { name: name.trim(), cover, deviceIds } })
    router.back()
  }

  function toggleDevice(id: string) {
    setDeviceIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]))
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={save} disabled={!canSave} accessibilityRole="button"
              style={[styles.save, !canSave && { opacity: 0.4 }]}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.nameRow}>
        <Pressable onPress={() => setCover(c => (c + 1) % COVERS.length)}
          accessibilityLabel="Change cover image" style={styles.camera}>
          <Ionicons name="camera" size={16} color="#fff" />
        </Pressable>
        <TextInput value={name} onChangeText={setName} placeholder="Room Name"
          placeholderTextColor={colors.muted} style={styles.input} />
      </View>
      <Text style={styles.hint}>Tap the camera to change the cover (cover {cover + 1}/{COVERS.length})</Text>

      <View style={styles.grid}>
        {deviceIds.map(id => (
          <Pressable key={id} onPress={() => toggleDevice(id)} style={[styles.tile, styles.deviceTile]}>
            <Ionicons name="bulb-outline" size={28} color={colors.primary} />
            <Text style={styles.tileText} numberOfLines={2}>{devices[id].name}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setPicking(p => !p)} accessibilityRole="button" style={styles.tile}>
          <Ionicons name="add" size={40} color={colors.primary} />
          <Text style={styles.addText}>Add Device</Text>
        </Pressable>
      </View>

      {picking && (
        <View style={styles.picker}>
          {Object.values(devices).map(d => {
            const selected = deviceIds.includes(d.id)
            return (
              <Pressable key={d.id} onPress={() => toggleDevice(d.id)} style={styles.pickRow}>
                <Text style={{ color: colors.text }}>{d.name}</Text>
                <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={colors.primary} />
              </Pressable>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  save: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  saveText: { color: '#fff', fontWeight: '600' },
  nameRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20,
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.card,
  },
  camera: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.border },
  hint: { color: colors.muted, fontSize: 12, paddingHorizontal: 16, paddingTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, marginTop: 12 },
  tile: {
    width: '47%', aspectRatio: 1.05, backgroundColor: colors.card, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  deviceTile: { borderWidth: 1, borderColor: colors.primarySoft },
  tileText: { color: colors.text, textAlign: 'center', paddingHorizontal: 8 },
  addText: { color: colors.primary, fontWeight: '500' },
  picker: { marginHorizontal: 16, backgroundColor: colors.card, borderRadius: 10, overflow: 'hidden' },
  pickRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
})
