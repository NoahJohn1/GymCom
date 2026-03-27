import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Exercise,
  ExerciseDefaults,
  Split,
  Workout,
  PlannedExercise,
  WorkoutPlan,
  UserPreferences,
} from '../types';
import {
  loadExercises,
  saveExercises,
  loadSplits,
  saveSplits,
  loadWorkouts,
  saveWorkouts,
  loadPreferences,
  savePreferences,
} from '../storage/storage';
import { generateId } from '../utils/generateId';

// ─── Default Exercise Library ─────────────────────────────────────────────────

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex-bench',      name: 'Bench Press',         muscleGroup: 'chest',     equipment: 'barbell',    type: 'weight' },
  { id: 'ex-incline',    name: 'Incline Bench Press',  muscleGroup: 'chest',     equipment: 'barbell',    type: 'weight' },
  { id: 'ex-squat',      name: 'Squat',                muscleGroup: 'legs',      equipment: 'barbell',    type: 'weight' },
  { id: 'ex-deadlift',   name: 'Deadlift',             muscleGroup: 'back',      equipment: 'barbell',    type: 'weight' },
  { id: 'ex-ohp',        name: 'Overhead Press',       muscleGroup: 'shoulders', equipment: 'barbell',    type: 'weight' },
  { id: 'ex-row',        name: 'Barbell Row',          muscleGroup: 'back',      equipment: 'barbell',    type: 'weight' },
  { id: 'ex-pullup',     name: 'Pull-Up',              muscleGroup: 'back',      equipment: 'bodyweight', type: 'weight' },
  { id: 'ex-dip',        name: 'Dip',                  muscleGroup: 'chest',     equipment: 'bodyweight', type: 'weight' },
  { id: 'ex-curl',       name: 'Barbell Curl',         muscleGroup: 'biceps',    equipment: 'barbell',    type: 'weight' },
  { id: 'ex-skullcrush', name: 'Skull Crusher',        muscleGroup: 'triceps',   equipment: 'barbell',    type: 'weight' },
  { id: 'ex-lunge',      name: 'Lunge',                muscleGroup: 'legs',      equipment: 'dumbbell',   type: 'weight' },
  { id: 'ex-rdl',        name: 'Romanian Deadlift',    muscleGroup: 'glutes',    equipment: 'barbell',    type: 'weight' },
  { id: 'ex-calf',       name: 'Calf Raise',           muscleGroup: 'legs',      equipment: 'machine',    type: 'weight' },
  { id: 'ex-plank',      name: 'Plank',                muscleGroup: 'core',      equipment: 'bodyweight', type: 'time' },
  { id: 'ex-run',        name: 'Treadmill Run',        muscleGroup: 'cardio',    equipment: 'machine',    type: 'time' },
];

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  exercises: Exercise[];
  splits: Split[];
  workouts: Workout[];
  preferences: UserPreferences;
  isLoading: boolean;
}

