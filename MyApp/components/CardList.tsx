import { Alert, FlatList, ListRenderItemInfo } from 'react-native';
import React from 'react';
import Card from './Card';

export interface PicsumPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

interface CardListProps {
  items: PicsumPhoto[];
}

const keyExtractor = ({ id }: PicsumPhoto) => id;

export default class CardList extends React.Component<CardListProps> {
    renderItem = ({ item: { author, download_url, width, height } }: ListRenderItemInfo<PicsumPhoto>) => (
        <Card
            authorProps={{
                fullName: author,
                linkText: 'Comments',
                onPressLinkText: () => Alert.alert('Pressed'),
            }}
            image={{ uri: download_url }}
            imageAspectRatio={width / height}
        />
    );

    render() {
        const { items } = this.props;

        return (
            <FlatList
                data={items}
                keyExtractor={keyExtractor}
                renderItem={this.renderItem}
            />
        );
    }
}
