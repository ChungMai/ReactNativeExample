import { StyleSheet, Text, View } from 'react-native';

export function HelloWorldScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
});
