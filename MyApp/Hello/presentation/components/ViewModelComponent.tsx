import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { ViewModelFactory } from '../ViewModelFactory';
import { ViewModelFactoryContext } from '../ViewModelFactoryContext';
import type { BaseViewModel } from '../viewmodels/BaseViewModel';

// Template Method pattern: the base class owns the lifecycle, loading and error UI;
// subclasses provide the ViewModel and the content (abstract methods) and may
// override renderLoading()/renderError() to customize the placeholders.
export abstract class ViewModelComponent<P, VM extends BaseViewModel> extends React.Component<P> {
  // The factory comes from React context (dependency injection), not from a global.
  static override contextType = ViewModelFactoryContext;

  protected readonly vm: VM;
  private unsubscribe?: () => void;

  constructor(props: P, context: ViewModelFactory | null) {
    super(props, context);
    if (!context) {
      throw new Error('ViewModelFactoryContext.Provider is missing above this component');
    }
    this.vm = this.createViewModel(context);
  }

  protected abstract createViewModel(factory: ViewModelFactory): VM;
  protected abstract renderContent(vm: VM): React.ReactNode;

  protected renderLoading(): React.ReactNode {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  protected renderError(message: string): React.ReactNode {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{message}</Text>
      </View>
    );
  }

  override componentDidMount(): void {
    this.unsubscribe = this.vm.subscribe(() => this.forceUpdate());
    this.vm.init();
  }

  override componentWillUnmount(): void {
    this.unsubscribe?.();
  }

  override render() {
    if (this.vm.loading) {
      return this.renderLoading();
    }
    if (this.vm.error) {
      return this.renderError(this.vm.error);
    }
    return this.renderContent(this.vm);
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: 'red' },
});
