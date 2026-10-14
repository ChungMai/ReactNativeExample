import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CommentsViewModel } from '../viewmodels/CommentsViewModel';
import CommentItem from './CommentItem';
import { ViewModelComponent } from './ViewModelComponent';
import type { ViewModelFactory } from '../ViewModelFactory';

interface Props {
  photoId: string;
}

// Read-only list of a photo's comments, shown on the detail screen.
export default class CommentPreview extends ViewModelComponent<Props, CommentsViewModel> {
  protected createViewModel(factory: ViewModelFactory): CommentsViewModel {
    return factory.createCommentsViewModel(this.props.photoId);
  }

  reload(): Promise<void> {
    return this.vm.refresh();
  }

  // Overriding the base placeholders with inline text (slides 14-15).
  protected override renderLoading(): React.ReactNode {
    return <Text style={styles.muted}>Loading comments…</Text>;
  }

  protected override renderError(message: string): React.ReactNode {
    return <Text style={styles.muted}>Cannot load comments: {message}</Text>;
  }

  protected renderContent(vm: CommentsViewModel) {
    return (
      <View>
        <Text style={styles.title}>Comments ({vm.comments.length})</Text>
        {vm.comments.length === 0 ? (
          <Text style={styles.muted}>No comments yet.</Text>
        ) : (
          vm.comments.map(c => (
            <View key={c.id} style={styles.item}>
              <CommentItem comment={c} readOnly />
            </View>
          ))
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: '#222', marginTop: 24, marginBottom: 6 },
  item: { marginTop: 12 },
  muted: { color: '#888', marginTop: 12 },
});
