# Smart Rooms — React Native Demo

A three-screen React Native demo inspired by a smart-home "Rooms" feature: a **room list**, a **room detail** screen and a **New Room** form. It was built to show what was learned in week 1 of moving from Swift to React Native: TypeScript, React hooks, React Native UI and Expo Router navigation.

Built with **Expo SDK 58 · React Native 0.88 · React 19.3 · Expo Router 58 · TypeScript (strict)**. All images are bundled, so the demo runs offline.

## Quick Start

> **Use Node 24 LTS** (or 22.13+). Node 25 is not supported by Expo SDK 58 / React Native 0.88 and prints `EBADENGINE` warnings.

```bash
cd smart-rooms
npm install
npx expo start        # press i for iOS Simulator, w for web, or scan the QR code with Expo Go
npm run typecheck     # 0 errors (run `npx expo start` once first: it generates the typed-route types in .expo/types)
npm test              # 194 unit tests (Jest + React Native Testing Library)
npm run lint          # ESLint: Expo rules + architecture boundaries
```

Don't run `npm audit fix --force` — it moves packages outside the versions Expo SDK 58 expects.

## The Three Screens

| Screen | Route | What it does |
|---|---|---|
| **1. Rooms** (list) | `/rooms` | Custom header with Search and Add buttons, sort direction + "Alphabetical / Recently added" dropdown, 2-column grid of room cards with an On/Off badge |
| **2. Room detail** | `/room/[id]` | Header title + "⋮" menu (Delete room), cover image, Manage / Devices / Presets segmented control, room power switch, Add to Favourites |
| **3. New Room** | `/room/new` | Header Save button (disabled until a name is entered), camera button to change the cover, room name, "Add Device" tile with a device picker |

The other tabs are small extras: **Home** is described below, **Devices** lists every device with a switch, **Groups** keeps a small list in `useState`, and **More** is a menu whose entry **React hooks demo** opens `src/features/hooks-demo`: runnable examples of `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useReducer`, `useContext`, custom hooks and the React Native hooks (its own README explains each one).

## Login

The app opens on a login screen, a port of the Swift `LoginViewController` and `LoginViewPresenter`. Demo account: `demo@example.com` / `demo1234` (also shown on the screen). **More → Log out** brings you back.

Ported: the field checks and their messages, show/hide password, "Keep me signed in" (the session lasts 30 days instead of 1), the remembered email, loading and error states. Routes are guarded with `Stack.Protected` in `app/_layout.tsx`: list every new route file there.

**Real sign-in (AWS Cognito).** Copy `.env.example` to `.env.local`, set `EXPO_PUBLIC_AUTH_SERVER_URL` and restart `npx expo start`. Each environment of the real system has its own user pool, so use the server your account belongs to. The app asks that server for the user pool (as the Swift app does) and signs in with SRP (`amazon-cognito-identity-js`), like the Swift app. `metro.config.js` gives that library a secure random source on iOS and Android. Its arithmetic runs in JavaScript, so signing in takes about 10 seconds in the simulator. Tokens and passwords are not stored. Without the variable, only the demo account works. `.env.local` is git-ignored: do not commit server addresses or accounts.

Not ported: biometric login, registration, forgot password, email verification, Keycloak servers and the terms pages. The session survives a restart: `expo-secure-store` (Keychain / Keystore) on iOS and Android, `localStorage` on web (only the email and sign-in time; a real token would need an HttpOnly cookie). An expired session is dropped at launch. The password is never stored.

**Choose another server?** on the login screen ports the Swift `SelectServerViewController`: Default Server, servers used before (removable) or a custom address. A server is only selected after it returned a sign-in configuration; the choice is remembered. Only `https` and Cognito servers are supported. `Default Server` is `EXPO_PUBLIC_AUTH_SERVER_URL`, or the demo account when that is not set.

## Network list

After login comes the list of networks, a port of the Swift `PSLNetworkListViewController` and `PSLNetworkListViewModel`; choosing one opens Home, and the network name on Home leads back. The demo has one joined network for each outcome: **My Home** (local) and **Beach House** (remote) open, **Office** refuses remote access, **Garage** cannot be reached. Two nearby networks show the join request and the "other server" message.

