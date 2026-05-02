# GymCom — New App Specification

**Purpose:** Handoff document for building a new iOS-only app based on the GymCom codebase.  
**Platform:** iOS only (iPhone), Expo SDK 55  
**Distribution:** Development build loaded via EAS on a physical iPhone for 1-week testing  
**Excluded:** All rest timer / timer-related functionality  

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 55 (bare managed workflow) |
| Language | TypeScript |
| Navigation | Expo Router v4 (file-based routing) |
| State | React `useReducer` + Context (no Redux/Zustand) |
| Persistence | `@react-native-async-storage/async-storage` |
| Drag & Drop | `react-native-draggable-flatlist` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Styling | React Native `StyleSheet` + inline dynamic colors |
| Build | EAS Build (`eas build --platform ios --profile development`) |

### Key Dependencies

```json
{
  "@expo/vector-icons": "^15",
  "@react-native-async-storage/async-storage": "^2",
  "expo": "~55.0.0",
  "expo-router": "~4.0.0",
  "expo-dev-client": "~5.0.0",
  "react": "19.x",
  "react-native": "~0.79.x",
  "react-native-draggable-flatlist": "^4.0.3",
  "react-native-gesture-handler": "~2.20.x",
  "react-native-reanimated": "~3.x",
  "react-native-safe-area-context": "~5.x",
  "react-native-screens": "~4.x",
  "react-native-svg": "^15"
}
```

> **Note:** Verify exact peer-compatible versions for Expo SDK 55 using `npx expo install --fix` after scaffolding.

---

## 2. App Overview

GymCom is a gym training companion app. Users build training splits (e.g. Push/Pull/Legs), populate each day with exercises, set per-split default weights/reps, and then track which workout day they are on using the home screen.

### Core User Flows

1. **Onboarding** — First launch shows a welcome screen, tapping "Get Started" marks onboarding complete and navigates to the main tabs.
2. **Build a split** — Create a named split → add workout days → add exercises to each day → set default sets/reps/weight per exercise.
3. **Track daily workouts** — Home screen shows today's scheduled workout with confirm / cardio / skip actions. Confirming advances the split to the next day automatically.
4. **Manage the exercise library** — Browse, search, filter, pin, create, and edit exercises.
5. **Adjust settings** — Toggle weight unit (lbs/kg), change accent colour, adjust which split day is "up next".

---

## 3. Data Models

All types live in `types/index.ts`.

```typescript
export type WeightUnit = 'lbs' | 'kg';

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'legs' | 'glutes' | 'core' | 'cardio' | 'full_body' | 'other';

export type Equipment =
  | 'barbell' | 'dumbbell' | 'machine' | 'cable'
  | 'bodyweight' | 'kettlebell' | 'bands' | 'other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  type: 'weight' | 'time';
  notes?: string;
  isCustom?: boolean;
}

export interface ExerciseDefaults {
  sets?: number;
  reps?: string;           // e.g. "8-12"
  workingWeight?: number;  // raw number, display unit comes from preferences
  bodyWeight?: boolean;
  duration?: string;       // e.g. "60s"
  personalBest?: number;   // seconds, for time-type exercises
}

export interface PlannedExercise {
  exerciseId: string;
}

export interface Split {
  id: string;
  name: string;
  description?: string;
  workoutIds: string[];
  exerciseDefaults?: Record<string, ExerciseDefaults>;  // keyed by exerciseId
}

export interface Workout {
  id: string;
  name: string;
  splitId: string;
  exerciseSlots: PlannedExercise[];
}

export interface UserPreferences {
  unit: WeightUnit;
  themeColor?: string;          // accent hex or preset key
  onboardingComplete?: boolean;
  activeSplitId?: string;
  pinnedExerciseIds?: string[];
  splitCurrentIndex?: number;   // 0-based index in active split
  splitLastDate?: string;       // YYYY-MM-DD
  splitTodayStatus?: 'pending' | 'confirmed' | 'skipped' | 'cardio';
  devDateOverride?: string;     // __DEV__ only: YYYY-MM-DD
}
```

---

## 4. State Management

### Context & Reducer (`context/AppContext.tsx`)

