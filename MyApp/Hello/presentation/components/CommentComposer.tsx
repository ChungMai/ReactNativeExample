import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Comment } from '../../domain/entities/Comment';

interface Props {
  draft: string;
  isEditing: boolean;
  error: string | null;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
}

// Fixed input bar at the bottom of the screen, like a chat/comment composer.
export default class CommentComposer extends React.Component<Props> {
  override render() {
    const { draft, isEditing, error, onChangeText, onSubmit, onCancelEdit } = this.props;
    const canSend = draft.trim().length > 0;
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        {isEditing && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Editing comment</Text>
            <TouchableOpacity onPress={onCancelEdit}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={isEditing ? 'Edit your comment…' : 'Add a comment…'}
            value={draft}
            onChangeText={onChangeText}
            multiline
          />
          <TouchableOpacity
            style={[styles.send, !canSend && styles.sendOff]}
            disabled={!canSend}
            onPress={onSubmit}>
            <Text style={styles.sendText}>{isEditing ? 'Save' : 'Post'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.counter}>
          {draft.trim().length}/{Comment.MAX_LENGTH}
        </Text>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  banner: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  bannerText: { color: '#4f6df5', fontWeight: '600' },
  cancel: { color: '#666' },
  error: { color: '#e0245e', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  send: { backgroundColor: '#4f6df5', borderRadius: 20, paddingHorizontal: 16, height: 40, justifyContent: 'center' },
  sendOff: { backgroundColor: '#b8c2f5' },
  sendText: { color: '#fff', fontWeight: '700' },
  counter: { alignSelf: 'flex-end', color: '#aaa', fontSize: 11, marginTop: 2 },
});