Ported: joined and nearby lists with access mode, join request, delete (type the name) and leave with the same rules, 15-second polling, offline list. Swipe actions are a **⋮** button here, and the profile button is **Log out**. Not ported: creating a network, troubleshooting, local network discovery, server selection. The chosen network is not saved, so after a restart you choose again. Every network shows the same demo devices on Home.

## Home

A port of the Home page of the Swift app (`HomeMainViewController` and its presenter): network name with access mode and server status, "+" and "more" menus, the "switched on" summary, and favourite scenes, devices, rooms, groups, zones and presets. A tap switches or triggers an object, a long press (web and iPad: the arrow button) opens its page. It reloads every 10 seconds while on screen, supports pull to refresh, shows cached data as "Offline" when a refresh fails, and honours the customisation data (default or grid layout, section order, titles, hidden sections).

| Swift | Here (`src/features/home`) |
|---|---|
| `HomeInfo`, `PSLHomeCustomizationData` | `domain/entities`, `data/dto`, `data/mappers` |
| `makeActiveAccessoriesInfo`, `sortItem` | `domain/build-home-overview.ts` |
| `doQuickAction`, `handleFavorites`, `loadInitalData` | `domain/use-cases` |
| `HomeMainCachedHelper` | `data/cached-home-repository.ts` (in memory) |
| `HomeMainViewPresenter` | `presentation/shared/hooks/use-home-screen.ts` |

Not ported: quick-control panels, Add Device / Add Hub / Create Zone, network list, the "Personalise your home screen" editor, background images, the shrinking header on scroll. The hub is a stub (`FakeHomeApi`); to see the offline state, build it with an `AppError` in `di/container.ts`.

## Suggested Demo Flow (about 4 minutes)

Sign in with the demo account first (the app stays signed in; **More → Log out** to start over) and choose **My Home**.

1. **Rooms list** — show sorting (arrow button, then *Recently added*) and search (🔍, type "virt").
2. Open **Virtual Room** — flip the **Switch**: the label changes to *Switch On*.
3. Tap **Add to Favourites** — the heart fills in; go to the **Home** tab to see the room there, among the other favourites.
4. Back on **Rooms** — the badge on Virtual Room now says **On**. Point out that power is *derived* from devices, never stored.
5. Tap **＋** — type "Kitchen", tap the camera to change the cover, add a device, **Save**. The new room appears in the grid.
6. Open **Kitchen** → **⋮** → **Delete room**.

The state lives in memory, so reloading the app resets it — every demo starts from the same three rooms.

## Live Coding Script: Add a New Sort Option (~3 minutes)

Goal: show how TypeScript guides a change, just like an exhaustive `switch` over an enum in Swift. Rehearsed — the compiler errors below are exactly what you will see.

**Step 1 — add the new case to the type** (`src/features/rooms/domain/room-sorting.ts`)

```ts
export type SortKey = 'alphabetical' | 'recent' | 'devices'
```

Run `npm run typecheck` (or look at the editor). Two errors appear:

```
src/features/rooms/domain/room-sorting.ts: Argument of type '"devices"' is not assignable to parameter of type 'never'.
src/features/rooms/presentation/components/sort-labels.ts: Property 'devices' is missing in type '{ alphabetical: string; recent: string; }'
              but required in type 'Record<SortKey, string>'.
```

> Say: *"`Record<SortKey, string>` forces a label for every key, and `assertNever` forces the switch to handle every case — like a Swift `switch` on an enum."*

**Step 2 — add the label** (`src/features/rooms/presentation/components/sort-labels.ts`)

```ts
export const SORT_LABELS: Record<SortKey, string> = {
  alphabetical: 'Alphabetical',
  recent: 'Recently added',
  devices: 'Device count',
}
```

One error left, in `room-sorting.ts`.

**Step 3 — handle the case** (`src/features/rooms/domain/room-sorting.ts`)

```ts
case 'devices': return b.deviceIds.length - a.deviceIds.length
```

0 errors. Save — the app reloads, and **Device count** appears in the dropdown automatically, because the menu is built from `SORT_LABELS`.

