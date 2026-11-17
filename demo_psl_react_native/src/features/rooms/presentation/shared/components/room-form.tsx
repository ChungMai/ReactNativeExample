// The form body shared by the New Room and Edit Room screens: cover, name, device tiles and picker.
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import type { RoomForm as RoomFormState } from '../hooks/use-room-form'

export function RoomForm({ form, showPreview = false }: { form: RoomFormState; showPreview?: boolean }) {
  return (
    <>
      {showPreview && <Image source={form.coverSource} style={styles.preview} resizeMode="cover" />}
      <View style={styles.nameRow}>
        <Pressable onPress={form.nextCover} accessibilityLabel="Change cover image" style={styles.camera}>
          <Ionicons name="camera" size={16} color="#fff" />
        </Pressable>
        <TextInput value={form.name} onChangeText={form.setName} placeholder="Room Name"
          placeholderTextColor={colors.muted} style={styles.input} />
      </View>
      <Text style={styles.hint}>Tap the camera to change the cover (cover {form.cover + 1}/{form.coverCount})</Text>

      <View style={styles.grid}>
        {form.selectedDevices.map(d => (
          <Pressable key={d.id} onPress={() => form.toggleDevice(d.id)} style={[styles.tile, styles.deviceTile]}>
            <Ionicons name="bulb-outline" size={28} color={colors.primary} />
            <Text style={styles.tileText} numberOfLines={2}>{d.title}</Text>
          </Pressable>
        ))}
        <Pressable onPress={form.togglePicker} accessibilityRole="button" style={styles.tile}>
          <Ionicons name="add" size={40} color={colors.primary} />
          <Text style={styles.addText}>Add Device</Text>
        </Pressable>
      </View>

      {form.picking && (
        <View style={styles.picker}>
          {form.devices.map(d => {
            const selected = form.deviceIds.includes(d.id)
            return (
              <Pressable key={d.id} onPress={() => form.toggleDevice(d.id)} style={styles.pickRow}>
                <Text style={{ color: colors.text }}>{d.title}</Text>
                <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={colors.primary} />
              </Pressable>
            )
          })}
        </View>
      )}
    </>
  )
}

export const formStyles = StyleSheet.create({
  save: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  saveText: { color: '#fff', fontWeight: '600' },
})

const styles = StyleSheet.create({
  preview: { width: '100%', height: 160 },
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