```typescript
interface State {
  exercises: Exercise[];
  splits: Split[];
  workouts: Workout[];
  preferences: UserPreferences;
  isLoading: boolean;
}

type Action =
  | { type: 'LOAD_ALL'; exercises: Exercise[]; splits: Split[]; workouts: Workout[]; preferences: UserPreferences }
  | { type: 'ADD_EXERCISE'; exercise: Exercise }
  | { type: 'UPDATE_EXERCISE'; exercise: Exercise }
  | { type: 'DELETE_EXERCISE'; id: string }
  | { type: 'ADD_SPLIT'; split: Split }
  | { type: 'UPDATE_SPLIT'; split: Split }
  | { type: 'DELETE_SPLIT'; id: string }
  | { type: 'ADD_WORKOUT'; workout: Workout }
  | { type: 'UPDATE_WORKOUT'; workout: Workout }
  | { type: 'DELETE_WORKOUT'; id: string }
  | { type: 'DELETE_SLOT'; workoutId: string; slotIndex: number }
  | { type: 'REORDER_SLOTS'; workoutId: string; slots: PlannedExercise[] }
  | { type: 'SET_EXERCISE_DEFAULTS'; splitId: string; exerciseId: string; defaults: ExerciseDefaults }
  | { type: 'SET_PREFERENCES'; preferences: Partial<UserPreferences> }
```

- Wrap `app/_layout.tsx` in `<AppProvider>`.
- On mount, `LOAD_ALL` is dispatched with data from AsyncStorage.
- After every dispatch, debounce (500 ms) a save back to AsyncStorage.

### AsyncStorage Keys

| Key | Type |
|---|---|
| `exercises` | `Exercise[]` |
| `splits` | `Split[]` |
| `workouts` | `Workout[]` |
| `user_preferences` | `UserPreferences` |

### Default Exercises (seed data on first launch)

Seed these 15 exercises when `exercises` key is missing:

| Name | Muscle Group | Equipment | Type |
|---|---|---|---|
| Bench Press | chest | barbell | weight |
| Incline Bench Press | chest | barbell | weight |
| Squat | legs | barbell | weight |
| Deadlift | back | barbell | weight |
| Overhead Press | shoulders | barbell | weight |
| Barbell Row | back | barbell | weight |
| Pull-Up | back | bodyweight | weight |
| Dip | chest | bodyweight | weight |
| Barbell Curl | biceps | barbell | weight |
| Skull Crusher | triceps | barbell | weight |
| Lunge | legs | bodyweight | weight |
| Romanian Deadlift | legs | barbell | weight |
| Calf Raise | legs | bodyweight | weight |
| Plank | core | bodyweight | time |
| Treadmill Run | cardio | other | time |

---

## 5. Navigation Structure

Uses Expo Router file-based routing.

```
app/
├── _layout.tsx          ← Root stack (AppProvider, ThemeContext, conditional routing)
├── welcome.tsx          ← Onboarding (shown once, then never again)
└── (tabs)/
    ├── _layout.tsx      ← Tab bar (4 tabs)
    ├── index.tsx        ← Home
    ├── plans.tsx        ← Plans
    ├── library.tsx      ← Library
    └── settings.tsx     ← Settings
split/
└── [id].tsx             ← Split detail / edit
workout/
└── [id].tsx             ← Workout day editor
```

### Root `_layout.tsx` Logic

```tsx
// If onboardingComplete is falsy → replace to /welcome
// Else → let (tabs) render
```

### Tab Bar Config

| Tab | Icon (Ionicons) | Label |
|---|---|---|
| index | `home-outline` | Home |
| plans | `list-outline` | Plans |
| library | `barbell-outline` | Library |
| settings | `settings-outline` | Settings |

Active icon: `colors.primary`. Inactive icon: `colors.textSecondary`.

---

## 6. Theme System

### `constants/theme.ts`

```typescript
export const LightColors = {
  primary: '#FF6B35',
  primaryLight: '#FFF0EB',
  background: '#F7F8FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  success: '#22C55E',
  successLight: '#DCFCE7',
  white: '#FFFFFF',
};

export const DarkColors = {
  primary: '#FF6B35',
  primaryLight: '#3D2010',
  background: '#1C1C1E',
  card: '#2C2C2E',
  text: '#F2F2F7',
  textSecondary: '#8E8E93',
  border: '#3A3A3C',
  danger: '#FF453A',
  dangerLight: '#3D1919',
  success: '#30D158',
  successLight: '#1A3D20',
  white: '#FFFFFF',
};

export const AccentPresets: Record<string, string> = {
  orange: '#FF6B35',
  red: '#F44336',
  blue: '#2196F3',
  green: '#4CAF50',
  purple: '#9C27B0',
  teal: '#009688',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '600' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const Radius = { sm: 8, md: 12, lg: 16 };
```