**Safety net:** commit the finished version on a separate git branch (`git switch -c live-done`) and keep a short screen recording, in case anything goes wrong on stage.

## Architecture

The app follows **Clean Architecture**, organised **by feature**. Each feature has three layers, and dependencies only point inwards:

```
presentation  ──►  domain  ◄──  data
 (screens,         (entities,    (DTOs, mappers,
  hooks, UI)        use cases,    API / DB sources,
                    repository    repository
                    interfaces)   implementation)
```

- **domain** knows nothing about React, Expo, DTOs or the UI.
- **data** implements the repository interfaces from domain.
- **presentation** calls use cases and never touches data directly.
- Three models per concept: **entity** (domain) → **DTO** (data) → **Display** (presentation), joined by mappers.
- `src/di/container.ts` is the only place that creates concrete classes and wires them together.
- Each feature has a **public API**, `src/features/<name>/index.ts`. Other features and `app/` import only from there; ESLint (`eslint.config.js`) rejects deep imports, domain → data/presentation imports, and React / React Native / Expo Router inside domain and data. `src/di` and `tests/` are exempt.

### One app, three UIs (iPhone, iPad + Mac, web)

The same domain, data and view models drive three different user interfaces:

| Device | Navigation | Layout |
|---|---|---|
| **iPhone** (and iPad in a narrow Split View) | bottom tab bar | 2-column grid, native headers |
| **iPad and Mac** (a Mac runs the iPad app: "Designed for iPad") | left menu (sidebar) | page header, search field, grid that fills the window, grouped lists |
| **Web** | left menu, shrinks to icons below 768px | page header, search box, "New room" button, tables |

Nothing below the UI knows which one is running — that is the point of the layering.

Inside every feature, `presentation/` is split into four folders, so the folder name tells you who uses a file:

```
rooms/presentation/
├── shared/     used by EVERY device: hooks (view models), models, mappers, assets,
│               and UI that is identical everywhere (sort-bar, room-detail-screen, new-room-screen)
├── mobile/     iPhone:               screens/rooms-screen.tsx, components/room-card.tsx
├── desktop/     iPad + Mac:           screens/rooms-screen.tsx, components/room-card.tsx
├── web/        browser:              screens/rooms-screen.tsx, components/room-card.tsx
├── index.native.ts   ← iOS + Android: picks mobile/ or desktop/ by window size, plus shared/
└── index.web.ts      ← web:           picks web/ plus shared/
```

```
 mobile/rooms-screen.tsx ─┐                                         ┌─ use cases → repositories → data
 desktop/rooms-screen.tsx ─┼→ shared/use-rooms-screen (view model) ──┤
 web/rooms-screen.tsx    ─┘                                         └─ (domain/ and data/ never see the UI)
```

| Folder | Contains | May import |
|---|---|---|
| `shared/` | view models, models, mappers, UI used on every device | `domain/`, other `shared/` files — **not** `mobile/`, `desktop/` or `web/` |
| `mobile/` | iPhone UI | `shared/` — **not** `desktop/` or `web/` |
| `desktop/` | iPad and Mac UI | `shared/` — **not** `mobile/` or `web/` |
| `web/` | browser UI | `shared/` — **not** `mobile/` or `desktop/` |

These rules are enforced by ESLint (`npm run lint`): a `web/` file that imports from `desktop/` is a lint error.

**How the right folder is picked.** Two decisions, both in one small file per feature:

1. *Platform* (web or native): Metro loads `index.web.ts` on web and `index.native.ts` on iOS and Android. The feature's public `index.ts` just says `export { RoomsScreen } from './presentation'`, so the routes in `app/` and the Home feature stay platform-neutral.
2. *Window size* (iPhone or iPad/Mac), live: `index.native.ts` uses `adaptive(MobileRoomsScreen, DesktopRoomsScreen)`. It looks at the window width (`src/shared/hooks/use-size-class.ts`): below 768 points is **compact** (iPhone, iPad in a narrow Split View), 768 and above is **regular** (iPad full screen, a Mac window). Deciding by width instead of "is this an iPad?" means the UI switches while you resize a Mac window or open Split View.

