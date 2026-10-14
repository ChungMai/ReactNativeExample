import React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Comment } from '../../domain/entities/Comment';
import CommentComposer from '../components/CommentComposer';
import CommentItem from '../components/CommentItem';
import { ViewModelComponent } from '../components/ViewModelComponent';
import type { RootStackParamList } from '../navigation';
import type { CommentsViewModel } from '../viewmodels/CommentsViewModel';
import type { ViewModelFactory } from '../ViewModelFactory';

type Props = NativeStackScreenProps<RootStackParamList, 'Comments'>;

export default class CommentsScreen extends ViewModelComponent<Props, CommentsViewModel> {
  protected createViewModel(factory: ViewModelFactory): CommentsViewModel {
    return factory.createCommentsViewModel(this.props.route.params.photoId);
  }

  protected renderContent(vm: CommentsViewModel) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}>
        <FlatList
          data={vm.comments}
          keyExtractor={(c: Comment) => c.id}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              highlighted={vm.editing?.id === item.id}
              onEdit={c => vm.startEdit(c)}
              onDelete={c => vm.remove(c)}
            />
          )}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No comments yet</Text>
              <Text style={styles.emptyText}>Be the first to share what you think.</Text>
            </View>
          }
        />
        <CommentComposer
          draft={vm.draft}
          isEditing={vm.isEditing}
          error={vm.formError}
          onChangeText={text => vm.setDraft(text)}
          onSubmit={() => vm.submit()}
          onCancelEdit={() => vm.cancelEdit()}
        />
      </KeyboardAvoidingView>
    );
  }
}

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, flexGrow: 1 },
  separator: { height: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  emptyText: { color: '#888', marginTop: 6 },
});
