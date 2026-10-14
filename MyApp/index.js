/**
 * @format
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './Hello/App';
import { Container } from './Hello/di/container';
import { AsyncStorageAdapter } from './Hello/data/storage/AsyncStorageAdapter';
import { name as appName } from './app.json';

// Composition root: choose the concrete storage and build the object graph once.
const container = new Container(new AsyncStorageAdapter());

class Root extends React.Component {
  render() {
    return (
      <SafeAreaProvider>
        <App factory={container} />
      </SafeAreaProvider>
    );
  }
}

AppRegistry.registerComponent(appName, () => Root);