**Running on a Mac.** On an Apple Silicon Mac the app runs as an iPad app ("Designed for iPad"), so the Mac gets the `desktop/` UI with no extra code. `app.json` has `ios.supportsTablet: true` (required), lets the iPad rotate freely while phones stay portrait, and sets `bundleIdentifier` and `appleTeamId` (change both to your own).

```bash
npx expo prebuild --platform ios      # creates the ios/ project (generated, git-ignored; needs Xcode and CocoaPods)
open ios/SmartRooms.xcworkspace       # in Xcode: destination "My Mac (Designed for iPad)", then Run
```

Notes from the first run: Xcode must be allowed to register the Mac in your developer account (a development profile lists the device; Xcode does this when you press Run with automatic signing). Expo Go does not run on a Mac. The Run action uses the **Release** configuration, so the JavaScript is embedded in the app and no Metro server is needed (a Debug build would load JavaScript from `localhost:8081`). For a Mac app that is not an iPad app you would need a separate native target (`react-native-macos`), or to wrap the web build in Electron; the `web/` UI already exists for that.

The navigation shell uses the same folders: `src/shared/navigation/shared/` has `nav-items.ts` (the one list of destinations), the `sidebar` and the `sidebar-shell` (used by iPad, Mac and web); `mobile/` has the bottom tabs. Layout helpers for wide windows live in `src/shared/components/` (`page-header`, `card-grid`, `readable-width`) and `src/shared/layout.ts`.

What changes per device: the desktop and web Rooms pages have an always-visible search field (iPhone toggles it from a header icon), cards fill a responsive grid, Devices and Groups are grouped lists (desktop) or tables (web). What does not change: every screen's behaviour, because it all lives in the view model. The tests show it: `mobile/`, `desktop/` and `web/` each have a `rooms-screen.test.tsx` that runs against the same view model.

To add a new destination, add one entry to `src/shared/navigation/shared/nav-items.ts` and a file in `app/(tabs)/`: every menu picks it up. To give a screen its own desktop or web UI, create `desktop/screens/<name>.tsx` (or `web/...`) and point the entry file at it. Room detail and New Room are still in `shared/screens/` (one UI everywhere, centred and capped at 720 points wide on big screens).

### Errors, loading and empty states

- `shared/domain/app-error.ts`: `AppError` (`network` / `timeout` / `unknown`), `toAppError()` wraps anything that was thrown, `userMessage()` gives text that is safe to show.
- `LoadRoomsUseCase` / `LoadDevicesUseCase` call `repository.refresh()` once per session and throw an `AppError`; `execute(true)` forces a retry.
- `shared/hooks/use-load-on-mount.ts` runs the load in a `useEffect` and exposes `loading | success | error` + `retry()`. Its cleanup ignores a result that arrives after unmount or after a retry.
- `shared/components/state-views.tsx`: `LoadingView` and `ErrorView` (Retry button). Rooms and Devices show them; empty lists have their own message.
- To see the error state: build `FakeRoomApi` / `FakeDeviceApi` in `di/container.ts` with `new AppError('network', 'offline')`.

### Typed routes

`app.json` enables `experiments.typedRoutes`. `src/shared/routes.ts` holds the route contracts (`routes.room(id)`, `routes.newRoom`), so a wrong path or a missing `id` is a compile error.

## React Mental Model: How This App Renders

**A component is a function of its props and state.** React calls it to get the UI, and calls it again whenever its state changes. A render must not mutate anything: it only reads and returns UI. That is why every update in this app creates a *new* object or array instead of editing the old one (`{ ...devices, [id]: { ...d, on: !d.on } }`): React and `useSyncExternalStore` detect a change by comparing references.

### Render cycle 1 — opening the Rooms tab (`useRoomsScreen`)

| # | What happens | Why |
|---|---|---|
| 1 | **Render** with `status: 'loading'` → `LoadingView` | `useLoadOnMount` starts in the loading state |
| 2 | React **commits** to the screen, *then* runs the effect | Effects run after the UI is on screen, never during render |
| 3 | The effect calls `loadRooms.execute()` | Dependencies `[load, attempt]` did not change, so it runs once |
| 4 | The promise resolves → `setState({ status: 'success' })` → **render** | The list appears. The screen also re-renders when the repository data changes |
| 5 | If the screen unmounts first, **cleanup** sets `cancelled = true` | A late result no longer touches state (no update on an unmounted component) |
| 6 | **Retry** changes `attempt` → cleanup of the old effect, then the effect runs again | The previous attempt's late result is ignored, only the newest one counts |

