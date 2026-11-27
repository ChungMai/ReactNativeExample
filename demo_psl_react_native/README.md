# Smart Rooms — React Native

A React Native client for a smart-home server, ported from parts of a Swift app. Built with **Expo SDK 58 · React Native 0.88 · React 19.3 · Expo Router 58 · TypeScript (strict)** for iOS, Android and web.

**It needs a real server and account.** There is no demo mode. Apart from signing in, everything is **read only**: nothing switches a device or changes data on the server.

## Quick start

> Use Node 24 LTS (or 22.13+). Node 25 is not supported by Expo SDK 58.

```bash
npm install
cp .env.example .env.local   # then fill it in, see below
npm run ios                  # or: npm run android
npx expo start               # press w for web
```

```bash
npm run typecheck
npm test
npm run lint
```

Don't run `npm audit fix --force`: it moves packages outside the versions Expo SDK 58 expects.

### `.env.local` (git-ignored: never commit server addresses or accounts)

| Variable | Used for |
|---|---|
| `EXPO_PUBLIC_AUTH_SERVER_URL` | Optional. The **Default Server**. Without it, choose a server on the login screen. |
| `DEV_PROXY_ALLOWED_HOSTS` | Web development only, see below. |

Restart `npx expo start` after changing it.

### Web and CORS

The server sends no CORS headers, so in development the web app goes through the Expo dev server (`dev-proxy.js`). It only serves a browser on the same machine, only the read requests listed below, and only the listed https hosts. Restart the dev server after changing `dev-proxy.js`. A deployed web build does not use it and needs CORS on the server.

## Screens and requests

| Screen | Request | Notes |
|---|---|---|
| Select server | `GET <server>/wmc/auth/types` | Only `https` and Cognito servers |
| Login | AWS Cognito, SRP | The password is not sent or stored. MFA and "new password" are not supported |
| Networks | `GET <server>/app/networks` | Remote access only |
| Home | `GET <server>/app/networks/users/`, `POST <server>/api/bridge/<hub>/objects` | Favourites and layout. Reloads every 10 s |
| Devices | `POST <server>/api/bridge/<hub>/accessories` | 64, then 128 at a time; categories, search, sort |
| Rooms | `GET <server>/api/bridge/<hub>/groups/0` | Grid of cards |
| Groups | `GET <server>/api/bridge/<hub>/groups` | Categories of cards, search, sort. Reloads every 10 s |
| More → Zones, Presets, Scenes, Events, PanL Hubs, PanL Accessories | `GET <server>/api/bridge/<hub>/zones` (`presets`, `scenes`, `events`, `hubs`) | Cards with search. A secondary user sees Zones, Presets and Scenes only |
| More → PanL Displays | `POST <server>/api/bridge/<hub>/accessories` | Filtered by display types |
| More → User Management | `POST <server>/app/networks/users/all` | |
| More → Network Settings | `GET <server>/api/bridge/<hub>/hubs` | Information only |
| More → Meter Insights | `GET <server>/ec/api/<network id>/energy-meter/date/<dd-mm-yyyy>` | Energy per hour, no water meters |
| Room detail | `GET <server>/api/bridge/<hub>/groups/<id>/memberof` | Bundled cover image, not the room's own |

**More → React hooks demo** (`src/features/hooks-demo`, with its own README) is an example that does not use the server.

The session lasts 1 day, or 30 with "Keep me signed in". The refresh token is kept in the Keychain / Keystore and the access token in memory; on web both are in memory only, so a reload signs you out.

## Architecture

Organised by feature, each with up to three layers; dependencies point inwards.

```
presentation  ──►  domain  ◄──  data
```

- `src/di/container.ts` is the only place that creates concrete classes.
- Each feature has a public API, `src/features/<name>/index.ts`. ESLint rejects deep imports.
- Requests that need the token go through `src/shared/data/authorized-fetch.ts`.
- `presentation/` may split into `shared/`, `mobile/`, `desktop/` and `web/`; `index.native.ts` and `index.web.ts` pick one.
- `app/` holds the routes. List every new route file in a `Stack.Protected` guard in `app/_layout.tsx`.
- Phones get bottom tabs; iPad, Mac ("Designed for iPad") and web get a left menu.

## Running on a Mac

On an Apple Silicon Mac the app runs as an iPad app:

```bash
npx expo prebuild --platform ios
open ios/SmartRooms.xcworkspace   # destination "My Mac (Designed for iPad)", then Run
```

## Tests

Tests are in `tests/`, mirroring `src/`. Aliases: `@/` is `src/`, `@tests/` is `tests/`. No test contacts a server.

`docs/` holds reports and screenshots from the earlier demo version of the app.