### ThemeContext

A separate `ThemeContext` (or part of `AppContext`) reads `preferences.themeColor`, merges the chosen accent over the base palette, and exposes a `useColors()` hook. Components **never** hardcode hex values — always call `useColors()`.

### Styling Rules (enforce these throughout)

- Static layout → `StyleSheet.create()`; dynamic colors → inline style
- Every screen root → `<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>`
- Cards → `{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: Radius.md }`
- Primary CTA buttons → `borderRadius: 14`
- Section headers → uppercase, `letterSpacing: 0.8`, `colors.textSecondary`
- Minimum touch target: **44 px** height

---

## 7. Screens

### 7.1 Welcome (`app/welcome.tsx`)

- Full-screen centered layout
- App logo / wordmark "GymCom"
- Tagline (optional)
- "Get Started" primary button
- On press: dispatch `SET_PREFERENCES { onboardingComplete: true }` → `router.replace('/(tabs)/')`

---

### 7.2 Home (`app/(tabs)/index.tsx`)

Contains only the `<SplitTracker />` component (scroll container if needed).  
The rest timer is **removed** — this screen is simpler than the original.

#### `SplitTracker` Component

**States:**

| State | Trigger | Display |
|---|---|---|
| No active split | `activeSplitId` is unset | Prompt card: "Set a plan to track" with link to Plans tab |
| Pending | `splitTodayStatus === 'pending'` | Today's workout name + 3 action buttons |
| Confirmed | `splitTodayStatus === 'confirmed'` | Green card, workout name, "Up next: X", Undo button |
| Skipped | `splitTodayStatus === 'skipped'` | Tinted card, "Rest day", Undo button |
| Cardio | `splitTodayStatus === 'cardio'` | Tinted card, "Cardio day", Undo button |

**Pending state — 3 action buttons:**

| Button | Icon | Action |
|---|---|---|
| Confirm workout | `play-circle-outline` (large) | `splitTodayStatus = 'confirmed'` |
| Cardio | `walk-outline` | `splitTodayStatus = 'cardio'` |
| Skip / Rest | `moon-outline` | `splitTodayStatus = 'skipped'` |

**Animations (spring):**
- Button press: compress to 0.92 scale (70 ms) → spring back to 1.0
- State result card: slide up from 20 px below + fade in

**Split advancement logic** (`utils/splitTracking.ts`):

```typescript
// Called on Home screen mount / focus
function advanceSplitIfNeeded(
  prefs: UserPreferences,
  splitLength: number,
  todayOverride?: string
): Partial<UserPreferences> | null

// Rules:
// - If splitLastDate === today → do nothing (return null)
// - If it is a new day AND previous status was 'confirmed':
//     advance splitCurrentIndex by 1 (wraps with modulo)
// - If previous status was 'skipped' | 'cardio' | 'pending':
//     keep same index
// - Always reset splitTodayStatus to 'pending' and splitLastDate to today
```

---

### 7.3 Plans (`app/(tabs)/plans.tsx`)

**Two sub-views toggled on this single screen:**

#### A. Split List View (no active split, or user taps "Switch")

- Flat list of `<SplitCard />` (swipe right to delete)
- "New Split" primary button at bottom
- Tap a card to set it as active and switch to the Active Split View

#### B. Active Split View

Shown when an `activeSplitId` is set.

- **Header:** Split name (large) + "Switch" button (opens split switcher modal)
- **Workout day list:** Each day rendered as a tappable row showing: day number badge, day name, exercise count
  - Tap → navigate to `/workout/[id]`
- **"Manage Split" button** → navigate to `/split/[id]`
- **"Add Day" FAB** → modal prompts for day name → creates Workout + appends to Split

**Modals on this screen:**

