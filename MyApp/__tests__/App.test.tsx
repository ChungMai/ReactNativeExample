/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from '../Hello/App';
import { MemoryKeyValueStorage } from '../Hello/data/storage/MemoryKeyValueStorage';
import { Container } from '../Hello/di/container';

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    }),
  ) as unknown as typeof fetch;
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}>
        <App factory={new Container(new MemoryKeyValueStorage())} />
      </SafeAreaProvider>,
    );
  });
});
