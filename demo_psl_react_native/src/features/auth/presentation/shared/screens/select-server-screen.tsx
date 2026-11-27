// "Select Server". Same UI on every device. Swift: SelectServerViewController and its bottom sheet.
import Ionicons from '@expo/vector-icons/Ionicons'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import { useSelectServerScreen } from '../hooks/use-select-server-screen'

export default function SelectServerScreen() {
  const vm = useSelectServerScreen()

  return (
    <View style={styles.screen}>
      <View style={styles.form}>
        <Text role="heading" style={styles.title}>Select Server</Text>

        <Pressable
          onPress={vm.openList}
          accessibilityRole="button"
          accessibilityLabel={`Server: ${vm.selectedLabel}`}
          style={styles.dropdown}
        >
          <Text numberOfLines={1} style={styles.value}>{vm.selectedLabel}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.primary} />
        </Pressable>

        {vm.isCustom ? (
          <TextInput
            value={vm.address}
            onChangeText={vm.setAddress}
            accessibilityLabel="Server URL / IP Address"
            placeholder="Server URL / IP Address"
            placeholderTextColor={colors.muted}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={vm.next}
            style={styles.input}
          />
        ) : null}

        {vm.error ? <Text accessibilityRole="alert" style={styles.error}>{vm.error}</Text> : null}

        <Pressable
          onPress={vm.next}
          disabled={vm.connecting}
          accessibilityRole="button"
          accessibilityLabel="Next"
          accessibilityState={{ disabled: vm.connecting, busy: vm.connecting }}
          style={[styles.next, vm.connecting && { opacity: 0.7 }]}
        >
          {vm.connecting ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>Next</Text>}
        </Pressable>
      </View>

      <Modal visible={vm.listOpen} transparent animationType="slide" onRequestClose={vm.closeList}>
        <Pressable style={styles.backdrop} onPress={vm.closeList} accessibilityLabel="Close server list" />
        <ScrollView style={styles.sheet} contentContainerStyle={{ paddingBottom: 32 }}>
          {vm.options.map(option => (
            <View key={option.label} style={styles.row}>
              <Pressable
                onPress={option.onPress}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: option.active }}
                style={styles.rowMain}
              >
                <Text numberOfLines={1} style={styles.value}>{option.label}</Text>
                {option.active ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
              </Pressable>
              {option.onRemove ? (
                <Pressable onPress={option.onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${option.label}`} hitSlop={8} style={styles.remove}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card, alignItems: 'center', padding: 24 },
  form: { width: '100%', maxWidth: 420, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  dropdown: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 12 },
  value: { flex: 1, fontSize: 16, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, height: 46, color: colors.text, fontSize: 16 },
  error: { color: colors.danger, fontSize: 14 },
  next: { height: 48, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { flexGrow: 0, maxHeight: '60%', backgroundColor: colors.card },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
  remove: { paddingHorizontal: 16 },
})
