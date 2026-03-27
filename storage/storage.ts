import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Exercise,
  WorkoutPlan,
  Split,
  Workout,
  UserPreferences,
  TimerPreset,
} from '../types';

const EXERCISES_KEY = 'exercises';
const PLANS_KEY = 'workout_plans';
const PREFS_KEY = 'user_preferences';

// ─── Exercises ────────────────────────────────────────────────────────────────

export async function loadExercises(): Promise<Exercise[]> {
  const raw = await AsyncStorage.getItem(EXERCISES_KEY);
  return raw ? (JSON.parse(raw) as Exercise[]) : [];
}

export async function saveExercises(exercises: Exercise[]): Promise<void> {
  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export async function loadPlans(): Promise<WorkoutPlan[]> {
  const raw = await AsyncStorage.getItem(PLANS_KEY);
  return raw ? (JSON.parse(raw) as WorkoutPlan[]) : [];
}

export async function savePlans(plans: WorkoutPlan[]): Promise<void> {
  await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

// ─── Splits ───────────────────────────────────────────────────────────────────

const SPLITS_KEY = 'splits';

export async function loadSplits(): Promise<Split[]> {
  const raw = await AsyncStorage.getItem(SPLITS_KEY);
  return raw ? (JSON.parse(raw) as Split[]) : [];
}

export async function saveSplits(splits: Split[]): Promise<void> {
  await AsyncStorage.setItem(SPLITS_KEY, JSON.stringify(splits));
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

const WORKOUTS_KEY = 'workouts';

export async function loadWorkouts(): Promise<Workout[]> {
  const raw = await AsyncStorage.getItem(WORKOUTS_KEY);
  return raw ? (JSON.parse(raw) as Workout[]) : [];
}

export async function saveWorkouts(workouts: Workout[]): Promise<void> {
  await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export async function loadPreferences(): Promise<UserPreferences> {
  const raw = await AsyncStorage.getItem(PREFS_KEY);
  return raw
    ? (JSON.parse(raw) as UserPreferences)
    : { unit: 'lbs' };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// ─── Timer Presets ────────────────────────────────────────────────────────────

const TIMER_PRESETS_KEY = 'timer_presets';

export async function loadTimerPresets(): Promise<TimerPreset[] | null> {
  const raw = await AsyncStorage.getItem(TIMER_PRESETS_KEY);
  return raw ? (JSON.parse(raw) as TimerPreset[]) : null;
}

export async function saveTimerPresets(presets: TimerPreset[]): Promise<void> {
  await AsyncStorage.setItem(TIMER_PRESETS_KEY, JSON.stringify(presets));
}