### Render cycle 2 — typing in the search box

`setQuery('virt')` re-renders immediately with the new `query`, so the text input stays responsive. The list uses `useDeferredValue(query)`: React first renders with the *old* deferred value (cheap), then renders again in the background with the new one. `useMemo` recomputes the filtered and sorted cards **only** when `rooms`, `devices`, the deferred query, the sort key or the direction changed; otherwise it returns the same array.

### Render cycle 3 — a device is switched somewhere else

`toggleDevice` → `repository.save()` → listeners run → every `useSyncExternalStore` subscriber compares the new snapshot with the old one **by reference**. Only the screens that read devices re-render, and `RoomCard` is wrapped in `memo`, so cards whose props did not change are skipped. Rooms, Home and Room detail all update from the same change without any manual refresh.

### Effects, dependencies and cleanup in the code

| Effect | Dependencies | Cleanup |
|---|---|---|
| `useLoadOnMount` (`shared/hooks/use-load-on-mount.ts`) | `[load, attempt]` | `cancelled = true`, so a stale or late result is ignored |
| `useSyncExternalStore` subscription (rooms, devices, detail, home, new room) | `subscribe` function | Unsubscribes the listener when the component unmounts |

### Two bugs this model explains (both have regression tests)

- **Unstable snapshot → infinite render.** If `repository.getAll()` returned a *new* array on every call, `useSyncExternalStore` would see a "change" after every render and loop forever. `CachedRoomRepository` caches the mapped result per source (`tests/features/rooms/data/cached-room-repository.test.ts`, "returns the same reference until data changes").
- **Unstable effect dependency → infinite effect.** `useLoadOnMount(() => load())` creates a new function each render, so the effect re-runs after every render. Pass a stable function such as the use case's `execute` (the hook documents this; the test passes `load` as a constant).

## Verified On

| Platform | How | Result |
|---|---|---|
| **Android 16** (emulator, Pixel API 36), Expo Go 58 | Ran the app and drove it with `adb`: Rooms list, sort dropdown (overlay and touch), room detail with switch and "⋮" menu, delete, New Room with device picker and save | Works. Screenshots in [`docs/verification/android/`](docs/verification/android) |
| **iOS** (simulator, iPhone 18 Pro), Expo Go | Ran the app and drove it with the simulator: Rooms list, sort dropdown, room detail with switch, favourite and "⋮" menu, Home tab, Devices tab | Works. One bug found and fixed (see below). Screenshots in [`docs/verification/ios/`](docs/verification/ios) |

**Bug found on iOS and fixed:** opening the Devices tab for the first time reset devices that a room had switched on, because the first load called `refresh()` and replaced them with the seed data. Report: [`docs/debugging/001-refresh-overwrites-local-changes.md`](docs/debugging/001-refresh-overwrites-local-changes.md). It has regression tests (`tests/regression.test.ts`).

Notes from the Android run (before that fix; the Devices tab was not opened there): Expo Go draws its own floating gear button (the dev menu) in the top-right corner, over the header "+" button. It is not part of the app; the deep link `exp://<ip>:<port>?__expo_disable_fab=1` hides it. The "Add Device" label on the New Room tile sits very close to the tile's bottom edge on Android.

## Tests

Tests live in `tests/`, in the same folder structure as `src/`, so `src/features/rooms/domain/room-sorting.ts` is tested by `tests/features/rooms/domain/room-sorting.test.ts`. Two import aliases are configured in `tsconfig.json` and `package.json` (Jest):

| Alias | Points to |
|---|---|
| `@/` | `src/` (e.g. `@/features/rooms/domain/room-sorting`) |
| `@tests/` | `tests/` (e.g. `@tests/helpers/make-env`) |

`tests/` is exempt from the "public API only" ESLint rule, so a test may import the internal file it tests. Never put tests inside `app/`: Expo Router would turn them into routes.

