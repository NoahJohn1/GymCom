// ─── Units ────────────────────────────────────────────────────────────────────

export type WeightUnit = 'lbs' | 'kg';

// ─── Exercise Library ─────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full_body'
  | 'other';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  type: 'weight' | 'time';
  notes?: string;
  isCustom?: boolean;
}

// ─── Exercise Defaults (per-split) ───────────────────────────────────────────

export interface ExerciseDefaults {
  sets?: number;
  /** Weight-based: target rep range e.g. "8-12" */
  reps?: string;
  /** Weight-based: current working weight (raw number, unit from preferences) */
  workingWeight?: number;
  /** Weight-based: exercise uses body weight (no external load) */
  bodyWeight?: boolean;
  /** Time-based: target duration e.g. "60s" */
  duration?: string;
  /** Time-based: personal best in seconds */
  personalBest?: number;
}

// ─── Splits / Workouts ────────────────────────────────────────────────────────

export interface PlannedExercise {
  exerciseId: string;
}

export interface Split {
  id: string;
  name: string;
  description?: string;
  workoutIds: string[];
  exerciseDefaults?: Record<string, ExerciseDefaults>;
}

export interface Workout {
  id: string;
  name: string;
  splitId: string;
  exerciseSlots: PlannedExercise[];
}

/** @deprecated Use Split/Workout instead */
export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercises: PlannedExercise[];
  createdAt: string;
  updatedAt: string;
}

// ─── Timer Presets ────────────────────────────────────────────────────────────

export interface TimerPreset {
  id: string;
  seconds: number;
}

// ─── User Preferences ─────────────────────────────────────────────────────────

export interface UserPreferences {
  unit: WeightUnit;
  themeColor?: string;
  onboardingComplete?: boolean;
  activeSplitId?: string;
  pinnedExerciseIds?: string[];
  /** 0-based index into the active split's workoutIds array */
  splitCurrentIndex?: number;
  /** YYYY-MM-DD — last date the user confirmed or skipped */
  splitLastDate?: string;
  splitTodayStatus?: 'pending' | 'confirmed' | 'skipped' | 'cardio';
  /** DEV ONLY — override the date the app treats as "today" (YYYY-MM-DD) */
  devDateOverride?: string;
}