| Modal | Trigger | Content |
|---|---|---|
| New Split | "New Split" button | Name text input + Create button |
| Split Switcher | "Switch" button | List of all splits, tap to activate |
| Add Day | FAB or button | Day name text input + Add button |

---

### 7.4 Library (`app/(tabs)/library.tsx`)

- **Search bar** at top (filters exercise list by name)
- **Muscle group filter chips** (horizontal scroll): All + each MuscleGroup value
- **Exercise list:**
  - When filter = 'all': sections → "Pinned" (if any pinned), then each muscle group with exercises
  - When filter = specific group: flat list for that group only
- **Each exercise row:**
  - Name (bold)
  - Muscle group + equipment badges
  - Type badge ('W' or 'T')
  - Pin icon (filled if pinned)
  - Long-press or kebab → edit / delete
- **Tap exercise row:**
  - If `activeSplitId` is set → open `SlotEditModal` to set per-split defaults
  - If no active split → open `ExerciseFormModal` to edit the exercise definition
- **FAB** (bottom-right) → open `ExerciseFormModal` to create new exercise

---

### 7.5 Settings (`app/(tabs)/settings.tsx`)

Sections (each a labelled group):

| Section | Component | Content |
|---|---|---|
| Profile | `ProfileSection` | Weight unit segmented control: lbs / kg |
| Appearance | `ThemeColorPicker` | 6 accent color swatches |
| Active Split | `SplitDaySettings` | "Day N of M" stepper (- / +) |
| Developer (DEV only) | `DevSplitSettings` | Date override, day index stepper, reset today |

---

### 7.6 Split Detail (`app/split/[id].tsx`)

- **Header:** Tappable split title (becomes inline `TextInput` on tap)
- **Draggable day list** (`DraggableFlatList`): each day = `WorkoutDayRow`
  - Drag handle (long-press to activate drag)
  - Day name + exercise count
  - Delete icon (right side)
  - Tap anywhere (not handle/delete) → navigate to `/workout/[id]`
- **FAB** → add new day (modal prompts name)
- On drag end: dispatch `UPDATE_SPLIT` with new `workoutIds` order

---

### 7.7 Workout Editor (`app/workout/[id].tsx`)

- **Header:** Tappable workout title (inline `TextInput` on tap)
- **Exercise slot list:**
  - Each slot = `ExerciseSlotCard`
  - Swipe right → delete slot (dispatch `DELETE_SLOT`)
  - Tap card → open `SlotEditModal`
- **FAB** (bottom-right) → open `ExercisePicker` modal
- After picking exercise: dispatch `UPDATE_WORKOUT` to append slot; if no defaults yet, create empty `ExerciseDefaults`

---

## 8. Components

### 8.1 `SplitCard` (`components/plans/SplitCard.tsx`)

Props: `split: Split`, `onPress`, `onDelete`

- Card with split name, optional description, day count badge
- Swipe right gesture → reveal delete button (red background)
- Tap → `onPress`

---

### 8.2 `WorkoutDayRow` (`components/plans/WorkoutDayRow.tsx`)

Props: `workout: Workout`, `index: number`, `onPress`, `onDelete`, `drag`, `isActive`

- Row with:
  - Left: drag handle icon (`reorder-three-outline`), day number badge
  - Center: workout name + "N exercises" subtitle
  - Right: delete icon (`trash-outline`)
- `isActive` (during drag) → elevated shadow, slightly scaled up
- `onLongPress` on drag handle → call `drag()` from DraggableFlatList

---

### 8.3 `ExerciseFormModal` (`components/plans/ExerciseFormModal.tsx`)

Props: `visible`, `onClose`, `exercise?: Exercise` (undefined = create mode)

A page-sheet modal with:
- Text input: exercise name
- Toggle chips: type (`weight` | `time`)
- Muscle group chip grid (11 options, single-select)
- Equipment chip grid (8 options, single-select) — optional but recommended
- Save / Cancel buttons
- In edit mode, pre-populates all fields
- On save: dispatch `ADD_EXERCISE` or `UPDATE_EXERCISE`

---

### 8.4 `ExercisePicker` (`components/plans/ExercisePicker.tsx`)

Props: `visible`, `onClose`, `onSelect: (exercise: Exercise) => void`

