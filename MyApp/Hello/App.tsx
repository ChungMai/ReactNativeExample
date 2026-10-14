import React from 'react';
import Navigation from './presentation/navigation';
import type { ViewModelFactory } from './presentation/ViewModelFactory';
import { ViewModelFactoryContext } from './presentation/ViewModelFactoryContext';

interface AppProps {
  factory: ViewModelFactory;
}

export default class App extends React.Component<AppProps> {
  override render() {
    return (
      <ViewModelFactoryContext.Provider value={this.props.factory}>
        <Navigation />
      </ViewModelFactoryContext.Provider>
    );
  }
}
