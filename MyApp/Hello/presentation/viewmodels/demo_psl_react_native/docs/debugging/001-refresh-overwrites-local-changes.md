# Debug report 001: opening the Devices tab turned a room back off

**Found by:** running the app on the iOS simulator (not visible in unit tests).
**Status:** fixed, with regression tests.

## Symptom
1. Rooms tab → open *Virtual Room* → switch it on. The list shows **On**, Home shows **On**.
2. Open the **Devices** tab for the first time. *Ceiling light*, *Floor lamp* and *Smart plug* are all **off**.
3. Back to Rooms: *Virtual Room* is **Off** again.

Evidence: [`bug-before-fix-devices-all-off.png`](../verification/ios/bug-before-fix-devices-all-off.png),
after the fix: [`after-fix-devices-keep-on.png`](../verification/ios/after-fix-devices-keep-on.png).

## Reproduce
Only when the Devices tab is opened **after** a change was made elsewhere. Tabs are mounted lazily, so
the first mount of the Devices tab was the first time `LoadDevicesUseCase` ran.

## Isolate
- `Room.power` is derived from the devices (`powerOf`), so the room going "Off" meant the devices changed.
- `triggerRoom` → `SetDevicesPowerUseCase` → `repository.save()` was correct (the switch screen showed "On").
- The reset came right after the Devices screen mounted: `useLoadOnMount` → `LoadDevicesUseCase.execute()`
  → `DeviceRepository.refresh()` → `db.save(await api.fetchDevices())`.
- `FakeDeviceApi` always returns the seed, and nothing ever sends local changes to it, so `refresh()` replaced
  the current state with the initial one.

## Root cause
`refresh()` overwrote local changes. The "load once per session" guard in the use case did not help, because
the first load of each feature happens when its screen is first shown, and that can be after other changes.

## Fix
`CachedRoomRepository` and `CachedDeviceRepository` remember `hasLocalChanges` (set in `save()`), and
`refresh()` does nothing in that case: local changes win until there is a write endpoint to send them to.
When a real API exists, writes should go to the server and this guard can be replaced by normal syncing.

## Regression tests
- `tests/regression.test.ts`: devices after a room switch, rooms after a new room, forced reload, normal load still works.
- `tests/features/devices/presentation/screens/devices-screen.regression.test.tsx`: the exact UI scenario above.
- `tests/features/*/data/cached-*-repository.test.ts`: `refresh()` keeps local changes and does not call the API.

All four scenario tests failed before the fix and pass after it.