A full-screen modal with:
- Search bar
- Muscle group filter chips (horizontal scroll)
- Filtered exercise list (each row: name, type badge, muscle/equipment)
- If search has no results → "Create '[query]'" shortcut row at top
- Tapping shortcut opens `ExerciseFormModal` pre-filled with the search term
- On exercise tap → `onSelect(exercise)` then close

---

### 8.5 `ExerciseSlotCard` (`components/workout/ExerciseSlotCard.tsx`)

Props: `exercise: Exercise`, `defaults?: ExerciseDefaults`, `unit: WeightUnit`, `onPress`, `onDelete`

- Shows exercise name
- Secondary line: `buildSetsRepsLine()`:
  - weight type: "3 sets × 8-12"
  - time type: "3 sets"
- Pill (right or below):
  - weight type: "135 lbs" | "Body Weight" | "Set"
  - time type: "60s" | "Set"
- Swipe right → `onDelete`
- Tap → `onPress` (open SlotEditModal)

---

### 8.6 `SlotEditModal` (`components/plans/SlotEditModal.tsx`)

Props: `visible`, `onClose`, `exercise: Exercise`, `defaults: ExerciseDefaults`, `unit: WeightUnit`, `onSave: (defaults: ExerciseDefaults) => void`

Fields vary by exercise type:

**Weight type:**
- Sets (numeric stepper or text input, min 1)
- Reps (text input, e.g. "8-12")
- Body weight checkbox (if checked, weight input is disabled)
- Working weight (numeric input, label shows unit)

**Time type:**
- Sets (numeric stepper, min 1)
- Duration per set (text input, e.g. "60s")
- Personal best (numeric input, seconds)

Save button → `onSave(updatedDefaults)` then dispatch `SET_EXERCISE_DEFAULTS`.

---

### 8.7 `ProfileSection` (`components/settings/ProfileSection.tsx`)

Props: none (reads from context)

- Label: "Weight Unit"
- Two-option segmented control: "lbs" | "kg"
- On change: dispatch `SET_PREFERENCES { unit }`

---

### 8.8 `ThemeColorPicker` (`components/settings/ThemeColorPicker.tsx`)

Props: none (reads from context)

- Label: "Accent Color"
- 6 circular swatches (40 px diameter) in a row
- Selected swatch: white border + drop shadow
- On press: dispatch `SET_PREFERENCES { themeColor }`

---

### 8.9 `SplitDaySettings` (`components/settings/SplitDaySettings.tsx`)

Props: none (reads from context)

- Label: "Current Day"
- "Day N of M" display
- "–" button (min 1) and "+" button (max = split length)
- On change: dispatch `SET_PREFERENCES { splitCurrentIndex: newIndex }`
- Only renders if an active split is set

---

### 8.10 `DevSplitSettings` (`components/settings/DevSplitSettings.tsx`)

Only renders in `__DEV__` mode.

- Date override picker (iOS `DateTimePicker` inline)
- Day index stepper
- "Reset Today" button → clears `splitTodayStatus` and `splitLastDate`
- Active override shown as a badge

---

## 9. Utilities

### `utils/generateId.ts`

```typescript
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
```

### `utils/dateUtils.ts`

```typescript
// Returns today as 'YYYY-MM-DD', respects devDateOverride in __DEV__
export function todayString(override?: string): string

// "Today", "Yesterday", or "Wed, Mar 5"
export function relativeDateLabel(dateStr: string): string

// Formats seconds → "M:SS"
export function formatDuration(seconds: number): string

// Formats seconds → "1h 23m" or "45m"
export function formatWorkoutDuration(seconds: number): string
```

### `utils/splitTracking.ts`

```typescript
export function advanceSplitIfNeeded(
  prefs: UserPreferences,
  splitLength: number,
  todayOverride?: string
): Partial<UserPreferences> | null
```

See section 7.2 for full rules.

### `storage/storage.ts`

```typescript
export async function loadExercises(): Promise<Exercise[]>
export async function saveExercises(data: Exercise[]): Promise<void>
export async function loadSplits(): Promise<Split[]>
export async function saveSplits(data: Split[]): Promise<void>
export async function loadWorkouts(): Promise<Workout[]>
export async function saveWorkouts(data: Workout[]): Promise<void>
export async function loadPreferences(): Promise<UserPreferences>
export async function savePreferences(data: UserPreferences): Promise<void>
```

