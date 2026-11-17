# Hooks in React Native

Written version of the 20-slide deck "React Native Hooks", with the source code in `sourcecode.zip`.

## Contents

1. [What is a hook?](#1-what-is-a-hook)
2. [Why hooks instead of classes?](#2-why-hooks-instead-of-classes)
3. [The two rules of hooks](#3-the-two-rules-of-hooks)
4. [useState](#4-usestate-remember-a-value)
5. [State lists: add and remove](#5-state-lists-add-and-remove)
6. [useEffect](#6-useeffect-run-side-effects)
7. [Cleanup](#7-clean-up-what-you-start)
8. [useRef](#8-useref-a-box-that-survives-renders)
9. [useMemo](#9-usememo-cache-a-calculation)
10. [useCallback](#10-usecallback-keep-a-function-stable)
11. [useReducer](#11-usereducer-many-actions-one-place)
12. [useContext](#12-usecontext-share-without-prop-drilling)
13. [Custom hooks](#13-custom-hooks-reuse-your-logic)
14. [useDebounce](#14-custom-hook-usedebounce)
15. [useFetch](#15-custom-hook-usefetch)
16. [Hooks built into React Native and Expo](#16-hooks-built-into-react-native-and-expo)
17. [Screen focus and app state](#17-screen-focus-and-app-state)
18. [Common pitfalls](#18-common-pitfalls)
19. [Cheat sheet](#19-hooks-cheat-sheet)

## Run the source code

1. Unzip `sourcecode.zip` into the root of your Expo project. It keeps the original paths:
   - `src/features/hooks-demo/` (hooks, examples, demo screen)
   - `app/hooks-demo.tsx` (route)
2. Register the route in `app/_layout.tsx`:

   ```tsx
   <Stack.Screen name="hooks-demo" options={{ title: 'Hooks Demo' }} />
   ```

3. Start the app and open the screen with `router.push('/hooks-demo')`.

```bash
npx expo start
npx tsc --noEmit   # type check
```

## 1. What is a hook?

Hooks arrived in React 16.8. They let plain functions use React features that used to need classes.

- A hook is a function whose name starts with `use`.
- A function component runs on every render. Hooks keep state between those runs.
- Hooks give access to state, lifecycle, context and refs without a class.

## 2. Why hooks instead of classes?

| Need | Class component | Hooks |
|---|---|---|
| State | `this.state`, `this.setState` | `useState`, `useReducer` |
| Lifecycle | `componentDidMount`, `DidUpdate`, `WillUnmount` | `useEffect` |
| Reuse logic | Higher-order components, render props | Custom hooks |
| Boilerplate | constructor, binding `this` | Plain functions |

Related logic stays together in one place instead of being split across lifecycle methods.

## 3. The two rules of hooks

1. Call hooks at the top level. Never inside loops, conditions or nested functions. The order of calls must be identical on every render.
2. Call hooks only from React functions: function components or other custom hooks.

Why? React identifies each hook by its position in the call order, so a skipped hook shifts every hook after it.

## 4. useState: remember a value

- Returns a pair: the current value and a setter.
- Calling the setter re-renders the component.
- Use the functional form when the new value depends on the old one.

```tsx
const [count, setCount] = useState(0)

// Functional update: always the latest value
setCount(c => c + 1)
setCount(c => c + 1) // total +2

// Objects: copy, never mutate
const [profile, setProfile] = useState<Profile>({ name: 'An', age: 20 })
setProfile(p => ({ ...p, age: p.age + 1 }))
```

File: `examples/use-state-example.tsx`

## 5. State lists: add and remove

State is immutable. Create a new array instead of changing the old one: add with spread, remove with `filter`, update with `map`.

```tsx
const [groups, setGroups] = useState<GroupInfo[]>([])

// Add
setGroups(prev => [...prev, { id: Date.now().toString(), name }])

// Remove
setGroups(prev => prev.filter(g => g.id !== id))

// Update one item
setGroups(prev => prev.map(g => (g.id === id ? { ...g, name } : g)))
```

Real example in this project: `src/features/groups/presentation/hooks/use-groups-screen.ts`.

## 6. useEffect: run side effects

- Runs after the screen has rendered.
- The dependency array decides when it runs again.
- Use it for fetching, subscriptions, timers and logging.

```tsx
useEffect(() => { console.log('mounted') }, [])      // once, after first render
useEffect(() => { loadUser(userId) }, [userId])      // when userId changes
useEffect(() => { console.log('rendered') })         // after every render
```

File: `examples/use-effect-example.tsx`

## 7. Clean up what you start

Return a function from the effect to clean up. It runs before the next effect and when the component unmounts. Skipping it leaks timers, listeners and network requests.

```tsx
useEffect(() => {
  const id = setInterval(() => setSeconds(s => s + 1), 1000)
  return () => clearInterval(id)
}, [])

useEffect(() => {
  const sub = AppState.addEventListener('change', setStatus)
  return () => sub.remove()
}, [])
```

## 8. useRef: a box that survives renders

- Holds a mutable value in `.current`.
- Changing `.current` does not trigger a re-render.
- Use it for native elements, timers and the previous value.

```tsx
const inputRef = useRef<TextInput>(null)
inputRef.current?.focus()

const renders = useRef(0)
renders.current += 1
```

Files: `examples/use-ref-example.tsx`, `hooks/use-previous.ts`

## 9. useMemo: cache a calculation

- Stores the result of an expensive calculation.
- Recomputes only when a dependency changes.
- It is an optimization. Measure before adding it.

```tsx
const filtered = useMemo(
  () => PEOPLE.filter(p => p.toLowerCase().includes(query.toLowerCase())),
  [query],
)
```

File: `examples/use-memo-example.tsx`

## 10. useCallback: keep a function stable

- Returns the same function between renders.
- Pairs with `memo()` and FlatList items. Without `memo()` on the child it gives no benefit.

```tsx
const Row = memo(function Row({ id, onRemove }) { /* ... */ })

const remove = useCallback(
  (id: number) => setIds(list => list.filter(x => x !== id)),
  [],
)
```

File: `examples/use-callback-example.tsx`

## 11. useReducer: many actions, one place

A reducer takes the old state and an action and returns the new state. Good when state has several related fields or many update types. It is a pure function, so it is easy to test.

```tsx
type Action =
  | { type: 'add'; title: string }
  | { type: 'toggle'; id: number }

function reducer(state: Todo[], action: Action) { /* switch on action.type */ }

const [todos, dispatch] = useReducer(reducer, [])
dispatch({ type: 'toggle', id })
```

File: `examples/use-reducer-example.tsx`

## 12. useContext: share without prop drilling

- Reads a value from the nearest Provider above.
- Every consumer re-renders when the value changes.
- Wrap it in a custom hook to hide the details.

```tsx
const ThemeContext = createContext<ThemeValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme needs a ThemeProvider')
  return ctx
}
```

File: `examples/use-context-example.tsx`

## 13. Custom hooks: reuse your logic

A function whose name starts with `use` and that calls other hooks. Each component that calls it gets its own independent state.

```tsx
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle] as const
}
```

File: `hooks/use-toggle.ts`

## 14. Custom hook: useDebounce

Waits until the value stops changing before it updates. Perfect for search boxes.

```tsx
export function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
```

File: `hooks/use-debounce.ts`

## 15. Custom hook: useFetch

Wraps loading, data and error state in one call. `AbortController` cancels the request on unmount or when the url changes.

```tsx
const { data, loading, error } = useFetch<User[]>(url)
```

File: `hooks/use-fetch.ts`

## 16. Hooks built into React Native and Expo

| Hook | Returns | Use it for |
|---|---|---|
| `useWindowDimensions` | width, height | Responsive layout, rotation |
| `useColorScheme` | `'light'` or `'dark'` | Dark mode |
| `useRouter` | router object | Navigate, go back |
| `useLocalSearchParams` | route params | Read the id of a detail screen |
| `useFocusEffect` | nothing | Run code on every screen focus |

`useRouter`, `useLocalSearchParams` and `useFocusEffect` come from `expo-router`.

## 17. Screen focus and app state

```tsx
const { width, height } = useWindowDimensions()
const scheme = useColorScheme()
const appState = useAppState() // custom hook around AppState

useFocusEffect(
  useCallback(() => {
    console.log('screen focused')
    return () => console.log('blurred')
  }, []),
)
```

Files: `examples/native-hooks-example.tsx`, `hooks/use-app-state.ts`

## 18. Common pitfalls

| Pitfall | Fix |
|---|---|
| Stale closures: a callback keeps the value from the render that created it | `setCount(c => c + 1)` |
| Missing dependencies: an effect reads a value but does not list it | Enable `react-hooks/exhaustive-deps` |
| Infinite loops: setting state in an effect that depends on that state | Check the dependency array |
| Mutating state: `list.push(x)` keeps the same reference | `setList(l => [...l, x])` |

## 19. Hooks cheat sheet

| Hook | Use it to |
|---|---|
| `useState` | Keep a value that changes the screen |
| `useEffect` | Run side effects and clean them up |
| `useRef` | Hold a value or element without re-rendering |
| `useMemo`, `useCallback` | Skip repeated work and keep functions stable |
| `useReducer` | Manage state with many kinds of updates |
| `useContext` | Share data without passing props |
| Custom hooks | Reuse logic and keep screens small |