const initialState: State = {
  exercises: [],
  splits: [],
  workouts: [],
  preferences: { unit: 'lbs' },
  isLoading: true,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  // Data load
  | { type: 'LOAD_ALL'; exercises: Exercise[]; splits: Split[]; workouts: Workout[]; preferences: UserPreferences }

  // Exercise library
  | { type: 'ADD_EXERCISE'; exercise: Exercise }
  | { type: 'UPDATE_EXERCISE'; exercise: Exercise }
  | { type: 'DELETE_EXERCISE'; id: string }

  // Splits
  | { type: 'ADD_SPLIT'; split: Split }
  | { type: 'UPDATE_SPLIT'; split: Split }
  | { type: 'DELETE_SPLIT'; id: string }

  // Workouts
  | { type: 'ADD_WORKOUT'; workout: Workout }
  | { type: 'UPDATE_WORKOUT'; workout: Workout }
  | { type: 'DELETE_WORKOUT'; id: string }

  // Exercise slots within a workout
  | { type: 'DELETE_SLOT'; workoutId: string; slotIndex: number }
  | { type: 'REORDER_SLOTS'; workoutId: string; slots: PlannedExercise[] }

  // Exercise defaults (per-split)
  | { type: 'SET_EXERCISE_DEFAULTS'; splitId: string; exerciseId: string; defaults: ExerciseDefaults }

  // Preferences
  | { type: 'SET_PREFERENCES'; preferences: Partial<UserPreferences> };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_ALL':
      return {
        ...state,
        exercises: action.exercises.length ? action.exercises : DEFAULT_EXERCISES,
        splits: action.splits,
        workouts: action.workouts,
        preferences: action.preferences,
        isLoading: false,
      };

    // ── Exercise library ──
    case 'ADD_EXERCISE':
      return { ...state, exercises: [...state.exercises, action.exercise] };
    case 'UPDATE_EXERCISE':
      return { ...state, exercises: state.exercises.map((e) => e.id === action.exercise.id ? action.exercise : e) };
    case 'DELETE_EXERCISE':
      return { ...state, exercises: state.exercises.filter((e) => e.id !== action.id) };

    // ── Splits ──
    case 'ADD_SPLIT':
      return { ...state, splits: [...state.splits, action.split] };
    case 'UPDATE_SPLIT':
      return { ...state, splits: state.splits.map((s) => s.id === action.split.id ? action.split : s) };
    case 'DELETE_SPLIT': {
      const childIds = new Set(
        state.workouts.filter((w) => w.splitId === action.id).map((w) => w.id)
      );
      return {
        ...state,
        splits: state.splits.filter((s) => s.id !== action.id),
        workouts: state.workouts.filter((w) => !childIds.has(w.id)),
      };
    }

    // ── Workouts ──
    case 'ADD_WORKOUT':
      return { ...state, workouts: [...state.workouts, action.workout] };
    case 'UPDATE_WORKOUT':
      return { ...state, workouts: state.workouts.map((w) => w.id === action.workout.id ? action.workout : w) };
    case 'DELETE_WORKOUT': {
      const workout = state.workouts.find((w) => w.id === action.id);
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== action.id),
        splits: workout
          ? state.splits.map((s) =>
              s.id === workout.splitId
                ? { ...s, workoutIds: s.workoutIds.filter((id) => id !== action.id) }
                : s
            )
          : state.splits,
      };
    }

    // ── Slots ──
    case 'DELETE_SLOT':
      return {
        ...state,
        workouts: state.workouts.map((w) => {
          if (w.id !== action.workoutId) return w;
          return { ...w, exerciseSlots: w.exerciseSlots.filter((_, i) => i !== action.slotIndex) };
        }),
      };
    case 'REORDER_SLOTS':
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === action.workoutId ? { ...w, exerciseSlots: action.slots } : w
        ),
      };

    // ── Exercise defaults (per-split) ──
    case 'SET_EXERCISE_DEFAULTS':
      return {
        ...state,
        splits: state.splits.map((s) => {
          if (s.id !== action.splitId) return s;
          return {
            ...s,
            exerciseDefaults: {
              ...(s.exerciseDefaults ?? {}),
              [action.exerciseId]: action.defaults,
            },
          };
        }),
      };

    // ── Preferences ──
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.preferences } };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue extends State {
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ─── Migration ────────────────────────────────────────────────────────────────

async function migrateIfNeeded(): Promise<{ splits: Split[]; workouts: Workout[] }> {
  const [rawOldPlans, rawSplits] = await Promise.all([
    AsyncStorage.getItem('workout_plans'),
    AsyncStorage.getItem('splits'),
  ]);

  // Already migrated or no old data
  if (rawSplits !== null || rawOldPlans === null) {
    return { splits: [], workouts: [] };
  }

  const oldPlans: WorkoutPlan[] = JSON.parse(rawOldPlans);
  const splits: Split[] = [];
  const workouts: Workout[] = [];

  for (const plan of oldPlans) {
    const splitId = generateId();
    const workoutId = generateId();
    const exerciseDefaults: Record<string, ExerciseDefaults> = {};
    const slots: PlannedExercise[] = [];
    for (const e of (plan.exercises ?? []) as any[]) {
      slots.push({ exerciseId: e.exerciseId });
      const d: ExerciseDefaults = {};
      if (e.sets != null) d.sets = e.sets;
      if (e.reps != null) d.reps = e.reps;
      if (e.workingWeight != null) d.workingWeight = e.workingWeight;
      if (e.duration != null) d.duration = e.duration;
      if (e.personalBest != null) d.personalBest = e.personalBest;
      if (Object.keys(d).length > 0) exerciseDefaults[e.exerciseId] = d;
    }
    splits.push({ id: splitId, name: plan.name, description: plan.description, workoutIds: [workoutId], exerciseDefaults });
    workouts.push({ id: workoutId, name: plan.name, splitId, exerciseSlots: slots });
  }

  await AsyncStorage.removeItem('workout_plans');
  return { splits, workouts };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all data on mount
  useEffect(() => {
    async function loadAll() {
      const [rawExercises, rawSplits, rawWorkouts, preferences] = await Promise.all([
        loadExercises(),
        loadSplits(),
        loadWorkouts(),
        loadPreferences(),
      ]);

      // Back-fill type field on persisted exercises that predate this field
      const exercises: Exercise[] = rawExercises.map((e) => ({ ...e, type: e.type ?? ('weight' as const) }));

      let splits = rawSplits;
      let workouts = rawWorkouts;

      // One-time migration from old WorkoutPlan data
      if (splits.length === 0) {
        const migrated = await migrateIfNeeded();
        if (migrated.splits.length > 0) {
          splits = migrated.splits;
          workouts = migrated.workouts;
          // Persist immediately so migration doesn't re-run
          await Promise.all([
            saveSplits(splits),
            saveWorkouts(workouts),
          ]);
        }
      }

      // Migrate per-slot data to split-level exerciseDefaults
      let splitsMigrated = false;
      for (const split of splits) {
        if (split.exerciseDefaults != null) continue;
        const defaults: Record<string, ExerciseDefaults> = {};
        const childWorkouts = workouts.filter((w) => w.splitId === split.id);
        for (const w of childWorkouts) {
          for (const slot of w.exerciseSlots) {
            if (defaults[slot.exerciseId]) continue; // first seen wins
            const d: ExerciseDefaults = {};
            if ((slot as any).sets != null) d.sets = (slot as any).sets;
            if ((slot as any).reps != null) d.reps = (slot as any).reps;
            if ((slot as any).workingWeight != null) d.workingWeight = (slot as any).workingWeight;
            if ((slot as any).duration != null) d.duration = (slot as any).duration;
            if ((slot as any).personalBest != null) d.personalBest = (slot as any).personalBest;
            if (Object.keys(d).length > 0) defaults[slot.exerciseId] = d;
          }
        }
        split.exerciseDefaults = defaults;
        splitsMigrated = true;
      }
      if (splitsMigrated) {
        await saveSplits(splits);
      }

      dispatch({ type: 'LOAD_ALL', exercises, splits, workouts, preferences });
    }
    loadAll();
  }, []);

  // Persist state changes (debounced)
  useEffect(() => {
    if (state.isLoading) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveExercises(state.exercises);
      saveSplits(state.splits);
      saveWorkouts(state.workouts);
      savePreferences(state.preferences);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.exercises, state.splits, state.workouts, state.preferences]);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
