import React from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ReactTestRenderer, { act, type ReactTestInstance, type ReactTestRenderer as Renderer } from 'react-test-renderer';
import { MemoryKeyValueStorage } from '../../data/storage/MemoryKeyValueStorage';
import { Container } from '../../di/container';
import CommentsScreen from '../../presentation/screens/CommentsScreen';
import DetailScreen from '../../presentation/screens/DetailScreen';
import ListScreen from '../../presentation/screens/ListScreen';
import { ViewModelFactoryContext } from '../../presentation/ViewModelFactoryContext';
import { photoDto } from '../../testing/fixtures';

// End-to-end through every layer: screens → view models → use cases → repositories,
// with only the network (fetch) and the storage faked.
const dtos = [photoDto('1', 'Zoe Adams', 400, 300), photoDto('2', 'Ann Lee', 300, 400), photoDto('3', 'Adam Smith', 500, 250)];

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

const navigation = () =>
  ({ navigate: jest.fn(), addListener: jest.fn(() => jest.fn()) }) as unknown as never;

const flush = () =>
  act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });

const textOf = (node: ReactTestInstance): string =>
  node
    .findAllByType(Text)
    .map(t => [t.props.children].flat(Infinity).join(''))
    .join('|');

const buttons = (r: Renderer, label: string) =>
  r.root.findAllByType(TouchableOpacity).filter(t => textOf(t) === label);

const press = async (r: Renderer, label: string, index = 0) => {
  const target = buttons(r, label)[index];
  if (!target) {
    throw new Error(`No button "${label}". Texts: ${textOf(r.root)}`);
  }
  await act(async () => {
    target.props.onPress();
  });
  await flush();
};

const type = async (r: Renderer, text: string) => {
  await act(async () => {
    r.root.findByType(TextInput).props.onChangeText(text);
  });
};

const mounted: Renderer[] = [];
let storage: MemoryKeyValueStorage;
let factory: Container;

const render = async (screen: React.ReactElement) => {
  let renderer!: Renderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ViewModelFactoryContext.Provider value={factory}>
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 0, left: 0, right: 0, bottom: 0 },
          }}>
          {screen}
        </SafeAreaProvider>
      </ViewModelFactoryContext.Provider>,
    );
  });
  await flush();
  mounted.push(renderer);
  return renderer;
};

beforeEach(() => {
  storage = new MemoryKeyValueStorage();
  factory = new Container(storage);
  globalThis.fetch = jest.fn(async (url: string) => {
    if (url.includes('/v2/list')) {
      return ok(dtos);
    }
    const id = /\/id\/(\w+)\/info/.exec(url)?.[1];
    return ok(dtos.find(d => d.id === id));
  }) as unknown as typeof fetch;
});

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach(r => r.unmount());
  });
});

describe('ListScreen', () => {
  test('loads photos, switches between the All and Favorites tabs, and navigates', async () => {
    const nav = navigation();
    const r = await render(<ListScreen navigation={nav} route={{ key: 'k', name: 'List' } as never} />);
    expect(textOf(r.root)).toContain('All|Favorites (0)');
    expect(textOf(r.root)).toContain('3 photo(s)');

    await press(r, 'Favorites (0)');
    expect(textOf(r.root)).toContain('No favorites yet');

    await press(r, 'All');
    await press(r, '♡', 1); // favorite the second photo (Ann Lee)
    expect(textOf(r.root)).toContain('Favorites (1)');
    expect(await storage.getItem('favorites')).toContain('"id":"2"');

    await press(r, 'Favorites (1)');
    expect(textOf(r.root)).toContain('1 photo(s)');
    expect(textOf(r.root)).toContain('Ann Lee');
    expect(textOf(r.root)).not.toContain('Zoe Adams');

    await press(r, 'Detail');
    expect((nav as { navigate: jest.Mock }).navigate).toHaveBeenCalledWith('Detail', { id: '2' });
  });

  test('favorites saved earlier are still there on a new screen', async () => {
    const first = await render(<ListScreen navigation={navigation()} route={{ key: 'k', name: 'List' } as never} />);
    await press(first, '♡', 0);

    const second = await render(<ListScreen navigation={navigation()} route={{ key: 'k', name: 'List' } as never} />);
    expect(textOf(second.root)).toContain('Favorites (1)');
  });

  test('shows the error when loading fails and there is no cache', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;
    const r = await render(<ListScreen navigation={navigation()} route={{ key: 'k', name: 'List' } as never} />);
    expect(textOf(r.root)).toContain('Cannot reach the server');
  });

  test('works offline from the saved cache', async () => {
    await render(<ListScreen navigation={navigation()} route={{ key: 'k', name: 'List' } as never} />);
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;
    const r = await render(<ListScreen navigation={navigation()} route={{ key: 'k', name: 'List' } as never} />);
    expect(textOf(r.root)).toContain('3 photo(s)');
  });
});

describe('DetailScreen', () => {
  test('shows the photo, its comments, and opens the comments screen', async () => {
    const nav = navigation();
    const r = await render(
      <DetailScreen navigation={nav} route={{ key: 'k', name: 'Detail', params: { id: '2' } } as never} />,
    );
    const text = textOf(r.root);
    expect(text).toContain('Ann Lee');
    expect(text).toContain('Size: 300 × 400');
    expect(text).toContain('Comments (0)');

    await press(r, '💬 Update comments');
    expect((nav as { navigate: jest.Mock }).navigate).toHaveBeenCalledWith('Comments', { photoId: '2' });
    expect((nav as { addListener: jest.Mock }).addListener).toHaveBeenCalledWith('focus', expect.any(Function));
  });
});

describe('CommentsScreen', () => {
  const screen = () => (
    <CommentsScreen navigation={navigation()} route={{ key: 'k', name: 'Comments', params: { photoId: '2' } } as never} />
  );

  test('post, edit and delete a comment, persisted to storage', async () => {
    const r = await render(screen());
    expect(textOf(r.root)).toContain('No comments yet');

    await type(r, 'Great photo');
    await press(r, 'Post');
    expect(textOf(r.root)).toContain('Great photo');
    expect(await storage.getItem('comments')).toContain('Great photo');

    await press(r, 'Edit');
    expect(textOf(r.root)).toContain('Editing comment');
    await type(r, 'Great photo!');
    await press(r, 'Save');
    expect(textOf(r.root)).toContain('Great photo!');
    expect(textOf(r.root)).toContain('edited');

    await press(r, 'Delete');
    expect(textOf(r.root)).toContain('No comments yet');
  });

  test('shows validation errors and keeps the draft', async () => {
    const r = await render(screen());
    await type(r, 'this is spam');
    await press(r, 'Post');
    expect(textOf(r.root)).toContain('banned word');
    expect(r.root.findByType(TextInput).props.value).toBe('this is spam');
  });

  test('comments saved earlier are loaded on a new screen', async () => {
    const first = await render(screen());
    await type(first, 'remember me');
    await press(first, 'Post');

    const second = await render(screen());
    expect(textOf(second.root)).toContain('remember me');
  });
});
