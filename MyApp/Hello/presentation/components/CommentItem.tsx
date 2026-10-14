import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Comment } from '../../domain/entities/Comment';
import { CommentFormatter } from '../formatters/CommentFormatter';
import Avatar from './Avatar';

interface Props {
  comment: Comment;
  highlighted?: boolean;
  readOnly?: boolean;
  onEdit?: (comment: Comment) => void;
  onDelete?: (comment: Comment) => void;
}

export default class CommentItem extends React.Component<Props> {
  private static readonly formatter = new CommentFormatter();

  override render() {
    const { comment, highlighted, readOnly, onEdit, onDelete } = this.props;
    return (
      <View style={styles.row}>
        <Avatar size={34} initials="You" backgroundColor="#4f6df5" />
        <View style={styles.body}>
          <View style={[styles.bubble, highlighted && styles.bubbleActive]}>
            <Text style={styles.author}>You</Text>
            <Text style={styles.text}>{comment.text}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.time}>{CommentItem.formatter.format(comment)}</Text>
            {!readOnly && (
              <>
                <TouchableOpacity onPress={() => onEdit?.(comment)}>
                  <Text style={styles.action}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete?.(comment)}>
                  <Text style={[styles.action, styles.delete]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  body: { flex: 1 },
  bubble: { backgroundColor: '#f0f2f5', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleActive: { backgroundColor: '#e3e9ff', borderWidth: 1, borderColor: '#4f6df5' },
  author: { fontWeight: '700', color: '#222', fontSize: 13, marginBottom: 2 },
  text: { color: '#222', fontSize: 15 },
  meta: { flexDirection: 'row', gap: 14, marginTop: 4, marginLeft: 6, alignItems: 'center' },
  time: { color: '#888', fontSize: 12 },
  action: { color: '#666', fontSize: 12, fontWeight: '600' },
  delete: { color: '#e0245e' },
});