All functions use `AsyncStorage.getItem` / `setItem` with `JSON.parse` / `JSON.stringify`.  
Return sane defaults (empty arrays, default preferences) when key is absent.

---

## 10. Removed Features

The following features from the original GymCom repo are **intentionally excluded** from this new app:

- **Rest Timer** (`components/workout/RestTimer.tsx`, `WiggleChip.tsx`, `PresetManager.tsx`)
- **Timer presets** (storage key `timer_presets`, type `TimerPreset`)
- **useTimerSound hook** and all `expo-audio` / `expo-notifications` usage
- **`formatPresetLabel` utility**
- **`formatDuration` / `formatWorkoutDuration`** — only include if needed elsewhere; omit if not used
- **Home screen timer section** — home screen only contains `SplitTracker`

---

## 11. iOS Build Setup (EAS)

### `app.json` essentials

```json
{
  "expo": {
    "name": "GymCom",
    "slug": "gymcom",
    "version": "1.0.0",
    "platforms": ["ios"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourname.gymcom"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

### `eas.json`

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    }
  }
}
```

### Steps to load on iPhone

1. `eas build --platform ios --profile development`
2. When prompted, register the iPhone's UDID to the provisioning profile
3. Download the `.ipa` from the EAS dashboard
4. Install via EAS device portal or Apple Configurator
5. Launch the Expo Dev Client app → connect to local bundler

---

## 12. File/Folder Scaffold

```
├── app/
│   ├── _layout.tsx
│   ├── welcome.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── plans.tsx
│   │   ├── library.tsx
│   │   └── settings.tsx
│   ├── split/
│   │   └── [id].tsx
│   └── workout/
│       └── [id].tsx
├── components/
│   ├── home/
│   │   └── SplitTracker.tsx
│   ├── plans/
│   │   ├── ExerciseFormModal.tsx
│   │   ├── ExercisePicker.tsx
│   │   ├── ExerciseSlotCard.tsx
│   │   ├── SlotEditModal.tsx
│   │   ├── SplitCard.tsx
│   │   └── WorkoutDayRow.tsx
│   └── settings/
│       ├── DevSplitSettings.tsx
│       ├── ProfileSection.tsx
│       ├── SplitDaySettings.tsx
│       └── ThemeColorPicker.tsx
├── constants/
│   └── theme.ts
├── context/
│   └── AppContext.tsx
├── storage/
│   └── storage.ts
├── types/
│   └── index.ts
└── utils/
    ├── dateUtils.ts
    ├── generateId.ts
    └── splitTracking.ts
```

---

## 13. Styling Quick-Reference

Always use `useColors()` — never hardcode hex values.

```typescript
// Every screen
<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

// Cards
{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: Radius.md }

// Primary button
{ backgroundColor: colors.primary, borderRadius: 14, minHeight: 44 }

// Destructive button
{ backgroundColor: colors.danger, borderRadius: 14, minHeight: 44 }

// Section label
{ ...Typography.small, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textSecondary }

// Chips (unselected)
{ backgroundColor: colors.primaryLight, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs }

// Chips (selected)
{ backgroundColor: colors.primary, borderRadius: Radius.sm }
```

Ionicons sizes: 24 (nav), 22 (list rows), 20 (card actions), 18 (input adornments).

---

## 14. Behaviour Notes & Edge Cases

- **First launch:** Exercises key missing → seed with 15 defaults. Preferences missing → `{ unit: 'lbs', onboardingComplete: false }`.
- **Split with 0 days:** Plans screen shows "Add a day" prompt inside the active split view.
- **Exercise deleted from library while referenced in a workout:** `ExerciseSlotCard` should gracefully handle `exercise === undefined` (show "[Deleted Exercise]" fallback).
- **Split advancement wraps:** After the last day, index resets to 0 (modulo split length).
- **Undo actions:** "Undo" on confirmed/skipped/cardio states resets `splitTodayStatus` to `'pending'` and does **not** un-advance the index (advancement happens the next day, not immediately).
- **Unit display:** All stored weights are raw numbers. The unit label comes from `preferences.unit` at display time.
- **Per-split defaults are keyed by exerciseId, not slotIndex.** If the same exercise appears in two workouts in one split, it shares defaults.
