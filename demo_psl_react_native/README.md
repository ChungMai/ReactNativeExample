# Smart Rooms — React Native Demo

A three-screen React Native demo inspired by a smart-home "Rooms" feature: a **room list**, a **room detail** screen and a **New Room** form. It was built to show what was learned in week 1 of moving from Swift to React Native: TypeScript, React hooks, React Native UI and Expo Router navigation.

Built with **Expo SDK 58 · React Native 0.88 · React 19.3 · Expo Router 58 · TypeScript (strict)**. All images are bundled, so the demo runs offline.

## Quick Start

> **Use Node 24 LTS** (or 22.13+). Node 25 is not supported by Expo SDK 58 / React Native 0.88 and prints `EBADENGINE` warnings.

```bash
cd smart-rooms
npm install
npx expo start        # press i for iOS Simulator, w for web, or scan the QR code with Expo Go
npm run typecheck     # 0 errors
```

Don't run `npm audit fix --force` — it moves packages outside the versions Expo SDK 58 expects.

## The Three Screens

| Screen | Route | What it does |
|---|---|---|
| **1. Rooms** (list) | `/rooms` | Custom header with Search and Add buttons, sort direction + "Alphabetical / Recently added" dropdown, 2-column grid of room cards with an On/Off badge |
| **2. Room detail** | `/room/[id]` | Header title + "⋮" menu (Delete room), cover image, Manage / Devices / Presets segmented control, room power switch, Add to Favourites |
| **3. New Room** | `/room/new` | Header Save button (disabled until a name is entered), camera button to change the cover, room name, "Add Device" tile with a device picker |

The other tabs are small extras: **Home** shows favourite rooms, **Devices** lists every device with a switch, **Groups** and **More** are placeholders.

## Suggested Demo Flow (about 4 minutes)

1. **Rooms list** — show sorting (arrow button, then *Recently added*) and search (🔍, type "virt").
2. Open **Virtual Room** — flip the **Switch**: the label changes to *Switch On*.
3. Tap **Add to Favourites** — the heart fills in; go to the **Home** tab to see the room there.
4. Back on **Rooms** — the badge on Virtual Room now says **On**. Point out that power is *derived* from devices, never stored.
5. Tap **＋** — type "Kitchen", tap the camera to change the cover, add a device, **Save**. The new room appears in the grid.
6. Open **Kitchen** → **⋮** → **Delete room**.

The state lives in memory, so reloading the app resets it — every demo starts from the same three rooms.

## Live Coding Script: Add a New Sort Option (~3 minutes)

Goal: show how TypeScript guides a change, just like an exhaustive `switch` over an enum in Swift. Rehearsed — the compiler errors below are exactly what you will see.

**Step 1 — add the new case to the type** (`src/types.ts`)

```ts
export type SortKey = 'alphabetical' | 'recent' | 'devices'
```

Run `npm run typecheck` (or look at the editor). Two errors appear:

```
src/types.ts: Property 'devices' is missing in type '{ alphabetical: string; recent: string; }'
              but required in type 'Record<SortKey, string>'.
src/hooks/useSortedRooms.ts: Argument of type '"devices"' is not assignable to parameter of type 'never'.
```

> Say: *"`Record<SortKey, string>` forces a label for every key, and `assertNever` forces the switch to handle every case — like a Swift `switch` on an enum."*

**Step 2 — add the label** (`src/types.ts`)

```ts
export const SORT_LABELS: Record<SortKey, string> = {
  alphabetical: 'Alphabetical',
  recent: 'Recently added',
  devices: 'Device count',
}
```

One error left, in `useSortedRooms.ts`.

**Step 3 — handle the case** (`src/hooks/useSortedRooms.ts`)

```ts
case 'devices': return b.deviceIds.length - a.deviceIds.length
```

0 errors. Save — the app reloads, and **Device count** appears in the dropdown automatically, because the menu is built from `SORT_LABELS`.

**Safety net:** commit the finished version on a separate git branch (`git switch -c live-done`) and keep a short screen recording, in case anything goes wrong on stage.

## Folder Structure

```
smart-rooms/
├── app/                                # Expo Router: every file is a route
│   ├── _layout.tsx                     # RoomsProvider + root Stack
│   ├── index.tsx                       # redirects to /rooms
│   ├── (tabs)/
│   │   ├── _layout.tsx                 # 5 bottom tabs
│   │   ├── rooms.tsx                   # SCREEN 1 – list
│   │   ├── home.tsx                    # favourite rooms
│   │   ├── devices.tsx                 # all devices
│   │   ├── groups.tsx, more.tsx        # placeholders
│   └── room/
│       ├── [id].tsx                    # SCREEN 2 – detail
│       └── new.tsx                     # SCREEN 3 – create
├── src/
│   ├── types.ts                        # Room, Device, Action, SortKey, assertNever
│   ├── theme.ts                        # colors
│   ├── data/seed.ts, covers.ts         # initial rooms/devices, bundled images
│   ├── store/rooms.tsx                 # reducer, 2 contexts, useRoom, powerOf
│   ├── hooks/useSortedRooms.ts         # search + sort (useMemo, useDeferredValue)
│   └── components/                     # IconButton, RoomCard, SortBar, SegmentedControl, Row
├── assets/rooms/                       # cover images
├── app.json
├── package.json
└── tsconfig.json
```

## Swift → React Native: Where Each Concept Lives

| Swift / SwiftUI | React Native in this demo | Where |
|---|---|---|
| `enum` with associated values | Discriminated union `Action` + `assertNever` | `src/types.ts`, `src/store/rooms.tsx` |
| `String?` | `string \| undefined` + early return | `useRoom(id)`, `app/room/[id].tsx` |
| `protocol` / model `struct` | `interface Room`, `interface Device` | `src/types.ts` |
| Dictionary `[String: Device]` | `Record<string, Device>` | `State.devices` |
| Computed property | Derived value `powerOf(devices)` | `src/store/rooms.tsx` |
| `@Observable` + `@Environment` | `useReducer` + two contexts + custom hooks | `src/store/rooms.tsx` |
| `@State` | `useState` (search, sort, tab, form) | screens |
| Generic view `<T>` | `SegmentedControl<T extends string>` | `src/components/SegmentedControl.tsx` |
| `LazyVGrid` | `FlatList numColumns={2}` | `app/(tabs)/rooms.tsx` |
| `HStack` / `VStack`, modifiers | Flexbox + `StyleSheet`, style arrays | all components |
| `Toggle`, `TextField`, `Button` | `Switch`, `TextInput`, `Pressable` | detail & new screens |
| `.safeAreaInset` | `useSafeAreaInsets()` | custom header in `rooms.tsx` |
| `NavigationStack` + destination | Stack + dynamic route `room/[id]` | `app/_layout.tsx` |
| `.toolbar { Button("Save") }` | `<Stack.Screen options={{ headerRight }} />` | `app/room/new.tsx` |
| `TabView` | `Tabs` | `app/(tabs)/_layout.tsx` |
| `dismiss()` | `router.back()` | after Save / Delete |
