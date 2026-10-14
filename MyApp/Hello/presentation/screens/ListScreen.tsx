import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CardList from '../components/CardList';
import TabBar from '../components/TabBar';
import type { RootStackParamList } from '../navigation';
import { PhotoListViewModel } from '../viewmodels/PhotoListViewModel';
import { ViewModelComponent } from '../components/ViewModelComponent';
import type { ViewModelFactory } from '../ViewModelFactory';

type Props = NativeStackScreenProps<RootStackParamList, 'List'>;

export default class ListScreen extends ViewModelComponent<
  Props,
  PhotoListViewModel
> {
  protected createViewModel(factory: ViewModelFactory): PhotoListViewModel {
    return factory.createPhotoListViewModel();
  }

  private renderHeader(vm: PhotoListViewModel) {
    return (
      <View style={styles.toolbar}>
        <TabBar
          tabs={PhotoListViewModel.tabs.map(t =>
            t.id === 'favorites'
              ? { ...t, label: `Favorites (${vm.favoriteCount})` }
              : t,
          )}
          active={vm.tab}
          onSelect={tab => vm.selectTab(tab)}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by author…"
          value={vm.author}
          onChangeText={text => vm.setAuthor(text)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {!!vm.actionError && <Text style={styles.error}>{vm.actionError}</Text>}
        <Text style={styles.meta}>{vm.visiblePhotos.length} photo(s)</Text>
      </View>
    );
  }

  protected renderContent(vm: PhotoListViewModel) {
    return (
      <CardList
        items={vm.visiblePhotos}
        ListHeaderComponent={this.renderHeader(vm)}
        emptyText={
          vm.tab === 'favorites'
            ? 'No favorites yet. Tap ♡ on a photo to add one.'
            : 'No photos found.'
        }
        isFavorite={id => vm.isFavorite(id)}
        onToggleFavorite={photo => vm.toggleFavorite(photo)}
        onPressItem={item =>
          this.props.navigation.navigate('Detail', { id: item.id })
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  toolbar: { marginBottom: 16 },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  error: { marginTop: 8, color: '#e0245e' },
  meta: { marginTop: 8, color: '#666' },
});
