import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CommentPreview from '../components/CommentPreview';
import { ViewModelComponent } from '../components/ViewModelComponent';
import type { RootStackParamList } from '../navigation';
import type { PhotoDetailViewModel } from '../viewmodels/PhotoDetailViewModel';
import type { ViewModelFactory } from '../ViewModelFactory';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default class DetailScreen extends ViewModelComponent<
  Props,
  PhotoDetailViewModel
> {
  private readonly preview = React.createRef<CommentPreview>();
  private removeFocusListener?: () => void;

  protected createViewModel(factory: ViewModelFactory): PhotoDetailViewModel {
    return factory.createPhotoDetailViewModel(this.props.route.params.id);
  }

  // Refresh the comment list every time we come back from the Comments screen.
  override componentDidMount(): void {
    super.componentDidMount();
    this.removeFocusListener = this.props.navigation.addListener(
      'focus',
      () => {
        this.preview.current?.reload();
      },
    );
  }

  override componentWillUnmount(): void {
    super.componentWillUnmount();
    this.removeFocusListener?.();
  }

  protected renderContent({ photo }: PhotoDetailViewModel) {
    if (!photo) {
      return null;
    }
    const imageHeight = Math.round(800 / photo.aspectRatio);
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          style={[styles.image, { aspectRatio: photo.aspectRatio }]}
          source={{
            uri: `https://picsum.photos/id/${photo.id}/800/${imageHeight}`,
          }}
        />
        <Text style={styles.author}>{photo.author}</Text>
        <Text style={styles.meta}>ID: {photo.id}</Text>
        <Text style={styles.meta}>
          Size: {photo.width} × {photo.height}
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL(photo.pageUrl)}>
          <Text style={styles.link}>Open on Unsplash</Text>
        </TouchableOpacity>
        <CommentPreview ref={this.preview} photoId={photo.id} />
        <TouchableOpacity
          style={styles.commentsButton}
          onPress={() =>
            this.props.navigation.navigate('Comments', { photoId: photo.id })
          }
        >
          <Text style={styles.commentsText}>💬 Update comments</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  image: { width: '100%', borderRadius: 12, backgroundColor: '#eee' },
  author: { fontSize: 22, fontWeight: '700', marginTop: 16, color: '#222' },
  meta: { fontSize: 15, color: '#555', marginTop: 6 },
  link: { fontSize: 16, color: '#4f6df5', marginTop: 16 },
  commentsButton: {
    marginTop: 24,
    backgroundColor: '#4f6df5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  commentsText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
