import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CardList, { type PicsumPhoto } from './components/CardList';

interface AppState {
  items: PicsumPhoto[];
  loading: boolean;
  error: string | null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10
  },
  textStyle: {
    fontSize: 50,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
  },
});

const FEED_URL = 'https://picsum.photos/v2/list?page=1&limit=10';

class App extends React.Component<object, AppState> {
  state: AppState = {
    items: [],
    loading: true,
    error: null,
  };

  async componentDidMount() {
    try {
      const response = await fetch(FEED_URL);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const items = await response.json() as PicsumPhoto[];

      this.setState({
        items,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Cannot load feed',
        loading: false,
      });
    }
  }

  render() {
    const { items, loading, error } = this.state;

    if (loading) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" />
          </View>
        </SafeAreaView>
      );
    }

    if (error) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <CardList items={items} />
        </View>
      </SafeAreaView>
    );
  }
}

export default App;
