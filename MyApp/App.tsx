import { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HelloWorldScreen } from './HelloWorldScreen';
import { VegetableListScreen } from './VegetableListScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [screen, setScreen] = useState<'home' | 'vegetables'>('home');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        {screen === 'home' ? (
          <HelloWorldScreen onNavigate={() => setScreen('vegetables')} />
        ) : (
          <VegetableListScreen onBack={() => setScreen('home')} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
