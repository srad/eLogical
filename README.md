# eLogical

Mobile eLearning game that teaches solving boolean formulas, which are randomly generated and
visualised as expression trees.

<img src="https://github.com/srad/eLogical/blob/master/assets/media/0.jpg?raw=true" width="30%"> <img src="https://github.com/srad/eLogical/blob/master/assets/media/1.jpg?raw=true" width="30%"> <img src="https://github.com/srad/eLogical/blob/master/assets/media/2.jpg?raw=true" width="30%">

## Stack

- **Vue 3** (composition API, `<script setup>`) + **TypeScript**, built with **Vite**
- **Capacitor 8** for the native Android app (targets Android 16 / API 36)
- **Bootstrap 5** for layout, **Chart.js 4** for the analytics views, **dagre** for tree layout

The app is **fully offline**. There is no backend and no network request anywhere in `src/`;
scores, tracking events and preferences all live in **IndexedDB** behind
`src/services/localStorage.ts`, which `src/services/elogical.ts` wraps.

## Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies (Node 22+ required) |
| `npm run dev` | Vite dev server on http://localhost:8080 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run type-check` | `vue-tsc --noEmit` |
| `npm test` | Run the unit tests once |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:ui` | Vitest UI |
| `npm run lint` | ESLint (flat config) with `--fix` |
| `npm run format` | Prettier over the repo |
| `npm run sync` | `build` + `cap sync` — refreshes the native projects |
| `npm run assets` | Regenerate launcher icons and splash screens |

Set `ANALYZE=1` on a build to emit a `stats.html` bundle treemap.

## Android

```powershell
.\run-android.ps1              # build, install and launch on the first connected device
.\run-android.ps1 -Log         # …and stream the app's logcat
.\run-android.ps1 -SkipWebBuild # native-only rebuild (skips Vite + cap sync)
.\run-android.ps1 -Release     # signed release APK instead of debug
```

Or by hand:

```bash
npm run sync
cd android && ./gradlew assembleDebug      # debug APK
cd android && ./gradlew bundleRelease      # release .aab for Play
```

Debug builds carry `applicationIdSuffix ".debug"`, so they install **alongside** the Play
build as a separate app called "eLogical dev" rather than colliding with it — the two are
signed with different keys, and a same-id install would fail with
`INSTALL_FAILED_UPDATE_INCOMPATIBLE`. Each has its own IndexedDB, so test games never touch
the real app's highscores. Note that the suffix shifts the package id but not the activity
class, so the launch component is `com.github.srad.elogical.debug/com.github.srad.elogical.MainActivity`.

Requires the Android SDK with **platform 36** installed. `minSdkVersion` is 31 (Android 12),
`targetSdkVersion` is 36 (Android 16), as required by Google Play.

Edge-to-edge and safe-area insets are handled by Capacitor 8's built-in SystemBars plugin,
which injects `--safe-area-inset-{top,right,bottom,left}` CSS variables — consumed in
`src/App.vue` and `src/views/Game.vue`. No safe-area plugin is installed.

### Release signing

`android/app/build.gradle` reads signing credentials from `android/keystore.properties`
(preferred), falling back to `android/local.properties` and then environment variables. All of
these are gitignored — **no keystore or password belongs in the repository**. Without them the
release build still succeeds, but produces an *unsigned* bundle and logs a warning.

Create `android/keystore.properties`:

```properties
RELEASE_STORE_FILE=/absolute/path/to/elogical.jks
RELEASE_STORE_PASSWORD=…
RELEASE_KEY_ALIAS=…
RELEASE_KEY_PASSWORD=…
```

Flutter's key names (`storeFile`, `storePassword`, `keyAlias`, `keyPassword`) are accepted
too, so an existing `key.properties` from another project can be copied across unchanged.
Point `storeFile` at the keystore where it already lives rather than copying the `.jks` into
the repo. Under Play App Signing this is only the *upload* key, and it is registered per app —
check its SHA-256 against Play Console → App integrity → Upload key certificate before relying
on it.

Bump `versionCode` in `android/app/build.gradle` before every Play upload; it must be strictly
greater than the last published one (currently 3).
