# React Native Hooks Demo

Runnable examples for the "Hooks in React Native" slide deck.
Every code sample on the slides is a real file in this folder.

## Run it

```bash
npm install
npx expo start
```

Then open the demo screen in the simulator, Expo Go, or the web:

- Deep link: `exp://<your-host>/--/hooks-demo`
- Or navigate in code: `router.push('/hooks-demo')`

The route is defined in `app/hooks-demo.tsx` and renders `HooksDemoScreen`.

## Folder structure

```
hooks-demo/
├── hooks/                       Reusable custom hooks
│   ├── use-toggle.ts            Boolean state with a stable toggle
│   ├── use-debounce.ts          Delay a fast-changing value
│   ├── use-fetch.ts             Load JSON with loading/error state and abort
│   ├── use-previous.ts          Value from the previous render
│   └── use-app-state.ts         Track active / background state
├── examples/                    One screen section per built-in hook
│   ├── use-state-example.tsx
│   ├── use-effect-example.tsx
│   ├── use-ref-example.tsx
│   ├── use-memo-example.tsx
│   ├── use-callback-example.tsx
│   ├── use-reducer-example.tsx
│   ├── use-context-example.tsx
│   └── native-hooks-example.tsx useWindowDimensions, useColorScheme, expo-router hooks
├── hooks-demo-screen.tsx        Shows every example in one ScrollView
└── index.ts                     Public API of the feature
```

## Hooks covered

| Hook | File | Idea |
|---|---|---|
| `useState` | `examples/use-state-example.tsx` | Keep a value; use functional updates |
| `useEffect` | `examples/use-effect-example.tsx` | Side effects, dependency array, cleanup |
| `useRef` | `examples/use-ref-example.tsx` | Focus an input, count renders, keep the previous value |
| `useMemo` | `examples/use-memo-example.tsx` | Cache an expensive filter |
| `useCallback` | `examples/use-callback-example.tsx` | Stable function for `memo()` children |
| `useReducer` | `examples/use-reducer-example.tsx` | Typed actions in one reducer |
| `useContext` | `examples/use-context-example.tsx` | Theme without prop drilling |
| Custom hooks | `hooks/*.ts` | Reuse logic across screens |
| React Native / Expo Router | `examples/native-hooks-example.tsx` | Dimensions, color scheme, focus, navigation |

## Using the custom hooks

```tsx
import { useToggle, useDebounce, useFetch } from '../src/features/hooks-demo'

const [open, toggleOpen] = useToggle()

const [text, setText] = useState('')
const search = useDebounce(text, 400)

const { data, loading, error } = useFetch<User[]>('https://example.com/users')
```

## The two rules of hooks

1. Call hooks at the top level. Never inside loops, conditions or nested functions.
2. Call hooks only from function components or other custom hooks.

## Related code in this project

- `src/features/auth/presentation/shared/hooks/use-login-screen.ts`: a custom hook that keeps screen logic out of the UI.

## Check the types

```bash
npx tsc --noEmit
```
