import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import Card from './Card';
import type { Photo } from '../../domain/entities/Photo';

interface CardListProps {
  items: Photo[];
  onPressItem: (item: Photo) => void;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (item: Photo) => void;
  ListHeaderComponent?: React.ReactElement;
  emptyText?: string;
}

const keyExtractor = ({ id }: Photo) => id;

const Separator = () => <View style={styles.separator} />;

export default class CardList extends React.Component<CardListProps> {
  renderItem = ({ item }: ListRenderItemInfo<Photo>) => {
    const { author, downloadUrl } = item;
    const { onPressItem, isFavorite, onToggleFavorite } = this.props;
    return (
      <Card
        authorProps={{
          fullName: author,
          linkText: 'Detail',
          onPressLinkText: () => onPressItem(item),
          isFavorite: isFavorite?.(item.id),
          onToggleFavorite: onToggleFavorite && (() => onToggleFavorite(item)),
        }}
        image={{ uri: downloadUrl }}
        imageAspectRatio={item.aspectRatio}
        onPress={() => onPressItem(item)}
      />
    );
  };

  override render() {
    const { items, ListHeaderComponent, emptyText } = this.props;

    return (
      <FlatList
        data={items}
        extraData={this.props.isFavorite}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          emptyText ? <Text style={styles.empty}>{emptyText}</Text> : null
        }
        keyExtractor={keyExtractor}
        renderItem={this.renderItem}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.content}
      />
    );
  }
}

const styles = StyleSheet.create({
  content: { padding: 12 },
  separator: { height: 16 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});
