// A message with an OK button. (Alert.alert does nothing on web.)
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../shared/theme'
import type { Dialog } from '../hooks/use-network-list-screen'

export function DialogView({ dialog, onClose }: { dialog: Dialog | null; onClose: () => void }) {
  if (!dialog) return null
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box} accessibilityViewIsModal>
          <Text role="heading" style={styles.title}>{dialog.title}</Text>
          <Text style={styles.message}>{dialog.message}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" style={styles.button}>
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { width: '100%', maxWidth: 360, backgroundColor: colors.card, borderRadius: 14, padding: 20, gap: 12 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  message: { fontSize: 14, color: colors.text },
  button: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
})