## Folder Structure

```
smart-rooms/
├── app/                                  # Expo Router: every file is a route (thin re-exports)
│   ├── _layout.tsx                       # root Stack
│   ├── index.tsx                         # redirects to /rooms
│   ├── (tabs)/
│   │   ├── _layout.tsx                   # bottom tabs on mobile, page slot on web (src/shared/navigation)
│   │   ├── rooms.tsx, home.tsx, devices.tsx
│   │   └── groups.tsx, more.tsx          # placeholders
│   └── room/
│       ├── [id].tsx                      # SCREEN 2 – detail
│       └── new.tsx                       # SCREEN 3 – create
├── src/
│   ├── di/container.ts                   # composition root
│   ├── shared/                           # theme, routes, app-error, use-load-on-mount, generic components, in-memory store
│   │   └── navigation/                   # shared/ (nav-items, sidebar, sidebar-shell), mobile/ (bottom tabs), index.native.ts (adaptive), index.web.ts
│   └── features/
│       ├── rooms/                        # index.ts = public API
│       │   ├── domain/                   # entities/, repositories/, use-cases/, room-with-power, room-sorting
│       │   ├── data/                     # dto/, mappers/, sources/ (room-api, room-db), cached-room-repository, room-seed
│       │   └── presentation/             # shared/ (hooks, models, mappers, assets, common UI), mobile/, desktop/, web/, index.native.ts, index.web.ts
│       ├── devices/                      # same three layers
│       └── home/                         # domain, data, presentation: the favourites dashboard
├── tests/                                # mirrors src/: tests/features/rooms/domain/... tests the file in src/features/rooms/domain/...
│   ├── helpers/make-env.ts               # fresh repositories + use cases for every test
│   └── regression.test.ts
├── docs/                                 # debugging reports and screenshots from the Android / iOS runs
├── assets/rooms/                         # cover images
├── app.json
├── package.json
└── tsconfig.json
```

Naming: folders and files are `kebab-case`; each screen has a matching hook (`mobile/`, `desktop/` and `web/` `screens/rooms-screen.tsx` + `shared/hooks/use-rooms-screen.ts`) that holds its state and calls the use cases.

## Swift → React Native: Where Each Concept Lives

| Swift / SwiftUI | React Native in this demo | Where |
|---|---|---|
| `enum` with exhaustive `switch` | Literal union `SortKey` + `assertNever` | `room-sorting.ts`, `shared/domain/assert-never.ts` |
| `String?` | `string \| undefined` + early return | `use-room-detail-screen.ts`, `room-detail-screen.tsx` |
| `protocol` / model `struct` | `interface Room`, `interface RoomRepository` | `domain/entities`, `domain/repositories` |
| Dictionary `[String: Device]` | `Record<string, Device>` (`DeviceMap`) | `devices/domain/entities/device.ts` |
| Computed property | Derived value `powerOf(devices)` | `rooms/domain/room-with-power.ts` |
| `@Observable` + `@Environment` | Repository + `useSyncExternalStore` in a screen hook | `cached-room-repository.ts`, `use-rooms-screen.ts` |
| `@State` | `useState` (search, sort, tab, form) | screens |
| Generic view `<T>` | `SegmentedControl<T extends string>` | `src/shared/components/segmented-control.tsx` |
| `LazyVGrid` | `FlatList numColumns={2}` | `rooms-screen.tsx` |
| `HStack` / `VStack`, modifiers | Flexbox + `StyleSheet`, style arrays | all components |
| `Toggle`, `TextField`, `Button` | `Switch`, `TextInput`, `Pressable` | detail & new screens |
| `.safeAreaInset` | `useSafeAreaInsets()` | custom header in `rooms-screen.tsx` |
| `NavigationStack` + destination | Stack + dynamic route `room/[id]` | `app/_layout.tsx` |
| `.toolbar { Button("Save") }` | `<Stack.Screen options={{ headerRight }} />` | `new-room-screen.tsx` |
| `TabView` | `Tabs` | `app/(tabs)/_layout.tsx` |
| `dismiss()` | `router.back()` | after Save / Delete |
