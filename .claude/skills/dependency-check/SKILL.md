---
name: dependency-check
description: Reference guide for safe package installs in GymCom — version constraints, why they exist, and correct install commands
---

Reference this skill before installing any package, modifying `package.json`, or troubleshooting a Metro/npm error. It contains every version constraint, the reason each constraint exists, and the correct install commands.

---

## Always-On Rules

Apply these on every install or package change — no exceptions:

- **Always run:** `npm install --legacy-peer-deps`
- **Always use:** `npx expo` (never bare `expo` — not reliably on PATH)
- **Never upgrade a single package in isolation** without reading the pinned-package notes below first
- **Why `--legacy-peer-deps`?** This project uses `react@19.1.0`. Many packages have transitive peer conflicts with `react-dom`. The `--legacy-peer-deps` flag bypasses those without breaking anything functional. Omitting it causes npm to either fail with `ERESOLVE` or silently remove correctly-installed packages.

---

## Pinned Packages — Constraints and Why

### `expo-asset` — must be `~12.0.12` if added

**Why:** `@expo/vector-icons@15.x` calls `setCustomSourceTransformer()` (exported from `expo-asset`) at import time to register icon font assets. This function does not exist in `expo-asset@10.x` or `expo-asset@11.x`. Using the wrong version causes an immediate crash the moment any icon is imported. The crash cascades into deceptive secondary errors — "Route missing default export", "No route named (tabs) in nested children" — that look like code bugs but are not.

**Constraint:** `~12.0.12` (tilde, not caret — do not allow a minor bump)

---

### `expo-linking` — must be `~8.0.11`

**Why:** `expo-router@6.0.x` declares `expo-linking@^8.0.11` as a required peer dependency. Using `7.x` causes an `npm ERESOLVE` that blocks `npm install` from completing at all.

**Constraint:** `~8.0.11`

---

### `react-native-worklets` — must be `^0.5.1`

**Why:** `react-native-reanimated@4.1.x` has a peer dependency on `react-native-worklets>=0.5.0`. The reanimated Babel plugin directly `require()`s `react-native-worklets/plugin` at Metro bundle time. If this package is missing or the wrong version, Metro fails with `Cannot find module 'react-native-worklets/plugin'`.

**Constraint:** `^0.5.1` in `package.json`

---

### `react-refresh` — must be an explicit dep at `^0.14.2`

**Why:** `babel-preset-expo` requires `react-refresh/babel` at Babel transform time. `--legacy-peer-deps` does not hoist it to top-level `node_modules`. Without an explicit entry in `package.json` `dependencies`, Metro fails with `Cannot find module 'react-refresh/babel'`.

**Constraint:** `^0.14.2` in `dependencies` (not `devDependencies`)

---

### `react-native-draggable-flatlist` — install with `--legacy-peer-deps`

**Why:** Has a transitive peer conflict with `react-dom` vs the project's `react@19.1.0`. Currently installed at `^4.0.3`.

**Install if re-adding:** `npm install --save react-native-draggable-flatlist --legacy-peer-deps`

---

### `expo-audio` — must be `~0.4.0`

**Why:** Used for rest timer audio feedback. Must match SDK 54. Do not bump independently.

**Constraint:** `~0.4.0`

---

### `babel-preset-expo` — must be `~54.0.0` in devDependencies

**Why:** `babel.config.js` references `babel-preset-expo` by name. If absent from `package.json`, Metro fails immediately at bundling time with `Cannot find module 'babel-preset-expo'`. Version must match the SDK.

**Constraint:** `~54.0.0` in `devDependencies`

---

## Full Dependency Table (SDK 54 working state)

| Package | Version | Type |
|---------|---------|------|
| `expo` | `~54.0.0` | dep |
| `expo-router` | `~6.0.0` | dep |
| `expo-audio` | `~0.4.0` | dep |
| `expo-document-picker` | `~14.0.8` | dep |
| `expo-file-system` | `~18.0.0` | dep |
| `expo-linking` | `~8.0.11` | dep |
| `expo-sharing` | `~14.0.8` | dep |
| `expo-status-bar` | `~3.0.9` | dep |
| `react` | `19.1.0` | dep |
| `react-native` | `0.81.5` | dep |
| `@expo/vector-icons` | `^15.0.0` | dep |
| `@react-native-async-storage/async-storage` | `2.2.0` | dep |
| `react-native-draggable-flatlist` | `^4.0.3` | dep |
| `react-native-gesture-handler` | `~2.28.0` | dep |
| `react-native-reanimated` | `~4.1.1` | dep |
| `react-native-safe-area-context` | `~5.6.0` | dep |
| `react-native-screens` | `~4.16.0` | dep |
| `react-native-svg` | `15.12.1` | dep |
| `react-native-worklets` | `^0.5.1` | dep |
| `react-refresh` | `^0.14.2` | dep |
| `@babel/core` | `^7.24.0` | devDep |
| `@expo/ngrok` | `^4.1.3` | devDep |
| `@types/react` | `~19.1.10` | devDep |
| `babel-preset-expo` | `~54.0.0` | devDep |
| `typescript` | `~5.9.2` | devDep |

---

## Error Symptom Lookup

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| `setCustomSourceTransformer is not a function` | `expo-asset` wrong version | Ensure `expo-asset` is `~12.0.12` |
| "Route missing default export" / "No route named (tabs)" | Usually the `expo-asset` crash cascading | Fix `expo-asset` version first; don't touch route files |
| `npm ERESOLVE` on install | `expo-linking` version mismatch | Ensure `expo-linking` is `~8.0.11` |
| `Cannot find module 'react-native-worklets/plugin'` | `react-native-worklets` missing or wrong version | Ensure `react-native-worklets` is `^0.5.1` |
| `Cannot find module 'react-refresh/babel'` | `react-refresh` not hoisted by `--legacy-peer-deps` | Add `react-refresh ^0.14.2` to `dependencies` explicitly |
| `Cannot find module 'babel-preset-expo'` | Missing from `devDependencies` | Add `babel-preset-expo ~54.0.0` to `devDeps`; run `npm install` |
| npm removes packages or breaks tree after install | `--legacy-peer-deps` was omitted | Re-run with `--legacy-peer-deps` |

---

## Evaluating New Packages

Before adding any new package, check these in order:

1. **Does it have a `react-dom` peer dep?** If yes, you must use `--legacy-peer-deps` on install.
2. **Does it depend on `react-native-reanimated` or `react-native-gesture-handler`?** If yes, verify it supports the versions already installed (`~4.1.1` and `~2.28.0`).
3. **Is it an Expo SDK package (`expo-*`)?** If yes, verify it targets SDK 54. Use `npx expo install <package>` to get the SDK-matched version automatically.
4. **Does it require a native module?** If yes, confirm it works with Expo managed workflow (no ejecting). Check the Expo docs.
5. **Does it ship a Babel plugin?** If yes, add it to `babel.config.js` plugins array and restart Metro (`Ctrl+C` + `npm start`).
