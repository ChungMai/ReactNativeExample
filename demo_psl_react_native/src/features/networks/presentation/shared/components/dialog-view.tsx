// A confirm / alert box that also works on web (Alert.alert does not).
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import type { Dialog } from '../hooks/use-network-list-screen'

type Props = { dialog: Dialog | null; input: string; onType: (text: string) => void; onClose: () => void }

export function DialogView({ dialog, input, onType, onClose }: Props) {
  if (!dialog) return null
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box} accessibilityViewIsModal>
          {dialog.title ? <Text role="heading" style={styles.title}>{dialog.title}</Text> : null}
          <Text style={styles.message}>{dialog.message}</Text>
          {dialog.inputLabel ? (
            <TextInput
              value={input}
              onChangeText={onType}
              accessibilityLabel={dialog.inputLabel}
              placeholder={dialog.inputLabel}
              autoCorrect={false}
              style={styles.input}
            />
          ) : null}
          <View style={styles.buttons}>
            {dialog.buttons.map(button => (
              <Pressable key={button.label} onPress={button.onPress} accessibilityRole="button" accessibilityLabel={button.label} hitSlop={8}>
                <Text style={[styles.button, button.destructive && { color: colors.danger }]}>{button.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { width: '100%', maxWidth: 360, backgroundColor: colors.card, borderRadius: 14, padding: 20, gap: 12 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  message: { color: colors.text, fontSize: 14 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, height: 44, color: colors.text },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24 },
  button: { color: colors.primary, fontWeight: '600', fontSize: 15 },
})
