import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from 'react';
import {
  Exercise,
  WorkoutPlan,
  UserPreferences,
} from '../types';
import {
  loadExercises,
  saveExercises,
  loadPlans,
  savePlans,
  loadPreferences,
  savePreferences,
} from '../storage/storage';

// ─── Default Exercise Library ─────────────────────────────────────────────────

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex-bench',      name: 'Bench Press',         muscleGroup: 'chest',     equipment: 'barbell' },
  { id: 'ex-incline',    name: 'Incline Bench Press',  muscleGroup: 'chest',     equipment: 'barbell' },
  { id: 'ex-squat',      name: 'Squat',                muscleGroup: 'legs',      equipment: 'barbell' },
  { id: 'ex-deadlift',   name: 'Deadlift',             muscleGroup: 'back',      equipment: 'barbell' },
  { id: 'ex-ohp',        name: 'Overhead Press',       muscleGroup: 'shoulders', equipment: 'barbell' },
  { id: 'ex-row',        name: 'Barbell Row',          muscleGroup: 'back',      equipment: 'barbell' },
  { id: 'ex-pullup',     name: 'Pull-Up',              muscleGroup: 'back',      equipment: 'bodyweight' },
  { id: 'ex-dip',        name: 'Dip',                  muscleGroup: 'chest',     equipment: 'bodyweight' },
  { id: 'ex-curl',       name: 'Barbell Curl',         muscleGroup: 'biceps',    equipment: 'barbell' },
  { id: 'ex-skullcrush', name: 'Skull Crusher',        muscleGroup: 'triceps',   equipment: 'barbell' },
  { id: 'ex-lunge',      name: 'Lunge',                muscleGroup: 'legs',      equipment: 'dumbbell' },
  { id: 'ex-rdl',        name: 'Romanian Deadlift',    muscleGroup: 'glutes',    equipment: 'barbell' },
  { id: 'ex-calf',       name: 'Calf Raise',           muscleGroup: 'legs',      equipment: 'machine' },
  { id: 'ex-plank',      name: 'Plank',                muscleGroup: 'core',      equipment: 'bodyweight' },
  { id: 'ex-run',        name: 'Treadmill Run',        muscleGroup: 'cardio',    equipment: 'machine' },
];

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  preferences: UserPreferences;
  isLoading: boolean;
}

const initialState: State = {
  exercises: [],
  workoutPlans: [],
  preferences: { unit: 'lbs' },
  isLoading: true,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  // Data load
  | { type: 'LOAD_ALL'; exercises: Exercise[]; workoutPlans: WorkoutPlan[]; preferences: UserPreferences }

  // Exercise library
  | { type: 'ADD_EXERCISE'; exercise: Exercise }
  | { type: 'UPDATE_EXERCISE'; exercise: Exercise }
  | { type: 'DELETE_EXERCISE'; id: string }

  // Workout plans
  | { type: 'ADD_PLAN'; plan: WorkoutPlan }
  | { type: 'UPDATE_PLAN'; plan: WorkoutPlan }
  | { type: 'DELETE_PLAN'; id: string }

  // Preferences
  | { type: 'SET_PREFERENCES'; preferences: Partial<UserPreferences> };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_ALL':
      return {
        ...state,
        exercises: action.exercises.length ? action.exercises : DEFAULT_EXERCISES,
        workoutPlans: action.workoutPlans,
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

    // ── Plans ──
    case 'ADD_PLAN':
      return { ...state, workoutPlans: [...state.workoutPlans, action.plan] };
    case 'UPDATE_PLAN':
      return { ...state, workoutPlans: state.workoutPlans.map((p) => p.id === action.plan.id ? action.plan : p) };
    case 'DELETE_PLAN':
      return { ...state, workoutPlans: state.workoutPlans.filter((p) => p.id !== action.id) };

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

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all data on mount
  useEffect(() => {
    async function loadAll() {
      const [exercises, workoutPlans, preferences] = await Promise.all([
        loadExercises(),
        loadPlans(),
        loadPreferences(),
      ]);
      dispatch({ type: 'LOAD_ALL', exercises, workoutPlans, preferences });
    }
    loadAll();
  }, []);

  // Persist state changes (debounced)
  useEffect(() => {
    if (state.isLoading) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveExercises(state.exercises);
      savePlans(state.workoutPlans);
      savePreferences(state.preferences);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.exercises, state.workoutPlans, state.preferences]);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
