import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import ProductList from './ProductList';
import Avatar from './components/Avatar';
import AuthorRow from './components/AuthorRow';
import { SafeAreaView } from 'react-native-safe-area-context';

const user = {
  firstName: 'Chung',
  lastName: 'Mai',
};

function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  textStyle: {
    fontSize: 50,
  },
});

class App extends React.Component {
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={{ backgroundColor: 'yellow' }}>
            Hello World
          </Text>
          <ProductList />
          <AuthorRow fullName='Chung Mai' linkText='Comments' onPress={() => Alert.alert('Pressed')} />
        </View>
      </SafeAreaView>
    );
  }
}

export default App;